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
exports.CostTracker = void 0;
var fs = require("fs");
var CostTracker = /** @class */ (function () {
    function CostTracker(projectDetector) {
        this.usageFile = null;
        this.projectDetector = projectDetector;
    }
    CostTracker.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.projectDetector.getUsageFilePath()];
                    case 1:
                        _a.usageFile = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CostTracker.prototype.trackUsage = function (intent, model, cost, query, responseTime, tokens) {
        return __awaiter(this, void 0, void 0, function () {
            var record, stats, today, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.usageFile) {
                            console.warn('No usage file available, skipping cost tracking');
                            return [2 /*return*/];
                        }
                        record = {
                            timestamp: new Date().toISOString(),
                            intent: intent,
                            model: model,
                            cost: cost,
                            query: query.substring(0, 100),
                            responseTime: responseTime,
                            tokens: tokens
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.loadStats()];
                    case 2:
                        stats = _a.sent();
                        stats.requests.push(record);
                        stats.totalCost += cost;
                        stats.totalRequests += 1;
                        // Update breakdowns
                        stats.intentBreakdown[intent] = (stats.intentBreakdown[intent] || 0) + 1;
                        stats.modelBreakdown[model] = (stats.modelBreakdown[model] || 0) + 1;
                        today = new Date().toISOString().split('T')[0];
                        stats.dailyCosts[today] = (stats.dailyCosts[today] || 0) + cost;
                        return [4 /*yield*/, this.saveStats(stats)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Failed to track usage:', error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CostTracker.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.usageFile) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.loadStats()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CostTracker.prototype.loadStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                if (!this.usageFile || !fs.existsSync(this.usageFile)) {
                    return [2 /*return*/, {
                            totalCost: 0,
                            totalRequests: 0,
                            requests: [],
                            intentBreakdown: {},
                            modelBreakdown: {},
                            dailyCosts: {}
                        }];
                }
                try {
                    data = fs.readFileSync(this.usageFile, 'utf8');
                    return [2 /*return*/, JSON.parse(data)];
                }
                catch (error) {
                    console.error('Failed to load usage stats:', error);
                    return [2 /*return*/, this.getEmptyStats()];
                }
                return [2 /*return*/];
            });
        });
    };
    CostTracker.prototype.saveStats = function (stats) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.usageFile) {
                    return [2 /*return*/];
                }
                try {
                    // Keep only last 1000 requests to prevent file from growing too large
                    if (stats.requests.length > 1000) {
                        stats.requests = stats.requests.slice(-1000);
                    }
                    fs.writeFileSync(this.usageFile, JSON.stringify(stats, null, 2));
                }
                catch (error) {
                    console.error('Failed to save usage stats:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    CostTracker.prototype.getEmptyStats = function () {
        return {
            totalCost: 0,
            totalRequests: 0,
            requests: [],
            intentBreakdown: {},
            modelBreakdown: {},
            dailyCosts: {}
        };
    };
    CostTracker.prototype.getCostSummary = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stats, project, projectName, today, todayCost, weekCost, monthCost;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getStats()];
                    case 1:
                        stats = _a.sent();
                        if (!stats) {
                            return [2 /*return*/, 'No cost tracking available'];
                        }
                        return [4 /*yield*/, this.projectDetector.detectProject()];
                    case 2:
                        project = _a.sent();
                        projectName = (project === null || project === void 0 ? void 0 : project.name) || 'Unknown';
                        today = new Date().toISOString().split('T')[0];
                        todayCost = stats.dailyCosts[today] || 0;
                        weekCost = this.getWeekCost(stats.dailyCosts);
                        monthCost = this.getMonthCost(stats.dailyCosts);
                        return [2 /*return*/, "\n\uD83D\uDCB0 **Cost Summary - ".concat(projectName, "**\n\n| Period | Cost |\n|--------|------|\n| Today | $").concat(todayCost.toFixed(2), " |\n| This Week | $").concat(weekCost.toFixed(2), " |\n| This Month | $").concat(monthCost.toFixed(2), " |\n| All Time | $").concat(stats.totalCost.toFixed(2), " |\n\n**Total Requests:** ").concat(stats.totalRequests, "\n\n**Intent Breakdown:**\n").concat(Object.entries(stats.intentBreakdown)
                                .map(function (_a) {
                                var intent = _a[0], count = _a[1];
                                return "- ".concat(intent, ": ").concat(count);
                            })
                                .join('\n'), "\n\n**Model Breakdown:**\n").concat(Object.entries(stats.modelBreakdown)
                                .map(function (_a) {
                                var model = _a[0], count = _a[1];
                                return "- ".concat(model, ": ").concat(count);
                            })
                                .join('\n'), "\n    ").trim()];
                }
            });
        });
    };
    CostTracker.prototype.getWeekCost = function (dailyCosts) {
        var today = new Date();
        var weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        var weekCost = 0;
        for (var d = new Date(weekStart); d <= today; d.setDate(d.getDate() + 1)) {
            var dateStr = d.toISOString().split('T')[0];
            weekCost += dailyCosts[dateStr] || 0;
        }
        return weekCost;
    };
    CostTracker.prototype.getMonthCost = function (dailyCosts) {
        var today = new Date();
        var monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        var monthCost = 0;
        for (var d = new Date(monthStart); d <= today; d.setDate(d.getDate() + 1)) {
            var dateStr = d.toISOString().split('T')[0];
            monthCost += dailyCosts[dateStr] || 0;
        }
        return monthCost;
    };
    return CostTracker;
}());
exports.CostTracker = CostTracker;
