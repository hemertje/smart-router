import axios from 'axios';
import { Intent } from './models';

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export class OllamaClient {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'qwen:8b') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generate(prompt: string): Promise<string> {
    try {
      const response = await axios.post<OllamaResponse>(
        `${this.baseUrl}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.1, // Low temperature for consistent classification
            top_p: 0.9,
          }
        }
      );

      return response.data.response.trim();
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama is not running. Start with: ollama serve');
      }
      console.error('Ollama error:', error.response?.data || error.message);
      throw new Error(`Ollama error: ${error.message}`);
    }
  }

  async classifyIntent(query: string): Promise<Intent | null> {
    const prompt = `Classify this query into exactly one of these categories: simple, code_gen, debug, or architecture.

Query: "${query}"

Category (one word only):`;

    try {
      const response = await this.generate(prompt);
      
      // Validate response
      const validIntents: Intent[] = ['simple', 'code_gen', 'debug', 'architecture'];
      const classified = response.toLowerCase().trim();
      
      if (validIntents.includes(classified as Intent)) {
        return classified as Intent;
      }
      
      // Fallback to rule-based if Ollama returns invalid response
      console.warn(`Ollama returned invalid intent: ${classified}, falling back to rule-based`);
      return null; // Signal to use rule-based fallback
    } catch (error) {
      console.error('Intent classification failed:', error);
      return null; // Signal to use rule-based fallback
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 2000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async pullModel(model: string = this.model): Promise<void> {
    console.log(`Pulling Ollama model: ${model}`);
    try {
      const response = await axios.post(`${this.baseUrl}/api/pull`, {
        model: model,
        stream: false
      });
      console.log('Model pulled successfully');
    } catch (error: any) {
      console.error('Failed to pull model:', error.response?.data || error.message);
      throw error;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models.map((m: any) => m.name);
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  }
}
