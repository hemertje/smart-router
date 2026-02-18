import * as vscode from 'vscode';
import * as path from 'path';
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
import { ImageAnalyzer } from './imageAnalyzer';
import { ProactiveValidator } from './proactiveValidator';
import { AutoHealingSystem } from './autoHealing';
import { PredictiveCostEngine } from './predictiveCost';
import { RealTimePerformanceMonitor } from './performanceMonitor';
import { RooCodeBridge } from './rooCodeBridge';
import { SmartRouterPanel } from './smartRouterPanel';
import { DailyEvaluator } from './dailyEvaluator';
import { HECOProjectAnalyzer } from './hecoProjectAnalyzer';

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
  
  // Initialize OpenRouter client
  const settings = SettingsManager.getSettings();
  const openRouterClient = new OpenRouterClient(settings.openrouterApiKey);
  
  // Initialize new v2.0 components
  const contextCache = new ContextCache();
  const arenaModeManager = new ArenaModeManager(costTracker);
  const chineseModelConfig: ChineseModelConfig = {
    enabled: true,
    costAdvantage: 0.7,
    preferredModels: ['z-ai/glm-5', 'minimax/minimax-m2.5', 'alibaba/qwen-3.5']
  };
  const chineseModelManager = new ChineseModelManager(chineseModelConfig);
  
  // Initialize image analyzer
  const imageAnalyzer = new ImageAnalyzer(settings.openrouterApiKey);
  
  // Initialize proactive validator
  const proactiveValidator = new ProactiveValidator(settings.openrouterApiKey);
  
  // Initialize auto-healing system
  const autoHealing = new AutoHealingSystem(openRouterClient);
  
  // Initialize predictive cost engine
  const predictiveCost = new PredictiveCostEngine(costTracker);
  
  // Initialize performance monitor
  const performanceMonitor = new RealTimePerformanceMonitor();
  
  // Initialize Roo Code bridge
  const rooCodeBridge = new RooCodeBridge();
  
  // Initialize async components
  const initialize = async () => {
    logger.info('Initializing Smart Router extension...');
    
    await costTracker.initialize();
    
    // Detect Roo Code
    const rooStatus = await rooCodeBridge.detect();
    if (rooStatus.installed) {
      logger.info(`Roo Code detected: v${rooStatus.version} (active: ${rooStatus.active})`);
    } else {
      logger.info('Roo Code not detected - running standalone');
    }
    
    // Validate settings
    const settings = SettingsManager.getSettings();
    const validation = SettingsManager.validateSettings(settings);
    
    if (!validation.valid) {
      logger.warn(`Settings validation failed: ${validation.errors.join(', ')}`);
      vscode.window.showWarningMessage(
        `Smart Router settings validation failed. Check settings: ${validation.errors.join(', ')}`
      );
    }
    
    // Proactive system validation (async, non-blocking)
    setTimeout(async () => {
      try {
        const systemValidation = await proactiveValidator.validateSystem();
        if (!systemValidation.valid) {
          logger.warn(`System validation found ${systemValidation.issues.length} issues`);
          // Show notification for critical issues
          const criticalIssues = systemValidation.issues.filter(i => i.type === 'error');
          if (criticalIssues.length > 0) {
            vscode.window.showWarningMessage(
              `Smart Router: ${criticalIssues.length} critical issues found. Run 'Smart Router: Validate System' for details.`,
              'Validate System'
            ).then(selection => {
              if (selection === 'Validate System') {
                vscode.commands.executeCommand('smart.validateSystem');
              }
            });
          }
        } else {
          logger.info('System validation passed - all systems operational');
        }
      } catch (error: any) {
        logger.error(`Proactive validation failed: ${error.message}`);
      }
    }, 5000); // Run after 5 seconds
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

  // Register Smart Router as a VS Code language model provider
  // This fixes "Language model unavailable" when GitHub Copilot is not installed
  if (typeof (vscode.lm as any).registerChatModelProvider === 'function') {
    const modelProvider = (vscode.lm as any).registerChatModelProvider(
      'smart-router',
      {
        async provideLanguageModelResponse(
          messages: vscode.LanguageModelChatMessage[],
          options: any,
          extensionId: string,
          progress: any,
          token: vscode.CancellationToken
        ) {
          const settings = SettingsManager.getSettings();
          const apiKey = settings.openrouterApiKey;
          if (!apiKey) {
            progress.report({ index: 0, part: new vscode.LanguageModelTextPart('⚠️ Set smartRouter.openrouterApiKey in VS Code settings to use Smart Router.') });
            return;
          }
          const openrouter = new OpenRouterClient(apiKey);
          const msgs = messages.map((m: any) => ({
            role: m.role === 1 ? 'user' : 'assistant',
            content: m.content.map((p: any) => p.value || '').join('')
          }));
          try {
            const result = await openrouter.complete('qwen/qwen3-235b-a22b', msgs, { max_tokens: 4096 });
            const text = result.choices[0]?.message?.content || '';
            progress.report({ index: 0, part: new vscode.LanguageModelTextPart(text) });
          } catch (e: any) {
            progress.report({ index: 0, part: new vscode.LanguageModelTextPart(`Error: ${e.message}`) });
          }
        },
        async countTokens(text: string) { return Math.ceil(text.length / 4); }
      },
      {
        vendor: 'smart-router',
        name: 'Smart Router (OpenRouter)',
        family: 'smart-router',
        version: '2.7.0',
        maxInputTokens: 128000,
        maxOutputTokens: 4096
      }
    );
    context.subscriptions.push(modelProvider);
  }

  // Register chat participant
  const participant = vscode.chat.createChatParticipant('smart', async (request, context, stream) => {
    const userQuery = request.prompt;
    const startTime = Date.now();
    
    try {
      // Get project context
      const projectContext = await projectDetector.getProjectContext();
      
      // Use enhanced classifier
      const classification = await enhancedClassifier.classify(userQuery);
      let routing = classifier.getRouting(classification.intent);
      
      // Enhanced architecture routing - 3-staps raket met slimme keuze
      if (classification.intent === 'architecture') {
        // Check for previous architecture attempts in context
        const context = contextCache.getContext();
        const previousAttempts = context.filter(c => 
          c.intent === 'architecture' || 
          c.intent === 'architecture_screening' ||
          c.intent === 'architecture_screening_alt' ||
          c.intent === 'architecture_premium'
        );
        
        if (previousAttempts.length === 0) {
          // Stap 1: SWE 1.5 snelle screening (FREE)
          routing = classifier.getRouting('architecture');
          stream.progress(`🚀 Stap 1: SWE 1.5 snelle architectuur screening (FREE)`);
        } else if (previousAttempts.length === 1) {
          // Stap 2: Kies tussen GLM-5 (kwaliteit) en Qwen (budget)
          const settings = SettingsManager.getSettings();
          
          // Check voor Chinese API keys (niet meer nodig, GLM-5 werkt via OpenRouter)
          // Gebruik altijd GLM-5 voor beste kwaliteit
          routing = classifier.getRouting('architecture_screening');
          stream.progress(`🏗️ Stap 2: GLM-5 Chinese model (open weights leader, $0.21)`);
        } else {
          // Stap 3: Opus 4.6 premium deep dive ($5.00)
          routing = classifier.getRouting('architecture_premium');
          stream.progress(`💎 Stap 3: Opus 4.6 premium deep dive (1M tokens)`);
        }
      }
      
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
      
      // Always try VS Code built-in model first (request.model)
      // This fixes "Language model unavailable" - VS Code Chat requires sendRequest()
      const vsCodeModel = request.model;
      
      const routingHeader = `🧠 **Smart Router** | Intent: \`${classification.intent}\` | Model: \`${routing.config.model}\` | Cost: $${routing.config.cost}\n\n`;

      if (!openrouterApiKey) {
        // No OpenRouter key - use VS Code built-in model with routing context
        stream.markdown(routingHeader);
        
        const systemPrompt = `You are a helpful AI assistant. Smart Router has classified this as a "${classification.intent}" task. Project context:\n${projectContext}`;
        const messages = [
          vscode.LanguageModelChatMessage.User(systemPrompt + '\n\nUser query: ' + userQuery)
        ];
        
        try {
          const vsResponse = await vsCodeModel.sendRequest(messages, {});
          for await (const chunk of vsResponse.text) {
            stream.markdown(chunk);
          }
        } catch (vsErr: any) {
          stream.markdown(`⚠️ *No OpenRouter API key configured. Set \`smartRouter.openrouterApiKey\` in VS Code settings for full model routing.*\n\n*Routing would use: ${routing.config.model} (${routing.config.description})*`);
        }
        
        await costTracker.trackUsage(classification.intent, routing.config.model, 0, userQuery, Date.now() - startTime);
        return;
      }
      
      // Check if task should be delegated to Roo Code
      const rooSettings = SettingsManager.getSettings();
      if (rooSettings.rooCodeIntegration && rooCodeBridge.isAvailable()) {
        // Delegate code_gen and debug tasks to Roo Code when auto-delegate is on
        if (rooSettings.rooCodeAutoDelegate && 
            (classification.intent === 'code_gen' || classification.intent === 'debug')) {
          stream.progress(`🔄 Delegating to Roo Code (${rooSettings.rooCodePreferredMode} mode)...`);
          const delegation = await rooCodeBridge.delegateTask(userQuery, {
            mode: rooSettings.rooCodePreferredMode as any,
            model: routing.config.model
          });
          if (delegation.success) {
            stream.markdown(
              `✅ **Task delegated to Roo Code**\n\n` +
              `- **Mode:** ${rooSettings.rooCodePreferredMode}\n` +
              `- **Model:** ${routing.config.model}\n` +
              `- **Result:** ${delegation.response}\n\n` +
              `*Check the Roo Code panel for the full response.*`
            );
            await costTracker.trackUsage(classification.intent, routing.config.model, 0, userQuery, Date.now() - startTime);
            return;
          }
          // If delegation fails, fall through to direct API call
          stream.progress('⚠️ Roo Code delegation failed, using direct API...');
        }
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
  
  // Image analysis command
  const analyzeImageCommand = vscode.commands.registerCommand('smart.analyzeImage', async () => {
    // Show file picker for image
    const fileUri = await vscode.window.showOpenDialog({
      canSelectMany: false,
      openLabel: 'Select Image to Analyze',
      filters: {
        'Images': ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
      }
    });
    
    if (!fileUri || fileUri.length === 0) {
      vscode.window.showInformationMessage('No image selected');
      return;
    }
    
    const imagePath = fileUri[0].fsPath;
    
    // Show progress
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Analyzing Image',
      cancellable: false
    }, async (progress) => {
      progress.report({ increment: 0, message: 'Loading image...' });
      
      // Analyze image
      const result = await imageAnalyzer.analyzeImage(imagePath);
      
      if (result.success) {
        progress.report({ increment: 100, message: 'Analysis complete!' });
        
        // Show results
        const analysis = `
🖼️ **Image Analysis Results**

**File:** ${path.basename(imagePath)}
**Model:** ${result.model}
**Tokens:** ${result.tokens}
**Cost:** $${result.cost?.toFixed(4)}

**Analysis:**
${result.analysis}

---
*Powered by GLM-5 via OpenRouter*
        `;
        
        // Create new document with results
        const doc = await vscode.workspace.openTextDocument({
          content: analysis,
          language: 'markdown'
        });
        
        await vscode.window.showTextDocument(doc);
        
        // Track cost
        if (result.cost) {
          const project = await projectDetector.detectProject();
          await costTracker.trackUsage('debug' as Intent, result.model!, result.cost!, 'Image analysis', 0, {
            prompt: Math.floor(result.tokens! * 0.3),
            completion: Math.floor(result.tokens! * 0.7),
            total: result.tokens!
          });
        }
      } else {
        vscode.window.showErrorMessage(`Image analysis failed: ${result.error}`);
      }
    });
  });
  
  // Proactive validation command
  const validateSystemCommand = vscode.commands.registerCommand('smart.validateSystem', async () => {
    await proactiveValidator.showValidationResults();
  });
  
  // Health dashboard command
  const showHealthCommand = vscode.commands.registerCommand('smart.showHealth', async () => {
    await autoHealing.showHealthDashboard();
  });
  
  // Cost predictions command
  const showCostPredictionsCommand = vscode.commands.registerCommand('smart.showCostPredictions', async () => {
    await predictiveCost.showCostPredictions();
  });
  
  // Performance dashboard command
  const showPerformanceCommand = vscode.commands.registerCommand('smart.showPerformance', async () => {
    await performanceMonitor.showPerformanceDashboard();
  });
  
  // Roo Code integration commands
  const showRooCodeStatusCommand = vscode.commands.registerCommand('smart.showRooCodeStatus', async () => {
    const report = await rooCodeBridge.getIntegrationReport();
    const doc = await vscode.workspace.openTextDocument({
      content: report,
      language: 'markdown'
    });
    await vscode.window.showTextDocument(doc);
  });

  const delegateToRooCodeCommand = vscode.commands.registerCommand('smart.delegateToRooCode', async () => {
    if (!rooCodeBridge.isAvailable()) {
      vscode.window.showWarningMessage('Roo Code is not installed or not active. Install it from the VS Code marketplace.');
      return;
    }

    const modes = [
      { label: 'Code', description: 'Write and edit code', value: 'code' },
      { label: 'Architect', description: 'Design architecture and plan', value: 'architect' },
      { label: 'Ask', description: 'Ask questions about code', value: 'ask' },
      { label: 'Debug', description: 'Debug issues', value: 'debug' }
    ];

    const selectedMode = await vscode.window.showQuickPick(modes, {
      placeHolder: 'Select Roo Code mode'
    });

    if (!selectedMode) return;

    const prompt = await vscode.window.showInputBox({
      prompt: 'Enter your prompt for Roo Code',
      placeHolder: 'e.g., Create a REST API with authentication'
    });

    if (!prompt) return;

    const result = await rooCodeBridge.delegateTask(prompt, {
      mode: selectedMode.value as any
    });

    if (result.success) {
      vscode.window.showInformationMessage(`Task delegated to Roo Code: ${result.response}`);
    } else {
      vscode.window.showErrorMessage(`Roo Code delegation failed: ${result.error}`);
    }
  });

  const openChatCommand = vscode.commands.registerCommand('smart.openChat', () => {
    SmartRouterPanel.createOrShow(context.extensionUri);
  });

  // Daily evaluator - runs automatically once per day at startup
  const dailyEvaluator = new DailyEvaluator(context);
  setTimeout(() => dailyEvaluator.runIfNeeded(), 8000);

  // HECO Project Analyzer
  const hecoAnalyzer = new HECOProjectAnalyzer(context);

  const runDailyEvalCommand = vscode.commands.registerCommand('smart.runDailyEval', () => {
    dailyEvaluator.runNow();
  });

  const analyzeHECOCommand = vscode.commands.registerCommand('smart.analyzeHECO', async () => {
    try {
      const analysis = await hecoAnalyzer.analyzeFullProject();
      
      // Show results in webview
      const panel = vscode.window.createWebviewPanel(
        'heco-analysis',
        'HECO Project Analysis',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );
      
      panel.webview.html = generateHECOReportHtml(analysis);
    } catch (error: any) {
      vscode.window.showErrorMessage(`HECO Analysis Error: ${error.message}`);
    }
  });

  const toggleRooCodeCommand = vscode.commands.registerCommand('smart.toggleRooCode', async () => {
    const current = SettingsManager.getSettings().rooCodeIntegration;
    await SettingsManager.updateSetting('rooCodeIntegration', !current);
    vscode.window.showInformationMessage(
      `Roo Code integration ${!current ? 'enabled' : 'disabled'}`
    );
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
    clearContextCacheCommand,
    analyzeImageCommand,
    validateSystemCommand,
    showHealthCommand,
    showCostPredictionsCommand,
    showPerformanceCommand,
    showRooCodeStatusCommand,
    delegateToRooCodeCommand,
    toggleRooCodeCommand,
    openChatCommand,
    runDailyEvalCommand,
    analyzeHECOCommand
  );
  
  // Add status bar to subscriptions for cleanup
  context.subscriptions.push(statusBarManager);
  
}

function generateHECOReportHtml(analysis: any): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HECO Project Analysis Report</title>
<style>
  body { font-family: var(--vscode-font-family); margin: 0; padding: 20px; background: var(--vscode-editor-background); color: var(--vscode-foreground); }
  .header { border-bottom: 2px solid var(--vscode-panel-border); padding: 20px 0; margin-bottom: 20px; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
  .card { background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); border-radius: 8px; padding: 15px; }
  .card h3 { margin: 0 0 10px 0; color: var(--vscode-textLink-foreground); }
  .issues { margin-bottom: 30px; }
  .issue { background: var(--vscode-editor-background); border-left: 4px solid var(--vscode-errorForeground); padding: 10px; margin-bottom: 10px; border-radius: 4px; }
  .issue.high { border-left-color: var(--vscode-errorForeground); }
  .issue.medium { border-left-color: var(--vscode-warningForeground); }
  .issue.low { border-left-color: var(--vscode-textLink-foreground); }
  .suggestions { margin-bottom: 30px; }
  .suggestion { background: var(--vscode-editor-background); border-left: 4px solid var(--vscode-textLink-foreground); padding: 10px; margin-bottom: 10px; border-radius: 4px; }
  .suggestion.high { border-left-color: var(--vscode-textLink-foreground); }
  .suggestion.medium { border-left-color: var(--vscode-textLink-foreground); }
  .suggestion.low { border-left-color: var(--vscode-textLink-foreground); }
  .file-list { max-height: 300px; overflow-y: auto; }
  .file-item { padding: 5px 10px; background: var(--vscode-editor-background); border-bottom: 1px solid var(--vscode-panel-border); }
  .file-item:hover { background: var(--vscode-list-hoverBackground); }
  .severity-critical { color: var(--vscode-errorForeground); font-weight: bold; }
  .severity-high { color: var(--vscode-warningForeground); }
  .severity-medium { color: var(--vscode-textLink-foreground); }
  .severity-low { color: var(--vscode-descriptionForeground); }
</style>
</head>
<body>
<div class="header">
  <h1>🔭 HECO Project Analysis Report</h1>
  <p>Generated: ${new Date().toLocaleString('nl-NL')}</p>
</div>

<div class="summary">
  <div class="card">
    <h3>📊 Samenvatting</h3>
    <p><strong>Totale bestanden:</strong> ${analysis.summary.totalFiles}</p>
    <p><strong>Issues gevonden:</strong> ${analysis.summary.issuesFound}</p>
    <p><strong>Kritieke issues:</strong> <span class="severity-critical">${analysis.summary.criticalIssues}</span></p>
    <p><strong>Suggesties:</strong> ${analysis.summary.suggestionsMade}</p>
  </div>
  
  <div class="card">
    <h3>🌐 Website Status</h3>
    ${analysis.websiteData ? `
      <p><strong>Status:</strong> ${analysis.websiteData.status}</p>
      <p><strong>Laatste update:</strong> ${new Date(analysis.websiteData.lastUpdate).toLocaleString('nl-NL')}</p>
      <p><strong>Flows:</strong> ${analysis.websiteData.metrics.flows}</p>
      <p><strong>Active Nodes:</strong> ${analysis.websiteData.metrics.activeNodes}</p>
      <p><strong>Performance:</strong> ${analysis.websiteData.metrics.performance}</p>
    ` : '<p>Website data niet beschikbaar</p>'}
  </div>
</div>

<div class="issues">
  <h2>🔍 Gevonden Issues (${analysis.summary.issuesFound})</h2>
  ${analysis.issues.length > 0 ? 
    analysis.issues.map((issue: any) => `
      <div class="issue ${issue.severity}">
        <strong>${issue.type.toUpperCase()} - ${issue.severity.toUpperCase()}</strong><br>
        <strong>Beschrijving:</strong> ${issue.description}<br>
        <strong>Bestand:</strong> ${issue.path}<br>
        ${issue.line ? `<strong>Lijn:</strong> ${issue.line}<br>` : ''}
        ${issue.fix ? `<strong>Fix:</strong> ${issue.fix}` : ''}
      </div>
    `).join('')
    : '<p>Geen issues gevonden! ✅</p>'
  }
</div>

<div class="suggestions">
  <h2>💡 Verbeteringen (${analysis.summary.suggestionsMade})</h2>
  ${analysis.suggestions.length > 0 ? 
    analysis.suggestions.map((suggestion: any) => `
      <div class="suggestion ${suggestion.priority}">
        <strong>${suggestion.type.toUpperCase()} - ${suggestion.priority.toUpperCase()}</strong><br>
        <strong>Beschrijving:</strong> ${suggestion.description}<br>
        <strong>Implementatie:</strong> ${suggestion.implementation || 'N.v.t.'}<br>
        <strong>Impact:</strong> ${suggestion.estimatedImpact || 'Onbekend'}<br>
        <strong>Bestand:</strong> ${suggestion.path || 'N.v.t.'}
      </div>
    `).join('')
    : '<p>Geen suggesties! ✅</p>'
  }
</div>

<div class="card">
  <h3>📁 Project Structuur</h3>
  <div class="file-list">
    ${analysis.structure.map((file: any) => `
      <div class="file-item">
        <strong>${file.name}</strong> (${file.type})<br>
        <small>${file.path}</small>
      </div>
    `).join('')}
  </div>
</div>

</body>
</html>
  `;
}

export function deactivate() {
  console.log('Smart Router extension deactivated');
}
