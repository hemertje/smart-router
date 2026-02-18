import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { OpenRouterClient } from './openrouter';
import { Logger } from './logger';

export interface ImageAnalysisResult {
  success: boolean;
  error?: string;
  analysis?: string;
  cost?: number;
  model?: string;
  tokens?: number;
}

export class ImageAnalyzer {
  private logger = Logger.getInstance();
  private openRouter: OpenRouterClient;

  constructor(apiKey: string) {
    this.openRouter = new OpenRouterClient(apiKey);
  }

  async analyzeImage(imagePath: string): Promise<ImageAnalysisResult> {
    try {
      // Validate image file
      await this.validateImageFile(imagePath);
      
      // Read image as base64
      const imageBase64 = await this.readImageAsBase64(imagePath);
      
      // Create analysis prompt
      const prompt = this.createAnalysisPrompt(imagePath);
      
      // Get model routing for image analysis
      const model = 'z-ai/glm-5'; // Use GLM-5 for image analysis
      
      // Call OpenRouter with vision model
      const messages = [
        {
          role: 'user',
          content: JSON.stringify([
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageBase64}`
              }
            }
          ])
        }
      ];
      
      const response = await this.openRouter.complete(model, messages, {
        max_tokens: 1000,
        temperature: 0.7
      });

      // Calculate cost
      const cost = this.calculateCost(model, response.usage.total_tokens);
      
      // Track usage
      await this.logger.info(`[Image Analysis] Model: ${model}, Tokens: ${response.usage.total_tokens}, Cost: $${cost.toFixed(4)}`);
      
      return {
        success: true,
        analysis: response.choices[0].message.content,
        cost,
        model,
        tokens: response.usage.total_tokens
      };
      
    } catch (error: any) {
      this.logger.error(`[Image Analysis] Error: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async validateImageFile(imagePath: string): Promise<void> {
    // Check if file exists
    try {
      await fs.access(imagePath, fs.constants.R_OK);
    } catch {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // Check file size (max 10MB)
    const stats = await fs.stat(imagePath);
    if (stats.size > 10 * 1024 * 1024) {
      throw new Error(`Image file too large: ${stats.size} bytes (max 10MB)`);
    }

    // Check file extension
    const ext = path.extname(imagePath).toLowerCase();
    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
    if (!validExtensions.includes(ext)) {
      throw new Error(`Unsupported image format: ${ext}. Supported: ${validExtensions.join(', ')}`);
    }
  }

  private async readImageAsBase64(imagePath: string): Promise<string> {
    const imageBuffer = await fs.readFile(imagePath);
    return imageBuffer.toString('base64');
  }

  private createAnalysisPrompt(imagePath: string): string {
    const fileName = path.basename(imagePath);
    return `Analyze this image thoroughly:

**File:** ${fileName}

**Instructions:**
1. Describe what you see in the image
2. Identify any errors, bugs, or issues
3. If it's code, analyze the logic and suggest improvements
4. If it's a diagram or design, explain the concepts
5. Point out any potential problems or areas for improvement
6. Provide actionable recommendations

**Context:** This is part of a coding/development workflow. Focus on technical accuracy and practical advice.

Please provide a detailed, structured analysis that helps the user understand and improve what they're working on.`;
  }

  private calculateCost(model: string, tokens: number): number {
    // GLM-5 pricing: ~$2.45 per 1M tokens
    const rate = 2.45 / 1000000;
    return tokens * rate;
  }
}
