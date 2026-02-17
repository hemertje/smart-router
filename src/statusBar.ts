import * as vscode from 'vscode';
import { CostTracker } from './costTracker';
import { ProjectDetector } from './projectDetector';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private costTracker: CostTracker;
  private projectDetector: ProjectDetector;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(costTracker: CostTracker, projectDetector: ProjectDetector) {
    this.costTracker = costTracker;
    this.projectDetector = projectDetector;
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.name = 'Smart Router Status';
    this.statusBarItem.command = 'smart.showStatus';
    this.statusBarItem.tooltip = 'Click to see Smart Router status and costs';
  }

  start() {
    this.updateStatus();
    this.updateInterval = setInterval(() => this.updateStatus(), 30000); // Update every 30 seconds
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private async updateStatus() {
    try {
      const project = await this.projectDetector.detectProject();
      const stats = await this.costTracker.getStats();
      
      if (project && stats) {
        const today = new Date().toISOString().split('T')[0];
        const todayCost = stats.dailyCosts[today] || 0;
        
        this.statusBarItem.text = `$(robot) ${project.name}: $${todayCost.toFixed(2)}`;
        this.statusBarItem.show();
      } else {
        this.statusBarItem.text = '$(robot) Smart Router';
        this.statusBarItem.show();
      }
    } catch (error) {
      console.error('Failed to update status bar:', error);
      this.statusBarItem.text = '$(robot) Smart Router';
      this.statusBarItem.show();
    }
  }

  dispose() {
    this.stop();
    this.statusBarItem.dispose();
  }
}
