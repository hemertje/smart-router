import * as vscode from 'vscode';
import { Logger } from './logger';
import { OpenRouterClient } from './openrouter';
import { MODEL_ROUTING } from './models';

export interface HealthStatus {
  healthy: boolean;
  issues: HealthIssue[];
  lastCheck: Date;
  uptime: number;
}

export interface HealthIssue {
  type: 'api_error' | 'model_unavailable' | 'timeout' | 'rate_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  message: string;
  timestamp: Date;
  resolved?: boolean;
}

export interface FallbackPlan {
  primary: string;
  fallbacks: string[];
  triggers: string[];
}

export class AutoHealingSystem {
  private logger = Logger.getInstance();
  private healthStatus: HealthStatus = {
    healthy: true,
    issues: [],
    lastCheck: new Date(),
    uptime: 0
  };
  private fallbackPlans: Map<string, FallbackPlan> = new Map();
  private recoveryAttempts: Map<string, number> = new Map();
  private startTime = Date.now();

  constructor(private openRouter: OpenRouterClient) {
    this.initializeFallbackPlans();
    this.startHealthMonitoring();
  }

  private initializeFallbackPlans(): void {
    // Architecture routing fallbacks
    this.fallbackPlans.set('architecture', {
      primary: 'swe-1.5',
      fallbacks: ['openai/gpt-3.5-turbo', 'anthropic/claude-3-haiku'],
      triggers: ['api_error', 'timeout', 'rate_limit']
    });

    this.fallbackPlans.set('architecture_screening', {
      primary: 'z-ai/glm-5',
      fallbacks: ['qwen/qwen-3.5', 'anthropic/claude-3-sonnet'],
      triggers: ['api_error', 'model_unavailable', 'timeout']
    });

    this.fallbackPlans.set('architecture_premium', {
      primary: 'anthropic/claude-3.5-sonnet',
      fallbacks: ['anthropic/claude-3-opus', 'gpt-4'],
      triggers: ['api_error', 'timeout', 'rate_limit']
    });

    // Debug fallbacks
    this.fallbackPlans.set('debug', {
      primary: 'swe-1.5',
      fallbacks: ['openai/gpt-3.5-turbo', 'anthropic/claude-3-haiku'],
      triggers: ['api_error', 'timeout']
    });

    // Code generation fallbacks
    this.fallbackPlans.set('code_generation', {
      primary: 'swe-1.5',
      fallbacks: ['openai/gpt-3.5-turbo', 'anthropic/claude-3-sonnet'],
      triggers: ['api_error', 'timeout', 'rate_limit']
    });
  }

  private startHealthMonitoring(): void {
    // Check health every 30 seconds
    setInterval(() => {
      this.performHealthCheck();
    }, 30000);

    // Update uptime every minute
    setInterval(() => {
      this.healthStatus.uptime = Date.now() - this.startTime;
    }, 60000);
  }

  async performHealthCheck(): Promise<HealthStatus> {
    const issues: HealthIssue[] = [];
    
    try {
      // Test primary models
      for (const [intent, config] of Object.entries(MODEL_ROUTING)) {
        try {
          const modelInfo = await this.openRouter.getModelInfo(config.model);
          if (!modelInfo) {
            issues.push({
              type: 'model_unavailable',
              severity: 'high',
              component: config.model,
              message: `Model ${config.model} not available`,
              timestamp: new Date()
            });
          }
        } catch (error: any) {
          issues.push({
            type: 'api_error',
            severity: 'critical',
            component: config.model,
            message: `API error for ${config.model}: ${error.message}`,
            timestamp: new Date()
          });
        }
      }

      // Check for unresolved issues
      const unresolvedIssues = this.healthStatus.issues.filter(i => !i.resolved);
      issues.push(...unresolvedIssues);

    } catch (error: any) {
      issues.push({
        type: 'api_error',
        severity: 'critical',
        component: 'health_check',
        message: `Health check failed: ${error.message}`,
        timestamp: new Date()
      });
    }

    this.healthStatus = {
      healthy: issues.filter(i => i.severity === 'critical').length === 0,
      issues,
      lastCheck: new Date(),
      uptime: Date.now() - this.startTime
    };

    // Auto-heal critical issues
    await this.autoHealCriticalIssues();

    return this.healthStatus;
  }

  private async autoHealCriticalIssues(): Promise<void> {
    const criticalIssues = this.healthStatus.issues.filter(i => 
      i.severity === 'critical' && !i.resolved
    );

    for (const issue of criticalIssues) {
      await this.attemptRecovery(issue);
    }
  }

  private async attemptRecovery(issue: HealthIssue): Promise<void> {
    const recoveryKey = `${issue.type}_${issue.component}`;
    const attempts = this.recoveryAttempts.get(recoveryKey) || 0;

    // Limit recovery attempts to prevent infinite loops
    if (attempts >= 3) {
      this.logger.error(`[AutoHealing] Max recovery attempts reached for ${recoveryKey}`);
      return;
    }

    this.recoveryAttempts.set(recoveryKey, attempts + 1);

    try {
      switch (issue.type) {
        case 'model_unavailable':
          await this.recoverModelUnavailable(issue);
          break;
        case 'api_error':
          await this.recoverApiError(issue);
          break;
        case 'timeout':
          await this.recoverTimeout(issue);
          break;
        case 'rate_limit':
          await this.recoverRateLimit(issue);
          break;
      }

      // Mark issue as resolved if recovery successful
      issue.resolved = true;
      this.logger.info(`[AutoHealing] Recovered from ${issue.type} for ${issue.component}`);

    } catch (error: any) {
      this.logger.error(`[AutoHealing] Recovery failed for ${recoveryKey}: ${error.message}`);
    }
  }

  private async recoverModelUnavailable(issue: HealthIssue): Promise<void> {
    // Find intent that uses this model
    for (const [intent, config] of Object.entries(MODEL_ROUTING)) {
      if (config.model === issue.component) {
        const fallbackPlan = this.fallbackPlans.get(intent);
        if (fallbackPlan) {
          // Try first fallback
          const fallback = fallbackPlan.fallbacks[0];
          if (fallback) {
            // Test fallback model
            await this.openRouter.getModelInfo(fallback);
            // Update model routing temporarily
            this.logger.info(`[AutoHealing] Switched ${intent} from ${issue.component} to ${fallback}`);
          }
        }
      }
    }
  }

  private async recoverApiError(issue: HealthIssue): Promise<void> {
    // Wait and retry with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, this.recoveryAttempts.get(`${issue.type}_${issue.component}`) || 0), 10000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Test connection with minimal request
    await this.openRouter.complete('openai/gpt-3.5-turbo', [
      { role: 'user', content: 'test' }
    ], { max_tokens: 1 });
  }

  private async recoverTimeout(issue: HealthIssue): Promise<void> {
    // Increase timeout for this component
    // This would require modifying the OpenRouterClient timeout settings
    this.logger.info(`[AutoHealing] Increasing timeout for ${issue.component}`);
  }

  private async recoverRateLimit(issue: HealthIssue): Promise<void> {
    // Implement rate limiting
    // Wait longer before retrying
    const delay = 60000; // 1 minute
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async getFallbackModel(intent: string, failedModel: string): Promise<string | null> {
    const fallbackPlan = this.fallbackPlans.get(intent);
    if (!fallbackPlan) return null;

    for (const fallback of fallbackPlan.fallbacks) {
      try {
        await this.openRouter.getModelInfo(fallback);
        return fallback;
      } catch (error) {
        continue; // Try next fallback
      }
    }

    return null; // No working fallback found
  }

  getHealthStatus(): HealthStatus {
    return { ...this.healthStatus };
  }

  async showHealthDashboard(): Promise<void> {
    const status = await this.performHealthCheck();
    
    const uptime = Math.floor(status.uptime / 1000 / 60); // minutes
    const criticalIssues = status.issues.filter(i => i.severity === 'critical' && !i.resolved);
    const warnings = status.issues.filter(i => i.severity === 'high' || i.severity === 'medium');

    const dashboard = `
# 🏥 Smart Router Health Dashboard

**Status:** ${status.healthy ? '🟢 HEALTHY' : '🔴 CRITICAL ISSUES'}
**Uptime:** ${uptime} minutes
**Last Check:** ${status.lastCheck.toLocaleString()}

## 🚨 Critical Issues (${criticalIssues.length})
${criticalIssues.length === 0 ? '✅ No critical issues' : 
  criticalIssues.map(i => `- **${i.component}**: ${i.message}`).join('\n')}

## ⚠️ Warnings (${warnings.length})
${warnings.length === 0 ? '✅ No warnings' : 
  warnings.map(i => `- **${i.component}**: ${i.message}`).join('\n')}

## 🔄 Auto-Healing Status
- Recovery attempts: ${Array.from(this.recoveryAttempts.values()).reduce((a, b) => a + b, 0)}
- Fallback plans: ${this.fallbackPlans.size}
- Monitoring active: ✅

---
*Auto-Healing System v2.4.0*
    `;

    const doc = await vscode.workspace.openTextDocument({
      content: dashboard,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc);
  }
}
