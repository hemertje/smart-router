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
exports.ArenaModeManager = void 0;
var vscode = require("vscode");
var models_1 = require("./models");
var logger_1 = require("./logger");
var ArenaModeManager = /** @class */ (function () {
    function ArenaModeManager(costTracker) {
        this.sessions = new Map();
        this.logger = logger_1.Logger.getInstance();
        this.costTracker = costTracker;
    }
    /**
     * Start een nieuwe Arena Mode sessie
     */
    ArenaModeManager.prototype.startArenaSession = function (battleGroup, prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, config, session;
            return __generator(this, function (_a) {
                sessionId = this.generateSessionId();
                config = models_1.ARENA_BATTLE_GROUPS[battleGroup];
                this.logger.info("[Arena Mode] Start sessie ".concat(sessionId, " met ").concat(battleGroup, " battle group"));
                session = {
                    id: sessionId,
                    models: __spreadArray([], config.models, true),
                    responses: new Map(),
                    costs: new Map(),
                    startTime: new Date(),
                    status: 'active'
                };
                this.sessions.set(sessionId, session);
                // Toon Arena Mode UI
                this.showArenaUI(session, config);
                return [2 /*return*/, session];
            });
        });
    };
    /**
     * Voeg response toe van een model
     */
    ArenaModeManager.prototype.addResponse = function (sessionId, model, response, cost) {
        var session = this.sessions.get(sessionId);
        if (!session) {
            this.logger.error("[Arena Mode] Sessie ".concat(sessionId, " niet gevonden"));
            return;
        }
        session.responses.set(model, response);
        session.costs.set(model, cost);
        this.logger.info("[Arena Mode] Response ontvangen van ".concat(model, " voor sessie ").concat(sessionId));
        // Update UI
        this.updateArenaUI(session);
        // Check of alle modellen hebben geantwoord
        if (session.responses.size === session.models.length) {
            this.showConvergenceOptions(session);
        }
    };
    /**
     * Convergeer naar beste response
     */
    ArenaModeManager.prototype.convergeToModel = function (sessionId, selectedModel) {
        return __awaiter(this, void 0, void 0, function () {
            var session, totalCost;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.sessions.get(sessionId);
                        if (!session) {
                            this.logger.error("[Arena Mode] Sessie ".concat(sessionId, " niet gevonden"));
                            return [2 /*return*/];
                        }
                        session.status = 'converged';
                        totalCost = Array.from(session.costs.values()).reduce(function (sum, cost) { return sum + cost; }, 0);
                        this.logger.info("[Arena Mode] Geconvergeerd naar ".concat(selectedModel, " (totale kosten: $").concat(totalCost.toFixed(2), ")"));
                        // Update cost tracking
                        return [4 /*yield*/, this.costTracker.trackUsage('architecture', 'arena-mode', totalCost, "Arena Mode sessie ".concat(sessionId, " geconvergeerd naar ").concat(selectedModel), Date.now() - session.startTime.getTime())];
                    case 1:
                        // Update cost tracking
                        _a.sent();
                        // Toon resultaat
                        vscode.window.showInformationMessage("Arena Mode: Geconvergeerd naar ".concat(selectedModel, " (Kosten: $").concat(totalCost.toFixed(2), ")"));
                        // Cleanup oude sessies
                        this.cleanupOldSessions();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Toon Arena Mode UI
     */
    ArenaModeManager.prototype.showArenaUI = function (session, config) {
        var _this = this;
        var panel = vscode.window.createWebviewPanel('arenaMode', "Arena Mode - ".concat(config.name), vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        panel.webview.html = this.getArenaWebviewContent(session, config);
        // Handle messages from webview
        panel.webview.onDidReceiveMessage(function (message) {
            switch (message.command) {
                case 'converge':
                    _this.convergeToModel(session.id, message.model);
                    break;
            }
        }, undefined);
    };
    /**
     * Genereer webview content voor Arena Mode
     */
    ArenaModeManager.prototype.getArenaWebviewContent = function (session, config) {
        return "<!DOCTYPE html>\n<html lang=\"nl\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Arena Mode - ".concat(config.name, "</title>\n    <style>\n        body { font-family: var(--vscode-font-family); padding: 20px; }\n        .header { color: var(--vscode-foreground); margin-bottom: 20px; }\n        .model-card { \n            border: 1px solid var(--vscode-panel-border); \n            border-radius: 4px; \n            padding: 15px; \n            margin: 10px 0; \n            background: var(--vscode-editor-background);\n        }\n        .model-name { font-weight: bold; color: var(--vscode-foreground); }\n        .model-status { color: var(--vscode-descriptionForeground); }\n        .converge-button { \n            background: var(--vscode-button-background); \n            color: var(--vscode-button-foreground); \n            border: none; \n            padding: 8px 16px; \n            border-radius: 4px; \n            cursor: pointer;\n            margin-top: 10px;\n        }\n        .converge-button:hover { background: var(--vscode-button-hoverBackground); }\n        .loading { color: var(--vscode-charts-blue); }\n        .complete { color: var(--vscode-charts-green); }\n    </style>\n</head>\n<body>\n    <div class=\"header\">\n        <h2>\uD83E\uDD16 Arena Mode - ").concat(config.name, "</h2>\n        <p>").concat(config.description, "</p>\n        <p>Sessie ID: ").concat(session.id, "</p>\n    </div>\n    \n    <div id=\"models\">\n        ").concat(session.models.map(function (model) { return "\n            <div class=\"model-card\" id=\"model-".concat(model, "\">\n                <div class=\"model-name\">").concat(model, "</div>\n                <div class=\"model-status loading\">\u23F3 Wachten op response...</div>\n                <button class=\"converge-button\" onclick=\"converge('").concat(model, "')\" disabled>\n                    Kies dit model\n                </button>\n            </div>\n        "); }).join(''), "\n    </div>\n\n    <script>\n        const vscode = acquireVsCodeApi();\n        \n        function converge(model) {\n            vscode.postMessage({\n                command: 'converge',\n                model: model\n            });\n        }\n        \n        // Update functie die vanuit de extension wordt aangeroepen\n        function updateModelStatus(model, status, response, cost) {\n            const card = document.getElementById(`model-${model}`);\n            const statusDiv = card.querySelector('.model-status');\n            const button = card.querySelector('.converge-button');\n            \n            statusDiv.className = 'model-status complete';\n            statusDiv.innerHTML = `\n                \u2705 Compleet<br>\n                Kosten: $${cost.toFixed(2)}<br>\n                <small>${response.substring(0, 100)}...</small>\n            `;\n            button.disabled = false;\n        }\n    </script>\n</body>\n</html>");
    };
    /**
     * Update Arena Mode UI met nieuwe responses
     */
    ArenaModeManager.prototype.updateArenaUI = function (session) {
        // Stuur update naar webview
        // Dit vereist tracking van webview panels
    };
    /**
     * Toon convergence opties
     */
    ArenaModeManager.prototype.showConvergenceOptions = function (session) {
        var _this = this;
        this.logger.info("[Arena Mode] Alle modellen compleet voor sessie ".concat(session.id));
        // Quick pick voor model selectie
        var options = Array.from(session.responses.keys()).map(function (model) {
            var _a;
            return ({
                label: model,
                description: "Kosten: $".concat((_a = session.costs.get(model)) === null || _a === void 0 ? void 0 : _a.toFixed(2))
            });
        });
        vscode.window.showQuickPick(options, {
            placeHolder: 'Selecteer het beste model om naar te convergeren'
        }).then(function (selected) {
            if (selected) {
                _this.convergeToModel(session.id, selected.label);
            }
        });
    };
    /**
     * Genereer unieke sessie ID
     */
    ArenaModeManager.prototype.generateSessionId = function () {
        return "arena-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
    };
    /**
     * Cleanup oude sessies
     */
    ArenaModeManager.prototype.cleanupOldSessions = function () {
        var now = Date.now();
        var oneHour = 60 * 60 * 1000;
        for (var _i = 0, _a = this.sessions; _i < _a.length; _i++) {
            var _b = _a[_i], id = _b[0], session = _b[1];
            if (now - session.startTime.getTime() > oneHour) {
                this.sessions["delete"](id);
                this.logger.info("[Arena Mode] Oude sessie opgeruimd: ".concat(id));
            }
        }
    };
    /**
     * Get actieve sessies
     */
    ArenaModeManager.prototype.getActiveSessions = function () {
        return Array.from(this.sessions.values()).filter(function (s) { return s.status === 'active'; });
    };
    /**
     * Stop Arena Mode sessie
     */
    ArenaModeManager.prototype.stopSession = function (sessionId) {
        var session = this.sessions.get(sessionId);
        if (session) {
            session.status = 'abandoned';
            this.logger.info("[Arena Mode] Sessie gestopt: ".concat(sessionId));
        }
    };
    return ArenaModeManager;
}());
exports.ArenaModeManager = ArenaModeManager;
