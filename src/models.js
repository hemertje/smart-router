"use strict";
exports.__esModule = true;
exports.CHINESE_MODELS = exports.ARENA_BATTLE_GROUPS = exports.MODEL_ROUTING = void 0;
exports.MODEL_ROUTING = {
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
exports.ARENA_BATTLE_GROUPS = {
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
exports.CHINESE_MODELS = {
    qwen: {
        model: 'qwen/qwen3.5-plus-02-15',
        cost: 0.24,
        maxTokens: 1000000,
        description: 'Qwen 3.5 Plus (1M tokens, 95% cheaper than Claude, Not in top 5 but best value)',
        ranking: 'Best value - 95% cheaper than top models',
        marketPosition: 'Cost-optimized leader'
    },
    minimax: {
        model: 'minimax/minimax-m2.5',
        cost: 0.15,
        maxTokens: 196608,
        description: 'MiniMax M2.5 (verbeterde AI agent tools)',
        ranking: 'Budget option',
        marketPosition: 'Ultra-low cost'
    },
    alibaba: {
        model: 'qwen/qwen3.5-397b-a17b',
        cost: 0.36,
        maxTokens: 262144,
        description: 'Qwen 3.5 397B (next-generation architectuur)',
        ranking: 'Performance option',
        marketPosition: 'Advanced features'
    }
};

// Nieuwe top-ranked modellen (Maart 2026)
exports.TOP_RANKED_MODELS = {
    claude_opus: {
        model: 'anthropic/claude-4.6-opus',
        cost: 15.00,
        maxTokens: 1000000,
        description: 'Claude 4.6 Opus - Technical leader with 1M context',
        ranking: '#1 Technical leader',
        marketPosition: 'Premium choice'
    },
    gemini_pro: {
        model: 'google/gemini-3.1-pro',
        cost: 2.00,
        maxTokens: 1000000,
        description: 'Gemini 3.1 Pro - Efficiency champion with $2/$12 pricing',
        ranking: '#2 Efficiency champion',
        marketPosition: 'Best price-to-performance'
    },
    claude_sonnet: {
        model: 'anthropic/claude-4.6-sonnet',
        cost: 3.00,
        maxTokens: 1000000,
        description: 'Claude Sonnet 4.6 - Accessible powerhouse with 1M context',
        ranking: '#3 Accessible powerhouse',
        marketPosition: 'Balanced choice'
    },
    glm_five: {
        model: 'thudm/glm-5',
        cost: 1.00,
        maxTokens: 1000000,
        description: 'GLM-5 - Open-source leader with MIT license',
        ranking: '#5 Open-source leader',
        marketPosition: 'Open-source champion'
    }
};
