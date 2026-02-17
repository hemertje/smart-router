import axios from 'axios';
import { ModelConfig, Intent } from './models';

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  id: string;
  object: string;
  created: number;
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async complete(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: {
      max_tokens?: number;
      temperature?: number;
      stream?: boolean;
    } = {}
  ): Promise<OpenRouterResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: model,
          messages: messages,
          max_tokens: options.max_tokens || 4096,
          temperature: options.temperature || 0.7,
          stream: options.stream || false,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/hemertje/HECO',
            'X-Title': 'Smart Router Extension',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('OpenRouter API error:', error.response?.data || error.message);
      throw new Error(`OpenRouter API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getModelInfo(model: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/model`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        params: { model }
      });
      return response.data;
    } catch (error: any) {
      console.error('Model info error:', error.response?.data || error.message);
      return null;
    }
  }

  calculateCost(model: string, tokens: number): number {
    // Rough cost calculation based on model pricing
    // These are approximate costs per 1M tokens
    const pricing: Record<string, number> = {
      'xiaomi/mimo-v2-flash': 0,      // FREE
      'swe-1.5': 0,                  // FREE
      'deepseek/deepseek-coder-v3': 0.14,  // ~$0.14/1M input, $0.28/1M output
      'minimax/minimax-m2.5': 0.15,   // ~$0.15/1M input, $0.30/1M output
      'qwen/qwen3.5-397b-a17b': 0.36,  // ~$0.36/1M input, $1.80/1M output
      'qwen/qwen3.5-plus-02-15': 0.24, // ~$0.24/1M input, $1.20/1M output
      'anthropic/claude-opus-4-6': 15, // ~$15/1M input, $75/1M output
    };

    const rate = pricing[model] || 1; // Default $1/1M tokens
    return (tokens / 1000000) * rate;
  }
}
