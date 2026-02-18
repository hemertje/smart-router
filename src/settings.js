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
exports.SettingsManager = void 0;
var vscode = require("vscode");
var SettingsManager = /** @class */ (function () {
    function SettingsManager() {
    }
    SettingsManager.getSettings = function () {
        var config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        return {
            enabled: config.get('enabled', true),
            openrouterApiKey: config.get('openrouterApiKey', ''),
            defaultModel: config.get('defaultModel', 'free-tier'),
            costWarningThreshold: config.get('costWarningThreshold', 5.0),
            localClassifier: config.get('localClassifier', 'ollama:qwen3:8b'),
            budgetAlerts: config.get('budgetAlerts', true),
            monthlyBudget: config.get('monthlyBudget', 50),
            preferredModels: config.get('preferredModels', {}),
            zhipuApiKey: config.get('zhipuApiKey', ''),
            minimaxApiKey: config.get('minimaxApiKey', ''),
            alibabaApiKey: config.get('alibabaApiKey', '')
        };
    };
    SettingsManager.updateSetting = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
                        return [4 /*yield*/, config.update(key, value, vscode.ConfigurationTarget.Global)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SettingsManager.openSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.commands.executeCommand('workbench.action.openSettings', '@id:smartRouter')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SettingsManager.validateSettings = function (settings) {
        var errors = [];
        if (!settings.openrouterApiKey) {
            errors.push('OpenRouter API key is required for full functionality');
        }
        if (settings.costWarningThreshold < 0) {
            errors.push('Cost warning threshold must be positive');
        }
        if (settings.monthlyBudget < 0) {
            errors.push('Monthly budget must be positive');
        }
        var validModels = ['free-tier', 'budget', 'mid', 'premium'];
        if (!validModels.includes(settings.defaultModel)) {
            errors.push("Default model must be one of: ".concat(validModels.join(', ')));
        }
        return {
            valid: errors.length === 0,
            errors: errors
        };
    };
    SettingsManager.CONFIG_SECTION = 'smartRouter';
    return SettingsManager;
}());
exports.SettingsManager = SettingsManager;
