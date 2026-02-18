import * as vscode from 'vscode';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { MODEL_ROUTING } from './models';
import { SettingsManager } from './settings';
import { Logger } from './logger';

const LAST_RUN_KEY = 'dailyEvaluator.lastRun';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Models we are actively watching for OpenRouter availability
const WATCHLIST_MODELS = [
  { id: 'inclusionAI/Ling-2.5-1T', name: 'Ling-2.5-1T', targetIntent: 'debug' },
  { id: 'inclusionAI/Ring-2.5-1T', name: 'Ring-2.5-1T', targetIntent: 'reasoning' },
  { id: 'inclusionAI/Ming-Flash-Omni-2.0', name: 'Ming-Flash-Omni-2.0', targetIntent: 'multimodal' },
];

export class DailyEvaluator {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async runIfNeeded(): Promise<void> {
    const lastRun = this.context.globalState.get<number>(LAST_RUN_KEY, 0);
    const now = Date.now();
    const hoursSinceLastRun = (now - lastRun) / (1000 * 60 * 60);

    if (now - lastRun < MS_PER_DAY) {
      Logger.getInstance().info(`DailyEvaluator: last run ${hoursSinceLastRun.toFixed(1)}h ago, skipping`);
      return;
    }

    Logger.getInstance().info('DailyEvaluator: running daily evaluation...');
    await this.context.globalState.update(LAST_RUN_KEY, now);
    await this.evaluate();
  }

  async runNow(): Promise<void> {
    await this.context.globalState.update(LAST_RUN_KEY, Date.now());
    await this.evaluate();
  }

  private async evaluate(): Promise<void> {
    const settings = SettingsManager.getSettings();
    const apiKey = settings.openrouterApiKey;

    if (!apiKey) {
      Logger.getInstance().info('DailyEvaluator: no API key, skipping OpenRouter checks');
      return;
    }

    const findings: string[] = [];

    try {
      const availableModels = await this.fetchOpenRouterModels(apiKey);

      // 1. Check routing models still available
      const routingFindings = this.checkRoutingModels(availableModels);
      findings.push(...routingFindings);

      // 2. Check watchlist models now available
      const watchlistFindings = this.checkWatchlistModels(availableModels);
      findings.push(...watchlistFindings);

      // 3. Check for new Anthropic/Qwen models not yet in routing
      const newModelFindings = this.checkForNewModels(availableModels);
      findings.push(...newModelFindings);

    } catch (error: any) {
      Logger.getInstance().warn(`DailyEvaluator: OpenRouter check failed: ${error.message}`);
    }

    // Always update the plan file with today's evaluation timestamp
    this.updatePlanTimestamp(findings);

    // Notify user if there are findings
    if (findings.length > 0) {
      const message = `🔭 Smart Router Daily Check: ${findings.length} bevinding(en)`;
      const action = await vscode.window.showInformationMessage(
        message,
        'Bekijk rapport',
        'Negeer'
      );
      if (action === 'Bekijk rapport') {
        this.showReport(findings);
      }
    } else {
      Logger.getInstance().info('DailyEvaluator: alles up-to-date, geen bevindingen');
    }
  }

  private checkRoutingModels(availableModels: string[]): string[] {
    const findings: string[] = [];
    const routingEntries = Object.entries(MODEL_ROUTING);

    for (const [intent, config] of routingEntries) {
      const model = config.model;
      if (model === 'xiaomi/mimo-v2-flash') { continue; } // free tier, skip
      if (!availableModels.includes(model)) {
        findings.push(`⚠️ Routing model niet meer beschikbaar: \`${model}\` (intent: ${intent})`);
      }
    }

    return findings;
  }

  private checkWatchlistModels(availableModels: string[]): string[] {
    const findings: string[] = [];

    for (const watched of WATCHLIST_MODELS) {
      if (availableModels.includes(watched.id)) {
        findings.push(`🎉 WATCHLIST HIT: \`${watched.id}\` is nu beschikbaar op OpenRouter! → Toevoegen aan \`${watched.targetIntent}\` routing`);
      }
    }

    return findings;
  }

  private checkForNewModels(availableModels: string[]): string[] {
    const findings: string[] = [];
    const currentModels = new Set(Object.values(MODEL_ROUTING).map(c => c.model));

    // Check for new Anthropic claude models not in our routing
    const newAnthropicModels = availableModels.filter(id =>
      id.startsWith('anthropic/claude') &&
      !currentModels.has(id) &&
      !id.includes('instant') &&
      !id.includes('v1') &&
      !id.includes('v2')
    );

    // Check for new Qwen models not in our routing
    const newQwenModels = availableModels.filter(id =>
      id.startsWith('qwen/') &&
      !currentModels.has(id) &&
      (id.includes('qwen3') || id.includes('qwen3.5'))
    );

    if (newAnthropicModels.length > 0) {
      findings.push(`🆕 Nieuwe Anthropic modellen op OpenRouter: ${newAnthropicModels.slice(0, 3).join(', ')}`);
    }

    if (newQwenModels.length > 0) {
      findings.push(`🆕 Nieuwe Qwen modellen op OpenRouter: ${newQwenModels.slice(0, 3).join(', ')}`);
    }

    return findings;
  }

  private updatePlanTimestamp(findings: string[]): void {
    try {
      const planPath = path.join(this.context.extensionPath, '..', '..', 'smart-router-v2.0.0', 'SMART_ROUTER_ANALYSIS_OPTIMIZED.md');
      // Update the last-evaluated timestamp in the watchlist instead
      const watchlistPath = path.join(this.context.extensionPath, '..', '..', 'smart-router-v2.0.0', 'WATCHLIST.md');

      if (fs.existsSync(watchlistPath)) {
        let content = fs.readFileSync(watchlistPath, 'utf8');
        const timestamp = new Date().toLocaleString('nl-NL');
        const newEntry = `| ${new Date().toLocaleDateString('nl-NL')} | Automatische dagelijkse evaluatie | ${findings.length} bevinding(en) |`;

        // Add to changelog if not already today
        const today = new Date().toLocaleDateString('nl-NL');
        if (!content.includes(today)) {
          content = content.replace(
            '## 📅 Changelog',
            `## 📅 Changelog\n\n${newEntry}`
          );
          fs.writeFileSync(watchlistPath, content, 'utf8');
          Logger.getInstance().info(`DailyEvaluator: WATCHLIST.md bijgewerkt om ${timestamp}`);
        }
      }
    } catch (error: any) {
      Logger.getInstance().warn(`DailyEvaluator: kon plan niet bijwerken: ${error.message}`);
    }
  }

  private showReport(findings: string[]): void {
    const date = new Date().toLocaleString('nl-NL');
    const report = [
      `# 🔭 Smart Router Dagelijkse Evaluatie`,
      `*${date}*`,
      '',
      '## Bevindingen',
      ...findings.map(f => `- ${f}`),
      '',
      '## Acties',
      '- Controleer `WATCHLIST.md` voor watchlist hits',
      '- Update `src/models.ts` voor nieuwe modellen',
      '- Run `Smart Router: Validate System` voor volledige check',
    ].join('\n');

    const panel = vscode.window.createWebviewPanel(
      'smartRouterDailyReport',
      '🔭 Smart Router Daily Report',
      vscode.ViewColumn.One,
      {}
    );

    panel.webview.html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, sans-serif; padding: 20px; max-width: 800px; }
  h1 { color: #007acc; }
  h2 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  li { margin: 8px 0; line-height: 1.5; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
  .hit { color: #28a745; font-weight: bold; }
  .warning { color: #dc3545; }
  .new { color: #007acc; }
</style>
</head>
<body>
<h1>🔭 Smart Router Dagelijkse Evaluatie</h1>
<p><em>${date}</em></p>
<h2>Bevindingen (${findings.length})</h2>
<ul>
${findings.map(f => {
  const cls = f.includes('🎉') ? 'hit' : f.includes('⚠️') ? 'warning' : 'new';
  return `<li class="${cls}">${f.replace(/`([^`]+)`/g, '<code>$1</code>')}</li>`;
}).join('\n')}
</ul>
<h2>Aanbevolen acties</h2>
<ul>
  <li>Controleer <code>WATCHLIST.md</code> voor watchlist hits</li>
  <li>Update <code>src/models.ts</code> voor nieuwe modellen</li>
  <li>Run <strong>Smart Router: Validate System</strong> voor volledige check</li>
</ul>
</body>
</html>`;
  }

  private fetchOpenRouterModels(apiKey: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'openrouter.ai',
        path: '/api/v1/models',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'vscode-smart-router',
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const ids = (parsed.data || []).map((m: any) => m.id as string);
            resolve(ids);
          } catch (e: any) {
            reject(new Error(`Parse error: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      req.end();
    });
  }
}
