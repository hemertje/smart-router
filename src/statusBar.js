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
exports.StatusBarManager = void 0;
var vscode = require("vscode");
var StatusBarManager = /** @class */ (function () {
    function StatusBarManager(costTracker, projectDetector) {
        this.updateInterval = null;
        this.costTracker = costTracker;
        this.projectDetector = projectDetector;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.name = 'Smart Router Status';
        this.statusBarItem.command = 'smart.showStatus';
        this.statusBarItem.tooltip = 'Click to see Smart Router status and costs';
    }
    StatusBarManager.prototype.start = function () {
        var _this = this;
        this.updateStatus();
        this.updateInterval = setInterval(function () { return _this.updateStatus(); }, 30000); // Update every 30 seconds
    };
    StatusBarManager.prototype.stop = function () {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    };
    StatusBarManager.prototype.updateStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var project, stats, today, todayCost, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.projectDetector.detectProject()];
                    case 1:
                        project = _a.sent();
                        return [4 /*yield*/, this.costTracker.getStats()];
                    case 2:
                        stats = _a.sent();
                        if (project && stats) {
                            today = new Date().toISOString().split('T')[0];
                            todayCost = stats.dailyCosts[today] || 0;
                            this.statusBarItem.text = "$(robot) ".concat(project.name, ": $").concat(todayCost.toFixed(2));
                            this.statusBarItem.show();
                        }
                        else {
                            this.statusBarItem.text = '$(robot) Smart Router';
                            this.statusBarItem.show();
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Failed to update status bar:', error_1);
                        this.statusBarItem.text = '$(robot) Smart Router';
                        this.statusBarItem.show();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StatusBarManager.prototype.dispose = function () {
        this.stop();
        this.statusBarItem.dispose();
    };
    return StatusBarManager;
}());
exports.StatusBarManager = StatusBarManager;
