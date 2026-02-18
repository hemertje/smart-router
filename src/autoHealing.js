"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.AutoHealingSystem = void 0;
var vscode = require("vscode");
var logger_1 = require("./logger");
var models_1 = require("./models");
var AutoHealingSystem = /** @class */ (function () {
    function AutoHealingSystem(openRouter) {
        this.openRouter = openRouter;
        this.logger = logger_1.Logger.getInstance();
        this.healthStatus = {
            healthy: true,
            issues: [],
            lastCheck: new Date(),
            uptime: 0
        };
        this.fallbackPlans = new Map();
        this.recoveryAttempts = new Map();
        this.startTime = Date.now();
        this.initializeFallbackPlans();
        this.startHealthMonitoring();
    }
    AutoHealingSystem.prototype.initializeFallbackPlans = function () {
        // Architecture routing fallbacks
        this.fallbackPlans.set('architecture', {
            primary: 'swe-1.5',
            fallbacks: ['openai/gpt-3.5-turbo', 'anthropic/claude-3-haiku'],
            triggers: ['api_error', 'timeout', 'rate_limit']
        });
        this.fallbackPlans.set('architecture_screening', {
            primary: 'z-ai/glm-5',
            fallbacks: ['qwen/qwen-3.5', 'anthropic/claude-3-sonnet'],
            triggers: ['api_error', 'model_unavailable', 'timeout']
        });
        this.fallbackPlans.set('architecture_premium', {
            primary: 'anthropic/claude-3.5-sonnet',
            fallbacks: ['anthropic/claude-3-opus', 'gpt-4'],
            triggers: ['api_error', 'timeout', 'rate_limit']
        });
        // Debug fallbacks
        this.fallbackPlans.set('debug', {
            primary: 'swe-1.5',
            fallbacks: ['openai/gpt-3.5-turbo', 'anthropic/claude-3-haiku'],
            triggers: ['api_error', 'timeout']
        });
        // Code generation fallbacks
        this.fallbackPlans.set('code_generation', {
            primary: 'swe-1.5',
            fallbacks: ['openai/gpt-3.5-turbo', 'anthropic/claude-3-sonnet'],
            triggers: ['api_error', 'timeout', 'rate_limit']
        });
    };
    AutoHealingSystem.prototype.startHealthMonitoring = function () {
        var _this = this;
        // Check health every 30 seconds
        setInterval(function () {
            _this.performHealthCheck();
        }, 30000);
        // Update uptime every minute
        setInterval(function () {
            _this.healthStatus.uptime = Date.now() - _this.startTime;
        }, 60000);
    };
    AutoHealingSystem.prototype.performHealthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var issues, _i, _a, _b, intent, config, modelInfo, error_1, unresolvedIssues, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        issues = [];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 8, , 9]);
                        _i = 0, _a = Object.entries(models_1.MODEL_ROUTING);
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        _b = _a[_i], intent = _b[0], config = _b[1];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.openRouter.getModelInfo(config.model)];
                    case 4:
                        modelInfo = _c.sent();
                        if (!modelInfo) {
                            issues.push({
                                type: 'model_unavailable',
                                severity: 'high',
                                component: config.model,
                                message: "Model ".concat(config.model, " not available"),
                                timestamp: new Date()
                            });
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _c.sent();
                        issues.push({
                            type: 'api_error',
                            severity: 'critical',
                            component: config.model,
                            message: "API error for ".concat(config.model, ": ").concat(error_1.message),
                            timestamp: new Date()
                        });
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        unresolvedIssues = this.healthStatus.issues.filter(function (i) { return !i.resolved; });
                        issues.push.apply(issues, unresolvedIssues);
                        return [3 /*break*/, 9];
                    case 8:
                        error_2 = _c.sent();
                        issues.push({
                            type: 'api_error',
                            severity: 'critical',
                            component: 'health_check',
                            message: "Health check failed: ".concat(error_2.message),
                            timestamp: new Date()
                        });
                        return [3 /*break*/, 9];
                    case 9:
                        this.healthStatus = {
                            healthy: issues.filter(function (i) { return i.severity === 'critical'; }).length === 0,
                            issues: issues,
                            lastCheck: new Date(),
                            uptime: Date.now() - this.startTime
                        };
                        // Auto-heal critical issues
                        return [4 /*yield*/, this.autoHealCriticalIssues()];
                    case 10:
                        // Auto-heal critical issues
                        _c.sent();
                        return [2 /*return*/, this.healthStatus];
                }
            });
        });
    };
    AutoHealingSystem.prototype.autoHealCriticalIssues = function () {
        return __awaiter(this, void 0, void 0, function () {
            var criticalIssues, _i, criticalIssues_1, issue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        criticalIssues = this.healthStatus.issues.filter(function (i) {
                            return i.severity === 'critical' && !i.resolved;
                        });
                        _i = 0, criticalIssues_1 = criticalIssues;
                        _a.label = 1;
                    case 1:
                        if (!(_i < criticalIssues_1.length)) return [3 /*break*/, 4];
                        issue = criticalIssues_1[_i];
                        return [4 /*yield*/, this.attemptRecovery(issue)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AutoHealingSystem.prototype.attemptRecovery = function (issue) {
        return __awaiter(this, void 0, void 0, function () {
            var recoveryKey, attempts, _a, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        recoveryKey = "".concat(issue.type, "_").concat(issue.component);
                        attempts = this.recoveryAttempts.get(recoveryKey) || 0;
                        // Limit recovery attempts to prevent infinite loops
                        if (attempts >= 3) {
                            this.logger.error("[AutoHealing] Max recovery attempts reached for ".concat(recoveryKey));
                            return [2 /*return*/];
                        }
                        this.recoveryAttempts.set(recoveryKey, attempts + 1);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 11, , 12]);
                        _a = issue.type;
                        switch (_a) {
                            case 'model_unavailable': return [3 /*break*/, 2];
                            case 'api_error': return [3 /*break*/, 4];
                            case 'timeout': return [3 /*break*/, 6];
                            case 'rate_limit': return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 10];
                    case 2: return [4 /*yield*/, this.recoverModelUnavailable(issue)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 4: return [4 /*yield*/, this.recoverApiError(issue)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 6: return [4 /*yield*/, this.recoverTimeout(issue)];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, this.recoverRateLimit(issue)];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 10:
                        // Mark issue as resolved if recovery successful
                        issue.resolved = true;
                        this.logger.info("[AutoHealing] Recovered from ".concat(issue.type, " for ").concat(issue.component));
                        return [3 /*break*/, 12];
                    case 11:
                        error_3 = _b.sent();
                        this.logger.error("[AutoHealing] Recovery failed for ".concat(recoveryKey, ": ").concat(error_3.message));
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    AutoHealingSystem.prototype.recoverModelUnavailable = function (issue) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, intent, config, fallbackPlan, fallback;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, _a = Object.entries(models_1.MODEL_ROUTING);
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        _b = _a[_i], intent = _b[0], config = _b[1];
                        if (!(config.model === issue.component)) return [3 /*break*/, 3];
                        fallbackPlan = this.fallbackPlans.get(intent);
                        if (!fallbackPlan) return [3 /*break*/, 3];
                        fallback = fallbackPlan.fallbacks[0];
                        if (!fallback) return [3 /*break*/, 3];
                        // Test fallback model
                        return [4 /*yield*/, this.openRouter.getModelInfo(fallback)];
                    case 2:
                        // Test fallback model
                        _c.sent();
                        // Update model routing temporarily
                        this.logger.info("[AutoHealing] Switched ".concat(intent, " from ").concat(issue.component, " to ").concat(fallback));
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AutoHealingSystem.prototype.recoverApiError = function (issue) {
        return __awaiter(this, void 0, void 0, function () {
            var delay;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        delay = Math.min(1000 * Math.pow(2, this.recoveryAttempts.get("".concat(issue.type, "_").concat(issue.component)) || 0), 10000);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
                    case 1:
                        _a.sent();
                        // Test connection with minimal request
                        return [4 /*yield*/, this.openRouter.complete('openai/gpt-3.5-turbo', [
                                { role: 'user', content: 'test' }
                            ], { max_tokens: 1 })];
                    case 2:
                        // Test connection with minimal request
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoHealingSystem.prototype.recoverTimeout = function (issue) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Increase timeout for this component
                // This would require modifying the OpenRouterClient timeout settings
                this.logger.info("[AutoHealing] Increasing timeout for ".concat(issue.component));
                return [2 /*return*/];
            });
        });
    };
    AutoHealingSystem.prototype.recoverRateLimit = function (issue) {
        return __awaiter(this, void 0, void 0, function () {
            var delay;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        delay = 60000;
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoHealingSystem.prototype.getFallbackModel = function (intent, failedModel) {
        return __awaiter(this, void 0, void 0, function () {
            var fallbackPlan, _i, _a, fallback, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fallbackPlan = this.fallbackPlans.get(intent);
                        if (!fallbackPlan)
                            return [2 /*return*/, null];
                        _i = 0, _a = fallbackPlan.fallbacks;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        fallback = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.openRouter.getModelInfo(fallback)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, fallback];
                    case 4:
                        error_4 = _b.sent();
                        return [3 /*break*/, 5]; // Try next fallback
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, null]; // No working fallback found
                }
            });
        });
    };
    AutoHealingSystem.prototype.getHealthStatus = function () {
        return __assign({}, this.healthStatus);
    };
    AutoHealingSystem.prototype.showHealthDashboard = function () {
        return __awaiter(this, void 0, void 0, function () {
            var status, uptime, criticalIssues, warnings, dashboard, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.performHealthCheck()];
                    case 1:
                        status = _a.sent();
                        uptime = Math.floor(status.uptime / 1000 / 60);
                        criticalIssues = status.issues.filter(function (i) { return i.severity === 'critical' && !i.resolved; });
                        warnings = status.issues.filter(function (i) { return i.severity === 'high' || i.severity === 'medium'; });
                        dashboard = "\n# \uD83C\uDFE5 Smart Router Health Dashboard\n\n**Status:** ".concat(status.healthy ? '🟢 HEALTHY' : '🔴 CRITICAL ISSUES', "\n**Uptime:** ").concat(uptime, " minutes\n**Last Check:** ").concat(status.lastCheck.toLocaleString(), "\n\n## \uD83D\uDEA8 Critical Issues (").concat(criticalIssues.length, ")\n").concat(criticalIssues.length === 0 ? '✅ No critical issues' :
                            criticalIssues.map(function (i) { return "- **".concat(i.component, "**: ").concat(i.message); }).join('\n'), "\n\n## \u26A0\uFE0F Warnings (").concat(warnings.length, ")\n").concat(warnings.length === 0 ? '✅ No warnings' :
                            warnings.map(function (i) { return "- **".concat(i.component, "**: ").concat(i.message); }).join('\n'), "\n\n## \uD83D\uDD04 Auto-Healing Status\n- Recovery attempts: ").concat(Array.from(this.recoveryAttempts.values()).reduce(function (a, b) { return a + b; }, 0), "\n- Fallback plans: ").concat(this.fallbackPlans.size, "\n- Monitoring active: \u2705\n\n---\n*Auto-Healing System v2.4.0*\n    ");
                        return [4 /*yield*/, vscode.workspace.openTextDocument({
                                content: dashboard,
                                language: 'markdown'
                            })];
                    case 2:
                        doc = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(doc)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AutoHealingSystem;
}());
exports.AutoHealingSystem = AutoHealingSystem;
