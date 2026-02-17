import * as fs from 'fs';
import * as path from 'path';
import { Intent, ModelConfig } from './models';
import { ProjectDetector } from './projectDetector';

export interface UsageRecord {
  timestamp: string;
  intent: Intent;
  model: string;
  cost: number;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  query: string;
  responseTime: number;
}

export interface UsageStats {
  totalCost: number;
  totalRequests: number;
  requests: UsageRecord[];
  intentBreakdown: Record<Intent, number>;
  modelBreakdown: Record<string, number>;
  dailyCosts: Record<string, number>;
}

export class CostTracker {
  private projectDetector: ProjectDetector;
  private usageFile: string | null = null;

  constructor(projectDetector: ProjectDetector) {
    this.projectDetector = projectDetector;
  }

  async initialize(): Promise<void> {
    this.usageFile = await this.projectDetector.getUsageFilePath();
  }

  async trackUsage(
    intent: Intent,
    model: string,
    cost: number,
    query: string,
    responseTime: number,
    tokens?: { prompt: number; completion: number; total: number }
  ): Promise<void> {
    if (!this.usageFile) {
      console.warn('No usage file available, skipping cost tracking');
      return;
    }

    const record: UsageRecord = {
      timestamp: new Date().toISOString(),
      intent,
      model,
      cost,
      query: query.substring(0, 100), // Limit query length
      responseTime,
      tokens
    };

    try {
      const stats = await this.loadStats();
      stats.requests.push(record);
      stats.totalCost += cost;
      stats.totalRequests += 1;
      
      // Update breakdowns
      stats.intentBreakdown[intent] = (stats.intentBreakdown[intent] || 0) + 1;
      stats.modelBreakdown[model] = (stats.modelBreakdown[model] || 0) + 1;
      
      // Update daily costs
      const today = new Date().toISOString().split('T')[0];
      stats.dailyCosts[today] = (stats.dailyCosts[today] || 0) + cost;

      await this.saveStats(stats);
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  }

  async getStats(): Promise<UsageStats | null> {
    if (!this.usageFile) {
      return null;
    }
    return await this.loadStats();
  }

  private async loadStats(): Promise<UsageStats> {
    if (!this.usageFile || !fs.existsSync(this.usageFile)) {
      return {
        totalCost: 0,
        totalRequests: 0,
        requests: [],
        intentBreakdown: {} as Record<Intent, number>,
        modelBreakdown: {},
        dailyCosts: {}
      };
    }

    try {
      const data = fs.readFileSync(this.usageFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load usage stats:', error);
      return this.getEmptyStats();
    }
  }

  private async saveStats(stats: UsageStats): Promise<void> {
    if (!this.usageFile) {
      return;
    }

    try {
      // Keep only last 1000 requests to prevent file from growing too large
      if (stats.requests.length > 1000) {
        stats.requests = stats.requests.slice(-1000);
      }

      fs.writeFileSync(this.usageFile, JSON.stringify(stats, null, 2));
    } catch (error) {
      console.error('Failed to save usage stats:', error);
    }
  }

  private getEmptyStats(): UsageStats {
    return {
      totalCost: 0,
      totalRequests: 0,
      requests: [],
      intentBreakdown: {} as Record<Intent, number>,
      modelBreakdown: {},
      dailyCosts: {}
    };
  }

  async getCostSummary(): Promise<string> {
    const stats = await this.getStats();
    if (!stats) {
      return 'No cost tracking available';
    }

    const project = await this.projectDetector.detectProject();
    const projectName = project?.name || 'Unknown';

    const today = new Date().toISOString().split('T')[0];
    const todayCost = stats.dailyCosts[today] || 0;
    const weekCost = this.getWeekCost(stats.dailyCosts);
    const monthCost = this.getMonthCost(stats.dailyCosts);

    return `
💰 **Cost Summary - ${projectName}**

| Period | Cost |
|--------|------|
| Today | $${todayCost.toFixed(2)} |
| This Week | $${weekCost.toFixed(2)} |
| This Month | $${monthCost.toFixed(2)} |
| All Time | $${stats.totalCost.toFixed(2)} |

**Total Requests:** ${stats.totalRequests}

**Intent Breakdown:**
${Object.entries(stats.intentBreakdown)
  .map(([intent, count]) => `- ${intent}: ${count}`)
  .join('\n')}

**Model Breakdown:**
${Object.entries(stats.modelBreakdown)
  .map(([model, count]) => `- ${model}: ${count}`)
  .join('\n')}
    `.trim();
  }

  private getWeekCost(dailyCosts: Record<string, number>): number {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    let weekCost = 0;
    for (let d = new Date(weekStart); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      weekCost += dailyCosts[dateStr] || 0;
    }
    
    return weekCost;
  }

  private getMonthCost(dailyCosts: Record<string, number>): number {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    let monthCost = 0;
    for (let d = new Date(monthStart); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      monthCost += dailyCosts[dateStr] || 0;
    }
    
    return monthCost;
  }
}
