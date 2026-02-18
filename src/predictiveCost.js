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
exports.PredictiveCostEngine = void 0;
var vscode = require("vscode");
var logger_1 = require("./logger");
var models_1 = require("./models");
var PredictiveCostEngine = /** @class */ (function () {
    function PredictiveCostEngine(costTracker) {
        this.costTracker = costTracker;
        this.logger = logger_1.Logger.getInstance();
        this.usagePatterns = new Map();
        this.costHistory = [];
        this.predictions = null;
        this.startDataCollection();
        this.startPredictionEngine();
    }
    PredictiveCostEngine.prototype.startDataCollection = function () {
        var _this = this;
        // Collect usage data every hour
        setInterval(function () {
            _this.collectUsageData();
        }, 3600000); // 1 hour
    };
    PredictiveCostEngine.prototype.startPredictionEngine = function () {
        var _this = this;
        // Update predictions every 30 minutes
        setInterval(function () {
            _this.updatePredictions();
        }, 1800000); // 30 minutes
    };
    PredictiveCostEngine.prototype.collectUsageData = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var stats, _i, _b, _c, intent, count, pattern, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.costTracker.getStats()];
                    case 1:
                        stats = _d.sent();
                        if (!stats) {
                            this.logger.warn('[PredictiveCost] No stats available');
                            return [2 /*return*/];
                        }
                        // Analyze usage patterns
                        for (_i = 0, _b = Object.entries(stats.intentBreakdown); _i < _b.length; _i++) {
                            _c = _b[_i], intent = _c[0], count = _c[1];
                            pattern = this.usagePatterns.get(intent) || {
                                intent: intent,
                                model: ((_a = models_1.MODEL_ROUTING[intent]) === null || _a === void 0 ? void 0 : _a.model) || 'unknown',
                                frequency: 0,
                                avgTokens: 0,
                                avgCost: 0,
                                timeOfDay: [],
                                dayOfWeek: [],
                                lastUsed: new Date()
                            };
                            // Update pattern with new data
                            pattern.frequency += count;
                            pattern.lastUsed = new Date();
                            pattern.timeOfDay.push(new Date().getHours());
                            pattern.dayOfWeek.push(new Date().getDay());
                            this.usagePatterns.set(intent, pattern);
                        }
                        // Store cost history
                        this.costHistory.push({
                            date: new Date(),
                            cost: stats.totalCost,
                            usage: stats.totalRequests
                        });
                        // Keep only last 30 days of history
                        if (this.costHistory.length > 720) { // 30 days * 24 hours
                            this.costHistory = this.costHistory.slice(-720);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _d.sent();
                        this.logger.error("[PredictiveCost] Failed to collect usage data: ".concat(error_1.message));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PredictiveCostEngine.prototype.updatePredictions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stats, settings, monthlyBudget, dailyAverage, monthlyProjection, optimizations, potentialSavings, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.costTracker.getStats()];
                    case 1:
                        stats = _a.sent();
                        settings = vscode.workspace.getConfiguration('smartRouter');
                        monthlyBudget = settings.get('monthlyBudget') || 50;
                        dailyAverage = this.calculateDailyAverage();
                        monthlyProjection = dailyAverage * 30;
                        optimizations = this.generateOptimizations(stats);
                        potentialSavings = optimizations.reduce(function (sum, opt) { return sum + opt.potentialSavings; }, 0);
                        this.predictions = {
                            predictedDailyCost: dailyAverage,
                            predictedMonthlyCost: monthlyProjection,
                            budgetStatus: this.getBudgetStatus(monthlyProjection, monthlyBudget),
                            recommendations: this.generateRecommendations(monthlyProjection, monthlyBudget, optimizations),
                            savings: potentialSavings,
                            optimization: optimizations
                        };
                        // Show alerts if needed
                        return [4 /*yield*/, this.checkBudgetAlerts()];
                    case 2:
                        // Show alerts if needed
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        this.logger.error("[PredictiveCost] Failed to update predictions: ".concat(error_2.message));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PredictiveCostEngine.prototype.calculateDailyAverage = function () {
        var _this = this;
        if (this.costHistory.length < 7) {
            // Not enough data, use recent average
            return this.costHistory.reduce(function (sum, entry) { return sum + entry.cost; }, 0) / Math.max(1, this.costHistory.length);
        }
        // Use weighted average (more recent = more weight)
        var weights = this.costHistory.map(function (_, index) { return (index + 1) / _this.costHistory.length; });
        var weightedSum = this.costHistory.reduce(function (sum, entry, index) { return sum + entry.cost * weights[index]; }, 0);
        var totalWeight = weights.reduce(function (sum, weight) { return sum + weight; }, 0);
        return weightedSum / totalWeight;
    };
    PredictiveCostEngine.prototype.getBudgetStatus = function (projected, budget) {
        var ratio = projected / budget;
        if (ratio > 1)
            return 'exceeded';
        if (ratio > 0.9)
            return 'critical';
        if (ratio > 0.7)
            return 'warning';
        return 'safe';
    };
    PredictiveCostEngine.prototype.generateOptimizations = function (stats) {
        var optimizations = [];
        // Analyze each intent for optimization opportunities
        for (var _i = 0, _a = this.usagePatterns.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], intent = _b[0], pattern = _b[1];
            var modelConfig = models_1.MODEL_ROUTING[intent];
            if (!modelConfig)
                continue;
            // Check for cheaper alternatives
            var cheaperAlternatives = this.findCheaperAlternatives(intent, modelConfig.cost);
            if (cheaperAlternatives.length > 0) {
                var potentialSavings = (modelConfig.cost - cheaperAlternatives[0].cost) * pattern.frequency * 30;
                optimizations.push({
                    type: 'model_switch',
                    description: "Switch ".concat(intent, " from ").concat(modelConfig.model, " to ").concat(cheaperAlternatives[0].model),
                    potentialSavings: potentialSavings,
                    confidence: 0.8,
                    action: "Update MODEL_ROUTING for ".concat(intent)
                });
            }
            // Check for usage reduction opportunities
            if (pattern.frequency > 10) { // High frequency usage
                var reductionSavings = modelConfig.cost * pattern.frequency * 0.2 * 30; // 20% reduction
                optimizations.push({
                    type: 'usage_reduction',
                    description: "Reduce ".concat(intent, " usage by 20% through caching or batching"),
                    potentialSavings: reductionSavings,
                    confidence: 0.6,
                    action: "Implement context caching for ".concat(intent)
                });
            }
        }
        // Sort by potential savings
        return optimizations.sort(function (a, b) { return b.potentialSavings - a.potentialSavings; });
    };
    PredictiveCostEngine.prototype.findCheaperAlternatives = function (intent, currentCost) {
        var alternatives = [];
        for (var _i = 0, _a = Object.entries(models_1.MODEL_ROUTING); _i < _a.length; _i++) {
            var _b = _a[_i], otherIntent = _b[0], config = _b[1];
            if (config.cost < currentCost && this.isCompatibleModel(intent, otherIntent)) {
                alternatives.push({ model: config.model, cost: config.cost });
            }
        }
        return alternatives;
    };
    PredictiveCostEngine.prototype.isCompatibleModel = function (targetIntent, sourceIntent) {
        var _a;
        // Simple compatibility check - can be enhanced
        var compatibility = {
            'debug': ['simple', 'code_generation'],
            'code_generation': ['simple'],
            'architecture': ['code_generation', 'debug'],
            'architecture_screening': ['debug', 'simple'],
            'architecture_premium': ['architecture', 'architecture_screening']
        };
        return ((_a = compatibility[targetIntent]) === null || _a === void 0 ? void 0 : _a.includes(sourceIntent)) || false;
    };
    PredictiveCostEngine.prototype.generateRecommendations = function (projected, budget, optimizations) {
        var recommendations = [];
        if (projected > budget) {
            recommendations.push("\uD83D\uDEA8 Budget exceeded by $".concat((projected - budget).toFixed(2)));
            recommendations.push('💡 Implement top 3 optimizations immediately');
        }
        else if (projected > budget * 0.9) {
            recommendations.push("\u26A0\uFE0F Budget nearly exceeded (".concat(((projected / budget) * 100).toFixed(1), "%)"));
            recommendations.push('💡 Consider implementing high-impact optimizations');
        }
        if (optimizations.length > 0) {
            var topOptimization = optimizations[0];
            recommendations.push("\uD83D\uDCB0 Top saving: ".concat(topOptimization.description, " ($").concat(topOptimization.potentialSavings.toFixed(2), ")"));
        }
        // Usage pattern recommendations
        var highUsageIntents = Array.from(this.usagePatterns.entries())
            .filter(function (_a) {
            var _ = _a[0], pattern = _a[1];
            return pattern.frequency > 5;
        })
            .sort(function (a, b) { return b[1].frequency - a[1].frequency; })
            .slice(0, 3);
        if (highUsageIntents.length > 0) {
            recommendations.push("\uD83D\uDCCA High usage: ".concat(highUsageIntents.map(function (_a) {
                var intent = _a[0];
                return intent;
            }).join(', ')));
            recommendations.push('🔄 Consider context caching for frequent queries');
        }
        return recommendations;
    };
    PredictiveCostEngine.prototype.checkBudgetAlerts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var settings, budgetAlerts, message;
            return __generator(this, function (_a) {
                if (!this.predictions)
                    return [2 /*return*/];
                settings = vscode.workspace.getConfiguration('smartRouter');
                budgetAlerts = settings.get('budgetAlerts');
                if (!budgetAlerts)
                    return [2 /*return*/];
                if (this.predictions.budgetStatus === 'critical' || this.predictions.budgetStatus === 'exceeded') {
                    message = this.predictions.budgetStatus === 'exceeded'
                        ? "\uD83D\uDEA8 Budget exceeded! Predicted: $".concat(this.predictions.predictedMonthlyCost.toFixed(2))
                        : "\u26A0\uFE0F Budget critical! Predicted: $".concat(this.predictions.predictedMonthlyCost.toFixed(2));
                    vscode.window.showWarningMessage(message, 'View Optimizations').then(function (selection) {
                        if (selection === 'View Optimizations') {
                            vscode.commands.executeCommand('smart.showCostPredictions');
                        }
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    PredictiveCostEngine.prototype.getCostPredictions = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.predictions) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.updatePredictions()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.predictions || {
                            predictedDailyCost: 0,
                            predictedMonthlyCost: 0,
                            budgetStatus: 'safe',
                            recommendations: [],
                            savings: 0,
                            optimization: []
                        }];
                }
            });
        });
    };
    PredictiveCostEngine.prototype.showCostPredictions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var predictions, stats, statusIcon, dashboard, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCostPredictions()];
                    case 1:
                        predictions = _a.sent();
                        return [4 /*yield*/, this.costTracker.getStats()];
                    case 2:
                        stats = _a.sent();
                        statusIcon = {
                            safe: '🟢',
                            warning: '🟡',
                            critical: '🟠',
                            exceeded: '🔴'
                        }[predictions.budgetStatus];
                        dashboard = "\n# \uD83D\uDCB0 Smart Router Cost Predictions\n\n**Status:** ".concat(statusIcon, " ").concat(predictions.budgetStatus.toUpperCase(), "\n**Predicted Daily:** $").concat(predictions.predictedDailyCost.toFixed(2), "\n**Predicted Monthly:** $").concat(predictions.predictedMonthlyCost.toFixed(2), "\n**Potential Savings:** $").concat(predictions.savings.toFixed(2), "\n\n## \uD83D\uDCCA Current Usage\n- **Total Cost:** $").concat((stats === null || stats === void 0 ? void 0 : stats.totalCost.toFixed(2)) || '0.00', "\n- **Total Requests:** ").concat((stats === null || stats === void 0 ? void 0 : stats.totalRequests) || 0, "\n- **Average Cost/Request:** $").concat(stats ? (stats.totalCost / Math.max(1, stats.totalRequests)).toFixed(4) : '0.0000', "\n\n## \uD83C\uDFAF Recommendations\n").concat(predictions.recommendations.map(function (rec) { return "- ".concat(rec); }).join('\n'), "\n\n## \uD83D\uDCA1 Optimizations (").concat(predictions.optimization.length, ")\n").concat(predictions.optimization.slice(0, 5).map(function (opt) {
                            return "### ".concat(opt.description, "\n  - **Potential Savings:** $").concat(opt.potentialSavings.toFixed(2), "\n  - **Confidence:** ").concat((opt.confidence * 100).toFixed(0), "%\n  - **Action:** ").concat(opt.action);
                        }).join('\n\n'), "\n\n## \uD83D\uDCC8 Usage Patterns\n").concat(Array.from(this.usagePatterns.entries()).map(function (_a) {
                            var intent = _a[0], pattern = _a[1];
                            return "- **".concat(intent, ":** ").concat(pattern.frequency, " uses/day, $").concat(pattern.avgCost.toFixed(3), "/request");
                        }).join('\n'), "\n\n---\n*Predictive Cost Engine v2.5.0*\n    ");
                        return [4 /*yield*/, vscode.workspace.openTextDocument({
                                content: dashboard,
                                language: 'markdown'
                            })];
                    case 3:
                        doc = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(doc)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PredictiveCostEngine.prototype.applyOptimization = function (optimization) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (optimization.type) {
                    case 'model_switch':
                        // This would require updating the MODEL_ROUTING configuration
                        vscode.window.showInformationMessage("To apply this optimization, update MODEL_ROUTING in src/models.ts", 'Open models.ts').then(function (selection) {
                            if (selection === 'Open models.ts') {
                                vscode.workspace.openTextDocument('src/models.ts');
                            }
                        });
                        break;
                    case 'usage_reduction':
                        vscode.window.showInformationMessage('To reduce usage, enable context caching in settings', 'Open Settings').then(function (selection) {
                            if (selection === 'Open Settings') {
                                vscode.commands.executeCommand('workbench.action.openSettings', 'smartRouter.contextCache');
                            }
                        });
                        break;
                    case 'timing_shift':
                        vscode.window.showInformationMessage('Consider shifting heavy usage to off-peak hours for better performance');
                        break;
                }
                return [2 /*return*/];
            });
        });
    };
    return PredictiveCostEngine;
}());
exports.PredictiveCostEngine = PredictiveCostEngine;
