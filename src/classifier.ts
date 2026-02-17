import { Intent, MODEL_ROUTING } from './models';

const PATTERNS = {
  simple: [
    'git', 'status', 'ls', 'cd', 'help', 'what is', 'list', 'show',
    'check', 'verify', 'tell me', 'explain', 'describe'
  ],
  code_gen: [
    'create', 'generate', 'implement', 'add', 'build', 'write',
    'make', 'develop', 'code', 'function', 'class', 'api'
  ],
  debug: [
    'why', 'error', 'not working', 'failed', 'broken', 'issue',
    'problem', 'fix', 'debug', 'troubleshoot', 'wrong'
  ],
  architecture: [
    'design', 'plan', 'should', 'architecture', 'structure',
    'pattern', 'approach', 'strategy', 'best practice', 'organize'
  ]
};

export class IntentClassifier {
  classify(query: string): Intent {
    const lowerQuery = query.toLowerCase();
    
    // Handle empty query
    if (!lowerQuery || lowerQuery.trim() === '') {
      return 'simple';
    }
    
    // Count matches for each intent
    const scores = {
      simple: this.countMatches(lowerQuery, PATTERNS.simple),
      code_gen: this.countMatches(lowerQuery, PATTERNS.code_gen),
      debug: this.countMatches(lowerQuery, PATTERNS.debug),
      architecture: this.countMatches(lowerQuery, PATTERNS.architecture),
      architecture_screening: 0, // Not used in direct classification
      architecture_screening_alt: 0, // Not used in direct classification
      architecture_premium: 0     // Not used in direct classification
    };
    
    // Find intent with highest score
    const bestIntent = Object.entries(scores).reduce((a, b) => 
      scores[a[0] as Intent] > scores[b[0] as Intent] ? a : b
    )[0] as Intent;
    
    // If no patterns matched, default to simple
    if (scores[bestIntent] === 0) {
      return 'simple';
    }
    
    return bestIntent;
  }
  
  private countMatches(query: string, patterns: string[]): number {
    return patterns.reduce((count, pattern) => 
      query.includes(pattern) ? count + 1 : count, 0
    );
  }
  
  getRouting(intent: Intent) {
    return {
      intent,
      config: MODEL_ROUTING[intent],
      confidence: 0.7 // Rule-based confidence
    };
  }
}
