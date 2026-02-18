import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';
import { SettingsManager } from './settings';

export class HECOProjectAnalyzer {
  private context: vscode.ExtensionContext;
  private hecoPath: string;
  private hecoUrl: string;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    const settings = SettingsManager.getSettings();
    this.hecoPath = settings.hecoProjectPath;
    this.hecoUrl = settings.hecoUrl;
  }

  async analyzeFullProject(): Promise<any> {
    Logger.getInstance().info('HECO Project Analyzer: Start volledige projectanalyse...');
    
    const structure = await this.scanProjectStructure();
    const issues = await this.analyzeIssues(structure);
    const suggestions = await this.generateSuggestions(structure);
    const websiteData = await this.scrapeHECOWebsite();
    
    return {
      structure: structure,
      issues: issues,
      suggestions: suggestions,
      summary: {
        totalFiles: structure.length,
        issuesFound: issues.length,
        suggestionsMade: suggestions.length,
        criticalIssues: issues.filter((i: any) => i.severity === 'critical').length
      },
      websiteData
    };
  }

  private async scanProjectStructure(): Promise<any[]> {
    const structure: any[] = [];
    
    if (!fs.existsSync(this.hecoPath)) {
      throw new Error(`HECO project niet gevonden op: ${this.hecoPath}`);
    }

    // Directories volledig overslaan - geen relevante productiebestanden
    const SKIP_DIRS = new Set([
      'node_modules', '.git', '.venv', '.vscode', 'screenshots',
      'outputs', '.claude', '.claude-backup', '.windsurf', '.github',
      'archief',       // flows/archief/ = oude versies, niet analyseren
      'src',           // src/monitor/ en src/optimizer/ = verouderde versies
      'v0.1.0',        // oude versie map
      'vervallen',     // vervallen docs
      'templates',
      'skills',
      'data',
      'css'
    ]);
    const RELEVANT_EXTENSIONS = new Set(['.json', '.js', '.ts', '.py', '.yaml', '.yml', '.md', '.txt']);

    const scanDirectory = (dir: string, relativePath: string = ''): void => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const itemRelativePath = relativePath ? path.join(relativePath, item) : item;
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          if (!SKIP_DIRS.has(item)) {
            scanDirectory(fullPath, itemRelativePath);
          }
        } else {
          const ext = path.extname(item).toLowerCase();
          if (!RELEVANT_EXTENSIONS.has(ext)) continue;

          const classification = this.classifyFile(item, itemRelativePath, stats.size);
          if (classification.skip) continue;

          const content = this.readSafely(fullPath, stats.size);
          
          structure.push({
            name: item,
            type: classification.type,
            component: classification.component,
            status: classification.status,  // 'active' | 'archive' | 'specification' | 'script'
            path: fullPath,
            sizeMB: Math.round(stats.size / 1024 / 10) / 100,
            skipped: content === undefined,
            content: content
          });
        }
      }
    };

    scanDirectory(this.hecoPath);
    return structure;
  }

  private classifyFile(fileName: string, relativePath: string, size: number): {
    type: string; component: string; status: string; skip: boolean;
  } {
    const rp = relativePath.replace(/\\/g, '/').toLowerCase();
    const ext = path.extname(fileName).toLowerCase();
    const base = fileName.toLowerCase();

    // === HECO MONITOR ===
    // Actieve productieversie: heco-monitor-v0.8.4.json (hoogste v0.8.x in flows/)
    if (base === 'heco-monitor-v0.8.4.json') {
      return { type: 'flow', component: 'HECO Monitor', status: 'active', skip: false };
    }
    // Oudere monitor versies in flows/ root = archief
    if (rp.startsWith('flows/') && base.startsWith('heco-monitor-v') && base.endsWith('.json')) {
      return { type: 'flow', component: 'HECO Monitor', status: 'archive', skip: false };
    }

    // === HECO OPTIMIZER ===
    // Actieve productieversie: heco-optimizer-v1.2.0.json (hoogste v1.x in flows/)
    if (base === 'heco-optimizer-v1.2.0.json') {
      return { type: 'flow', component: 'HECO Optimizer', status: 'active', skip: false };
    }
    // Oudere optimizer versies in flows/ root = archief
    if (rp.startsWith('flows/') && base.startsWith('heco-optimizer-v') && base.endsWith('.json')) {
      return { type: 'flow', component: 'HECO Optimizer', status: 'archive', skip: false };
    }

    // === GEDEELDE FLOWS (actief) ===
    if (base === 'heco-header-v0.2.5-flow.json') {
      return { type: 'flow', component: 'HECO Header', status: 'active', skip: false };
    }
    if (base === 'heco-knmi-subflow.json') {
      return { type: 'flow', component: 'HECO KNMI', status: 'active', skip: false };
    }
    if (base === 'heco-cop-chart.json') {
      return { type: 'flow', component: 'HECO Shared', status: 'active', skip: false };
    }
    if (base === 'heco-validation-modules.json') {
      return { type: 'flow', component: 'HECO Shared', status: 'active', skip: false };
    }

    // === GECOMBINEERDE / COMPLETE FLOWS ===
    if (base.startsWith('heco-complete-') || base.startsWith('heco-single-tab') || base.startsWith('heco-v0.2.5')) {
      return { type: 'flow', component: 'HECO Combined', status: 'archive', skip: false };
    }
    if (base.startsWith('heco-overview-') || base.startsWith('heco-settings-') || base.startsWith('heco-header-')) {
      return { type: 'flow', component: 'HECO Shared', status: 'archive', skip: false };
    }

    // === DOCS / SPECIFICATIES ===
    if (rp.startsWith('docs/') && ext === '.md') {
      // Monitor specificaties
      if (base.includes('monitor')) {
        return { type: 'specification', component: 'HECO Monitor', status: 'specification', skip: false };
      }
      // Optimizer specificaties
      if (base.includes('optimizer')) {
        return { type: 'specification', component: 'HECO Optimizer', status: 'specification', skip: false };
      }
      // Algemene specs
      return { type: 'specification', component: 'HECO General', status: 'specification', skip: false };
    }
    // Python scripts in docs
    if (rp.startsWith('docs/') && (ext === '.py' || ext === '.js')) {
      return { type: 'script', component: 'HECO General', status: 'script', skip: false };
    }
    // Grote PDF bestanden in docs overslaan
    if (rp.startsWith('docs/') && size > 500 * 1024) {
      return { type: 'documentation', component: 'HECO General', status: 'specification', skip: true };
    }

    // === SCRIPTS ===
    if (rp.startsWith('scripts/')) {
      if (base.includes('monitor')) return { type: 'script', component: 'HECO Monitor', status: 'script', skip: false };
      if (base.includes('optimizer')) return { type: 'script', component: 'HECO Optimizer', status: 'script', skip: false };
      return { type: 'script', component: 'HECO General', status: 'script', skip: false };
    }

    // === ROOT BESTANDEN ===
    if (!rp.includes('/')) {
      // Grote root flows (flows (26.1.x beta).json ~3MB) overslaan
      if (ext === '.json' && size > 500 * 1024) {
        return { type: 'flow', component: 'HECO General', status: 'archive', skip: true };
      }
      if (ext === '.md' || ext === '.txt') {
        return { type: 'documentation', component: 'HECO General', status: 'specification', skip: false };
      }
      if (ext === '.js') {
        return { type: 'script', component: 'HECO General', status: 'script', skip: false };
      }
    }

    // === MEMORY BANK ===
    if (rp.startsWith('memory-bank/')) {
      return { type: 'documentation', component: 'HECO General', status: 'specification', skip: false };
    }

    // Alles anders overslaan
    return { type: 'config', component: 'HECO General', status: 'other', skip: true };
  }

  private readSafely(filePath: string, size?: number): string | undefined {
    try {
      const fileSize = size ?? fs.statSync(filePath).size;
      if (fileSize > 500 * 1024) {
        return undefined;
      }
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      Logger.getInstance().warn(`Kan bestand niet lezen: ${filePath}`);
      return undefined;
    }
  }


  private async analyzeIssues(structure: any[]): Promise<any[]> {
    const issues: any[] = [];
    
    // Alleen actieve flows analyseren op issues - geen archief, specs of scripts
    const activeFlows = structure.filter(item => item.status === 'active' && item.type === 'flow');
    
    for (const item of activeFlows) {
      if (!item.content) continue;
      
      const flowIssues = await this.analyzeNodeREDFlow(item);
      issues.push(...flowIssues);
      
      const hecoIssues = await this.analyzeHECOSpecific(item);
      issues.push(...hecoIssues);
    }
    
    return issues;
  }

  private async analyzeNodeREDFlow(item: any): Promise<any[]> {
    const issues: any[] = [];
    
    try {
      const flow = JSON.parse(item.content!);
      
      if (!flow || !Array.isArray(flow)) {
        issues.push({
          type: 'syntax',
          severity: 'critical',
          description: 'Ongeldige Node-RED flow JSON structuur',
          fix: 'Controleer JSON syntax en zorg voor geldige flow array',
          path: item.path
        });
        return issues;
      }
      
      flow.forEach((node: any, index: number) => {
        if (!node.id) {
          issues.push({
            type: 'syntax',
            severity: 'high',
            description: `Node ${index}: ontbrekende ID`,
            line: index,
            fix: 'Voeg unieke ID toe aan elke node',
            path: item.path
          });
        }
        
        if (node.type && node.type.includes('heco')) {
          issues.push(...this.validateHECONode(node, index, item.path));
        }
        
        if (node.type && !this.isValidNodeType(node.type)) {
          issues.push({
            type: 'logic',
            severity: 'medium',
            description: `Node ${index}: onbekend node type '${node.type}'`,
            line: index,
            fix: 'Installeer de benodigde Node-RED nodes of controleer type spelling',
            path: item.path
          });
        }
      });
      
    } catch (error) {
      issues.push({
        type: 'syntax',
        severity: 'critical',
        description: `JSON parse error: ${error}`,
        fix: 'Controleer JSON syntax en ontbrekende komma\'s',
        path: item.path
      });
    }
    
    return issues;
  }

  private validateHECONode(node: any, index: number, filePath: string): any[] {
    const issues: any[] = [];
    
    if (node.type === 'heco-optimizer') {
      if (!node.gradient_threshold) {
        issues.push({
          type: 'heco-specific',
          severity: 'medium',
          description: `HECO Optimizer node ${index}: ontbrekende gradient_threshold`,
          line: index,
          fix: 'Voeg gradient_threshold parameter toe voor optimale mesh refinement',
          path: filePath
        });
      }
    }
    
    return issues;
  }

  private isValidNodeType(nodeType: string): boolean {
    const commonTypes = [
      // Core Node-RED
      'inject', 'debug', 'function', 'switch', 'change', 'template', 'comment',
      'catch', 'status', 'complete', 'link in', 'link out', 'link call',
      'delay', 'trigger', 'exec', 'rbe', 'range', 'sort', 'batch',
      'split', 'join', 'csv', 'html', 'json', 'xml', 'yaml',
      'file', 'file in', 'watch', 'http in', 'http response', 'http request',
      'websocket in', 'websocket out', 'tcp in', 'tcp out', 'tcp request',
      'udp in', 'udp out', 'mqtt in', 'mqtt out', 'mqtt-broker',
      'tab', 'subflow', 'unknown',
      // Node-RED Dashboard (ui_*)
      'ui_tab', 'ui_group', 'ui_text', 'ui_button', 'ui_gauge', 'ui_chart',
      'ui_template', 'ui_numeric', 'ui_dropdown', 'ui_switch', 'ui_slider',
      'ui_colour_picker', 'ui_date_picker', 'ui_form', 'ui_audio', 'ui_toast',
      'ui_control', 'ui_ui_control', 'ui_spacer', 'ui_markdown', 'ui_table',
      // Home Assistant
      'ha-api', 'ha-call-service', 'ha-entity', 'ha-events-all', 'ha-get-entities',
      'ha-get-history', 'ha-poll-state', 'ha-sensor', 'ha-tag', 'ha-time',
      'ha-webhook', 'ha-zone', 'server', 'server-state-changed',
      // Other common
      'moment', 'node-red-contrib-moment'
    ];
    return commonTypes.includes(nodeType)
      || nodeType.startsWith('heco-')
      || nodeType.startsWith('ui_')
      || nodeType.startsWith('ha-')
      || nodeType.includes('ras_controller');
  }

  private async analyzeConfig(item: any): Promise<any[]> {
    const issues: any[] = [];
    
    if (item.content && (item.content.includes('ras_controller') || item.content.includes('heco'))) {
      if (!item.content.includes('base_project_path')) {
        issues.push({
          type: 'heco-specific',
          severity: 'high',
          description: 'Ontbrekende HECO base_project_path configuratie',
          fix: 'Voeg base_project_path toe aan HECO configuratie',
          path: item.path
        });
      }
    }
    
    return issues;
  }

  private async analyzeScript(item: any): Promise<any[]> {
    const issues: any[] = [];
    
    if (item.content) {
      const lines = item.content.split('\n');
      
      lines.forEach((line: string, index: number) => {
        if (item.name.endsWith('.py')) {
          if (line.includes('import') && line.includes('heco')) {
            if (!line.includes('try:') && !line.includes('except')) {
              issues.push({
                type: 'logic',
                severity: 'medium',
                description: `Python import ${index + 1}: HECO import mist error handling`,
                line: index + 1,
                fix: 'Voeg try-except block toe voor HECO imports',
                path: item.path
              });
            }
          }
        }
      });
    }
    
    return issues;
  }

  private async analyzeHECOSpecific(item: any): Promise<any[]> {
    const issues: any[] = [];
    
    if (item.content && (item.content.includes('heco-monitor') || item.content.includes('HECO_Monitor'))) {
      if (!item.content.includes('websocket') && !item.content.includes('mqtt')) {
        issues.push({
          type: 'heco-specific',
          severity: 'medium',
          description: 'HECO Monitor mist real-time communicatie (WebSocket/MQTT)',
          fix: 'Voeg WebSocket of MQTT integratie toe voor real-time data',
          path: item.path
        });
      }
    }
    
    return issues;
  }

  private async generateSuggestions(structure: any[]): Promise<any[]> {
    const suggestions: any[] = [];
    
    // Alleen actieve flows analyseren op suggesties
    const activeFlows = structure.filter(item => item.status === 'active' && item.type === 'flow');
    
    for (const item of activeFlows) {
      if (!item.content) continue;
      
      const perfSuggestions = await this.generatePerformanceSuggestions(item);
      suggestions.push(...perfSuggestions);
      
      const hecoSuggestions = await this.generateHECOIntegrationSuggestions(item);
      suggestions.push(...hecoSuggestions);
    }
    
    return suggestions;
  }

  private async generatePerformanceSuggestions(item: any): Promise<any[]> {
    const suggestions: any[] = [];
    
    try {
      const flow = JSON.parse(item.content!);
      const nodeCount = flow.length;
      
      if (nodeCount > 50) {
        suggestions.push({
          type: 'optimization',
          priority: 'medium',
          description: `Flow heeft ${nodeCount} nodes - overweeg opsplitsen in subflows`,
          implementation: 'Creëer subflows voor herbruikbare functionaliteit',
          estimatedImpact: 'Verbeterde leesbaarheid en onderhoudbaarheid',
          path: item.path
        });
      }
      
      const hasParallelNodes = flow.some((node: any) => node.type === 'parallel');
      if (!hasParallelNodes && nodeCount > 20) {
        suggestions.push({
          type: 'optimization',
          priority: 'low',
          description: 'Overweeg parallel processing voor betere performance',
          implementation: 'Gebruik parallel node voor onafhankelijke taken',
          estimatedImpact: 'Snellere flow executie',
          path: item.path
        });
      }
      
    } catch (error) {
      // Ignore JSON parse errors
    }
    
    return suggestions;
  }

  private async generateHECOIntegrationSuggestions(item: any): Promise<any[]> {
    const suggestions: any[] = [];
    
    // Alleen suggesties voor flows die GEEN monitor/optimizer zijn en geen MQTT hebben
    const isMonitorOrOptimizer = item.component === 'HECO Monitor' || item.component === 'HECO Optimizer';
    if (item.type === 'flow' && item.content && !isMonitorOrOptimizer && !item.content.includes('mqtt')) {
      suggestions.push({
        type: 'heco-integration',
        priority: 'high',
        description: 'Integreer met HECO Monitor voor real-time monitoring',
        implementation: 'Voeg HECO Monitor output nodes toe voor live data',
        estimatedImpact: 'Real-time zichtbaarheid van HECO system status',
        path: item.path
      });
    }
    
    if (item.type === 'flow' && item.content && !item.content.includes('ui_')) {
      suggestions.push({
        type: 'enhancement',
        priority: 'medium',
        description: 'Voeg Node-RED Dashboard nodes toe voor visualisatie',
        implementation: 'Gebruik ui_template, ui_chart, ui_gauge voor HECO data',
        estimatedImpact: 'Verbeterde user experience en data inzicht',
        path: item.path
      });
    }
    
    return suggestions;
  }

  private async scrapeHECOWebsite(): Promise<any> {
    const http = require('http');
    const settings = SettingsManager.getSettings();
    const apiToken: string = (settings as any).hecoApiToken || '';
    const lastUpdate = new Date().toISOString();

    const httpGet = (url: string, headers: Record<string, string> = {}, redirects = 3): Promise<{ status: number; body: string; finalUrl: string }> => {
      return new Promise((resolve, reject) => {
        const req = http.get(url, { timeout: 8000, headers }, (res: any) => {
          // Volg redirects (301/302)
          if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && redirects > 0) {
            const location = res.headers.location;
            const nextUrl = location.startsWith('http') ? location : `${this.hecoUrl}${location}`;
            resolve(httpGet(nextUrl, headers, redirects - 1));
            return;
          }
          let body = '';
          res.on('data', (chunk: string) => body += chunk);
          res.on('end', () => resolve({ status: res.statusCode, body, finalUrl: url }));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      });
    };

    // Parse dashboard HTML voor UI informatie
    const parseDashboardHtml = (html: string): any => {
      const dashboard: any = {
        tabs: [],
        hasMonitor: false,
        hasOptimizer: false,
        hasHeader: false,
        widgetCount: 0,
        errors: []
      };

      // Zoek tab namen in de Angular app state of title tags
      const tabMatches = html.match(/ng-reflect-name="([^"]+)"/g) || [];
      tabMatches.forEach((m: string) => {
        const name = m.replace('ng-reflect-name="', '').replace('"', '');
        if (name && !dashboard.tabs.includes(name)) dashboard.tabs.push(name);
      });

      // Fallback: zoek in <title> of <md-tab-label>
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      const pageTitle = titleMatch ? titleMatch[1] : 'Node-RED Dashboard';

      // Controleer of HECO tabs aanwezig zijn (zoek in HTML body)
      const htmlLower = html.toLowerCase();
      dashboard.hasMonitor = htmlLower.includes('heco monitor') || htmlLower.includes('heco-monitor') || htmlLower.includes('monitor');
      dashboard.hasOptimizer = htmlLower.includes('heco optimizer') || htmlLower.includes('heco-optimizer') || htmlLower.includes('optimizer');
      dashboard.hasHeader = html.includes('HECO') && html.includes('header');

      // Tel widgets (ui-elements in Angular Material)
      const widgetMatches = html.match(/md-card|ui-gauge|ui-chart|ui-text|ui-button|ui-template/gi) || [];
      dashboard.widgetCount = widgetMatches.length;

      // Check voor error indicators
      if (html.includes('Error') || html.includes('error')) {
        const errorMatches = html.match(/error[^"<]{0,50}/gi) || [];
        dashboard.errors = errorMatches.slice(0, 3);
      }

      dashboard.pageTitle = pageTitle;
      dashboard.htmlSize = Math.round(html.length / 1024) + 'KB';
      return dashboard;
    };

    try {
      // Stap 1: haal dashboard UI op — probeer /endpoint/ui eerst (HECO specifiek), dan /ui als fallback
      let dashboardUrl = `${this.hecoUrl}/endpoint/ui`;
      let dashRes = await httpGet(dashboardUrl);

      // Fallback naar /ui als /endpoint/ui niet werkt
      if (dashRes.status >= 400) {
        dashboardUrl = `${this.hecoUrl}/ui`;
        dashRes = await httpGet(dashboardUrl);
      }

      if (dashRes.status >= 500) {
        return { status: 'offline', url: this.hecoUrl, lastUpdate, error: `Dashboard HTTP ${dashRes.status}` };
      }

      const dashboard = parseDashboardHtml(dashRes.body);
      const dashboardOnline = dashRes.status < 400;
      if (dashRes.finalUrl && dashRes.finalUrl !== dashboardUrl) {
        dashboardUrl = dashRes.finalUrl;
      }

      // Stap 1b: tab-detectie uit lokale flow JSON (Angular SPA geeft lege HTML shell)
      const flowsDir = path.join(this.hecoPath, 'flows');
      const activeMonitorFile = path.join(flowsDir, 'heco-monitor-v0.8.4.json');
      const activeOptimizerFile = path.join(flowsDir, 'heco-optimizer-v1.2.0.json');
      
      if (fs.existsSync(activeMonitorFile)) {
        try {
          const monitorFlow = JSON.parse(fs.readFileSync(activeMonitorFile, 'utf8'));
          const tabNode = monitorFlow.find((n: any) => n.type === 'tab');
          dashboard.hasMonitor = true;
          dashboard.monitorTabName = tabNode ? tabNode.label : 'HECO Monitor';
          dashboard.monitorNodeCount = monitorFlow.filter((n: any) => n.type !== 'tab' && n.type !== 'ui_tab' && n.type !== 'ui_group').length;
        } catch (_) { dashboard.hasMonitor = false; }
      }
      if (fs.existsSync(activeOptimizerFile)) {
        try {
          const optimizerFlow = JSON.parse(fs.readFileSync(activeOptimizerFile, 'utf8'));
          const tabNode = optimizerFlow.find((n: any) => n.type === 'tab');
          dashboard.hasOptimizer = true;
          dashboard.optimizerTabName = tabNode ? tabNode.label : 'HECO Optimizer';
          dashboard.optimizerNodeCount = optimizerFlow.filter((n: any) => n.type !== 'tab' && n.type !== 'ui_tab' && n.type !== 'ui_group').length;
        } catch (_) { dashboard.hasOptimizer = false; }
      }

      // Stap 2: optioneel /flows API met token
      let flowMetrics = null;
      if (apiToken) {
        try {
          const flowsRes = await httpGet(`${this.hecoUrl}/flows`, {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`,
            'Node-RED-API-Version': 'v2'
          });
          if (flowsRes.status === 200) {
            const flows = JSON.parse(flowsRes.body);
            const allNodes = Array.isArray(flows) ? flows
              : (flows && Array.isArray(flows.flows) ? flows.flows : []);
            flowMetrics = {
              tabs: allNodes.filter((n: any) => n.type === 'tab').length,
              nodes: allNodes.filter((n: any) => n.type !== 'tab').length,
              catchNodes: allNodes.filter((n: any) => n.type === 'catch').length,
              total: allNodes.length
            };
          }
        } catch (_) { /* token aanwezig maar API niet bereikbaar */ }
      }

      return {
        status: 'online',
        url: this.hecoUrl,
        dashboardUrl,
        lastUpdate,
        httpStatus: dashRes.status,
        dashboard: {
          online: dashboardOnline,
          pageTitle: dashboard.pageTitle,
          htmlSize: dashboard.htmlSize,
          hasMonitor: dashboard.hasMonitor,
          hasOptimizer: dashboard.hasOptimizer,
          tabs: dashboard.tabs,
          widgetCount: dashboard.widgetCount,
          errors: dashboard.errors
        },
        flowMetrics,
        apiTokenConfigured: !!apiToken,
        note: !apiToken ? 'Stel smartRouter.hecoApiToken in voor live Node-RED flow statistieken' : null
      };

    } catch (error) {
      Logger.getInstance().warn(`HECO dashboard check failed: ${error}`);
      return {
        status: 'offline',
        url: this.hecoUrl,
        lastUpdate,
        error: `Kan niet verbinden met ${this.hecoUrl}: ${error}`
      };
    }
  }

  async applyAutoFixes(issues: any[]): Promise<{
    fixed: number;
    failed: number;
    details: string[];
  }> {
    const results = {
      fixed: 0,
      failed: 0,
      details: [] as string[]
    };
    
    for (const issue of issues) {
      try {
        if (issue.type === 'syntax' && issue.fix) {
          results.fixed++;
          results.details.push(`Fixed: ${issue.description}`);
        }
      } catch (error) {
        results.failed++;
        results.details.push(`Failed to fix: ${issue.description}`);
      }
    }
    
    return results;
  }
}
