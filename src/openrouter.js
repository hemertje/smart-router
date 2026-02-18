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
exports.OpenRouterClient = void 0;
var axios_1 = require("axios");
var OpenRouterClient = /** @class */ (function () {
    function OpenRouterClient(apiKey) {
        this.baseUrl = 'https://openrouter.ai/api/v1';
        this.apiKey = apiKey;
    }
    OpenRouterClient.prototype.complete = function (model, messages, options) {
        var _a, _b, _c, _d;
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1["default"].post("".concat(this.baseUrl, "/chat/completions"), {
                                model: model,
                                messages: messages,
                                max_tokens: options.max_tokens || 4096,
                                temperature: options.temperature || 0.7,
                                stream: options.stream || false
                            }, {
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Content-Type': 'application/json',
                                    'HTTP-Referer': 'https://github.com/hemertje/HECO',
                                    'X-Title': 'Smart Router Extension'
                                }
                            })];
                    case 1:
                        response = _e.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_1 = _e.sent();
                        console.error('OpenRouter API error:', ((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) || error_1.message);
                        throw new Error("OpenRouter API error: ".concat(((_d = (_c = (_b = error_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) === null || _d === void 0 ? void 0 : _d.message) || error_1.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OpenRouterClient.prototype.getModelInfo = function (model) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1["default"].get("".concat(this.baseUrl, "/model"), {
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey)
                                },
                                params: { model: model }
                            })];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Model info error:', ((_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) || error_2.message);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OpenRouterClient.prototype.calculateCost = function (model, tokens) {
        // Rough cost calculation based on model pricing
        // These are approximate costs per 1M tokens
        var pricing = {
            'xiaomi/mimo-v2-flash': 0,
            'swe-1.5': 0,
            'deepseek/deepseek-coder-v3': 0.14,
            'minimax/minimax-m2.5': 0.15,
            'qwen/qwen3.5-397b-a17b': 0.36,
            'qwen/qwen3.5-plus-02-15': 0.24,
            'anthropic/claude-opus-4-6': 15
        };
        var rate = pricing[model] || 1; // Default $1/1M tokens
        return (tokens / 1000000) * rate;
    };
    return OpenRouterClient;
}());
exports.OpenRouterClient = OpenRouterClient;
