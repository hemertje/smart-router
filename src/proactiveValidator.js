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
exports.ProactiveValidator = void 0;
var vscode = require("vscode");
var openrouter_1 = require("./openrouter");
var logger_1 = require("./logger");
var models_1 = require("./models");
var ProactiveValidator = /** @class */ (function () {
    function ProactiveValidator(apiKey) {
        this.logger = logger_1.Logger.getInstance();
        this.openRouter = new openrouter_1.OpenRouterClient(apiKey);
    }
    ProactiveValidator.prototype.validateSystem = function () {
        return __awaiter(this, void 0, void 0, function () {
            var issues, recommendations, apiKeyValid, modelsValid, pricingValid, configValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        issues = [];
                        recommendations = [];
                        return [4 /*yield*/, this.validateApiKey()];
                    case 1:
                        apiKeyValid = _a.sent();
                        if (!apiKeyValid.valid) {
                            issues.push.apply(issues, apiKeyValid.issues);
                        }
                        return [4 /*yield*/, this.validateModelAvailability()];
                    case 2:
                        modelsValid = _a.sent();
                        if (!modelsValid.valid) {
                            issues.push.apply(issues, modelsValid.issues);
                        }
                        return [4 /*yield*/, this.validatePricing()];
                    case 3:
                        pricingValid = _a.sent();
                        if (!pricingValid.valid) {
                            issues.push.apply(issues, pricingValid.issues);
                        }
                        return [4 /*yield*/, this.validateConfiguration()];
                    case 4:
                        configValid = _a.sent();
                        if (!configValid.valid) {
                            issues.push.apply(issues, configValid.issues);
                        }
                        // 5. Generate Recommendations
                        recommendations.push.apply(recommendations, this.generateRecommendations(issues));
                        return [2 /*return*/, {
                                valid: issues.filter(function (i) { return i.type === 'error'; }).length === 0,
                                issues: issues,
                                recommendations: recommendations
                            }];
                }
            });
        });
    };
    ProactiveValidator.prototype.validateApiKey = function () {
        return __awaiter(this, void 0, void 0, function () {
            var issues, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        issues = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Test API key with minimal request
                        return [4 /*yield*/, this.openRouter.complete('openai/gpt-3.5-turbo', [
                                { role: 'user', content: 'test' }
                            ], { max_tokens: 1 })];
                    case 2:
                        // Test API key with minimal request
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        issues.push({
                            type: 'error',
                            component: 'OpenRouter API',
                            message: "API key validation failed: ".concat(error_1.message),
                            fix: 'Update OpenRouter API key in VS Code settings'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, { valid: issues.length === 0, issues: issues }];
                }
            });
        });
    };
    ProactiveValidator.prototype.validateModelAvailability = function () {
        return __awaiter(this, void 0, void 0, function () {
            var issues, criticalModels, _i, criticalModels_1, modelId, modelInfo, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        issues = [];
                        criticalModels = [
                            'swe-1.5',
                            'z-ai/glm-5',
                            'anthropic/claude-3.5-sonnet'
                        ];
                        _i = 0, criticalModels_1 = criticalModels;
                        _a.label = 1;
                    case 1:
                        if (!(_i < criticalModels_1.length)) return [3 /*break*/, 6];
                        modelId = criticalModels_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.openRouter.getModelInfo(modelId)];
                    case 3:
                        modelInfo = _a.sent();
                        if (!modelInfo) {
                            issues.push({
                                type: 'error',
                                component: 'Model Availability',
                                message: "Critical model not available: ".concat(modelId),
                                fix: 'Check model availability and update routing configuration'
                            });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        issues.push({
                            type: 'warning',
                            component: 'Model Availability',
                            message: "Cannot validate model ".concat(modelId, ": ").concat(error_2.message),
                            fix: 'Verify OpenRouter service status'
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, { valid: issues.length === 0, issues: issues }];
                }
            });
        });
    };
    ProactiveValidator.prototype.validatePricing = function () {
        return __awaiter(this, void 0, void 0, function () {
            var issues, _i, _a, _b, intent, config;
            return __generator(this, function (_c) {
                issues = [];
                // Validate pricing data in MODEL_ROUTING
                for (_i = 0, _a = Object.entries(models_1.MODEL_ROUTING); _i < _a.length; _i++) {
                    _b = _a[_i], intent = _b[0], config = _b[1];
                    if (config.cost < 0 || config.cost > 100) {
                        issues.push({
                            type: 'warning',
                            component: 'Pricing Data',
                            message: "Suspicious pricing for ".concat(intent, ": $").concat(config.cost),
                            fix: 'Verify and update pricing information'
                        });
                    }
                }
                return [2 /*return*/, { valid: issues.length === 0, issues: issues }];
            });
        });
    };
    ProactiveValidator.prototype.validateConfiguration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var issues, settings, apiKey, monthlyBudget;
            return __generator(this, function (_a) {
                issues = [];
                settings = vscode.workspace.getConfiguration('smartRouter');
                apiKey = settings.get('openrouterApiKey');
                if (!apiKey || apiKey.length < 10) {
                    issues.push({
                        type: 'error',
                        component: 'Configuration',
                        message: 'OpenRouter API key not configured',
                        fix: 'Set smartRouter.openrouterApiKey in VS Code settings'
                    });
                }
                monthlyBudget = settings.get('monthlyBudget');
                if (!monthlyBudget || monthlyBudget <= 0) {
                    issues.push({
                        type: 'warning',
                        component: 'Configuration',
                        message: 'Monthly budget not set or invalid',
                        fix: 'Set a reasonable monthly budget in settings'
                    });
                }
                return [2 /*return*/, { valid: issues.length === 0, issues: issues }];
            });
        });
    };
    ProactiveValidator.prototype.generateRecommendations = function (issues) {
        var recommendations = [];
        // Analyze issue patterns
        var errorCount = issues.filter(function (i) { return i.type === 'error'; }).length;
        var warningCount = issues.filter(function (i) { return i.type === 'warning'; }).length;
        if (errorCount > 0) {
            recommendations.push("\uD83D\uDEA8 Critical issues found: ".concat(errorCount, ". Fix these immediately."));
        }
        if (warningCount > 3) {
            recommendations.push("\u26A0\uFE0F Multiple warnings: ".concat(warningCount, ". Review configuration."));
        }
        // Specific recommendations based on issue types
        var apiIssues = issues.filter(function (i) { return i.component === 'OpenRouter API'; });
        if (apiIssues.length > 0) {
            recommendations.push('🔑 Verify OpenRouter API key and service status');
        }
        var modelIssues = issues.filter(function (i) { return i.component === 'Model Availability'; });
        if (modelIssues.length > 0) {
            recommendations.push('🤖 Check model availability and update routing');
        }
        var pricingIssues = issues.filter(function (i) { return i.component === 'Pricing Data'; });
        if (pricingIssues.length > 0) {
            recommendations.push('💰 Update pricing information with verified sources');
        }
        // Proactive recommendations
        if (issues.length === 0) {
            recommendations.push('✅ System is healthy! Consider enabling Arena Mode for testing.');
            recommendations.push('📊 Monitor costs regularly with smart.showCosts command.');
            recommendations.push('🖼️ Try screenshot analysis with smart.analyzeImage command.');
        }
        return recommendations;
    };
    ProactiveValidator.prototype.showValidationResults = function () {
        return __awaiter(this, void 0, void 0, function () {
            var validation, output, recommendations, message, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.validateSystem()];
                    case 1:
                        validation = _a.sent();
                        output = validation.issues.map(function (issue) {
                            var icon = issue.type === 'error' ? '🚨' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
                            return "".concat(icon, " **").concat(issue.component, "**: ").concat(issue.message).concat(issue.fix ? "\n   \uD83D\uDCA1 Fix: ".concat(issue.fix) : '');
                        }).join('\n\n');
                        recommendations = validation.recommendations.map(function (rec) { return "- ".concat(rec); }).join('\n');
                        message = "\n# \uD83E\uDDE0 Smart Router System Validation\n\n**Status:** ".concat(validation.valid ? '✅ Healthy' : '❌ Issues Found', "\n\n## Issues (").concat(validation.issues.length, ")\n").concat(output || 'No issues found!', "\n\n## Recommendations\n").concat(recommendations, "\n\n---\n*Last validated: ").concat(new Date().toLocaleString(), "*\n    ");
                        return [4 /*yield*/, vscode.workspace.openTextDocument({
                                content: message,
                                language: 'markdown'
                            })];
                    case 2:
                        doc = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(doc)];
                    case 3:
                        _a.sent();
                        // Log to console
                        this.logger.info("[ProactiveValidator] Validation complete: ".concat(validation.valid ? 'HEALTHY' : 'ISSUES FOUND'));
                        return [2 /*return*/];
                }
            });
        });
    };
    return ProactiveValidator;
}());
exports.ProactiveValidator = ProactiveValidator;
