export const MODEL_ROUTING = {
  simple: { 
    model: 'xiaomi/mimo-v2-flash', 
    cost: 0,
    maxTokens: 4096,
    description: 'FREE tier voor simple taken'
  },
  code_gen: { 
    model: 'qwen/qwen3-235b-a22b', 
    cost: 0,
    maxTokens: 8192,
    description: 'Fast tier voor code generatie - Qwen3 235B (free)'
  },
  debug: { 
    model: 'minimax/minimax-m2.5', 
    cost: 0.28,
    maxTokens: 8192,
    description: 'Mid tier voor debugging (upgrade M2.1→M2.5)'
  },
  architecture: { 
    model: 'qwen/qwen3-235b-a22b', 
    cost: 0,
    maxTokens: 8192,
    description: 'Stap 1: Qwen3 235B snelle architectuur screening (free)'
  },
  architecture_screening: { 
    model: 'qwen/qwen3-235b-a22b', 
    cost: 0,
    maxTokens: 8192,
    description: 'Stap 2: Qwen3 235B screening (free, glm-4-32b niet meer beschikbaar)'
  },
  architecture_screening_alt: { 
    model: 'qwen/qwen3.5-397b-a17b', 
    cost: 0.36,
    maxTokens: 262144,
    description: 'Stap 2: Qwen3.5 397B flagship (60% goedkoper, 8x throughput, visual agentic)'
  },
  architecture_premium: { 
    model: 'anthropic/claude-opus-4.6', 
    cost: 5.0,
    maxTokens: 1000000,
    description: 'Stap 3: Opus 4.6 premium deep dive'
  },
  // Roo Code integrated routes
  roo_code_gen: {
    model: 'anthropic/claude-haiku-4.5',
    cost: 0.8,
    maxTokens: 200000,
    description: 'Claude Haiku 4.5 via Roo Code (snel, goedkoop, gpt-5.3-codex niet beschikbaar)'
  },
  roo_architect: {
    model: 'anthropic/claude-sonnet-4.6',
    cost: 3.0,
    maxTokens: 1000000,
    description: 'Claude Sonnet 4.6 via Roo Code (architect mode, 1M context)'
  },
  roo_debug: {
    model: 'google/gemini-2.0-flash-001',
    cost: 0.1,
    maxTokens: 1000000,
    description: 'Gemini 2.0 Flash via Roo Code (fast debug, 1M tokens, gemini-3-flash niet beschikbaar)'
  },
  roo_premium: {
    model: 'anthropic/claude-opus-4.6',
    cost: 15.0,
    maxTokens: 1000000,
    description: 'Opus 4.6 via Roo Code orchestrator (subtasks)'
  }
};

// Arena Mode Battle Groups
export const ARENA_BATTLE_GROUPS = {
  frontier: {
    name: 'Frontier',
    models: ['anthropic/claude-opus-4.6', 'anthropic/claude-sonnet-4.6', 'anthropic/claude-opus-4.5', 'anthropic/claude-sonnet-4.5'],
    description: 'Top reasoning modellen voor maximale intelligentie (incl. Sonnet 4.6)'
  },
  fast: {
    name: 'Fast',
    models: ['qwen/qwen3-235b-a22b', 'anthropic/claude-haiku-4.5', 'google/gemini-2.0-flash-001', 'qwen/qwen3-coder-next'],
    description: 'Snelle modellen geoptimaliseerd voor snelheid'
  },
  hybrid: {
    name: 'Hybrid',
    models: ['anthropic/claude-sonnet-4.5', 'qwen/qwen3-235b-a22b', 'minimax/minimax-m2.5'],
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

export type Intent = 'simple' | 'code_gen' | 'debug' | 'architecture' | 'architecture_screening' | 'architecture_screening_alt' | 'architecture_premium' | 'roo_code_gen' | 'roo_architect' | 'roo_debug' | 'roo_premium';
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
