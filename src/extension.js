"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.deactivate = exports.activate = void 0;
var vscode = require("vscode");
var path = require("path");
var classifier_1 = require("./classifier");
var enhancedClassifier_1 = require("./enhancedClassifier");
var openrouter_1 = require("./openrouter");
var ollama_1 = require("./ollama");
var projectDetector_1 = require("./projectDetector");
var costTracker_1 = require("./costTracker");
var statusBar_1 = require("./statusBar");
var settings_1 = require("./settings");
var logger_1 = require("./logger");
var metrics_1 = require("./metrics");
var models_1 = require("./models");
var arenaMode_1 = require("./arenaMode");
var chineseModels_1 = require("./chineseModels");
var contextCache_1 = require("./contextCache");
var imageAnalyzer_1 = require("./imageAnalyzer");
var proactiveValidator_1 = require("./proactiveValidator");
var autoHealing_1 = require("./autoHealing");
var predictiveCost_1 = require("./predictiveCost");
var performanceMonitor_1 = require("./performanceMonitor");
function activate(context) {
    var _this = this;
    console.log('Smart Router extension is now active!');
    // Initialize logger and metrics
    var logger = logger_1.Logger.getInstance();
    var metrics = new metrics_1.MetricsCollector();
    var outputChannel = vscode.window.createOutputChannel('Smart Router');
    logger.setOutputChannel(outputChannel);
    // Initialize components
    var classifier = new classifier_1.IntentClassifier();
    var enhancedClassifier = new enhancedClassifier_1.EnhancedIntentClassifier();
    var projectDetector = new projectDetector_1.ProjectDetector();
    var costTracker = new costTracker_1.CostTracker(projectDetector);
    var statusBarManager = new statusBar_1.StatusBarManager(costTracker, projectDetector);
    // Initialize OpenRouter client
    var settings = settings_1.SettingsManager.getSettings();
    var openRouterClient = new openrouter_1.OpenRouterClient(settings.openrouterApiKey);
    // Initialize new v2.0 components
    var contextCache = new contextCache_1.ContextCache();
    var arenaModeManager = new arenaMode_1.ArenaModeManager(costTracker);
    var chineseModelConfig = {
        enabled: true,
        costAdvantage: 0.7,
        preferredModels: ['z-ai/glm-5', 'minimax/minimax-m2.5', 'alibaba/qwen-3.5']
    };
    var chineseModelManager = new chineseModels_1.ChineseModelManager(chineseModelConfig);
    // Initialize image analyzer
    var imageAnalyzer = new imageAnalyzer_1.ImageAnalyzer(settings.openrouterApiKey);
    // Initialize proactive validator
    var proactiveValidator = new proactiveValidator_1.ProactiveValidator(settings.openrouterApiKey);
    // Initialize auto-healing system
    var autoHealing = new autoHealing_1.AutoHealingSystem(openRouterClient);
    // Initialize predictive cost engine
    var predictiveCost = new predictiveCost_1.PredictiveCostEngine(costTracker);
    // Initialize performance monitor
    var performanceMonitor = new performanceMonitor_1.RealTimePerformanceMonitor();
    // Initialize async components
    var initialize = function () { return __awaiter(_this, void 0, void 0, function () {
        var settings, validation, openrouterApiKey, ollama, ollamaAvailable;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info('Initializing Smart Router extension...');
                    return [4 /*yield*/, costTracker.initialize()];
                case 1:
                    _a.sent();
                    settings = settings_1.SettingsManager.getSettings();
                    validation = settings_1.SettingsManager.validateSettings(settings);
                    if (!validation.valid) {
                        logger.warn("Settings validation failed: ".concat(validation.errors.join(', ')));
                        vscode.window.showWarningMessage("Smart Router settings validation failed. Check settings: ".concat(validation.errors.join(', ')));
                    }
                    // Proactive system validation (async, non-blocking)
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        var systemValidation, criticalIssues, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, proactiveValidator.validateSystem()];
                                case 1:
                                    systemValidation = _a.sent();
                                    if (!systemValidation.valid) {
                                        logger.warn("System validation found ".concat(systemValidation.issues.length, " issues"));
                                        criticalIssues = systemValidation.issues.filter(function (i) { return i.type === 'error'; });
                                        if (criticalIssues.length > 0) {
                                            vscode.window.showWarningMessage("Smart Router: ".concat(criticalIssues.length, " critical issues found. Run 'Smart Router: Validate System' for details."), 'Validate System').then(function (selection) {
                                                if (selection === 'Validate System') {
                                                    vscode.commands.executeCommand('smart.validateSystem');
                                                }
                                            });
                                        }
                                    }
                                    else {
                                        logger.info('System validation passed - all systems operational');
                                    }
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_1 = _a.sent();
                                    logger.error("Proactive validation failed: ".concat(error_1.message));
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }, 5000); // Run after 5 seconds
                    // Start status bar
                    if (settings.enabled) {
                        statusBarManager.start();
                        logger.info('Status bar manager started');
                    }
                    openrouterApiKey = process.env.OPENROUTER_API_KEY || settings.openrouterApiKey;
                    if (!openrouterApiKey) {
                        logger.warn('OpenRouter API key not configured');
                    }
                    else {
                        logger.info('OpenRouter API key configured');
                    }
                    ollama = new ollama_1.OllamaClient();
                    return [4 /*yield*/, ollama.isAvailable()];
                case 2:
                    ollamaAvailable = _a.sent();
                    logger.info('Ollama availability checked', { available: ollamaAvailable });
                    logger.info('Smart Router extension initialized successfully');
                    return [2 /*return*/];
            }
        });
    }); };
    initialize();
    // Register chat participant
    var participant = vscode.chat.createChatParticipant('smart', function (request, context, stream) { return __awaiter(_this, void 0, void 0, function () {
        var userQuery, startTime, projectContext, classification, routing, context_1, previousAttempts, settings_2, settings_3, openrouterApiKey, response, openrouter, messages, apiResponse, responseText, actualCost, responseTime, stats, today, todayCost, monthCost, error_2, errorResponse;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    userQuery = request.prompt;
                    startTime = Date.now();
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, projectDetector.getProjectContext()];
                case 2:
                    projectContext = _c.sent();
                    return [4 /*yield*/, enhancedClassifier.classify(userQuery)];
                case 3:
                    classification = _c.sent();
                    routing = classifier.getRouting(classification.intent);
                    // Enhanced architecture routing - 3-staps raket met slimme keuze
                    if (classification.intent === 'architecture') {
                        context_1 = contextCache.getContext();
                        previousAttempts = context_1.filter(function (c) {
                            return c.intent === 'architecture' ||
                                c.intent === 'architecture_screening' ||
                                c.intent === 'architecture_screening_alt' ||
                                c.intent === 'architecture_premium';
                        });
                        if (previousAttempts.length === 0) {
                            // Stap 1: SWE 1.5 snelle screening (FREE)
                            routing = classifier.getRouting('architecture');
                            stream.progress("\uD83D\uDE80 Stap 1: SWE 1.5 snelle architectuur screening (FREE)");
                        }
                        else if (previousAttempts.length === 1) {
                            settings_2 = settings_1.SettingsManager.getSettings();
                            // Check voor Chinese API keys (niet meer nodig, GLM-5 werkt via OpenRouter)
                            // Gebruik altijd GLM-5 voor beste kwaliteit
                            routing = classifier.getRouting('architecture_screening');
                            stream.progress("\uD83C\uDFD7\uFE0F Stap 2: GLM-5 Chinese model (open weights leader, $0.21)");
                        }
                        else {
                            // Stap 3: Opus 4.6 premium deep dive ($5.00)
                            routing = classifier.getRouting('architecture_premium');
                            stream.progress("\uD83D\uDC8E Stap 3: Opus 4.6 premium deep dive (1M tokens)");
                        }
                    }
                    // Show progress with classification details
                    stream.progress("\uD83E\uDD16 ".concat(classification.intent, " (").concat(classification.method, ") | ") +
                        "Model: ".concat(routing.config.model, " | ") +
                        "Cost: $".concat(routing.config.cost, " | ") +
                        "Confidence: ".concat((classification.confidence * 100).toFixed(0), "%"));
                    settings_3 = settings_1.SettingsManager.getSettings();
                    openrouterApiKey = process.env.OPENROUTER_API_KEY || settings_3.openrouterApiKey;
                    if (!!openrouterApiKey) return [3 /*break*/, 5];
                    response = "\uD83E\uDDE0 **Smart Router Analysis**\n\n**Project Context:**\n".concat(projectContext, "\n\n**Classification:**\n- Intent: ").concat(classification.intent, "\n- Method: ").concat(classification.method, "\n- Confidence: ").concat((classification.confidence * 100).toFixed(0), "%\n- Reasoning: ").concat(classification.reasoning, "\n\n**Selected Model:** ").concat(routing.config.model, "\n**Cost:** $").concat(routing.config.cost, "\n**Description:** ").concat(routing.config.description, "\n\n**Query:** \"").concat(userQuery, "\"\n\n\u26A0\uFE0F *Note: OpenRouter API key not configured. Set OPENROUTER_API_KEY environment variable to enable full functionality.*");
                    stream.markdown(response);
                    // Track usage (no cost)
                    return [4 /*yield*/, costTracker.trackUsage(classification.intent, routing.config.model, 0, userQuery, Date.now() - startTime)];
                case 4:
                    // Track usage (no cost)
                    _c.sent();
                    return [2 /*return*/];
                case 5:
                    openrouter = new openrouter_1.OpenRouterClient(openrouterApiKey);
                    messages = [
                        {
                            role: 'system',
                            content: "You are a helpful AI assistant. Context:\n\n".concat(projectContext)
                        },
                        {
                            role: 'user',
                            content: userQuery
                        }
                    ];
                    return [4 /*yield*/, openrouter.complete(routing.config.model, messages, {
                            max_tokens: routing.config.maxTokens,
                            temperature: 0.7
                        })];
                case 6:
                    apiResponse = _c.sent();
                    responseText = ((_b = (_a = apiResponse.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'No response received';
                    actualCost = openrouter.calculateCost(routing.config.model, apiResponse.usage.total_tokens);
                    responseTime = Date.now() - startTime;
                    // Send response
                    stream.markdown(responseText);
                    // Track usage
                    return [4 /*yield*/, costTracker.trackUsage(classification.intent, routing.config.model, actualCost, userQuery, responseTime, {
                            prompt: apiResponse.usage.prompt_tokens,
                            completion: apiResponse.usage.completion_tokens,
                            total: apiResponse.usage.total_tokens
                        })];
                case 7:
                    // Track usage
                    _c.sent();
                    if (!settings_3.budgetAlerts) return [3 /*break*/, 9];
                    return [4 /*yield*/, costTracker.getStats()];
                case 8:
                    stats = _c.sent();
                    if (stats) {
                        today = new Date().toISOString().split('T')[0];
                        todayCost = stats.dailyCosts[today] || 0;
                        if (todayCost > settings_3.costWarningThreshold) {
                            vscode.window.showWarningMessage("Smart Router: Daily cost $".concat(todayCost.toFixed(2), " exceeds threshold $").concat(settings_3.costWarningThreshold));
                        }
                        monthCost = Object.values(stats.dailyCosts)
                            .filter(function (_, i) { return i >= 30; }) // Last 30 days
                            .reduce(function (sum, cost) { return sum + cost; }, 0);
                        if (monthCost > settings_3.monthlyBudget) {
                            vscode.window.showWarningMessage("Smart Router: Monthly cost $".concat(monthCost.toFixed(2), " exceeds budget $").concat(settings_3.monthlyBudget));
                        }
                    }
                    _c.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_2 = _c.sent();
                    console.error('Smart Router error:', error_2);
                    errorResponse = "\u274C **Smart Router Error**\n\n".concat(error_2.message, "\n\n**Query:** \"").concat(userQuery, "\"\n\n*Please check your configuration and try again.*");
                    stream.markdown(errorResponse);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    }); });
    participant.iconPath = new vscode.ThemeIcon('arrow-circle-right');
    participant.followupProvider = {
        provideFollowups: function (result, context) {
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
    var showCostsCommand = vscode.commands.registerCommand('smart.showCosts', function () { return __awaiter(_this, void 0, void 0, function () {
        var summary;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, costTracker.getCostSummary()];
                case 1:
                    summary = _a.sent();
                    vscode.window.showInformationMessage(summary, { modal: true });
                    return [2 /*return*/];
            }
        });
    }); });
    var showStatusCommand = vscode.commands.registerCommand('smart.showStatus', function () { return __awaiter(_this, void 0, void 0, function () {
        var project, stats, ollama, ollamaAvailable, settings, status;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, projectDetector.detectProject()];
                case 1:
                    project = _a.sent();
                    return [4 /*yield*/, costTracker.getStats()];
                case 2:
                    stats = _a.sent();
                    ollama = new ollama_1.OllamaClient();
                    return [4 /*yield*/, ollama.isAvailable()];
                case 3:
                    ollamaAvailable = _a.sent();
                    settings = settings_1.SettingsManager.getSettings();
                    status = "\n\uD83E\uDD16 **Smart Router Status**\n\n**Project:** ".concat((project === null || project === void 0 ? void 0 : project.name) || 'No active project', "\n**Extension:** ").concat(settings.enabled ? '✅ Enabled' : '❌ Disabled', "\n**Ollama:** ").concat(ollamaAvailable ? '✅ Running' : '❌ Not running', "\n**API Key:** ").concat(settings.openrouterApiKey ? '✅ Configured' : '❌ Not set', "\n\n**Usage:**\n").concat(stats ? "- Total Cost: $".concat(stats.totalCost.toFixed(2), "\n- Requests: ").concat(stats.totalRequests) : 'No usage data', "\n\n**Settings:**\n- Default Model: ").concat(settings.defaultModel, "\n- Cost Warning: $").concat(settings.costWarningThreshold, "\n- Monthly Budget: $").concat(settings.monthlyBudget, "\n- Budget Alerts: ").concat(settings.budgetAlerts ? 'On' : 'Off', "\n  ").trim();
                    vscode.window.showInformationMessage(status, { modal: true });
                    return [2 /*return*/];
            }
        });
    }); });
    var clearPreferencesCommand = vscode.commands.registerCommand('smart.clearPreferences', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            enhancedClassifier.clearUserPreferences();
            vscode.window.showInformationMessage('Smart Router preferences cleared');
            return [2 /*return*/];
        });
    }); });
    var openSettingsCommand = vscode.commands.registerCommand('smart.openSettings', function () {
        settings_1.SettingsManager.openSettings();
    });
    var explainRoutingCommand = vscode.commands.registerCommand('smart.explainRouting', function () { return __awaiter(_this, void 0, void 0, function () {
        var ollama, ollamaAvailable, chineseStats, explanation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ollama = new ollama_1.OllamaClient();
                    return [4 /*yield*/, ollama.isAvailable()];
                case 1:
                    ollamaAvailable = _a.sent();
                    chineseStats = chineseModelManager.getModelStats();
                    explanation = "\n\uD83E\uDDE0 **Smart Router Logic v2.0**\n\n1. **Intent Classification:**\n   - Primary: Ollama Qwen3:8b (".concat(ollamaAvailable ? '✅ Available' : '❌ Not running', ")\n   - Enhanced: Rule-based with pattern weights\n   - ML: User preferences and similarity matching\n\n2. **Model Selection:** Optimal model chosen for your intent\n3. **Cost Tracking:** Usage tracked per project\n4. **Project Context:** Automatically loaded from .claude/CLAUDE.md\n5. **Budget Alerts:** Warnings for daily/monthly limits\n6. **Arena Mode:** Parallel model comparison (NEW)\n7. **Chinese Models:** Cost-optimized alternatives (NEW)\n\n**Example:**\n- \"@smart git status\" \u2192 Simple \u2192 FREE model\n- \"@smart create API\" \u2192 Code Gen \u2192 SWE 1.5 (NEW)\n- \"@smart why is this broken\" \u2192 Debug \u2192 MiniMax M2.5 (UPGRADE)\n- \"@smart design architecture\" \u2192 Architecture \u2192 Opus 4.6 (1M tokens)\n\n**Arena Mode:**\n- Frontier: Opus 4.6, Opus 4.5, Sonnet 4.5\n- Fast: SWE 1.5, Haiku 4.5, Gemini 3 Flash\n- Hybrid: Mix of speed and intelligence\n\n**Chinese Models:**\n- Available: ").concat(chineseStats.enabledModels, "/").concat(chineseStats.totalModels, "\n- Average Cost: $").concat(chineseStats.averageCost.toFixed(2), "\n- Total Savings: $").concat(chineseStats.totalSavings.toFixed(2), "\n\n**Configuration:**\n- OpenRouter API Key: ").concat(process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Not set', "\n- Ollama: ").concat(ollamaAvailable ? '✅ Running' : '❌ Not running', "\n  ");
                    vscode.window.showInformationMessage(explanation, { modal: true });
                    return [2 /*return*/];
            }
        });
    }); });
    // Arena Mode commands
    var startArenaModeCommand = vscode.commands.registerCommand('smart.startArena', function () { return __awaiter(_this, void 0, void 0, function () {
        var battleGroups, selected, prompt_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    battleGroups = [
                        { label: 'Frontier', description: 'Top reasoning modellen', value: 'frontier' },
                        { label: 'Fast', description: 'Snelle modellen', value: 'fast' },
                        { label: 'Hybrid', description: 'Balans tussen snelheid en intelligentie', value: 'hybrid' }
                    ];
                    return [4 /*yield*/, vscode.window.showQuickPick(battleGroups, {
                            placeHolder: 'Selecteer battle group voor Arena Mode'
                        })];
                case 1:
                    selected = _a.sent();
                    if (!selected) return [3 /*break*/, 4];
                    return [4 /*yield*/, vscode.window.showInputBox({
                            prompt: 'Voer je query in voor Arena Mode',
                            placeHolder: 'bv: create a REST API with authentication'
                        })];
                case 2:
                    prompt_1 = _a.sent();
                    if (!prompt_1) return [3 /*break*/, 4];
                    return [4 /*yield*/, arenaModeManager.startArenaSession(selected.value, prompt_1)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Chinese models commands
    var showChineseModelsCommand = vscode.commands.registerCommand('smart.showChineseModels', function () { return __awaiter(_this, void 0, void 0, function () {
        var models, stats, savings, modelList, savingsList, info;
        return __generator(this, function (_a) {
            models = chineseModelManager.getAvailableModels();
            stats = chineseModelManager.getModelStats();
            savings = chineseModelManager.getCostSavings();
            modelList = models.map(function (m) {
                return "- **".concat(m.model, "**: $").concat(m.cost.toFixed(2), " - ").concat(m.description);
            }).join('\n');
            savingsList = savings.map(function (s) {
                return "- ".concat(s.model, ": $").concat(s.originalCost.toFixed(2), " \u2192 $").concat(s.discountedCost.toFixed(2), " (bespaar $").concat(s.savings.toFixed(2), ")");
            }).join('\n');
            info = "\n\uD83C\uDDE8\uD83C\uDDF3 **Chinese AI Models**\n\n**Beschikbare Modellen (".concat(models.length, "):**\n").concat(modelList, "\n\n**Statistieken:**\n- Totaal: ").concat(stats.totalModels, " modellen\n- Actief: ").concat(stats.enabledModels, " modellen\n- Gemiddelde kosten: $").concat(stats.averageCost.toFixed(2), "\n- Totale besparing: $").concat(stats.totalSavings.toFixed(2), "\n\n**Kostenbesparing:**\n").concat(savingsList, "\n\n**Cost Advantage:** ").concat(((1 - chineseModelConfig.costAdvantage) * 100).toFixed(0), "% korting op alle Chinese modellen\n  ");
            vscode.window.showInformationMessage(info, { modal: true });
            return [2 /*return*/];
        });
    }); });
    // Context cache commands
    var showContextCacheCommand = vscode.commands.registerCommand('smart.showContextCache', function () { return __awaiter(_this, void 0, void 0, function () {
        var project, context, stats, contextList, info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, projectDetector.detectProject()];
                case 1:
                    project = _a.sent();
                    context = contextCache.getContext(project === null || project === void 0 ? void 0 : project.name);
                    stats = contextCache.getStats(project === null || project === void 0 ? void 0 : project.name);
                    contextList = context.slice(0, 10).map(function (c) {
                        return "- **".concat(c.intent, "**: ").concat(c.query.substring(0, 50), "... (").concat(new Date(c.timestamp).toLocaleString(), ")");
                    }).join('\n');
                    info = "\n\uD83D\uDCDD **Context Cache**\n\n**Project:** ".concat((project === null || project === void 0 ? void 0 : project.name) || 'Global', "\n**Entries:** ").concat(stats.totalEntries, "\n**Total Cost:** $").concat(stats.totalCost.toFixed(2), "\n**Total Tokens:** ").concat(stats.totalTokens, "\n\n**Recente Context (10 meest recente):**\n").concat(contextList || 'Geen context', "\n\n**Intent Breakdown:**\n").concat(Object.entries(stats.mostUsedIntents).map(function (_a) {
                        var intent = _a[0], count = _a[1];
                        return "- ".concat(intent, ": ").concat(count, " keer");
                    }).join('\n'), "\n  ");
                    vscode.window.showInformationMessage(info, { modal: true });
                    return [2 /*return*/];
            }
        });
    }); });
    var clearContextCacheCommand = vscode.commands.registerCommand('smart.clearContextCache', function () { return __awaiter(_this, void 0, void 0, function () {
        var project;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, projectDetector.detectProject()];
                case 1:
                    project = _a.sent();
                    contextCache.clear(project === null || project === void 0 ? void 0 : project.name);
                    vscode.window.showInformationMessage('Context cache geleegd');
                    return [2 /*return*/];
            }
        });
    }); });
    // Image analysis command
    var analyzeImageCommand = vscode.commands.registerCommand('smart.analyzeImage', function () { return __awaiter(_this, void 0, void 0, function () {
        var fileUri, imagePath;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vscode.window.showOpenDialog({
                        canSelectMany: false,
                        openLabel: 'Select Image to Analyze',
                        filters: {
                            'Images': ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
                        }
                    })];
                case 1:
                    fileUri = _a.sent();
                    if (!fileUri || fileUri.length === 0) {
                        vscode.window.showInformationMessage('No image selected');
                        return [2 /*return*/];
                    }
                    imagePath = fileUri[0].fsPath;
                    // Show progress
                    return [4 /*yield*/, vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: 'Analyzing Image',
                            cancellable: false
                        }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                            var result, analysis, doc, project;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        progress.report({ increment: 0, message: 'Loading image...' });
                                        return [4 /*yield*/, imageAnalyzer.analyzeImage(imagePath)];
                                    case 1:
                                        result = _b.sent();
                                        if (!result.success) return [3 /*break*/, 7];
                                        progress.report({ increment: 100, message: 'Analysis complete!' });
                                        analysis = "\n\uD83D\uDDBC\uFE0F **Image Analysis Results**\n\n**File:** ".concat(path.basename(imagePath), "\n**Model:** ").concat(result.model, "\n**Tokens:** ").concat(result.tokens, "\n**Cost:** $").concat((_a = result.cost) === null || _a === void 0 ? void 0 : _a.toFixed(4), "\n\n**Analysis:**\n").concat(result.analysis, "\n\n---\n*Powered by GLM-5 via OpenRouter*\n        ");
                                        return [4 /*yield*/, vscode.workspace.openTextDocument({
                                                content: analysis,
                                                language: 'markdown'
                                            })];
                                    case 2:
                                        doc = _b.sent();
                                        return [4 /*yield*/, vscode.window.showTextDocument(doc)];
                                    case 3:
                                        _b.sent();
                                        if (!result.cost) return [3 /*break*/, 6];
                                        return [4 /*yield*/, projectDetector.detectProject()];
                                    case 4:
                                        project = _b.sent();
                                        return [4 /*yield*/, costTracker.trackUsage('debug', result.model, result.cost, 'Image analysis', 0, {
                                                prompt: Math.floor(result.tokens * 0.3),
                                                completion: Math.floor(result.tokens * 0.7),
                                                total: result.tokens
                                            })];
                                    case 5:
                                        _b.sent();
                                        _b.label = 6;
                                    case 6: return [3 /*break*/, 8];
                                    case 7:
                                        vscode.window.showErrorMessage("Image analysis failed: ".concat(result.error));
                                        _b.label = 8;
                                    case 8: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    // Show progress
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Proactive validation command
    var validateSystemCommand = vscode.commands.registerCommand('smart.validateSystem', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proactiveValidator.showValidationResults()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Health dashboard command
    var showHealthCommand = vscode.commands.registerCommand('smart.showHealth', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, autoHealing.showHealthDashboard()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Cost predictions command
    var showCostPredictionsCommand = vscode.commands.registerCommand('smart.showCostPredictions', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, predictiveCost.showCostPredictions()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Performance dashboard command
    var showPerformanceCommand = vscode.commands.registerCommand('smart.showPerformance', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, performanceMonitor.showPerformanceDashboard()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    context.subscriptions.push(showCostsCommand, showStatusCommand, clearPreferencesCommand, openSettingsCommand, explainRoutingCommand, startArenaModeCommand, showChineseModelsCommand, showContextCacheCommand, clearContextCacheCommand, analyzeImageCommand, validateSystemCommand, showHealthCommand, showCostPredictionsCommand, showPerformanceCommand);
    // Add status bar to subscriptions for cleanup
    context.subscriptions.push(statusBarManager);
    // Chat participant handler for @smart command
    var handler = function (request, context, stream, token) { return __awaiter(_this, void 0, void 0, function () {
        var logger_2, settings_4, openRouter, classifier_2, userMessage, intent, routing, selectedModel, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    logger_2 = logger_1.Logger.getInstance();
                    settings_4 = settings_1.SettingsManager.getSettings();
                    openRouter = new openrouter_1.OpenRouterClient(settings_4.openrouterApiKey);
                    classifier_2 = new classifier_1.IntentClassifier();
                    userMessage = request.prompt;
                    logger_2.info("[Chat] Received message: ".concat(userMessage));
                    return [4 /*yield*/, classifier_2.classify(userMessage)];
                case 1:
                    intent = _a.sent();
                    logger_2.info("[Chat] Classified intent: ".concat(intent));
                    routing = models_1.MODEL_ROUTING[intent];
                    selectedModel = routing.model;
                    stream.progress('Analyzing intent and selecting optimal model...');
                    return [4 /*yield*/, openRouter.complete(selectedModel, [
                            { role: "system", content: "You are Smart Router, an intelligent AI model routing assistant. Help users with their requests using the most appropriate model." },
                            { role: "user", content: userMessage }
                        ], {
                            max_tokens: 2000,
                            temperature: 0.7
                        })];
                case 2:
                    result = _a.sent();
                    stream.markdown(result.choices[0].message.content);
                    return [2 /*return*/, { metadata: { model: selectedModel, intent: intent } }];
                case 3:
                    error_3 = _a.sent();
                    logger_1.Logger.getInstance().error("[Chat] Error processing request: ".concat(error_3.message));
                    stream.markdown("\u274C **Error**: ".concat(error_3.message, "\n\nPlease check your OpenRouter API key in VS Code settings."));
                    return [2 /*return*/, { metadata: { error: error_3.message } }];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Register the chat participant and its request handler
    var smart = vscode.chat.createChatParticipant('smart', handler);
    // Add to subscriptions
    context.subscriptions.push(smart);
}
exports.activate = activate;
function deactivate() {
    console.log('Smart Router extension deactivated');
}
exports.deactivate = deactivate;
