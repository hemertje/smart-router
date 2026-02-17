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
    model: 'anthropic/claude-opus-4-6', 
    cost: 5.0,
    maxTokens: 1000000,
    description: 'Premium tier voor complex reasoning (Arena Mode #1, 1M tokens)'
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

// Chinese AI Modellen
export const CHINESE_MODELS = {
  zhipu: {
    model: 'zhipu/glm-5',
    cost: 3.5,
    maxTokens: 32768,
    description: 'Zhipu AI GLM-5 (benadert Opus 4.5 in coding)'
  },
  minimax: {
    model: 'minimax/minimax-m2.5',
    cost: 0.28,
    maxTokens: 16384,
    description: 'MiniMax M2.5 (verbeterde AI agent tools)'
  },
  alibaba: {
    model: 'alibaba/qwen-3.5',
    cost: 0.45,
    maxTokens: 32768,
    description: 'Alibaba Qwen 3.5 (next-generation architectuur)'
  }
};

export type Intent = 'simple' | 'code_gen' | 'debug' | 'architecture';
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
