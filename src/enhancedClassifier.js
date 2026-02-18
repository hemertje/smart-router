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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.EnhancedIntentClassifier = void 0;
var ollama_1 = require("./ollama");
var settings_1 = require("./settings");
var EnhancedIntentClassifier = /** @class */ (function () {
    function EnhancedIntentClassifier() {
        this.userPreferences = new Map();
        this.patternHistory = [];
        this.ollama = new ollama_1.OllamaClient();
        this.settings = settings_1.SettingsManager.getSettings();
    }
    EnhancedIntentClassifier.prototype.classify = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, cached, ollamaAvailable, ollamaIntent, result, error_1, ruleResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        cached = this.checkUserPreferences(query);
                        if (cached) {
                            return [2 /*return*/, {
                                    intent: cached,
                                    confidence: 0.95,
                                    method: 'ml',
                                    reasoning: 'User preference detected'
                                }];
                        }
                        return [4 /*yield*/, this.ollama.isAvailable()];
                    case 1:
                        ollamaAvailable = _a.sent();
                        if (!ollamaAvailable) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.ollama.classifyIntent(query)];
                    case 3:
                        ollamaIntent = _a.sent();
                        if (ollamaIntent) {
                            result = {
                                intent: ollamaIntent,
                                confidence: 0.85,
                                method: 'ollama',
                                reasoning: 'Ollama Qwen3:8b classification'
                            };
                            // Learn from this classification
                            this.updatePatternHistory(query, ollamaIntent);
                            return [2 /*return*/, result];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.warn('Ollama classification failed:', error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        ruleResult = this.enhancedRuleBasedClassification(query);
                        // Learn from this classification
                        this.updatePatternHistory(query, ruleResult.intent);
                        return [2 /*return*/, __assign(__assign({}, ruleResult), { method: 'rules', reasoning: 'Enhanced rule-based classification' })];
                }
            });
        });
    };
    EnhancedIntentClassifier.prototype.checkUserPreferences = function (query) {
        var _this = this;
        // Check for exact matches
        if (this.userPreferences.has(query.toLowerCase())) {
            return this.userPreferences.get(query.toLowerCase());
        }
        // Check for similar patterns in history
        var recent = this.patternHistory
            .filter(function (h) { return Date.now() - h.timestamp < 86400000; }) // Last 24 hours
            .filter(function (h) { return _this.calculateSimilarity(query, h.query) > 0.8; });
        if (recent.length > 0) {
            // Return the most common intent from similar queries
            var intentCounts = recent.reduce(function (acc, h) {
                acc[h.intent] = (acc[h.intent] || 0) + 1;
                return acc;
            }, {});
            var topIntent = Object.entries(intentCounts)
                .sort(function (_a, _b) {
                var a = _a[1];
                var b = _b[1];
                return b - a;
            })[0][0];
            return topIntent;
        }
        return null;
    };
    EnhancedIntentClassifier.prototype.enhancedRuleBasedClassification = function (query) {
        var lowerQuery = query.toLowerCase();
        // Enhanced patterns with weights
        var patterns = {
            simple: {
                patterns: [
                    { text: 'git', weight: 3 },
                    { text: 'status', weight: 2 },
                    { text: 'ls', weight: 2 },
                    { text: 'help', weight: 1 },
                    { text: 'what is', weight: 1 },
                    { text: 'list', weight: 1 },
                    { text: 'show', weight: 1 },
                    { text: 'check', weight: 1 },
                    { text: 'explain', weight: 1 },
                    { text: 'tell me', weight: 1 }
                ],
                keywords: ['directory', 'file', 'folder', 'path']
            },
            code_gen: {
                patterns: [
                    { text: 'create', weight: 3 },
                    { text: 'generate', weight: 3 },
                    { text: 'implement', weight: 2 },
                    { text: 'add', weight: 2 },
                    { text: 'build', weight: 2 },
                    { text: 'write', weight: 2 },
                    { text: 'make', weight: 1 },
                    { text: 'develop', weight: 1 },
                    { text: 'code', weight: 1 },
                    { text: 'function', weight: 2 },
                    { text: 'class', weight: 2 },
                    { text: 'api', weight: 2 },
                    { text: 'component', weight: 2 }
                ],
                keywords: ['endpoint', 'service', 'module', 'library', 'package']
            },
            debug: {
                patterns: [
                    { text: 'why', weight: 3 },
                    { text: 'error', weight: 3 },
                    { text: 'not working', weight: 2 },
                    { text: 'failed', weight: 2 },
                    { text: 'broken', weight: 2 },
                    { text: 'issue', weight: 1 },
                    { text: 'problem', weight: 1 },
                    { text: 'fix', weight: 2 },
                    { text: 'debug', weight: 2 },
                    { text: 'troubleshoot', weight: 1 },
                    { text: 'wrong', weight: 1 },
                    { text: 'exception', weight: 2 },
                    { text: 'bug', weight: 2 }
                ],
                keywords: ['stack trace', 'crash', 'timeout', 'undefined', 'null']
            },
            architecture: {
                patterns: [
                    { text: 'design', weight: 3 },
                    { text: 'plan', weight: 3 },
                    { text: 'should', weight: 2 },
                    { text: 'architecture', weight: 3 },
                    { text: 'structure', weight: 2 },
                    { text: 'pattern', weight: 2 },
                    { text: 'approach', weight: 1 },
                    { text: 'strategy', weight: 1 },
                    { text: 'best practice', weight: 1 },
                    { text: 'organize', weight: 1 },
                    { text: 'refactor', weight: 2 },
                    { text: 'optimize', weight: 1 }
                ],
                keywords: ['system', 'scalable', 'maintainable', 'pattern', 'framework']
            }
        };
        // Calculate scores
        var scores = {
            simple: this.calculateScore(lowerQuery, patterns.simple),
            code_gen: this.calculateScore(lowerQuery, patterns.code_gen),
            debug: this.calculateScore(lowerQuery, patterns.debug),
            architecture: this.calculateScore(lowerQuery, patterns.architecture),
            architecture_screening: 0,
            architecture_screening_alt: 0,
            architecture_premium: 0 // Not used in direct classification
        };
        // Find best intent
        var entries = Object.entries(scores);
        var bestIntent = entries.reduce(function (a, b) { return a[1] > b[1] ? a : b; })[0];
        var bestScore = scores[bestIntent];
        // Calculate confidence based on score
        var confidence = Math.min(bestScore / 10, 0.9); // Max 0.9 for rule-based
        return {
            intent: bestIntent,
            confidence: confidence,
            method: 'rules',
            reasoning: "Score: ".concat(bestScore.toFixed(1), " for ").concat(bestIntent)
        };
    };
    EnhancedIntentClassifier.prototype.calculateScore = function (query, patterns) {
        var score = 0;
        // Pattern matching with weights
        for (var _i = 0, _a = patterns.patterns; _i < _a.length; _i++) {
            var pattern = _a[_i];
            if (query.includes(pattern.text)) {
                score += pattern.weight;
            }
        }
        // Keyword matching
        for (var _b = 0, _c = patterns.keywords; _b < _c.length; _b++) {
            var keyword = _c[_b];
            if (query.includes(keyword)) {
                score += 1.5;
            }
        }
        // Context clues
        if (query.includes('how to'))
            score += 1;
        if (query.includes('example'))
            score += 0.5;
        if (query.includes('tutorial'))
            score += 0.5;
        return score;
    };
    EnhancedIntentClassifier.prototype.calculateSimilarity = function (query1, query2) {
        // Simple similarity based on common words
        var words1 = query1.toLowerCase().split(' ');
        var words2 = query2.toLowerCase().split(' ');
        var common = words1.filter(function (w) { return words2.includes(w); });
        var total = new Set(__spreadArray(__spreadArray([], words1, true), words2, true)).size;
        return common.length / total;
    };
    EnhancedIntentClassifier.prototype.updatePatternHistory = function (query, intent) {
        this.patternHistory.push({
            query: query.toLowerCase(),
            intent: intent,
            timestamp: Date.now()
        });
        // Keep only last 1000 entries
        if (this.patternHistory.length > 1000) {
            this.patternHistory = this.patternHistory.slice(-1000);
        }
    };
    EnhancedIntentClassifier.prototype.setUserPreference = function (query, intent) {
        this.userPreferences.set(query.toLowerCase(), intent);
    };
    EnhancedIntentClassifier.prototype.getPatternHistory = function () {
        return this.patternHistory;
    };
    EnhancedIntentClassifier.prototype.clearUserPreferences = function () {
        this.userPreferences.clear();
    };
    return EnhancedIntentClassifier;
}());
exports.EnhancedIntentClassifier = EnhancedIntentClassifier;
