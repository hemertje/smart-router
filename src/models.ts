export const MODEL_ROUTING = {
  simple: { 
    model: 'xiaomi/mimo-v2-flash', 
    cost: 0,
    maxTokens: 4096,
    description: 'FREE tier voor simple taken'
  },
  code_gen: { 
    model: 'swe-1.5', 
    cost: 0,
    maxTokens: 8192,
    description: 'Fast tier voor code generatie (Arena Mode #1)'
  },
  debug: { 
    model: 'minimax/minimax-m2.5', 
    cost: 0.28,
    maxTokens: 8192,
    description: 'Mid tier voor debugging (upgrade M2.1→M2.5)'
  },
  architecture: { 
    model: 'swe-1.5', 
    cost: 0,
    maxTokens: 8192,
    description: 'Stap 1: SWE 1.5 snelle architectuur screening'
  },
  architecture_screening: { 
    model: 'z-ai/glm-5', 
    cost: 0.21,
    maxTokens: 200000,
    description: 'Stap 2: GLM-5 Chinese model (open weights leader, $0.21)'
  },
  architecture_screening_alt: { 
    model: 'qwen/qwen3.5-plus-02-15', 
    cost: 0.24,
    maxTokens: 1000000,
    description: 'Stap 2: Qwen 3.5 Plus (budget optie)'
  },
  architecture_premium: { 
    model: 'anthropic/claude-opus-4-6', 
    cost: 5.0,
    maxTokens: 1000000,
    description: 'Stap 3: Opus 4.6 premium deep dive'
  }
};

// Arena Mode Battle Groups
export const ARENA_BATTLE_GROUPS = {
  frontier: {
    name: 'Frontier',
    models: ['anthropic/claude-opus-4-6', 'anthropic/claude-opus-4-5', 'anthropic/claude-sonnet-4-5'],
    description: 'Top reasoning modellen voor maximale intelligentie'
  },
  fast: {
    name: 'Fast',
    models: ['swe-1.5', 'anthropic/claude-haiku-4-5', 'google/gemini-3-flash-low'],
    description: 'Snelle modellen geoptimaliseerd voor snelheid'
  },
  hybrid: {
    name: 'Hybrid',
    models: ['anthropic/claude-sonnet-4-5', 'swe-1.5', 'minimax/minimax-m2.5'],
    description: 'Balans tussen snelheid en intelligentie'
  }
};

// Chinese AI Modellen (beschikbaar via OpenRouter)
export const CHINESE_MODELS = {
  qwen: {
    model: 'qwen/qwen3.5-plus-02-15',
    cost: 0.24,
    maxTokens: 1000000,
    description: 'Qwen 3.5 Plus (1M tokens, Chinese model)'
  },
  minimax: {
    model: 'minimax/minimax-m2.5',
    cost: 0.15,
    maxTokens: 196608,
    description: 'MiniMax M2.5 (verbeterde AI agent tools)'
  },
  alibaba: {
    model: 'qwen/qwen3.5-397b-a17b',
    cost: 0.36,
    maxTokens: 262144,
    description: 'Qwen 3.5 397B (next-generation architectuur)'
  }
};

export type Intent = 'simple' | 'code_gen' | 'debug' | 'architecture' | 'architecture_screening' | 'architecture_screening_alt' | 'architecture_premium';
export type BattleGroup = 'frontier' | 'fast' | 'hybrid';

export interface ModelConfig {
  model: string;
  cost: number;
  maxTokens: number;
  description: string;
}

export interface RoutingResult {
  intent: Intent;
  config: ModelConfig;
  confidence: number;
}

export interface ArenaModeConfig {
  enabled: boolean;
  battleGroup: BattleGroup;
  models: string[];
  costMultiplier: number;
}

export interface ChineseModelConfig {
  enabled: boolean;
  costAdvantage: number;
  preferredModels: string[];
}
