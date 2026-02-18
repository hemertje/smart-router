import * as http from 'http';
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

  private httpPost(path: string, body: object): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const url = new URL(this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || 11434,
        path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
      };
      const req = http.request(options, (res) => {
        let raw = '';
        res.on('data', (chunk) => raw += chunk);
        res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve(raw); } });
      });
      req.on('error', reject);
      req.setTimeout(10000, () => { req.destroy(new Error('timeout')); });
      req.write(data);
      req.end();
    });
  }

  private httpGet(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl);
      const options = { hostname: url.hostname, port: url.port || 11434, path, method: 'GET' };
      const req = http.request(options, (res) => {
        let raw = '';
        res.on('data', (chunk) => raw += chunk);
        res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve(raw); } });
      });
      req.on('error', reject);
      req.setTimeout(2000, () => { req.destroy(new Error('timeout')); });
      req.end();
    });
  }

  async generate(prompt: string): Promise<string> {
    try {
      const data = await this.httpPost('/api/generate', {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: { temperature: 0.1, top_p: 0.9 }
      });
      return (data as OllamaResponse).response.trim();
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama is not running. Start with: ollama serve');
      }
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
      await this.httpGet('/api/tags');
      return true;
    } catch {
      return false;
    }
  }

  async pullModel(model: string = this.model): Promise<void> {
    console.log(`Pulling Ollama model: ${model}`);
    try {
      await this.httpPost('/api/pull', { model, stream: false });
      console.log('Model pulled successfully');
    } catch (error: any) {
      console.error('Failed to pull model:', error.message);
      throw error;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const data = await this.httpGet('/api/tags');
      return data.models.map((m: any) => m.name);
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  }
}
