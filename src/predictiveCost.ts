import * as vscode from 'vscode';
import { Logger } from './logger';
import { CostTracker } from './costTracker';
import { MODEL_ROUTING } from './models';

export interface UsagePattern {
  intent: string;
  model: string;
  frequency: number;
  avgTokens: number;
  avgCost: number;
  timeOfDay: number[];
  dayOfWeek: number[];
  lastUsed: Date;
}

export interface CostPrediction {
  predictedDailyCost: number;
  predictedMonthlyCost: number;
  budgetStatus: 'safe' | 'warning' | 'critical' | 'exceeded';
  recommendations: string[];
  savings: number;
  optimization: CostOptimization[];
}

export interface CostOptimization {
  type: 'model_switch' | 'usage_reduction' | 'timing_shift';
  description: string;
  potentialSavings: number;
  confidence: number;
  action: string;
}

export class PredictiveCostEngine {
  private logger = Logger.getInstance();
  private usagePatterns: Map<string, UsagePattern> = new Map();
  private costHistory: Array<{ date: Date; cost: number; usage: number }> = [];
  private predictions: CostPrediction | null = null;

  constructor(private costTracker: CostTracker) {
    this.startDataCollection();
    this.startPredictionEngine();
  }

  private startDataCollection(): void {
    // Collect usage data every hour
    setInterval(() => {
      this.collectUsageData();
    }, 3600000); // 1 hour
  }

  private startPredictionEngine(): void {
    // Update predictions every 30 minutes
    setInterval(() => {
      this.updatePredictions();
    }, 1800000); // 30 minutes
  }

  private async collectUsageData(): Promise<void> {
    try {
      // Get current usage from cost tracker
      const stats = await this.costTracker.getStats();
      
      if (!stats) {
        this.logger.warn('[PredictiveCost] No stats available');
        return;
      }
      
      // Analyze usage patterns
      for (const [intent, count] of Object.entries(stats.intentBreakdown)) {
        const pattern = this.usagePatterns.get(intent) || {
          intent,
          model: MODEL_ROUTING[intent as keyof typeof MODEL_ROUTING]?.model || 'unknown',
          frequency: 0,
          avgTokens: 0,
          avgCost: 0,
          timeOfDay: [],
          dayOfWeek: [],
          lastUsed: new Date()
        };

        // Update pattern with new data
        pattern.frequency += count as number;
        pattern.lastUsed = new Date();
        pattern.timeOfDay.push(new Date().getHours());
        pattern.dayOfWeek.push(new Date().getDay());

        this.usagePatterns.set(intent, pattern);
      }

      // Store cost history
      this.costHistory.push({
        date: new Date(),
        cost: stats.totalCost,
        usage: stats.totalRequests
      });

      // Keep only last 30 days of history
      if (this.costHistory.length > 720) { // 30 days * 24 hours
        this.costHistory = this.costHistory.slice(-720);
      }

    } catch (error: any) {
      this.logger.error(`[PredictiveCost] Failed to collect usage data: ${error.message}`);
    }
  }

  private async updatePredictions(): Promise<void> {
    try {
      const stats = await this.costTracker.getStats();
      const settings = vscode.workspace.getConfiguration('smartRouter');
      const monthlyBudget = settings.get<number>('monthlyBudget') || 50;

      // Calculate predictions based on patterns
      const dailyAverage = this.calculateDailyAverage();
      const monthlyProjection = dailyAverage * 30;
      
      // Generate optimizations
      const optimizations = this.generateOptimizations(stats);

      // Calculate potential savings
      const potentialSavings = optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0);

      this.predictions = {
        predictedDailyCost: dailyAverage,
        predictedMonthlyCost: monthlyProjection,
        budgetStatus: this.getBudgetStatus(monthlyProjection, monthlyBudget),
        recommendations: this.generateRecommendations(monthlyProjection, monthlyBudget, optimizations),
        savings: potentialSavings,
        optimization: optimizations
      };

      // Show alerts if needed
      await this.checkBudgetAlerts();

    } catch (error: any) {
      this.logger.error(`[PredictiveCost] Failed to update predictions: ${error.message}`);
    }
  }

  private calculateDailyAverage(): number {
    if (this.costHistory.length < 7) {
      // Not enough data, use recent average
      return this.costHistory.reduce((sum, entry) => sum + entry.cost, 0) / Math.max(1, this.costHistory.length);
    }

    // Use weighted average (more recent = more weight)
    const weights = this.costHistory.map((_, index) => (index + 1) / this.costHistory.length);
    const weightedSum = this.costHistory.reduce((sum, entry, index) => sum + entry.cost * weights[index], 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    return weightedSum / totalWeight;
  }

  private getBudgetStatus(projected: number, budget: number): 'safe' | 'warning' | 'critical' | 'exceeded' {
    const ratio = projected / budget;
    
    if (ratio > 1) return 'exceeded';
    if (ratio > 0.9) return 'critical';
    if (ratio > 0.7) return 'warning';
    return 'safe';
  }

  private generateOptimizations(stats: any): CostOptimization[] {
    const optimizations: CostOptimization[] = [];

    // Analyze each intent for optimization opportunities
    for (const [intent, pattern] of this.usagePatterns.entries()) {
      const modelConfig = MODEL_ROUTING[intent as keyof typeof MODEL_ROUTING];
      if (!modelConfig) continue;

      // Check for cheaper alternatives
      const cheaperAlternatives = this.findCheaperAlternatives(intent, modelConfig.cost);
      
      if (cheaperAlternatives.length > 0) {
        const potentialSavings = (modelConfig.cost - cheaperAlternatives[0].cost) * pattern.frequency * 30;
        
        optimizations.push({
          type: 'model_switch',
          description: `Switch ${intent} from ${modelConfig.model} to ${cheaperAlternatives[0].model}`,
          potentialSavings,
          confidence: 0.8,
          action: `Update MODEL_ROUTING for ${intent}`
        });
      }

      // Check for usage reduction opportunities
      if (pattern.frequency > 10) { // High frequency usage
        const reductionSavings = modelConfig.cost * pattern.frequency * 0.2 * 30; // 20% reduction
        
        optimizations.push({
          type: 'usage_reduction',
          description: `Reduce ${intent} usage by 20% through caching or batching`,
          potentialSavings: reductionSavings,
          confidence: 0.6,
          action: `Implement context caching for ${intent}`
        });
      }
    }

    // Sort by potential savings
    return optimizations.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  private findCheaperAlternatives(intent: string, currentCost: number): Array<{ model: string; cost: number }> {
    const alternatives: Array<{ model: string; cost: number }> = [];

    for (const [otherIntent, config] of Object.entries(MODEL_ROUTING)) {
      if (config.cost < currentCost && this.isCompatibleModel(intent, otherIntent)) {
        alternatives.push({ model: config.model, cost: config.cost });
      }
    }

    return alternatives;
  }

  private isCompatibleModel(targetIntent: string, sourceIntent: string): boolean {
    // Simple compatibility check - can be enhanced
    const compatibility: Record<string, string[]> = {
      'debug': ['simple', 'code_generation'],
      'code_generation': ['simple'],
      'architecture': ['code_generation', 'debug'],
      'architecture_screening': ['debug', 'simple'],
      'architecture_premium': ['architecture', 'architecture_screening']
    };

    return compatibility[targetIntent]?.includes(sourceIntent) || false;
  }

  private generateRecommendations(projected: number, budget: number, optimizations: CostOptimization[]): string[] {
    const recommendations: string[] = [];

    if (projected > budget) {
      recommendations.push(`🚨 Budget exceeded by $${(projected - budget).toFixed(2)}`);
      recommendations.push('💡 Implement top 3 optimizations immediately');
    } else if (projected > budget * 0.9) {
      recommendations.push(`⚠️ Budget nearly exceeded (${((projected / budget) * 100).toFixed(1)}%)`);
      recommendations.push('💡 Consider implementing high-impact optimizations');
    }

    if (optimizations.length > 0) {
      const topOptimization = optimizations[0];
      recommendations.push(`💰 Top saving: ${topOptimization.description} ($${topOptimization.potentialSavings.toFixed(2)})`);
    }

    // Usage pattern recommendations
    const highUsageIntents = Array.from(this.usagePatterns.entries())
      .filter(([_, pattern]) => pattern.frequency > 5)
      .sort((a, b) => b[1].frequency - a[1].frequency)
      .slice(0, 3);

    if (highUsageIntents.length > 0) {
      recommendations.push(`📊 High usage: ${highUsageIntents.map(([intent]) => intent).join(', ')}`);
      recommendations.push('🔄 Consider context caching for frequent queries');
    }

    return recommendations;
  }

  private async checkBudgetAlerts(): Promise<void> {
    if (!this.predictions) return;

    const settings = vscode.workspace.getConfiguration('smartRouter');
    const budgetAlerts = settings.get<boolean>('budgetAlerts');
    
    if (!budgetAlerts) return;

    if (this.predictions.budgetStatus === 'critical' || this.predictions.budgetStatus === 'exceeded') {
      const message = this.predictions.budgetStatus === 'exceeded' 
        ? `🚨 Budget exceeded! Predicted: $${this.predictions.predictedMonthlyCost.toFixed(2)}`
        : `⚠️ Budget critical! Predicted: $${this.predictions.predictedMonthlyCost.toFixed(2)}`;

      vscode.window.showWarningMessage(message, 'View Optimizations').then(selection => {
        if (selection === 'View Optimizations') {
          vscode.commands.executeCommand('smart.showCostPredictions');
        }
      });
    }
  }

  async getCostPredictions(): Promise<CostPrediction> {
    if (!this.predictions) {
      await this.updatePredictions();
    }
    return this.predictions || {
      predictedDailyCost: 0,
      predictedMonthlyCost: 0,
      budgetStatus: 'safe',
      recommendations: [],
      savings: 0,
      optimization: []
    };
  }

  async showCostPredictions(): Promise<void> {
    const predictions = await this.getCostPredictions();
    const stats = await this.costTracker.getStats();

    const statusIcon = {
      safe: '🟢',
      warning: '🟡',
      critical: '🟠',
      exceeded: '🔴'
    }[predictions.budgetStatus];

    const dashboard = `
# 💰 Smart Router Cost Predictions

**Status:** ${statusIcon} ${predictions.budgetStatus.toUpperCase()}
**Predicted Daily:** $${predictions.predictedDailyCost.toFixed(2)}
**Predicted Monthly:** $${predictions.predictedMonthlyCost.toFixed(2)}
**Potential Savings:** $${predictions.savings.toFixed(2)}

## 📊 Current Usage
- **Total Cost:** $${stats?.totalCost.toFixed(2) || '0.00'}
- **Total Requests:** ${stats?.totalRequests || 0}
- **Average Cost/Request:** $${stats ? (stats.totalCost / Math.max(1, stats.totalRequests)).toFixed(4) : '0.0000'}

## 🎯 Recommendations
${predictions.recommendations.map(rec => `- ${rec}`).join('\n')}

## 💡 Optimizations (${predictions.optimization.length})
${predictions.optimization.slice(0, 5).map(opt => 
  `### ${opt.description}
  - **Potential Savings:** $${opt.potentialSavings.toFixed(2)}
  - **Confidence:** ${(opt.confidence * 100).toFixed(0)}%
  - **Action:** ${opt.action}`
).join('\n\n')}

## 📈 Usage Patterns
${Array.from(this.usagePatterns.entries()).map(([intent, pattern]) => 
  `- **${intent}:** ${pattern.frequency} uses/day, $${pattern.avgCost.toFixed(3)}/request`
).join('\n')}

---
*Predictive Cost Engine v2.5.0*
    `;

    const doc = await vscode.workspace.openTextDocument({
      content: dashboard,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc);
  }

  async applyOptimization(optimization: CostOptimization): Promise<void> {
    switch (optimization.type) {
      case 'model_switch':
        // This would require updating the MODEL_ROUTING configuration
        vscode.window.showInformationMessage(
          `To apply this optimization, update MODEL_ROUTING in src/models.ts`,
          'Open models.ts'
        ).then(selection => {
          if (selection === 'Open models.ts') {
            vscode.workspace.openTextDocument('src/models.ts');
          }
        });
        break;
        
      case 'usage_reduction':
        vscode.window.showInformationMessage(
          'To reduce usage, enable context caching in settings',
          'Open Settings'
        ).then(selection => {
          if (selection === 'Open Settings') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'smartRouter.contextCache');
          }
        });
        break;
        
      case 'timing_shift':
        vscode.window.showInformationMessage(
          'Consider shifting heavy usage to off-peak hours for better performance'
        );
        break;
    }
  }
}
