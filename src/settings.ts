import * as vscode from 'vscode';

export interface SmartRouterSettings {
  enabled: boolean;
  openrouterApiKey: string;
  defaultModel: string;
  costWarningThreshold: number;
  localClassifier: string;
  budgetAlerts: boolean;
  monthlyBudget: number;
  preferredModels: Record<string, string>;
  zhipuApiKey: string;
  minimaxApiKey: string;
  alibabaApiKey: string;
}

export class SettingsManager {
  private static readonly CONFIG_SECTION = 'smartRouter';

  static getSettings(): SmartRouterSettings {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    
    return {
      enabled: config.get<boolean>('enabled', true),
      openrouterApiKey: config.get<string>('openrouterApiKey', ''),
      defaultModel: config.get<string>('defaultModel', 'free-tier'),
      costWarningThreshold: config.get<number>('costWarningThreshold', 5.0),
      localClassifier: config.get<string>('localClassifier', 'ollama:qwen3:8b'),
      budgetAlerts: config.get<boolean>('budgetAlerts', true),
      monthlyBudget: config.get<number>('monthlyBudget', 50),
      preferredModels: config.get<Record<string, string>>('preferredModels', {}),
      zhipuApiKey: config.get<string>('zhipuApiKey', ''),
      minimaxApiKey: config.get<string>('minimaxApiKey', ''),
      alibabaApiKey: config.get<string>('alibabaApiKey', '')
    };
  }

  static async updateSetting(key: keyof SmartRouterSettings, value: any): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    await config.update(key, value, vscode.ConfigurationTarget.Global);
  }

  static async openSettings(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.openSettings', '@id:smartRouter');
  }

  static validateSettings(settings: SmartRouterSettings): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!settings.openrouterApiKey) {
      errors.push('OpenRouter API key is required for full functionality');
    }

    if (settings.costWarningThreshold < 0) {
      errors.push('Cost warning threshold must be positive');
    }

    if (settings.monthlyBudget < 0) {
      errors.push('Monthly budget must be positive');
    }

    const validModels = ['free-tier', 'budget', 'mid', 'premium'];
    if (!validModels.includes(settings.defaultModel)) {
      errors.push(`Default model must be one of: ${validModels.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
