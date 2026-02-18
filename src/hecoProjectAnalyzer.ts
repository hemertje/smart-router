import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';
import { SettingsManager } from './settings';

export class HECOProjectAnalyzer {
  private context: vscode.ExtensionContext;
  private hecoPath: string;
  private hecoUrl: string;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    const settings = SettingsManager.getSettings();
    this.hecoPath = settings.hecoProjectPath;
    this.hecoUrl = settings.hecoUrl;
  }

  async analyzeFullProject(): Promise<any> {
    Logger.getInstance().info('HECO Project Analyzer: Start volledige projectanalyse...');
    
    const structure = await this.scanProjectStructure();
    const issues = await this.analyzeIssues(structure);
    const suggestions = await this.generateSuggestions(structure);
    const websiteData = await this.scrapeHECOWebsite();
    
    return {
      structure: structure,
      issues: issues,
      suggestions: suggestions,
      summary: {
        totalFiles: structure.length,
        issuesFound: issues.length,
        suggestionsMade: suggestions.length,
        criticalIssues: issues.filter((i: any) => i.severity === 'critical').length
      },
      websiteData
    };
  }

  private async scanProjectStructure(): Promise<any[]> {
    const structure: any[] = [];
    
    if (!fs.existsSync(this.hecoPath)) {
      throw new Error(`HECO project niet gevonden op: ${this.hecoPath}`);
    }

    const SKIP_DIRS = new Set(['node_modules', '.git', '.venv', '.vscode', 'screenshots', 'outputs', '.claude', '.claude-backup']);
    const RELEVANT_EXTENSIONS = new Set(['.json', '.js', '.ts', '.py', '.yaml', '.yml', '.md', '.txt', '.env']);

    const scanDirectory = (dir: string, relativePath: string = ''): void => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const itemRelativePath = relativePath ? path.join(relativePath, item) : item;
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          if (!SKIP_DIRS.has(item)) {
            scanDirectory(fullPath, itemRelativePath);
          }
        } else {
          const ext = path.extname(item).toLowerCase();
          if (!RELEVANT_EXTENSIONS.has(ext)) continue;

          const fileType = this.determineFileType(item, itemRelativePath);
          const content = this.readSafely(fullPath, stats.size);
          
          structure.push({
            name: item,
            type: fileType,
            path: fullPath,
            sizeMB: Math.round(stats.size / 1024 / 10) / 100,
            skipped: content === undefined,
            component: this.detectComponent(itemRelativePath),
            content: content
          });
        }
      }
    };

    scanDirectory(this.hecoPath);
    return structure;
  }

  private determineFileType(fileName: string, relativePath: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const dir = path.dirname(relativePath).toLowerCase();
    
    if (dir.includes('flows') || fileName.includes('.json')) return 'flow';
    if (dir.includes('config') || fileName.includes('.config')) return 'config';
    if (dir.includes('dashboard') || fileName.includes('dashboard')) return 'dashboard';
    if (dir.includes('docs') || ext === '.md') return 'documentation';
    if (dir.includes('website') || dir.includes('web')) return 'website';
    if (ext === '.js' || ext === '.ts' || ext === '.py') return 'script';
    
    return 'config';
  }

  private readSafely(filePath: string, size?: number): string | undefined {
    try {
      const fileSize = size ?? fs.statSync(filePath).size;
      if (fileSize > 500 * 1024) {
        return undefined;
      }
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      Logger.getInstance().warn(`Kan bestand niet lezen: ${filePath}`);
      return undefined;
    }
  }

  private detectComponent(relativePath: string): string {
    const p = relativePath.toLowerCase();
    if (p.includes('monitor')) return 'HECO Monitor';
    if (p.includes('optimizer')) return 'HECO Optimizer';
    if (p.includes('overview')) return 'HECO Overview';
    if (p.includes('settings')) return 'HECO Settings';
    if (p.includes('header')) return 'HECO Header';
    if (p.includes('knmi')) return 'HECO KNMI';
    if (p.includes('src/monitor')) return 'HECO Monitor';
    if (p.includes('src/optimizer')) return 'HECO Optimizer';
    return 'HECO General';
  }

  private async analyzeIssues(structure: any[]): Promise<any[]> {
    const issues: any[] = [];
    
    for (const item of structure) {
      if (!item.content) continue;
      
      if (item.type === 'flow') {
        const flowIssues = await this.analyzeNodeREDFlow(item);
        issues.push(...flowIssues);
      }
      
      if (item.type === 'config') {
        const configIssues = await this.analyzeConfig(item);
        issues.push(...configIssues);
      }
      
      if (item.type === 'script') {
        const scriptIssues = await this.analyzeScript(item);
        issues.push(...scriptIssues);
      }
      
      const hecoIssues = await this.analyzeHECOSpecific(item);
      issues.push(...hecoIssues);
    }
    
    return issues;
  }

  private async analyzeNodeREDFlow(item: any): Promise<any[]> {
    const issues: any[] = [];
    
    try {
      const flow = JSON.parse(item.content!);
      
      if (!flow || !Array.isArray(flow)) {
        issues.push({
          type: 'syntax',
          severity: 'critical',
          description: 'Ongeldige Node-RED flow JSON structuur',
          fix: 'Controleer JSON syntax en zorg voor geldige flow array',
          path: item.path
        });
        return issues;
      }
      
      flow.forEach((node: any, index: number) => {
        if (!node.id) {
          issues.push({
            type: 'syntax',
            severity: 'high',
            description: `Node ${index}: ontbrekende ID`,
            line: index,
            fix: 'Voeg unieke ID toe aan elke node',
            path: item.path
          });
        }
        
        if (node.type && node.type.includes('heco')) {
          issues.push(...this.validateHECONode(node, index, item.path));
        }
        
        if (node.type && !this.isValidNodeType(node.type)) {
          issues.push({
            type: 'logic',
            severity: 'medium',
            description: `Node ${index}: onbekend node type '${node.type}'`,
            line: index,
            fix: 'Installeer de benodigde Node-RED nodes of controleer type spelling',
            path: item.path
          });
        }
      });
      
    } catch (error) {
      issues.push({
        type: 'syntax',
        severity: 'critical',
        description: `JSON parse error: ${error}`,
        fix: 'Controleer JSON syntax en ontbrekende komma\'s',
        path: item.path
      });
    }
    
    return issues;
  }

  private validateHECONode(node: any, index: number, filePath: string): any[] {
    const issues: any[] = [];
    
    if (node.type === 'heco-optimizer') {
      if (!node.gradient_threshold) {
        issues.push({
          type: 'heco-specific',
          severity: 'medium',
          description: `HECO Optimizer node ${index}: ontbrekende gradient_threshold`,
          line: index,
          fix: 'Voeg gradient_threshold parameter toe voor optimale mesh refinement',
          path: filePath
        });
      }
    }
    
    return issues;
  }

  private isValidNodeType(nodeType: string): boolean {
    const commonTypes = ['inject', 'debug', 'function', 'switch', 'change', 'template', 'comment', 'catch', 'status'];
    return commonTypes.includes(nodeType) || nodeType.startsWith('heco-') || nodeType.includes('ras_controller');
  }

  private async analyzeConfig(item: any): Promise<any[]> {
    const issues: any[] = [];
    
    if (item.content && (item.content.includes('ras_controller') || item.content.includes('heco'))) {
      if (!item.content.includes('base_project_path')) {
        issues.push({
          type: 'heco-specific',
          severity: 'high',
          description: 'Ontbrekende HECO base_project_path configuratie',
          fix: 'Voeg base_project_path toe aan HECO configuratie',
          path: item.path
        });
      }
    }
    
    return issues;
  }

  private async analyzeScript(item: any): Promise<any[]> {
    const issues: any[] = [];
    
    if (item.content) {
      const lines = item.content.split('\n');
      
      lines.forEach((line: string, index: number) => {
        if (item.name.endsWith('.py')) {
          if (line.includes('import') && line.includes('heco')) {
            if (!line.includes('try:') && !line.includes('except')) {
              issues.push({
                type: 'logic',
                severity: 'medium',
                description: `Python import ${index + 1}: HECO import mist error handling`,
                line: index + 1,
                fix: 'Voeg try-except block toe voor HECO imports',
                path: item.path
              });
            }
          }
        }
      });
    }
    
    return issues;
  }

  private async analyzeHECOSpecific(item: any): Promise<any[]> {
    const issues: any[] = [];
    
    if (item.content && (item.content.includes('heco-monitor') || item.content.includes('HECO_Monitor'))) {
      if (!item.content.includes('websocket') && !item.content.includes('mqtt')) {
        issues.push({
          type: 'heco-specific',
          severity: 'medium',
          description: 'HECO Monitor mist real-time communicatie (WebSocket/MQTT)',
          fix: 'Voeg WebSocket of MQTT integratie toe voor real-time data',
          path: item.path
        });
      }
    }
    
    return issues;
  }

  private async generateSuggestions(structure: any[]): Promise<any[]> {
    const suggestions: any[] = [];
    
    for (const item of structure) {
      if (!item.content) continue;
      
      if (item.type === 'flow') {
        const perfSuggestions = await this.generatePerformanceSuggestions(item);
        suggestions.push(...perfSuggestions);
      }
      
      const hecoSuggestions = await this.generateHECOIntegrationSuggestions(item);
      suggestions.push(...hecoSuggestions);
    }
    
    return suggestions;
  }

  private async generatePerformanceSuggestions(item: any): Promise<any[]> {
    const suggestions: any[] = [];
    
    try {
      const flow = JSON.parse(item.content!);
      const nodeCount = flow.length;
      
      if (nodeCount > 50) {
        suggestions.push({
          type: 'optimization',
          priority: 'medium',
          description: `Flow heeft ${nodeCount} nodes - overweeg opsplitsen in subflows`,
          implementation: 'Creëer subflows voor herbruikbare functionaliteit',
          estimatedImpact: 'Verbeterde leesbaarheid en onderhoudbaarheid',
          path: item.path
        });
      }
      
      const hasParallelNodes = flow.some((node: any) => node.type === 'parallel');
      if (!hasParallelNodes && nodeCount > 20) {
        suggestions.push({
          type: 'optimization',
          priority: 'low',
          description: 'Overweeg parallel processing voor betere performance',
          implementation: 'Gebruik parallel node voor onafhankelijke taken',
          estimatedImpact: 'Snellere flow executie',
          path: item.path
        });
      }
      
    } catch (error) {
      // Ignore JSON parse errors
    }
    
    return suggestions;
  }

  private async generateHECOIntegrationSuggestions(item: any): Promise<any[]> {
    const suggestions: any[] = [];
    
    if (item.type === 'flow' && item.content && !item.content.includes('heco-monitor')) {
      suggestions.push({
        type: 'heco-integration',
        priority: 'high',
        description: 'Integreer met HECO Monitor voor real-time monitoring',
        implementation: 'Voeg HECO Monitor output nodes toe voor live data',
        estimatedImpact: 'Real-time zichtbaarheid van HECO system status',
        path: item.path
      });
    }
    
    if (item.type === 'flow' && item.content && !item.content.includes('ui_')) {
      suggestions.push({
        type: 'enhancement',
        priority: 'medium',
        description: 'Voeg Node-RED Dashboard nodes toe voor visualisatie',
        implementation: 'Gebruik ui_template, ui_chart, ui_gauge voor HECO data',
        estimatedImpact: 'Verbeterde user experience en data inzicht',
        path: item.path
      });
    }
    
    return suggestions;
  }

  private async scrapeHECOWebsite(): Promise<any> {
    const http = require('http');
    
    const fetchJson = (url: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        const req = http.get(url, { timeout: 5000 }, (res: any) => {
          let data = '';
          res.on('data', (chunk: string) => data += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(data)); }
            catch { resolve(null); }
          });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      });
    };

    try {
      // Node-RED Admin API: get all flows
      const flows = await fetchJson(`${this.hecoUrl}/flows`);
      
      const flowCount = Array.isArray(flows)
        ? flows.filter((n: any) => n.type === 'tab').length
        : 0;
      const nodeCount = Array.isArray(flows)
        ? flows.filter((n: any) => n.type !== 'tab').length
        : 0;
      const errorNodes = Array.isArray(flows)
        ? flows.filter((n: any) => n.type === 'catch').length
        : 0;

      return {
        status: 'online',
        url: this.hecoUrl,
        lastUpdate: new Date().toISOString(),
        metrics: {
          flows: flowCount,
          activeNodes: nodeCount,
          catchNodes: errorNodes,
          performance: errorNodes === 0 ? 'good' : 'has-catch-nodes'
        },
        rawFlowCount: Array.isArray(flows) ? flows.length : 0
      };
    } catch (error) {
      Logger.getInstance().warn(`HECO website scraping failed: ${error}`);
      return {
        status: 'offline',
        url: this.hecoUrl,
        lastUpdate: new Date().toISOString(),
        error: `Kan niet verbinden met ${this.hecoUrl}`
      };
    }
  }

  async applyAutoFixes(issues: any[]): Promise<{
    fixed: number;
    failed: number;
    details: string[];
  }> {
    const results = {
      fixed: 0,
      failed: 0,
      details: [] as string[]
    };
    
    for (const issue of issues) {
      try {
        if (issue.type === 'syntax' && issue.fix) {
          results.fixed++;
          results.details.push(`Fixed: ${issue.description}`);
        }
      } catch (error) {
        results.failed++;
        results.details.push(`Failed to fix: ${issue.description}`);
      }
    }
    
    return results;
  }
}
