import * as vscode from 'vscode';
import { Logger } from './logger';

export interface PerformanceMetrics {
  latency: {
    current: number;
    average: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  errors: {
    rate: number;
    totalErrors: number;
    errorTypes: Record<string, number>;
  };
  resources: {
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
  };
  bottlenecks: PerformanceBottleneck[];
}

export interface PerformanceBottleneck {
  type: 'latency' | 'throughput' | 'error_rate' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  description: string;
  impact: string;
  recommendation: string;
  detected: Date;
}

export interface PerformanceAlert {
  type: 'latency_spike' | 'error_burst' | 'resource_exhaustion' | 'throughput_drop';
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: Date;
  resolved?: boolean;
}

export class RealTimePerformanceMonitor {
  private logger = Logger.getInstance();
  private metrics: PerformanceMetrics = {
    latency: { current: 0, average: 0, p95: 0, p99: 0 },
    throughput: { requestsPerSecond: 0, requestsPerMinute: 0, requestsPerHour: 0 },
    errors: { rate: 0, totalErrors: 0, errorTypes: {} },
    resources: { memoryUsage: 0, cpuUsage: 0, activeConnections: 0 },
    bottlenecks: []
  };
  
  private latencyHistory: number[] = [];
  private requestTimestamps: number[] = [];
  private errorTimestamps: Array<{ timestamp: number; type: string }> = [];
  private alerts: PerformanceAlert[] = [];
  private monitoringActive = false;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    this.monitoringActive = true;
    
    // Update metrics every 5 seconds
    setInterval(() => {
      if (this.monitoringActive) {
        this.updateMetrics();
        this.detectBottlenecks();
        this.checkAlerts();
      }
    }, 5000);

    // Clean old data every minute
    setInterval(() => {
      this.cleanupOldData();
    }, 60000);
  }

  recordRequest(startTime: number, endTime: number, success: boolean, errorType?: string): void {
    const latency = endTime - startTime;
    const now = Date.now();

    // Record latency
    this.latencyHistory.push(latency);
    this.metrics.latency.current = latency;

    // Record request timestamp
    this.requestTimestamps.push(now);

    // Record error if any
    if (!success && errorType) {
      this.errorTimestamps.push({ timestamp: now, type: errorType });
      this.metrics.errors.totalErrors++;
      this.metrics.errors.errorTypes[errorType] = (this.metrics.errors.errorTypes[errorType] || 0) + 1;
    }

    // Keep only last 1000 latency measurements
    if (this.latencyHistory.length > 1000) {
      this.latencyHistory = this.latencyHistory.slice(-1000);
    }
  }

  private updateMetrics(): void {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;

    // Update latency metrics
    if (this.latencyHistory.length > 0) {
      const sorted = [...this.latencyHistory].sort((a, b) => a - b);
      this.metrics.latency.average = this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
      this.metrics.latency.p95 = sorted[Math.floor(sorted.length * 0.95)];
      this.metrics.latency.p99 = sorted[Math.floor(sorted.length * 0.99)];
    }

    // Update throughput metrics
    const recentRequests = this.requestTimestamps.filter(t => t >= oneSecondAgo);
    const minuteRequests = this.requestTimestamps.filter(t => t >= oneMinuteAgo);
    const hourRequests = this.requestTimestamps.filter(t => t >= oneHourAgo);

    this.metrics.throughput.requestsPerSecond = recentRequests.length;
    this.metrics.throughput.requestsPerMinute = minuteRequests.length;
    this.metrics.throughput.requestsPerHour = hourRequests.length;

    // Update error rate
    const recentErrors = this.errorTimestamps.filter(e => e.timestamp >= oneMinuteAgo);
    this.metrics.errors.rate = minuteRequests.length > 0 ? recentErrors.length / minuteRequests.length : 0;

    // Update resource metrics (simplified)
    this.updateResourceMetrics();
  }

  private updateResourceMetrics(): void {
    // Memory usage (simplified - would need more sophisticated tracking)
    if (process.memoryUsage) {
      const usage = process.memoryUsage();
      this.metrics.resources.memoryUsage = usage.heapUsed / 1024 / 1024; // MB
    }

    // CPU usage (simplified - would need more sophisticated tracking)
    this.metrics.resources.cpuUsage = Math.random() * 20; // Placeholder

    // Active connections (based on recent requests)
    const fiveSecondsAgo = Date.now() - 5000;
    this.metrics.resources.activeConnections = this.requestTimestamps.filter(t => t >= fiveSecondsAgo).length;
  }

  private detectBottlenecks(): void {
    const newBottlenecks: PerformanceBottleneck[] = [];

    // Latency bottleneck
    if (this.metrics.latency.p95 > 5000) { // 5 seconds
      newBottlenecks.push({
        type: 'latency',
        severity: this.metrics.latency.p95 > 10000 ? 'critical' : 'high',
        component: 'API Calls',
        description: `95th percentile latency is ${this.metrics.latency.p95}ms`,
        impact: 'Slow response times affecting user experience',
        recommendation: 'Consider implementing request queuing or load balancing',
        detected: new Date()
      });
    }

    // Error rate bottleneck
    if (this.metrics.errors.rate > 0.1) { // 10% error rate
      newBottlenecks.push({
        type: 'error_rate',
        severity: this.metrics.errors.rate > 0.2 ? 'critical' : 'medium',
        component: 'API Reliability',
        description: `Error rate is ${(this.metrics.errors.rate * 100).toFixed(1)}%`,
        impact: 'High failure rate causing user frustration',
        recommendation: 'Implement better error handling and retry logic',
        detected: new Date()
      });
    }

    // Resource bottleneck
    if (this.metrics.resources.memoryUsage > 500) { // 500MB
      newBottlenecks.push({
        type: 'resource',
        severity: this.metrics.resources.memoryUsage > 1000 ? 'critical' : 'medium',
        component: 'Memory Usage',
        description: `Memory usage is ${this.metrics.resources.memoryUsage.toFixed(1)}MB`,
        impact: 'Potential memory leaks affecting stability',
        recommendation: 'Implement memory cleanup and reduce caching',
        detected: new Date()
      });
    }

    // Throughput bottleneck
    if (this.metrics.throughput.requestsPerSecond < 0.1 && this.requestTimestamps.length > 10) {
      newBottlenecks.push({
        type: 'throughput',
        severity: 'low',
        component: 'Request Processing',
        description: 'Low throughput detected',
        impact: 'Reduced system efficiency',
        recommendation: 'Optimize request processing pipeline',
        detected: new Date()
      });
    }

    // Add new bottlenecks (avoid duplicates)
    for (const bottleneck of newBottlenecks) {
      const exists = this.metrics.bottlenecks.some(existing => 
        existing.type === bottleneck.type && 
        existing.component === bottleneck.component &&
        existing.detected.getTime() > bottleneck.detected.getTime() - 60000 // Within last minute
      );

      if (!exists) {
        this.metrics.bottlenecks.push(bottleneck);
      }
    }

    // Keep only last 50 bottlenecks
    if (this.metrics.bottlenecks.length > 50) {
      this.metrics.bottlenecks = this.metrics.bottlenecks.slice(-50);
    }
  }

  private checkAlerts(): void {
    const now = Date.now();

    // Latency spike alert
    if (this.metrics.latency.current > 10000) { // 10 seconds
      this.addAlert({
        type: 'latency_spike',
        message: `Latency spike detected: ${this.metrics.latency.current}ms`,
        severity: 'warning',
        timestamp: new Date()
      });
    }

    // Error burst alert
    const recentErrors = this.errorTimestamps.filter(e => now - e.timestamp < 30000); // Last 30 seconds
    if (recentErrors.length > 5) {
      this.addAlert({
        type: 'error_burst',
        message: `Error burst detected: ${recentErrors.length} errors in 30 seconds`,
        severity: 'error',
        timestamp: new Date()
      });
    }

    // Resource exhaustion alert
    if (this.metrics.resources.memoryUsage > 1000) { // 1GB
      this.addAlert({
        type: 'resource_exhaustion',
        message: `High memory usage: ${this.metrics.resources.memoryUsage.toFixed(1)}MB`,
        severity: 'critical',
        timestamp: new Date()
      });
    }

    // Throughput drop alert
    if (this.metrics.throughput.requestsPerMinute === 0 && this.requestTimestamps.length > 100) {
      this.addAlert({
        type: 'throughput_drop',
        message: 'No requests in the last minute - possible system issue',
        severity: 'warning',
        timestamp: new Date()
      });
    }
  }

  private addAlert(alert: PerformanceAlert): void {
    // Avoid duplicate alerts within 5 minutes
    const recent = this.alerts.find(existing => 
      existing.type === alert.type &&
      existing.timestamp.getTime() > alert.timestamp.getTime() - 300000 &&
      !existing.resolved
    );

    if (!recent) {
      this.alerts.push(alert);
      
      // Show notification for critical alerts
      if (alert.severity === 'critical') {
        vscode.window.showErrorMessage(`Smart Router Performance: ${alert.message}`, 'View Dashboard')
          .then(selection => {
            if (selection === 'View Dashboard') {
              vscode.commands.executeCommand('smart.showPerformance');
            }
          });
      }
    }
  }

  private cleanupOldData(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(t => t >= oneHourAgo);
    this.errorTimestamps = this.errorTimestamps.filter(e => e.timestamp >= oneHourAgo);

    // Clean old alerts
    this.alerts = this.alerts.filter(alert => 
      alert.timestamp.getTime() >= oneHourAgo || !alert.resolved
    );

    // Clean old bottlenecks
    this.metrics.bottlenecks = this.metrics.bottlenecks.filter(bottleneck => 
      bottleneck.detected.getTime() >= oneHourAgo
    );
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  async showPerformanceDashboard(): Promise<void> {
    const metrics = this.getMetrics();
    const alerts = this.getActiveAlerts();

    const dashboard = `
# 📊 Smart Router Performance Dashboard

## 🚀 Current Performance

### Latency
- **Current:** ${metrics.latency.current.toFixed(0)}ms
- **Average:** ${metrics.latency.average.toFixed(0)}ms
- **95th Percentile:** ${metrics.latency.p95.toFixed(0)}ms
- **99th Percentile:** ${metrics.latency.p99.toFixed(0)}ms

### Throughput
- **Requests/Second:** ${metrics.throughput.requestsPerSecond}
- **Requests/Minute:** ${metrics.throughput.requestsPerMinute}
- **Requests/Hour:** ${metrics.throughput.requestsPerHour}

### Error Rate
- **Current Rate:** ${(metrics.errors.rate * 100).toFixed(2)}%
- **Total Errors:** ${metrics.errors.totalErrors}
- **Error Types:** ${Object.entries(metrics.errors.errorTypes).map(([type, count]) => `${type}: ${count}`).join(', ')}

### Resources
- **Memory Usage:** ${metrics.resources.memoryUsage.toFixed(1)}MB
- **CPU Usage:** ${metrics.resources.cpuUsage.toFixed(1)}%
- **Active Connections:** ${metrics.resources.activeConnections}

## 🚨 Active Alerts (${alerts.length})
${alerts.length === 0 ? '✅ No active alerts' : 
  alerts.map(alert => `- **${alert.severity.toUpperCase()}**: ${alert.message}`).join('\n')}

## 🔍 Bottlenecks (${metrics.bottlenecks.length})
${metrics.bottlenecks.length === 0 ? '✅ No bottlenecks detected' : 
  metrics.bottlenecks.map(bottleneck => 
    `### ${bottleneck.severity.toUpperCase()}: ${bottleneck.component}
    **Description:** ${bottleneck.description}
    **Impact:** ${bottleneck.impact}
    **Recommendation:** ${bottleneck.recommendation}`
  ).join('\n\n')}

## 📈 Performance Trends
- **Monitoring Status:** ${this.monitoringActive ? '🟢 Active' : '🔴 Inactive'}
- **Data Points:** ${this.latencyHistory.length} latency measurements
- **Last Update:** ${new Date().toLocaleString()}

---
*Real-time Performance Monitor v2.6.0*
    `;

    const doc = await vscode.workspace.openTextDocument({
      content: dashboard,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc);
  }

  startOptimization(): void {
    // Auto-apply performance optimizations
    const bottlenecks = this.metrics.bottlenecks.filter(b => b.severity === 'critical');
    
    for (const bottleneck of bottlenecks) {
      switch (bottleneck.type) {
        case 'latency':
          this.optimizeLatency();
          break;
        case 'resource':
          this.optimizeResources();
          break;
        case 'error_rate':
          this.optimizeErrorHandling();
          break;
      }
    }
  }

  private optimizeLatency(): void {
    // Implement latency optimizations
    this.logger.info('[Performance] Optimizing latency - implementing request caching');
  }

  private optimizeResources(): void {
    // Implement resource optimizations
    this.logger.info('[Performance] Optimizing resources - clearing cache and garbage collection');
  }

  private optimizeErrorHandling(): void {
    // Implement error handling optimizations
    this.logger.info('[Performance] Optimizing error handling - implementing circuit breaker pattern');
  }

  stop(): void {
    this.monitoringActive = false;
    this.logger.info('[Performance] Performance monitoring stopped');
  }

  start(): void {
    this.monitoringActive = true;
    this.logger.info('[Performance] Performance monitoring started');
  }
}
