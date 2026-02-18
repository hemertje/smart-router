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
exports.ChineseModelManager = void 0;
var models_1 = require("./models");
var logger_1 = require("./logger");
var ChineseModelManager = /** @class */ (function () {
    function ChineseModelManager(config) {
        this.logger = logger_1.Logger.getInstance();
        this.config = config;
    }
    /**
     * Get beschikbare Chinese modellen
     */
    ChineseModelManager.prototype.getAvailableModels = function () {
        if (!this.config.enabled) {
            return [];
        }
        var models = [];
        for (var _i = 0, _a = Object.entries(models_1.CHINESE_MODELS); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], model = _b[1];
            if (this.config.preferredModels.includes(model.model)) {
                // Pas kosten aan op basis van cost advantage
                var adjustedCost = model.cost * this.config.costAdvantage;
                models.push(__assign(__assign({}, model), { cost: adjustedCost, description: "".concat(model.description, " (Korting: ").concat(((1 - this.config.costAdvantage) * 100).toFixed(0), "%)") }));
            }
        }
        this.logger.info("[Chinese Models] ".concat(models.length, " modellen beschikbaar met cost advantage"));
        return models;
    };
    /**
     * Get beste Chinese model voor intent
     */
    ChineseModelManager.prototype.getBestModel = function (intent) {
        var models = this.getAvailableModels();
        if (models.length === 0) {
            return null;
        }
        // Prioriteiten per intent
        var priorities = {
            'code_gen': ['zhipu/glm-5', 'alibaba/qwen-3.5', 'minimax/minimax-m2.5'],
            'debug': ['minimax/minimax-m2.5', 'zhipu/glm-5', 'alibaba/qwen-3.5'],
            'architecture': ['zhipu/glm-5', 'alibaba/qwen-3.5', 'minimax/minimax-m2.5'],
            'simple': ['minimax/minimax-m2.5', 'alibaba/qwen-3.5', 'zhipu/glm-5']
        };
        var intentPriority = priorities[intent] || priorities['simple'];
        var _loop_1 = function (modelName) {
            var model = models.find(function (m) { return m.model === modelName; });
            if (model) {
                this_1.logger.info("[Chinese Models] Geselecteerd ".concat(modelName, " voor ").concat(intent));
                return { value: model };
            }
        };
        var this_1 = this;
        for (var _i = 0, intentPriority_1 = intentPriority; _i < intentPriority_1.length; _i++) {
            var modelName = intentPriority_1[_i];
            var state_1 = _loop_1(modelName);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        // Fallback naar eerste beschikbare model
        return models[0];
    };
    /**
     * Check of Chinese model beschikbaar is
     */
    ChineseModelManager.prototype.isModelAvailable = function (modelName) {
        var models = this.getAvailableModels();
        return models.some(function (m) { return m.model === modelName; });
    };
    /**
     * Update configuratie
     */
    ChineseModelManager.prototype.updateConfig = function (config) {
        this.config = __assign(__assign({}, this.config), config);
        this.logger.info('[Chinese Models] Configuratie bijgewerkt');
    };
    /**
     * Get cost savings ten opzichte van westerse modellen
     */
    ChineseModelManager.prototype.getCostSavings = function () {
        var _this = this;
        var models = this.getAvailableModels();
        return models.map(function (model) { return ({
            model: model.model,
            originalCost: model.cost / _this.config.costAdvantage,
            discountedCost: model.cost,
            savings: (model.cost / _this.config.costAdvantage) - model.cost
        }); });
    };
    /**
     * Valideer Chinese model response
     */
    ChineseModelManager.prototype.validateResponse = function (modelName, response) {
        return __awaiter(this, void 0, void 0, function () {
            var hasChineseChars;
            return __generator(this, function (_a) {
                // Basis validatie checks
                if (!response || response.length < 10) {
                    this.logger.warn("[Chinese Models] Ongeldige response van ".concat(modelName));
                    return [2 /*return*/, false];
                }
                hasChineseChars = /[\u4e00-\u9fff]/.test(response);
                if (hasChineseChars) {
                    this.logger.info("[Chinese Models] ".concat(modelName, " antwoordde in het Chinees"));
                }
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * Get model statistieken
     */
    ChineseModelManager.prototype.getModelStats = function () {
        var models = this.getAvailableModels();
        var totalSavings = this.getCostSavings().reduce(function (sum, s) { return sum + s.savings; }, 0);
        var averageCost = models.length > 0 ? models.reduce(function (sum, m) { return sum + m.cost; }, 0) / models.length : 0;
        return {
            totalModels: Object.keys(models_1.CHINESE_MODELS).length,
            enabledModels: models.length,
            averageCost: averageCost,
            totalSavings: totalSavings
        };
    };
    return ChineseModelManager;
}());
exports.ChineseModelManager = ChineseModelManager;
