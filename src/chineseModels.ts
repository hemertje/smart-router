import { CHINESE_MODELS, ModelConfig, ChineseModelConfig } from './models';
import { Logger } from './logger';

export class ChineseModelManager {
  private logger = Logger.getInstance();
  private config: ChineseModelConfig;

  constructor(config: ChineseModelConfig) {
    this.config = config;
  }

  /**
   * Get beschikbare Chinese modellen
   */
  getAvailableModels(): ModelConfig[] {
    if (!this.config.enabled) {
      return [];
    }

    const models: ModelConfig[] = [];
    
    for (const [key, model] of Object.entries(CHINESE_MODELS)) {
      if (this.config.preferredModels.includes(model.model)) {
        // Pas kosten aan op basis van cost advantage
        const adjustedCost = model.cost * this.config.costAdvantage;
        models.push({
          ...model,
          cost: adjustedCost,
          description: `${model.description} (Korting: ${((1 - this.config.costAdvantage) * 100).toFixed(0)}%)`
        });
      }
    }

    this.logger.info(`[Chinese Models] ${models.length} modellen beschikbaar met cost advantage`);
    return models;
  }

  /**
   * Get beste Chinese model voor intent
   */
  getBestModel(intent: string): ModelConfig | null {
    const models = this.getAvailableModels();
    if (models.length === 0) {
      return null;
    }

    // Prioriteiten per intent
    const priorities: Record<string, string[]> = {
      'code_gen': ['zhipu/glm-5', 'alibaba/qwen-3.5', 'minimax/minimax-m2.5'],
      'debug': ['minimax/minimax-m2.5', 'zhipu/glm-5', 'alibaba/qwen-3.5'],
      'architecture': ['zhipu/glm-5', 'alibaba/qwen-3.5', 'minimax/minimax-m2.5'],
      'simple': ['minimax/minimax-m2.5', 'alibaba/qwen-3.5', 'zhipu/glm-5']
    };

    const intentPriority = priorities[intent] || priorities['simple'];
    
    for (const modelName of intentPriority) {
      const model = models.find(m => m.model === modelName);
      if (model) {
        this.logger.info(`[Chinese Models] Geselecteerd ${modelName} voor ${intent}`);
        return model;
      }
    }

    // Fallback naar eerste beschikbare model
    return models[0];
  }

  /**
   * Check of Chinese model beschikbaar is
   */
  isModelAvailable(modelName: string): boolean {
    const models = this.getAvailableModels();
    return models.some(m => m.model === modelName);
  }

  /**
   * Update configuratie
   */
  updateConfig(config: Partial<ChineseModelConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('[Chinese Models] Configuratie bijgewerkt');
  }

  /**
   * Get cost savings ten opzichte van westerse modellen
   */
  getCostSavings(): { model: string; originalCost: number; discountedCost: number; savings: number }[] {
    const models = this.getAvailableModels();
    return models.map(model => ({
      model: model.model,
      originalCost: model.cost / this.config.costAdvantage,
      discountedCost: model.cost,
      savings: (model.cost / this.config.costAdvantage) - model.cost
    }));
  }

  /**
   * Valideer Chinese model response
   */
  async validateResponse(modelName: string, response: string): Promise<boolean> {
    // Basis validatie checks
    if (!response || response.length < 10) {
      this.logger.warn(`[Chinese Models] Ongeldige response van ${modelName}`);
      return false;
    }

    // Check voor Chinese karakters (optioneel)
    const hasChineseChars = /[\u4e00-\u9fff]/.test(response);
    if (hasChineseChars) {
      this.logger.info(`[Chinese Models] ${modelName} antwoordde in het Chinees`);
    }

    return true;
  }

  /**
   * Get model statistieken
   */
  getModelStats(): {
    totalModels: number;
    enabledModels: number;
    averageCost: number;
    totalSavings: number;
  } {
    const models = this.getAvailableModels();
    const totalSavings = this.getCostSavings().reduce((sum, s) => sum + s.savings, 0);
    const averageCost = models.length > 0 ? models.reduce((sum, m) => sum + m.cost, 0) / models.length : 0;

    return {
      totalModels: Object.keys(CHINESE_MODELS).length,
      enabledModels: models.length,
      averageCost,
      totalSavings
    };
  }
}
