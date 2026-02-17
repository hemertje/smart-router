import * as vscode from 'vscode';
import { IntentClassifier } from './classifier';
import { EnhancedIntentClassifier } from './enhancedClassifier';
import { OpenRouterClient } from './openrouter';
import { OllamaClient } from './ollama';
import { ProjectDetector } from './projectDetector';
import { CostTracker } from './costTracker';
import { StatusBarManager } from './statusBar';
import { SettingsManager } from './settings';
import { Logger } from './logger';
import { MetricsCollector } from './metrics';
import { Intent, MODEL_ROUTING, BattleGroup, ChineseModelConfig, ArenaModeConfig } from './models';
import { ArenaModeManager } from './arenaMode';
import { ChineseModelManager } from './chineseModels';
import { ContextCache } from './contextCache';

export function activate(context: vscode.ExtensionContext) {
  console.log('Smart Router extension is now active!');
  
  // Initialize logger and metrics
  const logger = Logger.getInstance();
  const metrics = new MetricsCollector();
  const outputChannel = vscode.window.createOutputChannel('Smart Router');
  logger.setOutputChannel(outputChannel);
  
  // Initialize components
  const classifier = new IntentClassifier();
  const enhancedClassifier = new EnhancedIntentClassifier();
  const projectDetector = new ProjectDetector();
  const costTracker = new CostTracker(projectDetector);
  const statusBarManager = new StatusBarManager(costTracker, projectDetector);
  
  // Initialize new v2.0 components
  const contextCache = new ContextCache();
  const arenaModeManager = new ArenaModeManager(costTracker);
  const chineseModelConfig: ChineseModelConfig = {
    enabled: true,
    costAdvantage: 0.7,
    preferredModels: ['zhipu/glm-5', 'minimax/minimax-m2.5', 'alibaba/qwen-3.5']
  };
  const chineseModelManager = new ChineseModelManager(chineseModelConfig);
  
  // Initialize async components
  const initialize = async () => {
    logger.info('Initializing Smart Router extension...');
    
    await costTracker.initialize();
    
    // Validate settings
    const settings = SettingsManager.getSettings();
    const validation = SettingsManager.validateSettings(settings);
    
    if (!validation.valid) {
      logger.warn('Settings validation failed', { errors: validation.errors });
      vscode.window.showWarningMessage(
        `Smart Router: ${validation.errors.join(', ')}`,
        'Open Settings'
      ).then(selection => {
        if (selection === 'Open Settings') {
          SettingsManager.openSettings();
        }
      });
    }
    
    // Start status bar
    if (settings.enabled) {
      statusBarManager.start();
      logger.info('Status bar manager started');
    }
    
    // Check for API keys
    const openrouterApiKey = process.env.OPENROUTER_API_KEY || settings.openrouterApiKey;
    
    if (!openrouterApiKey) {
      logger.warn('OpenRouter API key not configured');
    } else {
      logger.info('OpenRouter API key configured');
    }
    
    // Check Ollama availability
    const ollama = new OllamaClient();
    const ollamaAvailable = await ollama.isAvailable();
    logger.info('Ollama availability checked', { available: ollamaAvailable });
    
    logger.info('Smart Router extension initialized successfully');
  };
  
  initialize();
  
  // Register chat participant
  const participant = vscode.chat.createChatParticipant('smart', async (request, context, stream) => {
    const userQuery = request.prompt;
    const startTime = Date.now();
    
    try {
      // Get project context
      const projectContext = await projectDetector.getProjectContext();
      
      // Use enhanced classifier
      const classification = await enhancedClassifier.classify(userQuery);
      const routing = classifier.getRouting(classification.intent);
      
      // Show progress with classification details
      stream.progress(
        `🤖 ${classification.intent} (${classification.method}) | ` +
        `Model: ${routing.config.model} | ` +
        `Cost: $${routing.config.cost} | ` +
        `Confidence: ${(classification.confidence * 100).toFixed(0)}%`
      );
      
      // Get settings
      const settings = SettingsManager.getSettings();
      const openrouterApiKey = process.env.OPENROUTER_API_KEY || settings.openrouterApiKey;
      
      if (!openrouterApiKey) {
        // No API key - show routing info only
        const response = `🧠 **Smart Router Analysis**

**Project Context:**
${projectContext}

**Classification:**
- Intent: ${classification.intent}
- Method: ${classification.method}
- Confidence: ${(classification.confidence * 100).toFixed(0)}%
- Reasoning: ${classification.reasoning}

**Selected Model:** ${routing.config.model}
**Cost:** $${routing.config.cost}
**Description:** ${routing.config.description}

**Query:** "${userQuery}"

⚠️ *Note: OpenRouter API key not configured. Set OPENROUTER_API_KEY environment variable to enable full functionality.*`;
        
        stream.markdown(response);
        
        // Track usage (no cost)
        await costTracker.trackUsage(classification.intent, routing.config.model, 0, userQuery, Date.now() - startTime);
        return;
      }
      
      // Full API integration
      const openrouter = new OpenRouterClient(openrouterApiKey);
      
      // Build messages with project context
      const messages = [
        {
          role: 'system',
          content: `You are a helpful AI assistant. Context:\n\n${projectContext}`
        },
        {
          role: 'user',
          content: userQuery
        }
      ];
      
      // Call OpenRouter API
      const apiResponse = await openrouter.complete(routing.config.model, messages, {
        max_tokens: routing.config.maxTokens,
        temperature: 0.7
      });
      
      const responseText = apiResponse.choices[0]?.message?.content || 'No response received';
      const actualCost = openrouter.calculateCost(routing.config.model, apiResponse.usage.total_tokens);
      const responseTime = Date.now() - startTime;
      
      // Send response
      stream.markdown(responseText);
      
      // Track usage
      await costTracker.trackUsage(
        classification.intent, 
        routing.config.model, 
        actualCost, 
        userQuery, 
        responseTime,
        {
          prompt: apiResponse.usage.prompt_tokens,
          completion: apiResponse.usage.completion_tokens,
          total: apiResponse.usage.total_tokens
        }
      );
      
      // Check budget alerts
      if (settings.budgetAlerts) {
        const stats = await costTracker.getStats();
        if (stats) {
          const today = new Date().toISOString().split('T')[0];
          const todayCost = stats.dailyCosts[today] || 0;
          
          if (todayCost > settings.costWarningThreshold) {
            vscode.window.showWarningMessage(
              `Smart Router: Daily cost $${todayCost.toFixed(2)} exceeds threshold $${settings.costWarningThreshold}`
            );
          }
          
          const monthCost = Object.values(stats.dailyCosts)
            .filter((_, i) => i >= 30) // Last 30 days
            .reduce((sum, cost) => sum + cost, 0);
          
          if (monthCost > settings.monthlyBudget) {
            vscode.window.showWarningMessage(
              `Smart Router: Monthly cost $${monthCost.toFixed(2)} exceeds budget $${settings.monthlyBudget}`
            );
          }
        }
      }
      
    } catch (error: any) {
      console.error('Smart Router error:', error);
      
      const errorResponse = `❌ **Smart Router Error**

${error.message}

**Query:** "${userQuery}"

*Please check your configuration and try again.*`;
      
      stream.markdown(errorResponse);
    }
  });
  
  participant.iconPath = new vscode.ThemeIcon('arrow-circle-right');
  participant.followupProvider = {
    provideFollowups(result, context) {
      return [
        {
          prompt: 'Show model costs',
          label: '💰 Show model costs',
          command: 'smart.showCosts'
        },
        {
          prompt: 'Explain routing',
          label: '📖 Explain routing logic',
          command: 'smart.explainRouting'
        },
        {
          prompt: 'Clear preferences',
          label: '🗑️ Clear preferences',
          command: 'smart.clearPreferences'
        },
        {
          prompt: 'Start Arena Mode',
          label: '⚔️ Start Arena Mode',
          command: 'smart.startArena'
        },
        {
          prompt: 'Show Chinese models',
          label: '🇨🇳 Show Chinese models',
          command: 'smart.showChineseModels'
        },
        {
          prompt: 'Show context cache',
          label: '📝 Show context cache',
          command: 'smart.showContextCache'
        }
      ];
    }
  };
  
  context.subscriptions.push(participant);
  
  // Register commands
  const showCostsCommand = vscode.commands.registerCommand('smart.showCosts', async () => {
    const summary = await costTracker.getCostSummary();
    vscode.window.showInformationMessage(summary, { modal: true });
  });

  const showStatusCommand = vscode.commands.registerCommand('smart.showStatus', async () => {
    const project = await projectDetector.detectProject();
    const stats = await costTracker.getStats();
    const ollama = new OllamaClient();
    const ollamaAvailable = await ollama.isAvailable();
    const settings = SettingsManager.getSettings();
    
    const status = `
🤖 **Smart Router Status**

**Project:** ${project?.name || 'No active project'}
**Extension:** ${settings.enabled ? '✅ Enabled' : '❌ Disabled'}
**Ollama:** ${ollamaAvailable ? '✅ Running' : '❌ Not running'}
**API Key:** ${settings.openrouterApiKey ? '✅ Configured' : '❌ Not set'}

**Usage:**
${stats ? `- Total Cost: $${stats.totalCost.toFixed(2)}\n- Requests: ${stats.totalRequests}` : 'No usage data'}

**Settings:**
- Default Model: ${settings.defaultModel}
- Cost Warning: $${settings.costWarningThreshold}
- Monthly Budget: $${settings.monthlyBudget}
- Budget Alerts: ${settings.budgetAlerts ? 'On' : 'Off'}
  `.trim();
    
    vscode.window.showInformationMessage(status, { modal: true });
  });

  const clearPreferencesCommand = vscode.commands.registerCommand('smart.clearPreferences', async () => {
    enhancedClassifier.clearUserPreferences();
    vscode.window.showInformationMessage('Smart Router preferences cleared');
  });

  const openSettingsCommand = vscode.commands.registerCommand('smart.openSettings', () => {
    SettingsManager.openSettings();
  });

  const explainRoutingCommand = vscode.commands.registerCommand('smart.explainRouting', async () => {
    const ollama = new OllamaClient();
    const ollamaAvailable = await ollama.isAvailable();
    const chineseStats = chineseModelManager.getModelStats();
    
    const explanation = `
🧠 **Smart Router Logic v2.0**

1. **Intent Classification:**
   - Primary: Ollama Qwen3:8b (${ollamaAvailable ? '✅ Available' : '❌ Not running'})
   - Enhanced: Rule-based with pattern weights
   - ML: User preferences and similarity matching

2. **Model Selection:** Optimal model chosen for your intent
3. **Cost Tracking:** Usage tracked per project
4. **Project Context:** Automatically loaded from .claude/CLAUDE.md
5. **Budget Alerts:** Warnings for daily/monthly limits
6. **Arena Mode:** Parallel model comparison (NEW)
7. **Chinese Models:** Cost-optimized alternatives (NEW)

**Example:**
- "@smart git status" → Simple → FREE model
- "@smart create API" → Code Gen → SWE 1.5 (NEW)
- "@smart why is this broken" → Debug → MiniMax M2.5 (UPGRADE)
- "@smart design architecture" → Architecture → Opus 4.6 (1M tokens)

**Arena Mode:**
- Frontier: Opus 4.6, Opus 4.5, Sonnet 4.5
- Fast: SWE 1.5, Haiku 4.5, Gemini 3 Flash
- Hybrid: Mix of speed and intelligence

**Chinese Models:**
- Available: ${chineseStats.enabledModels}/${chineseStats.totalModels}
- Average Cost: $${chineseStats.averageCost.toFixed(2)}
- Total Savings: $${chineseStats.totalSavings.toFixed(2)}

**Configuration:**
- OpenRouter API Key: ${process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Not set'}
- Ollama: ${ollamaAvailable ? '✅ Running' : '❌ Not running'}
  `;
    vscode.window.showInformationMessage(explanation, { modal: true });
  });

  // Arena Mode commands
  const startArenaModeCommand = vscode.commands.registerCommand('smart.startArena', async () => {
    const battleGroups: { label: string; description: string; value: BattleGroup }[] = [
      { label: 'Frontier', description: 'Top reasoning modellen', value: 'frontier' },
      { label: 'Fast', description: 'Snelle modellen', value: 'fast' },
      { label: 'Hybrid', description: 'Balans tussen snelheid en intelligentie', value: 'hybrid' }
    ];
    
    const selected = await vscode.window.showQuickPick(battleGroups, {
      placeHolder: 'Selecteer battle group voor Arena Mode'
    });
    
    if (selected) {
      const prompt = await vscode.window.showInputBox({
        prompt: 'Voer je query in voor Arena Mode',
        placeHolder: 'bv: create a REST API with authentication'
      });
      
      if (prompt) {
        await arenaModeManager.startArenaSession(selected.value, prompt);
      }
    }
  });

  // Chinese models commands
  const showChineseModelsCommand = vscode.commands.registerCommand('smart.showChineseModels', async () => {
    const models = chineseModelManager.getAvailableModels();
    const stats = chineseModelManager.getModelStats();
    const savings = chineseModelManager.getCostSavings();
    
    const modelList = models.map(m => 
      `- **${m.model}**: $${m.cost.toFixed(2)} - ${m.description}`
    ).join('\n');
    
    const savingsList = savings.map(s => 
      `- ${s.model}: $${s.originalCost.toFixed(2)} → $${s.discountedCost.toFixed(2)} (bespaar $${s.savings.toFixed(2)})`
    ).join('\n');
    
    const info = `
🇨🇳 **Chinese AI Models**

**Beschikbare Modellen (${models.length}):**
${modelList}

**Statistieken:**
- Totaal: ${stats.totalModels} modellen
- Actief: ${stats.enabledModels} modellen
- Gemiddelde kosten: $${stats.averageCost.toFixed(2)}
- Totale besparing: $${stats.totalSavings.toFixed(2)}

**Kostenbesparing:**
${savingsList}

**Cost Advantage:** ${((1 - chineseModelConfig.costAdvantage) * 100).toFixed(0)}% korting op alle Chinese modellen
  `;
    
    vscode.window.showInformationMessage(info, { modal: true });
  });

  // Context cache commands
  const showContextCacheCommand = vscode.commands.registerCommand('smart.showContextCache', async () => {
    const project = await projectDetector.detectProject();
    const context = contextCache.getContext(project?.name);
    const stats = contextCache.getStats(project?.name);
    
    const contextList = context.slice(0, 10).map(c => 
      `- **${c.intent}**: ${c.query.substring(0, 50)}... (${new Date(c.timestamp).toLocaleString()})`
    ).join('\n');
    
    const info = `
📝 **Context Cache**

**Project:** ${project?.name || 'Global'}
**Entries:** ${stats.totalEntries}
**Total Cost:** $${stats.totalCost.toFixed(2)}
**Total Tokens:** ${stats.totalTokens}

**Recente Context (10 meest recente):**
${contextList || 'Geen context'}

**Intent Breakdown:**
${Object.entries(stats.mostUsedIntents).map(([intent, count]) => 
  `- ${intent}: ${count} keer`
).join('\n')}
  `;
    
    vscode.window.showInformationMessage(info, { modal: true });
  });

  const clearContextCacheCommand = vscode.commands.registerCommand('smart.clearContextCache', async () => {
    const project = await projectDetector.detectProject();
    contextCache.clear(project?.name);
    vscode.window.showInformationMessage('Context cache geleegd');
  });
  
  context.subscriptions.push(
    showCostsCommand,
    showStatusCommand,
    clearPreferencesCommand,
    openSettingsCommand,
    explainRoutingCommand,
    startArenaModeCommand,
    showChineseModelsCommand,
    showContextCacheCommand,
    clearContextCacheCommand
  );
  
  // Add status bar to subscriptions for cleanup
  context.subscriptions.push(statusBarManager);
}

export function deactivate() {
  console.log('Smart Router extension deactivated');
}
