import * as vscode from 'vscode';
import { Logger } from './logger';

export interface RooCodeStatus {
  installed: boolean;
  active: boolean;
  version: string | null;
  extensionId: string | null;
  capabilities: RooCodeCapabilities;
}

export interface RooCodeCapabilities {
  chatParticipant: boolean;
  orchestrator: boolean;
  cli: boolean;
  subtasks: boolean;
  disabledTools: boolean;
}

export interface RooCodeDelegationResult {
  success: boolean;
  response?: string;
  error?: string;
  delegatedTo: string;
  model?: string;
  duration?: number;
}

export interface RooCodeModel {
  id: string;
  name: string;
  provider: string;
  costPer1MInput: number;
  costPer1MOutput: number;
  maxTokens: number;
  supportsVision: boolean;
  supportsThinking: boolean;
}

// Roo Code supported models (from v3.48.0 release analysis)
export const ROO_CODE_MODELS: RooCodeModel[] = [
  {
    id: 'anthropic/claude-sonnet-4.6',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    costPer1MInput: 3.0,
    costPer1MOutput: 15.0,
    maxTokens: 1000000,
    supportsVision: true,
    supportsThinking: true
  },
  {
    id: 'anthropic/claude-opus-4.6',
    name: 'Claude Opus 4.6',
    provider: 'anthropic',
    costPer1MInput: 15.0,
    costPer1MOutput: 75.0,
    maxTokens: 1000000,
    supportsVision: true,
    supportsThinking: true
  },
  {
    id: 'openai/gpt-5.3-codex',
    name: 'GPT-5.3 Codex',
    provider: 'openai',
    costPer1MInput: 2.0,
    costPer1MOutput: 8.0,
    maxTokens: 128000,
    supportsVision: true,
    supportsThinking: false
  },
  {
    id: 'google/gemini-3-flash',
    name: 'Gemini 3 Flash',
    provider: 'google',
    costPer1MInput: 0.075,
    costPer1MOutput: 0.30,
    maxTokens: 1000000,
    supportsVision: true,
    supportsThinking: true
  },
  {
    id: 'thudm/glm-4-32b',
    name: 'GLM-4 32B',
    provider: 'thudm',
    costPer1MInput: 0.21,
    costPer1MOutput: 0.21,
    maxTokens: 128000,
    supportsVision: true,
    supportsThinking: false
  },
  {
    id: 'fireworks/kimi-k2.5',
    name: 'Kimi K2.5',
    provider: 'fireworks',
    costPer1MInput: 0.20,
    costPer1MOutput: 0.80,
    maxTokens: 131072,
    supportsVision: false,
    supportsThinking: false
  }
];

// Known Roo Code extension IDs
const ROO_CODE_EXTENSION_IDS = [
  'rooveterinaryinc.roo-cline',
  'RooVeterinaryInc.roo-cline',
  'rooveterinaryinc.roo-code',
  'RooVeterinaryInc.roo-code',
  'roocode.roo-code',
  'RooCodeInc.roo-code',
  'roo-cline'
];

export class RooCodeBridge {
  private logger: Logger;
  private status: RooCodeStatus;
  private rooExtension: vscode.Extension<any> | undefined;

  constructor() {
    this.logger = Logger.getInstance();
    this.status = {
      installed: false,
      active: false,
      version: null,
      extensionId: null,
      capabilities: {
        chatParticipant: false,
        orchestrator: false,
        cli: false,
        subtasks: false,
        disabledTools: false
      }
    };
  }

  /**
   * Detect if Roo Code is installed and active
   */
  async detect(): Promise<RooCodeStatus> {
    this.logger.info('[RooCode Bridge] Detecting Roo Code installation...');

    for (const extId of ROO_CODE_EXTENSION_IDS) {
      const ext = vscode.extensions.getExtension(extId);
      if (ext) {
        this.rooExtension = ext;
        this.status.installed = true;
        this.status.active = ext.isActive;
        this.status.version = ext.packageJSON?.version || null;
        this.status.extensionId = extId;

        // Detect capabilities based on version
        this.detectCapabilities(ext);

        this.logger.info(
          `[RooCode Bridge] Found: ${extId} v${this.status.version} ` +
          `(active: ${this.status.active})`
        );
        break;
      }
    }

    if (!this.status.installed) {
      this.logger.info('[RooCode Bridge] Roo Code not installed');
    }

    return this.status;
  }

  /**
   * Detect Roo Code capabilities based on version
   */
  private detectCapabilities(ext: vscode.Extension<any>): void {
    const version = ext.packageJSON?.version || '0.0.0';
    const [major, minor] = version.split('.').map(Number);

    // v3.47.0+ features
    if (major > 3 || (major === 3 && minor >= 47)) {
      this.status.capabilities.orchestrator = true;
      this.status.capabilities.subtasks = true;
    }

    // v3.48.0+ features
    if (major > 3 || (major === 3 && minor >= 48)) {
      this.status.capabilities.disabledTools = true;
    }

    // Chat participant available in all recent versions
    this.status.capabilities.chatParticipant = true;

    // CLI available since v0.0.50+
    this.status.capabilities.cli = true;
  }

  /**
   * Get current Roo Code status
   */
  getStatus(): RooCodeStatus {
    return this.status;
  }

  /**
   * Check if Roo Code is available for delegation
   */
  isAvailable(): boolean {
    return this.status.installed && this.status.active;
  }

  /**
   * Delegate a task to Roo Code via VS Code command API
   * Uses Roo Code's chat participant or command interface
   */
  async delegateTask(
    prompt: string,
    options: {
      model?: string;
      mode?: 'code' | 'architect' | 'ask' | 'debug';
      autoApprove?: boolean;
    } = {}
  ): Promise<RooCodeDelegationResult> {
    const startTime = Date.now();

    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Roo Code is not available',
        delegatedTo: 'roo-code'
      };
    }

    try {
      this.logger.info(
        `[RooCode Bridge] Delegating task: "${prompt.substring(0, 50)}..." ` +
        `(mode: ${options.mode || 'code'}, model: ${options.model || 'auto'})`
      );

      // Method 1: Try Roo Code's command API
      const rooCommands = await vscode.commands.getCommands(true);
      
      // Look for Roo Code specific commands
      const rooNewTask = rooCommands.find(cmd => 
        cmd.includes('roo') && cmd.includes('newTask') ||
        cmd.includes('roo') && cmd.includes('new-task') ||
        cmd.includes('roo-code') && cmd.includes('task')
      );

      const rooSendMessage = rooCommands.find(cmd =>
        cmd.includes('roo') && cmd.includes('sendMessage') ||
        cmd.includes('roo') && cmd.includes('send-message')
      );

      if (rooNewTask) {
        await vscode.commands.executeCommand(rooNewTask, {
          prompt: prompt,
          model: options.model,
          mode: options.mode || 'code',
          autoApprove: options.autoApprove ?? true
        });

        return {
          success: true,
          response: `Task delegated to Roo Code via ${rooNewTask}`,
          delegatedTo: 'roo-code',
          model: options.model,
          duration: Date.now() - startTime
        };
      }

      if (rooSendMessage) {
        await vscode.commands.executeCommand(rooSendMessage, prompt);

        return {
          success: true,
          response: `Message sent to Roo Code via ${rooSendMessage}`,
          delegatedTo: 'roo-code',
          model: options.model,
          duration: Date.now() - startTime
        };
      }

      // Method 2: Try opening Roo Code's sidebar and sending via input
      const rooFocus = rooCommands.find(cmd =>
        cmd.includes('roo') && (cmd.includes('focus') || cmd.includes('open'))
      );

      if (rooFocus) {
        await vscode.commands.executeCommand(rooFocus);
        
        return {
          success: true,
          response: `Roo Code panel opened. Please enter your prompt manually.`,
          delegatedTo: 'roo-code',
          model: options.model,
          duration: Date.now() - startTime
        };
      }

      // Method 3: Fallback - show Roo Code extension
      await vscode.commands.executeCommand('workbench.view.extension.roo-code');

      return {
        success: true,
        response: 'Roo Code opened. Direct command API not found - please enter prompt manually.',
        delegatedTo: 'roo-code',
        duration: Date.now() - startTime
      };

    } catch (error: any) {
      this.logger.error(`[RooCode Bridge] Delegation failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        delegatedTo: 'roo-code',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Get available Roo Code commands
   */
  async getAvailableCommands(): Promise<string[]> {
    const allCommands = await vscode.commands.getCommands(true);
    return allCommands.filter(cmd => 
      cmd.toLowerCase().includes('roo') ||
      cmd.toLowerCase().includes('cline')
    );
  }

  /**
   * Get Roo Code models that are also available via OpenRouter
   */
  getSharedModels(): RooCodeModel[] {
    return ROO_CODE_MODELS;
  }

  /**
   * Find the cheapest Roo Code model for a given task type
   */
  getCheapestModel(options: {
    needsVision?: boolean;
    needsThinking?: boolean;
    minTokens?: number;
  } = {}): RooCodeModel | null {
    let candidates = ROO_CODE_MODELS.filter(m => {
      if (options.needsVision && !m.supportsVision) return false;
      if (options.needsThinking && !m.supportsThinking) return false;
      if (options.minTokens && m.maxTokens < options.minTokens) return false;
      return true;
    });

    if (candidates.length === 0) return null;

    // Sort by average cost (input + output) / 2
    candidates.sort((a, b) => {
      const costA = (a.costPer1MInput + a.costPer1MOutput) / 2;
      const costB = (b.costPer1MInput + b.costPer1MOutput) / 2;
      return costA - costB;
    });

    return candidates[0];
  }

  /**
   * Compare Smart Router cost vs Roo Code cost for a model
   */
  compareCosts(modelId: string, tokens: number): {
    smartRouterCost: number;
    rooCodeCost: number;
    savings: number;
    recommendation: 'smart-router' | 'roo-code' | 'equal';
  } {
    const rooModel = ROO_CODE_MODELS.find(m => m.id === modelId);
    
    // Smart Router uses OpenRouter pricing (same models, same cost)
    // The advantage is in routing optimization, not raw pricing
    const baseCost = rooModel 
      ? (tokens / 1000000) * ((rooModel.costPer1MInput + rooModel.costPer1MOutput) / 2)
      : (tokens / 1000000) * 1.0; // Default $1/1M

    return {
      smartRouterCost: baseCost,
      rooCodeCost: baseCost,
      savings: 0,
      recommendation: 'equal'
    };
  }

  /**
   * Generate integration status report
   */
  async getIntegrationReport(): Promise<string> {
    const status = await this.detect();
    const commands = await this.getAvailableCommands();
    const models = this.getSharedModels();
    const cheapest = this.getCheapestModel();

    let report = `# Roo Code Integration Report\n\n`;
    report += `## Status\n`;
    report += `- **Installed:** ${status.installed ? 'Yes' : 'No'}\n`;
    report += `- **Active:** ${status.active ? 'Yes' : 'No'}\n`;
    report += `- **Version:** ${status.version || 'N/A'}\n`;
    report += `- **Extension ID:** ${status.extensionId || 'N/A'}\n\n`;

    report += `## Capabilities\n`;
    report += `- **Chat Participant:** ${status.capabilities.chatParticipant ? 'Yes' : 'No'}\n`;
    report += `- **Orchestrator:** ${status.capabilities.orchestrator ? 'Yes' : 'No'}\n`;
    report += `- **Subtasks:** ${status.capabilities.subtasks ? 'Yes' : 'No'}\n`;
    report += `- **CLI:** ${status.capabilities.cli ? 'Yes' : 'No'}\n`;
    report += `- **Disabled Tools:** ${status.capabilities.disabledTools ? 'Yes' : 'No'}\n\n`;

    report += `## Available Commands (${commands.length})\n`;
    commands.forEach(cmd => {
      report += `- \`${cmd}\`\n`;
    });

    report += `\n## Shared Models (${models.length})\n`;
    models.forEach(m => {
      report += `- **${m.name}** (${m.id}): $${m.costPer1MInput}/$${m.costPer1MOutput} per 1M tokens\n`;
    });

    if (cheapest) {
      report += `\n## Cost Optimization\n`;
      report += `- **Cheapest model:** ${cheapest.name} ($${cheapest.costPer1MInput}/1M input)\n`;
    }

    report += `\n## Integration Strategy\n`;
    report += `- Smart Router handles **intent classification** and **model selection**\n`;
    report += `- Roo Code handles **code execution** and **file editing**\n`;
    report += `- Both share models via **OpenRouter**\n`;
    report += `- Smart Router provides **cost tracking** across both tools\n`;

    return report;
  }
}
