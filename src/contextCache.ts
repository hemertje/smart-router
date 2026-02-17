import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

export interface ContextEntry {
  id: string;
  timestamp: number;
  intent: string;
  query: string;
  response: string;
  model: string;
  cost: number;
  tokens?: number;
  projectId?: string;
  workspaceId?: string;
}

export interface ContextStats {
  totalEntries: number;
  totalCost: number;
  totalTokens: number;
  averageResponseTime: number;
  mostUsedIntents: Record<string, number>;
}

export class ContextCache {
  private cache: Map<string, ContextEntry[]> = new Map();
  private logger = Logger.getInstance();
  private maxEntries: number;
  private maxAge: number; // in milliseconds
  private cacheFile: string;

  constructor(maxEntries: number = 1000, maxAge: number = 24 * 60 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.maxAge = maxAge;
    this.cacheFile = path.join(vscode.workspace.rootPath || '', '.vscode', 'smart-router-cache.json');
    this.loadCache();
  }

  /**
   * Voeg context entry toe
   */
  add(entry: Omit<ContextEntry, 'id' | 'timestamp'>): void {
    const id = this.generateId();
    const fullEntry: ContextEntry = {
      ...entry,
      id,
      timestamp: Date.now()
    };

    const key = this.getCacheKey(entry.projectId, entry.workspaceId);
    const entries = this.cache.get(key) || [];
    
    // Voeg nieuwe entry toe
    entries.push(fullEntry);
    
    // Limit aantal entries
    if (entries.length > this.maxEntries) {
      entries.shift(); // Verwijder oudste
    }
    
    this.cache.set(key, entries);
    this.saveCache();
    
    this.logger.info(`[Context Cache] Entry toegevoegd: ${id}`);
  }

  /**
   * Get context voor een project/workspace
   */
  getContext(projectId?: string, workspaceId?: string, limit: number = 10): ContextEntry[] {
    const key = this.getCacheKey(projectId, workspaceId);
    const entries = this.cache.get(key) || [];
    
    // Filter op leeftijd
    const now = Date.now();
    const validEntries = entries.filter(e => now - e.timestamp < this.maxAge);
    
    // Sorteer op timestamp (nieuwste eerst)
    validEntries.sort((a, b) => b.timestamp - a.timestamp);
    
    return validEntries.slice(0, limit);
  }

  /**
   * Get relevante context voor query
   */
  getRelevantContext(query: string, projectId?: string, workspaceId?: string): ContextEntry[] {
    const context = this.getContext(projectId, workspaceId, 50);
    
    // Simple relevance scoring based on keyword overlap
    const queryWords = query.toLowerCase().split(/\s+/);
    
    return context
      .map(entry => ({
        entry,
        score: this.calculateRelevance(entry, queryWords)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.entry);
  }

  /**
   * Clear cache voor project/workspace
   */
  clear(projectId?: string, workspaceId?: string): void {
    const key = this.getCacheKey(projectId, workspaceId);
    this.cache.delete(key);
    this.saveCache();
    this.logger.info(`[Context Cache] Cache geleegd voor: ${key}`);
  }

  /**
   * Clear alle cache
   */
  clearAll(): void {
    this.cache.clear();
    this.saveCache();
    this.logger.info('[Context Cache] Alle cache geleegd');
  }

  /**
   * Get cache statistieken
   */
  getStats(projectId?: string, workspaceId?: string): ContextStats {
    const entries = this.getContext(projectId, workspaceId);
    const totalCost = entries.reduce((sum, e) => sum + e.cost, 0);
    const totalTokens = entries.reduce((sum, e) => sum + (e.tokens || 0), 0);
    
    // Intent breakdown
    const mostUsedIntents: Record<string, number> = {};
    entries.forEach(e => {
      mostUsedIntents[e.intent] = (mostUsedIntents[e.intent] || 0) + 1;
    });

    return {
      totalEntries: entries.length,
      totalCost,
      totalTokens,
      averageResponseTime: 0, // Would need response time tracking
      mostUsedIntents
    };
  }

  /**
   * Export context voor backup
   */
  export(projectId?: string, workspaceId?: string): string {
    const entries = this.getContext(projectId, workspaceId);
    return JSON.stringify(entries, null, 2);
  }

  /**
   * Import context
   */
  import(data: ContextEntry[]): void {
    data.forEach(entry => {
      const key = this.getCacheKey(entry.projectId, entry.workspaceId);
      const entries = this.cache.get(key) || [];
      entries.push(entry);
      this.cache.set(key, entries);
    });
    
    this.saveCache();
    this.logger.info(`[Context Cache] ${data.length} entries geïmporteerd`);
  }

  /**
   * Cleanup oude entries
   */
  cleanup(): void {
    const now = Date.now();
    let totalRemoved = 0;

    for (const [key, entries] of this.cache) {
      const validEntries = entries.filter(e => now - e.timestamp < this.maxAge);
      const removed = entries.length - validEntries.length;
      totalRemoved += removed;
      
      if (validEntries.length === 0) {
        this.cache.delete(key);
      } else {
        this.cache.set(key, validEntries);
      }
    }

    if (totalRemoved > 0) {
      this.saveCache();
      this.logger.info(`[Context Cache] Cleanup: ${totalRemoved} oude entries verwijderd`);
    }
  }

  /**
   * Genereer cache key
   */
  private getCacheKey(projectId?: string, workspaceId?: string): string {
    return `${projectId || 'global'}-${workspaceId || 'default'}`;
  }

  /**
   * Genereer unieke ID
   */
  private generateId(): string {
    return `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Bereken relevance score
   */
  private calculateRelevance(entry: ContextEntry, queryWords: string[]): number {
    const entryWords = `${entry.query} ${entry.response}`.toLowerCase().split(/\s+/);
    let score = 0;
    
    queryWords.forEach(word => {
      if (word.length > 2) { // Negeer korte woorden
        const matches = entryWords.filter(w => w.includes(word) || word.includes(w)).length;
        score += matches;
      }
    });
    
    // Time decay (recentere entries zijn relevanter)
    const hoursOld = (Date.now() - entry.timestamp) / (1000 * 60 * 60);
    score *= Math.exp(-hoursOld / 24); // Halveer score elke 24 uur
    
    return score;
  }

  /**
   * Save cache naar file
   */
  private saveCache(): void {
    try {
      const data = Array.from(this.cache.entries()).map(([key, entries]) => ({
        key,
        entries
      }));
      
      const dir = path.dirname(this.cacheFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
    } catch (error) {
      this.logger.error('[Context Cache] Failed to save cache', error as Error);
    }
  }

  /**
   * Load cache van file
   */
  private loadCache(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        data.forEach((item: { key: string; entries: ContextEntry[] }) => {
          this.cache.set(item.key, item.entries);
        });
        this.logger.info(`[Context Cache] Cache geladen: ${this.cache.size} keys`);
      }
    } catch (error) {
      this.logger.error('[Context Cache] Failed to load cache', error as Error);
    }
  }
}
