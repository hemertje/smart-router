import * as https from 'https';
import { ModelConfig, Intent } from './models';

export interface OpenRouterMessage {
  role: string;
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

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

  private httpsRequest(method: string, path: string, body?: object, extraHeaders?: Record<string,string>): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = body ? JSON.stringify(body) : undefined;
      const options: https.RequestOptions = {
        hostname: 'openrouter.ai',
        port: 443,
        path,
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/hemertje/HECO',
          'X-Title': 'Smart Router Extension',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...extraHeaders
        }
      };
      const req = https.request(options, (res) => {
        let raw = '';
        res.on('data', (chunk) => raw += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(parsed?.error?.message || `HTTP ${res.statusCode}`));
            } else {
              resolve(parsed);
            }
          } catch { resolve(raw); }
        });
      });
      req.on('error', reject);
      req.setTimeout(30000, () => { req.destroy(new Error('Request timeout')); });
      if (data) req.write(data);
      req.end();
    });
  }

  async complete(
    model: string,
    messages: Array<OpenRouterMessage>,
    options: {
      max_tokens?: number;
      temperature?: number;
      stream?: boolean;
    } = {}
  ): Promise<OpenRouterResponse> {
    try {
      const result = await this.httpsRequest('POST', '/api/v1/chat/completions', {
        model,
        messages,
        max_tokens: options.max_tokens || 4096,
        temperature: options.temperature || 0.7,
        stream: options.stream || false,
      });
      return result as OpenRouterResponse;
    } catch (error: any) {
      throw new Error(`OpenRouter API error: ${error.message}`);
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const result = await this.httpsRequest('GET', '/api/v1/models');
      return (result?.data || []).map((m: any) => m.id as string);
    } catch (error: any) {
      console.error('List models error:', error.message);
      return [];
    }
  }

  async getModelInfo(model: string): Promise<any> {
    try {
      const result = await this.httpsRequest('GET', '/api/v1/models');
      const models: any[] = result?.data || [];
      return models.find((m: any) => m.id === model) || null;
    } catch (error: any) {
      console.error('Model info error:', error.message);
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
