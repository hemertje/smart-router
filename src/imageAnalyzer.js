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
exports.ImageAnalyzer = void 0;
var fs = require("fs/promises");
var path = require("path");
var openrouter_1 = require("./openrouter");
var logger_1 = require("./logger");
var ImageAnalyzer = /** @class */ (function () {
    function ImageAnalyzer(apiKey) {
        this.logger = logger_1.Logger.getInstance();
        this.openRouter = new openrouter_1.OpenRouterClient(apiKey);
    }
    ImageAnalyzer.prototype.analyzeImage = function (imagePath) {
        return __awaiter(this, void 0, void 0, function () {
            var imageBase64, prompt_1, model, messages, response, cost, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        // Validate image file
                        return [4 /*yield*/, this.validateImageFile(imagePath)];
                    case 1:
                        // Validate image file
                        _a.sent();
                        return [4 /*yield*/, this.readImageAsBase64(imagePath)];
                    case 2:
                        imageBase64 = _a.sent();
                        prompt_1 = this.createAnalysisPrompt(imagePath);
                        model = 'z-ai/glm-5';
                        messages = [
                            {
                                role: 'user',
                                content: JSON.stringify([
                                    {
                                        type: 'text',
                                        text: prompt_1
                                    },
                                    {
                                        type: 'image_url',
                                        image_url: {
                                            url: "data:image/png;base64,".concat(imageBase64)
                                        }
                                    }
                                ])
                            }
                        ];
                        return [4 /*yield*/, this.openRouter.complete(model, messages, {
                                max_tokens: 1000,
                                temperature: 0.7
                            })];
                    case 3:
                        response = _a.sent();
                        cost = this.calculateCost(model, response.usage.total_tokens);
                        // Track usage
                        return [4 /*yield*/, this.logger.info("[Image Analysis] Model: ".concat(model, ", Tokens: ").concat(response.usage.total_tokens, ", Cost: $").concat(cost.toFixed(4)))];
                    case 4:
                        // Track usage
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                analysis: response.choices[0].message.content,
                                cost: cost,
                                model: model,
                                tokens: response.usage.total_tokens
                            }];
                    case 5:
                        error_1 = _a.sent();
                        this.logger.error("[Image Analysis] Error: ".concat(error_1.message));
                        return [2 /*return*/, {
                                success: false,
                                error: error_1.message
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ImageAnalyzer.prototype.validateImageFile = function (imagePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, stats, ext, validExtensions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.access(imagePath, fs.constants.R_OK)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        throw new Error("Image file not found: ".concat(imagePath));
                    case 3: return [4 /*yield*/, fs.stat(imagePath)];
                    case 4:
                        stats = _b.sent();
                        if (stats.size > 10 * 1024 * 1024) {
                            throw new Error("Image file too large: ".concat(stats.size, " bytes (max 10MB)"));
                        }
                        ext = path.extname(imagePath).toLowerCase();
                        validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
                        if (!validExtensions.includes(ext)) {
                            throw new Error("Unsupported image format: ".concat(ext, ". Supported: ").concat(validExtensions.join(', ')));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ImageAnalyzer.prototype.readImageAsBase64 = function (imagePath) {
        return __awaiter(this, void 0, void 0, function () {
            var imageBuffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs.readFile(imagePath)];
                    case 1:
                        imageBuffer = _a.sent();
                        return [2 /*return*/, imageBuffer.toString('base64')];
                }
            });
        });
    };
    ImageAnalyzer.prototype.createAnalysisPrompt = function (imagePath) {
        var fileName = path.basename(imagePath);
        return "Analyze this image thoroughly:\n\n**File:** ".concat(fileName, "\n\n**Instructions:**\n1. Describe what you see in the image\n2. Identify any errors, bugs, or issues\n3. If it's code, analyze the logic and suggest improvements\n4. If it's a diagram or design, explain the concepts\n5. Point out any potential problems or areas for improvement\n6. Provide actionable recommendations\n\n**Context:** This is part of a coding/development workflow. Focus on technical accuracy and practical advice.\n\nPlease provide a detailed, structured analysis that helps the user understand and improve what they're working on.");
    };
    ImageAnalyzer.prototype.calculateCost = function (model, tokens) {
        // GLM-5 pricing: ~$2.45 per 1M tokens
        var rate = 2.45 / 1000000;
        return tokens * rate;
    };
    return ImageAnalyzer;
}());
exports.ImageAnalyzer = ImageAnalyzer;
