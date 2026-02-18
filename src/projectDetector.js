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
exports.ProjectDetector = void 0;
var vscode = require("vscode");
var path = require("path");
var fs = require("fs");
var ProjectDetector = /** @class */ (function () {
    function ProjectDetector() {
        this.currentProject = null;
    }
    ProjectDetector.prototype.detectProject = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolder, projectRoot, projectName, claudeMdPath, hasClaudeConfig, context;
            return __generator(this, function (_b) {
                workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
                if (!workspaceFolder) {
                    return [2 /*return*/, null];
                }
                projectRoot = workspaceFolder.uri.fsPath;
                projectName = path.basename(projectRoot);
                claudeMdPath = path.join(projectRoot, '.claude', 'CLAUDE.md');
                hasClaudeConfig = fs.existsSync(claudeMdPath);
                context = '';
                if (hasClaudeConfig) {
                    try {
                        context = fs.readFileSync(claudeMdPath, 'utf8');
                    }
                    catch (error) {
                        console.error("Failed to read CLAUDE.md: ".concat(error));
                    }
                }
                this.currentProject = {
                    name: projectName,
                    root: projectRoot,
                    context: context,
                    claudeMdPath: claudeMdPath,
                    hasClaudeConfig: hasClaudeConfig
                };
                return [2 /*return*/, this.currentProject];
            });
        });
    };
    ProjectDetector.prototype.getCurrentProject = function () {
        return this.currentProject;
    };
    ProjectDetector.prototype.getProjectContext = function () {
        return __awaiter(this, void 0, void 0, function () {
            var project, sections;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.detectProject()];
                    case 1:
                        project = _a.sent();
                        if (!project) {
                            return [2 /*return*/, 'No active project detected.'];
                        }
                        if (!project.hasClaudeConfig) {
                            return [2 /*return*/, "Project: ".concat(project.name, "\nNo .claude/CLAUDE.md found. Using global rules only.")];
                        }
                        sections = this.extractKeySections(project.context);
                        return [2 /*return*/, "Project: ".concat(project.name, "\n\n").concat(sections)];
                }
            });
        });
    };
    ProjectDetector.prototype.extractKeySections = function (content) {
        var sections = [];
        // Extract common sections
        var patterns = [
            { name: 'Project Info', regex: /## Project Info\n([\s\S]*?)(?=\n## |\n--- |\n$)/ },
            { name: 'Build Gates', regex: /## Build Gates\n([\s\S]*?)(?=\n## |\n--- |\n$)/ },
            { name: 'Technical Patterns', regex: /## Technical Patterns\n([\s\S]*?)(?=\n## |\n--- |\n$)/ },
            { name: 'Project-Specific Regels', regex: /## Project-Specifieke Regels\n([\s\S]*?)(?=\n## |\n--- |\n$)/ },
        ];
        patterns.forEach(function (_a) {
            var name = _a.name, regex = _a.regex;
            var match = content.match(regex);
            if (match) {
                sections.push("### ".concat(name, "\n").concat(match[1].trim()));
            }
        });
        // If no sections found, return first 500 chars
        if (sections.length === 0) {
            sections.push(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
        }
        return sections.join('\n\n');
    };
    ProjectDetector.prototype.getUsageFilePath = function () {
        return __awaiter(this, void 0, void 0, function () {
            var project, usageDir, usageFile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.detectProject()];
                    case 1:
                        project = _a.sent();
                        if (!project) {
                            return [2 /*return*/, null];
                        }
                        usageDir = path.join(project.root, '.claude');
                        usageFile = path.join(usageDir, 'usage.json');
                        // Ensure .claude directory exists
                        if (!fs.existsSync(usageDir)) {
                            try {
                                fs.mkdirSync(usageDir, { recursive: true });
                            }
                            catch (error) {
                                console.error("Failed to create .claude directory: ".concat(error));
                                return [2 /*return*/, null];
                            }
                        }
                        return [2 /*return*/, usageFile];
                }
            });
        });
    };
    return ProjectDetector;
}());
exports.ProjectDetector = ProjectDetector;
