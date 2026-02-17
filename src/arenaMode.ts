import * as vscode from 'vscode';
import { ARENA_BATTLE_GROUPS, BattleGroup, ArenaModeConfig, ModelConfig, Intent } from './models';
import { Logger } from './logger';
import { CostTracker } from './costTracker';

export interface ArenaSession {
  id: string;
  models: string[];
  responses: Map<string, any>;
  costs: Map<string, number>;
  startTime: Date;
  status: 'active' | 'converged' | 'abandoned';
}

export class ArenaModeManager {
  private sessions: Map<string, ArenaSession> = new Map();
  private logger = Logger.getInstance();
  private costTracker: CostTracker;

  constructor(costTracker: CostTracker) {
    this.costTracker = costTracker;
  }

  /**
   * Start een nieuwe Arena Mode sessie
   */
  async startArenaSession(battleGroup: BattleGroup, prompt: string): Promise<ArenaSession> {
    const sessionId = this.generateSessionId();
    const config = ARENA_BATTLE_GROUPS[battleGroup];
    
    this.logger.info(`[Arena Mode] Start sessie ${sessionId} met ${battleGroup} battle group`);
    
    const session: ArenaSession = {
      id: sessionId,
      models: [...config.models],
      responses: new Map(),
      costs: new Map(),
      startTime: new Date(),
      status: 'active'
    };

    this.sessions.set(sessionId, session);

    // Toon Arena Mode UI
    this.showArenaUI(session, config);

    return session;
  }

  /**
   * Voeg response toe van een model
   */
  addResponse(sessionId: string, model: string, response: any, cost: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logger.error(`[Arena Mode] Sessie ${sessionId} niet gevonden`);
      return;
    }

    session.responses.set(model, response);
    session.costs.set(model, cost);

    this.logger.info(`[Arena Mode] Response ontvangen van ${model} voor sessie ${sessionId}`);

    // Update UI
    this.updateArenaUI(session);

    // Check of alle modellen hebben geantwoord
    if (session.responses.size === session.models.length) {
      this.showConvergenceOptions(session);
    }
  }

  /**
   * Convergeer naar beste response
   */
  async convergeToModel(sessionId: string, selectedModel: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logger.error(`[Arena Mode] Sessie ${sessionId} niet gevonden`);
      return;
    }

    session.status = 'converged';

    // Bereken totale kosten
    const totalCost = Array.from(session.costs.values()).reduce((sum, cost) => sum + cost, 0);
    
    this.logger.info(`[Arena Mode] Geconvergeerd naar ${selectedModel} (totale kosten: $${totalCost.toFixed(2)})`);

    // Update cost tracking
    await this.costTracker.trackUsage(
      'architecture' as Intent,
      'arena-mode',
      totalCost,
      `Arena Mode sessie ${sessionId} geconvergeerd naar ${selectedModel}`,
      Date.now() - session.startTime.getTime()
    );

    // Toon resultaat
    vscode.window.showInformationMessage(
      `Arena Mode: Geconvergeerd naar ${selectedModel} (Kosten: $${totalCost.toFixed(2)})`
    );

    // Cleanup oude sessies
    this.cleanupOldSessions();
  }

  /**
   * Toon Arena Mode UI
   */
  private showArenaUI(session: ArenaSession, config: any): void {
    const panel = vscode.window.createWebviewPanel(
      'arenaMode',
      `Arena Mode - ${config.name}`,
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    panel.webview.html = this.getArenaWebviewContent(session, config);

    // Handle messages from webview
    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'converge':
            this.convergeToModel(session.id, message.model);
            break;
        }
      },
      undefined
    );
  }

  /**
   * Genereer webview content voor Arena Mode
   */
  private getArenaWebviewContent(session: ArenaSession, config: any): string {
    return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arena Mode - ${config.name}</title>
    <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        .header { color: var(--vscode-foreground); margin-bottom: 20px; }
        .model-card { 
            border: 1px solid var(--vscode-panel-border); 
            border-radius: 4px; 
            padding: 15px; 
            margin: 10px 0; 
            background: var(--vscode-editor-background);
        }
        .model-name { font-weight: bold; color: var(--vscode-foreground); }
        .model-status { color: var(--vscode-descriptionForeground); }
        .converge-button { 
            background: var(--vscode-button-background); 
            color: var(--vscode-button-foreground); 
            border: none; 
            padding: 8px 16px; 
            border-radius: 4px; 
            cursor: pointer;
            margin-top: 10px;
        }
        .converge-button:hover { background: var(--vscode-button-hoverBackground); }
        .loading { color: var(--vscode-charts-blue); }
        .complete { color: var(--vscode-charts-green); }
    </style>
</head>
<body>
    <div class="header">
        <h2>🤖 Arena Mode - ${config.name}</h2>
        <p>${config.description}</p>
        <p>Sessie ID: ${session.id}</p>
    </div>
    
    <div id="models">
        ${session.models.map(model => `
            <div class="model-card" id="model-${model}">
                <div class="model-name">${model}</div>
                <div class="model-status loading">⏳ Wachten op response...</div>
                <button class="converge-button" onclick="converge('${model}')" disabled>
                    Kies dit model
                </button>
            </div>
        `).join('')}
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function converge(model) {
            vscode.postMessage({
                command: 'converge',
                model: model
            });
        }
        
        // Update functie die vanuit de extension wordt aangeroepen
        function updateModelStatus(model, status, response, cost) {
            const card = document.getElementById(\`model-\${model}\`);
            const statusDiv = card.querySelector('.model-status');
            const button = card.querySelector('.converge-button');
            
            statusDiv.className = 'model-status complete';
            statusDiv.innerHTML = \`
                ✅ Compleet<br>
                Kosten: $\${cost.toFixed(2)}<br>
                <small>\${response.substring(0, 100)}...</small>
            \`;
            button.disabled = false;
        }
    </script>
</body>
</html>`;
  }

  /**
   * Update Arena Mode UI met nieuwe responses
   */
  private updateArenaUI(session: ArenaSession): void {
    // Stuur update naar webview
    // Dit vereist tracking van webview panels
  }

  /**
   * Toon convergence opties
   */
  private showConvergenceOptions(session: ArenaSession): void {
    this.logger.info(`[Arena Mode] Alle modellen compleet voor sessie ${session.id}`);
    
    // Quick pick voor model selectie
    const options = Array.from(session.responses.keys()).map(model => ({
      label: model,
      description: `Kosten: $${session.costs.get(model)?.toFixed(2)}`
    }));

    vscode.window.showQuickPick(options, {
      placeHolder: 'Selecteer het beste model om naar te convergeren'
    }).then(selected => {
      if (selected) {
        this.convergeToModel(session.id, selected.label);
      }
    });
  }

  /**
   * Genereer unieke sessie ID
   */
  private generateSessionId(): string {
    return `arena-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup oude sessies
   */
  private cleanupOldSessions(): void {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const [id, session] of this.sessions) {
      if (now - session.startTime.getTime() > oneHour) {
        this.sessions.delete(id);
        this.logger.info(`[Arena Mode] Oude sessie opgeruimd: ${id}`);
      }
    }
  }

  /**
   * Get actieve sessies
   */
  getActiveSessions(): ArenaSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }

  /**
   * Stop Arena Mode sessie
   */
  stopSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'abandoned';
      this.logger.info(`[Arena Mode] Sessie gestopt: ${sessionId}`);
    }
  }
}
