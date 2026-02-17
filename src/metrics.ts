export interface MetricsData {
  totalRequests: number;
  totalCost: number;
  averageResponseTime: number;
  intentDistribution: Record<string, number>;
  modelDistribution: Record<string, number>;
  errorRate: number;
  dailyStats: Record<string, DailyStats>;
  hourlyStats: Record<string, HourlyStats>;
}

export interface DailyStats {
  date: string;
  requests: number;
  cost: number;
  averageResponseTime: number;
  errors: number;
}

export interface HourlyStats {
  hour: string;
  requests: number;
  cost: number;
  averageResponseTime: number;
  errors: number;
}

export interface RequestMetric {
  timestamp: string;
  intent: string;
  model: string;
  cost: number;
  responseTime: number;
  tokens?: number;
  success: boolean;
  error?: string;
}

export class MetricsCollector {
  private metrics: RequestMetric[] = [];
  private maxMetrics = 10000; // Keep last 10k requests

  recordRequest(metric: RequestMetric) {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(): MetricsData {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        totalCost: 0,
        averageResponseTime: 0,
        intentDistribution: {},
        modelDistribution: {},
        errorRate: 0,
        dailyStats: {},
        hourlyStats: {}
      };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Filter metrics from last 30 days
    const recentMetrics = this.metrics.filter(m => 
      new Date(m.timestamp) >= thirtyDaysAgo
    );

    const totalRequests = recentMetrics.length;
    const successfulRequests = recentMetrics.filter(m => m.success).length;
    const totalCost = recentMetrics.reduce((sum, m) => sum + m.cost, 0);
    const totalResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    const averageResponseTime = totalResponseTime / totalRequests;
    const errorRate = (totalRequests - successfulRequests) / totalRequests;

    // Intent distribution
    const intentDistribution = recentMetrics.reduce((acc, m) => {
      acc[m.intent] = (acc[m.intent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Model distribution
    const modelDistribution = recentMetrics.reduce((acc, m) => {
      acc[m.model] = (acc[m.model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Daily stats
    const dailyStats = recentMetrics.reduce((acc, m) => {
      const date = m.timestamp.split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          requests: 0,
          cost: 0,
          averageResponseTime: 0,
          errors: 0
        };
      }
      
      acc[date].requests++;
      acc[date].cost += m.cost;
      acc[date].errors += m.success ? 0 : 1;
      
      return acc;
    }, {} as Record<string, DailyStats>);

    // Calculate average response times per day
    Object.keys(dailyStats).forEach(date => {
      const dayMetrics = recentMetrics.filter(m => m.timestamp.startsWith(date));
      const dayResponseTime = dayMetrics.reduce((sum, m) => sum + m.responseTime, 0);
      dailyStats[date].averageResponseTime = dayResponseTime / dayMetrics.length;
    });

    // Hourly stats (last 24 hours)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentHourlyMetrics = this.metrics.filter(m => 
      new Date(m.timestamp) >= twentyFourHoursAgo
    );

    const hourlyStats = recentHourlyMetrics.reduce((acc, m) => {
      const hour = m.timestamp.substring(0, 13); // YYYY-MM-DDTHH
      
      if (!acc[hour]) {
        acc[hour] = {
          hour,
          requests: 0,
          cost: 0,
          averageResponseTime: 0,
          errors: 0
        };
      }
      
      acc[hour].requests++;
      acc[hour].cost += m.cost;
      acc[hour].errors += m.success ? 0 : 1;
      
      return acc;
    }, {} as Record<string, HourlyStats>);

    // Calculate average response times per hour
    Object.keys(hourlyStats).forEach(hour => {
      const hourMetrics = recentHourlyMetrics.filter(m => m.timestamp.startsWith(hour));
      const hourResponseTime = hourMetrics.reduce((sum, m) => sum + m.responseTime, 0);
      hourlyStats[hour].averageResponseTime = hourResponseTime / hourMetrics.length;
    });

    return {
      totalRequests,
      totalCost,
      averageResponseTime,
      intentDistribution,
      modelDistribution,
      errorRate,
      dailyStats,
      hourlyStats
    };
  }

  getTopIntents(limit: number = 10): Array<{ intent: string; count: number; percentage: number }> {
    const metrics = this.getMetrics();
    const sorted = Object.entries(metrics.intentDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([intent, count]) => ({
        intent,
        count,
        percentage: (count / metrics.totalRequests) * 100
      }));
    
    return sorted;
  }

  getTopModels(limit: number = 10): Array<{ model: string; count: number; percentage: number }> {
    const metrics = this.getMetrics();
    const sorted = Object.entries(metrics.modelDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([model, count]) => ({
        model,
        count,
        percentage: (count / metrics.totalRequests) * 100
      }));
    
    return sorted;
  }

  getCostTrend(days: number = 7): Array<{ date: string; cost: number; requests: number }> {
    const metrics = this.getMetrics();
    const sortedDates = Object.keys(metrics.dailyStats)
      .sort()
      .slice(-days);
    
    return sortedDates.map(date => ({
      date,
      cost: metrics.dailyStats[date].cost,
      requests: metrics.dailyStats[date].requests
    }));
  }

  getPerformanceReport(): string {
    const metrics = this.getMetrics();
    
    return `
📊 **Smart Router Performance Report**

**Overall Metrics:**
- Total Requests: ${metrics.totalRequests}
- Total Cost: $${metrics.totalCost.toFixed(2)}
- Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms
- Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%

**Top Intents:**
${this.getTopIntents(5).map(({ intent, count, percentage }) => 
  `- ${intent}: ${count} (${percentage.toFixed(1)}%)`
).join('\n')}

**Top Models:**
${this.getTopModels(5).map(({ model, count, percentage }) => 
  `- ${model}: ${count} (${percentage.toFixed(1)}%)`
).join('\n')}

**Recent Daily Costs (Last 7 Days):**
${this.getCostTrend(7).map(({ date, cost, requests }) => 
  `- ${date}: $${cost.toFixed(2)} (${requests} requests)`
).join('\n')}
    `.trim();
  }

  exportMetrics(): string {
    return JSON.stringify(this.getMetrics(), null, 2);
  }

  clearMetrics() {
    this.metrics = [];
  }
}
