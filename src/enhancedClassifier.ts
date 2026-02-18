import { Intent, MODEL_ROUTING } from './models';
import { OllamaClient } from './ollama';
import { SettingsManager, SmartRouterSettings } from './settings';

export interface ClassificationResult {
  intent: Intent;
  confidence: number;
  method: 'ollama' | 'rules' | 'ml';
  reasoning?: string;
}

export class EnhancedIntentClassifier {
  private ollama: OllamaClient;
  private settings: SmartRouterSettings;
  private userPreferences: Map<string, Intent> = new Map();
  private patternHistory: Array<{ query: string; intent: Intent; timestamp: number }> = [];

  constructor() {
    this.ollama = new OllamaClient();
    this.settings = SettingsManager.getSettings();
  }

  async classify(query: string): Promise<ClassificationResult> {
    const startTime = Date.now();
    
    // Check user preferences first
    const cached = this.checkUserPreferences(query);
    if (cached) {
      return {
        intent: cached,
        confidence: 0.95,
        method: 'ml',
        reasoning: 'User preference detected'
      };
    }

    // Try Ollama if available
    const ollamaAvailable = await this.ollama.isAvailable();
    if (ollamaAvailable) {
      try {
        const ollamaIntent = await this.ollama.classifyIntent(query);
        if (ollamaIntent) {
          const result = {
            intent: ollamaIntent,
            confidence: 0.85,
            method: 'ollama' as const,
            reasoning: 'Ollama Qwen3:8b classification'
          };
          
          // Learn from this classification
          this.updatePatternHistory(query, ollamaIntent);
          return result;
        }
      } catch (error) {
        console.warn('Ollama classification failed:', error);
      }
    }

    // Fallback to enhanced rule-based classification
    const ruleResult = this.enhancedRuleBasedClassification(query);
    
    // Learn from this classification
    this.updatePatternHistory(query, ruleResult.intent);
    
    return {
      ...ruleResult,
      method: 'rules',
      reasoning: 'Enhanced rule-based classification'
    };
  }

  private checkUserPreferences(query: string): Intent | null {
    // Check for exact matches
    if (this.userPreferences.has(query.toLowerCase())) {
      return this.userPreferences.get(query.toLowerCase())!;
    }

    // Check for similar patterns in history
    const recent = this.patternHistory
      .filter(h => Date.now() - h.timestamp < 86400000) // Last 24 hours
      .filter(h => this.calculateSimilarity(query, h.query) > 0.8);
    
    if (recent.length > 0) {
      // Return the most common intent from similar queries
      const intentCounts = recent.reduce((acc, h) => {
        acc[h.intent] = (acc[h.intent] || 0) + 1;
        return acc;
      }, {} as Record<Intent, number>);
      
      const topIntent = Object.entries(intentCounts)
        .sort(([,a], [,b]) => b - a)[0][0] as Intent;
      
      return topIntent;
    }

    return null;
  }

  private enhancedRuleBasedClassification(query: string): ClassificationResult {
    const lowerQuery = query.toLowerCase();
    
    // Enhanced patterns with weights
    const patterns = {
      simple: {
        patterns: [
          { text: 'git', weight: 3 },
          { text: 'status', weight: 2 },
          { text: 'ls', weight: 2 },
          { text: 'help', weight: 1 },
          { text: 'what is', weight: 1 },
          { text: 'list', weight: 1 },
          { text: 'show', weight: 1 },
          { text: 'check', weight: 1 },
          { text: 'explain', weight: 1 },
          { text: 'tell me', weight: 1 }
        ],
        keywords: ['directory', 'file', 'folder', 'path']
      },
      code_gen: {
        patterns: [
          { text: 'create', weight: 3 },
          { text: 'generate', weight: 3 },
          { text: 'implement', weight: 2 },
          { text: 'add', weight: 2 },
          { text: 'build', weight: 2 },
          { text: 'write', weight: 2 },
          { text: 'make', weight: 1 },
          { text: 'develop', weight: 1 },
          { text: 'code', weight: 1 },
          { text: 'function', weight: 2 },
          { text: 'class', weight: 2 },
          { text: 'api', weight: 2 },
          { text: 'component', weight: 2 }
        ],
        keywords: ['endpoint', 'service', 'module', 'library', 'package']
      },
      debug: {
        patterns: [
          { text: 'why', weight: 3 },
          { text: 'error', weight: 3 },
          { text: 'not working', weight: 2 },
          { text: 'failed', weight: 2 },
          { text: 'broken', weight: 2 },
          { text: 'issue', weight: 1 },
          { text: 'problem', weight: 1 },
          { text: 'fix', weight: 2 },
          { text: 'debug', weight: 2 },
          { text: 'troubleshoot', weight: 1 },
          { text: 'wrong', weight: 1 },
          { text: 'exception', weight: 2 },
          { text: 'bug', weight: 2 }
        ],
        keywords: ['stack trace', 'crash', 'timeout', 'undefined', 'null']
      },
      architecture: {
        patterns: [
          { text: 'design', weight: 3 },
          { text: 'plan', weight: 3 },
          { text: 'should', weight: 2 },
          { text: 'architecture', weight: 3 },
          { text: 'structure', weight: 2 },
          { text: 'pattern', weight: 2 },
          { text: 'approach', weight: 1 },
          { text: 'strategy', weight: 1 },
          { text: 'best practice', weight: 1 },
          { text: 'organize', weight: 1 },
          { text: 'refactor', weight: 2 },
          { text: 'optimize', weight: 1 }
        ],
        keywords: ['system', 'scalable', 'maintainable', 'pattern', 'framework']
      }
    };

    // Calculate scores
    const scores = {
      simple: this.calculateScore(lowerQuery, patterns.simple),
      code_gen: this.calculateScore(lowerQuery, patterns.code_gen),
      debug: this.calculateScore(lowerQuery, patterns.debug),
      architecture: this.calculateScore(lowerQuery, patterns.architecture),
      architecture_screening: 0, // Not used in direct classification
      architecture_screening_alt: 0, // Not used in direct classification
      architecture_premium: 0,    // Not used in direct classification
      roo_code_gen: 0,            // Roo Code delegation routes
      roo_architect: 0,
      roo_debug: 0,
      roo_premium: 0,
      multimodal: 0              // Vision-language models
    };

    // Find best intent
    const entries = Object.entries(scores) as [Intent, number][];
    const bestIntent = entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const bestScore = scores[bestIntent];
    
    // Calculate confidence based on score
    const confidence = Math.min(bestScore / 10, 0.9); // Max 0.9 for rule-based
    
    return {
      intent: bestIntent,
      confidence,
      method: 'rules',
      reasoning: `Score: ${bestScore.toFixed(1)} for ${bestIntent}`
    };
  }

  private calculateScore(query: string, patterns: any): number {
    let score = 0;
    
    // Pattern matching with weights
    for (const pattern of patterns.patterns) {
      if (query.includes(pattern.text)) {
        score += pattern.weight;
      }
    }
    
    // Keyword matching
    for (const keyword of patterns.keywords) {
      if (query.includes(keyword)) {
        score += 1.5;
      }
    }
    
    // Context clues
    if (query.includes('how to')) score += 1;
    if (query.includes('example')) score += 0.5;
    if (query.includes('tutorial')) score += 0.5;
    
    return score;
  }

  private calculateSimilarity(query1: string, query2: string): number {
    // Simple similarity based on common words
    const words1 = query1.toLowerCase().split(' ');
    const words2 = query2.toLowerCase().split(' ');
    
    const common = words1.filter(w => words2.includes(w));
    const total = new Set([...words1, ...words2]).size;
    
    return common.length / total;
  }

  private updatePatternHistory(query: string, intent: Intent): void {
    this.patternHistory.push({
      query: query.toLowerCase(),
      intent,
      timestamp: Date.now()
    });
    
    // Keep only last 1000 entries
    if (this.patternHistory.length > 1000) {
      this.patternHistory = this.patternHistory.slice(-1000);
    }
  }

  setUserPreference(query: string, intent: Intent): void {
    this.userPreferences.set(query.toLowerCase(), intent);
  }

  getPatternHistory(): Array<{ query: string; intent: Intent; timestamp: number }> {
    return this.patternHistory;
  }

  clearUserPreferences(): void {
    this.userPreferences.clear();
  }
}
