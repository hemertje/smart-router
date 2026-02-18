import * as vscode from 'vscode';
import { OpenRouterClient } from './openrouter';
import { Logger } from './logger';
import { MODEL_ROUTING } from './models';

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  recommendations: string[];
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  component: string;
  message: string;
  fix?: string;
}

export class ProactiveValidator {
  private logger = Logger.getInstance();
  private openRouter: OpenRouterClient;

  constructor(apiKey: string) {
    this.openRouter = new OpenRouterClient(apiKey);
  }

  async validateSystem(): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const recommendations: string[] = [];

    // 1. API Key Validation
    const apiKeyValid = await this.validateApiKey();
    if (!apiKeyValid.valid) {
      issues.push(...apiKeyValid.issues);
    }

    // 2. Model Availability Validation
    const modelsValid = await this.validateModelAvailability();
    if (!modelsValid.valid) {
      issues.push(...modelsValid.issues);
    }

    // 3. Pricing Validation
    const pricingValid = await this.validatePricing();
    if (!pricingValid.valid) {
      issues.push(...pricingValid.issues);
    }

    // 4. Configuration Validation
    const configValid = await this.validateConfiguration();
    if (!configValid.valid) {
      issues.push(...configValid.issues);
    }

    // 5. Generate Recommendations
    recommendations.push(...this.generateRecommendations(issues));

    return {
      valid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      recommendations
    };
  }

  private async validateApiKey(): Promise<{ valid: boolean; issues: ValidationIssue[] }> {
    const issues: ValidationIssue[] = [];

    try {
      // Test API key with minimal request
      await this.openRouter.complete('openai/gpt-3.5-turbo', [
        { role: 'user', content: 'test' }
      ], { max_tokens: 1 });
    } catch (error: any) {
      issues.push({
        type: 'error',
        component: 'OpenRouter API',
        message: `API key validation failed: ${error.message}`,
        fix: 'Update OpenRouter API key in VS Code settings'
      });
    }

    return { valid: issues.length === 0, issues };
  }

  private async validateModelAvailability(): Promise<{ valid: boolean; issues: ValidationIssue[] }> {
    const issues: ValidationIssue[] = [];

    // Check critical models - fetch list once for efficiency
    const criticalModels = [
      'qwen/qwen3-235b-a22b',
      'anthropic/claude-sonnet-4.6',
      'google/gemini-2.0-flash-001'
    ];

    try {
      const availableModels = await this.openRouter.listModels();
      if (availableModels.length === 0) {
        issues.push({
          type: 'warning',
          component: 'Model Availability',
          message: 'Could not fetch model list from OpenRouter (API key may not be set)',
          fix: 'Set smartRouter.openrouterApiKey in VS Code settings'
        });
      } else {
        for (const modelId of criticalModels) {
          if (!availableModels.includes(modelId)) {
            issues.push({
              type: 'warning',
              component: 'Model Availability',
              message: `Model not found in OpenRouter: ${modelId}`,
              fix: 'Check model availability at openrouter.ai/models'
            });
          }
        }
      }
    } catch (error: any) {
      issues.push({
        type: 'warning',
        component: 'Model Availability',
        message: `Cannot validate models: ${error.message}`,
        fix: 'Verify OpenRouter service status and API key'
      });
    }

    return { valid: issues.length === 0, issues };
  }

  private async validatePricing(): Promise<{ valid: boolean; issues: ValidationIssue[] }> {
    const issues: ValidationIssue[] = [];

    // Validate pricing data in MODEL_ROUTING
    for (const [intent, config] of Object.entries(MODEL_ROUTING)) {
      if (config.cost < 0 || config.cost > 100) {
        issues.push({
          type: 'warning',
          component: 'Pricing Data',
          message: `Suspicious pricing for ${intent}: $${config.cost}`,
          fix: 'Verify and update pricing information'
        });
      }
    }

    return { valid: issues.length === 0, issues };
  }

  private async validateConfiguration(): Promise<{ valid: boolean; issues: ValidationIssue[] }> {
    const issues: ValidationIssue[] = [];

    // Check VS Code settings
    const settings = vscode.workspace.getConfiguration('smartRouter');
    
    const apiKey = settings.get<string>('openrouterApiKey');
    if (!apiKey || apiKey.length < 10) {
      issues.push({
        type: 'error',
        component: 'Configuration',
        message: 'OpenRouter API key not configured',
        fix: 'Set smartRouter.openrouterApiKey in VS Code settings'
      });
    }

    const monthlyBudget = settings.get<number>('monthlyBudget');
    if (!monthlyBudget || monthlyBudget <= 0) {
      issues.push({
        type: 'warning',
        component: 'Configuration',
        message: 'Monthly budget not set or invalid',
        fix: 'Set a reasonable monthly budget in settings'
      });
    }

    return { valid: issues.length === 0, issues };
  }

  private generateRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations: string[] = [];

    // Analyze issue patterns
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;

    if (errorCount > 0) {
      recommendations.push(`🚨 Critical issues found: ${errorCount}. Fix these immediately.`);
    }

    if (warningCount > 3) {
      recommendations.push(`⚠️ Multiple warnings: ${warningCount}. Review configuration.`);
    }

    // Specific recommendations based on issue types
    const apiIssues = issues.filter(i => i.component === 'OpenRouter API');
    if (apiIssues.length > 0) {
      recommendations.push('🔑 Verify OpenRouter API key and service status');
    }

    const modelIssues = issues.filter(i => i.component === 'Model Availability');
    if (modelIssues.length > 0) {
      recommendations.push('🤖 Check model availability and update routing');
    }

    const pricingIssues = issues.filter(i => i.component === 'Pricing Data');
    if (pricingIssues.length > 0) {
      recommendations.push('💰 Update pricing information with verified sources');
    }

    // Proactive recommendations
    if (issues.length === 0) {
      recommendations.push('✅ System is healthy! Consider enabling Arena Mode for testing.');
      recommendations.push('📊 Monitor costs regularly with smart.showCosts command.');
      recommendations.push('🖼️ Try screenshot analysis with smart.analyzeImage command.');
    }

    return recommendations;
  }

  async showValidationResults(): Promise<void> {
    const validation = await this.validateSystem();
    
    // Create output
    const output = validation.issues.map(issue => {
      const icon = issue.type === 'error' ? '🚨' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
      return `${icon} **${issue.component}**: ${issue.message}${issue.fix ? `\n   💡 Fix: ${issue.fix}` : ''}`;
    }).join('\n\n');

    const recommendations = validation.recommendations.map(rec => `- ${rec}`).join('\n');

    const message = `
# 🧠 Smart Router System Validation

**Status:** ${validation.valid ? '✅ Healthy' : '❌ Issues Found'}

## Issues (${validation.issues.length})
${output || 'No issues found!'}

## Recommendations
${recommendations}

---
*Last validated: ${new Date().toLocaleString()}*
    `;

    // Show in new document
    const doc = await vscode.workspace.openTextDocument({
      content: message,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc);

    // Log to console
    this.logger.info(`[ProactiveValidator] Validation complete: ${validation.valid ? 'HEALTHY' : 'ISSUES FOUND'}`);
  }
}
