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
exports.AgentMarketplace = exports.AgentCategory = void 0;
var vscode = require("vscode");
var logger_1 = require("./logger");
var AgentCategory;
(function (AgentCategory) {
    AgentCategory["CODE"] = "code";
    AgentCategory["DEBUG"] = "debug";
    AgentCategory["DESIGN"] = "design";
    AgentCategory["ANALYSIS"] = "analysis";
    AgentCategory["WRITING"] = "writing";
    AgentCategory["RESEARCH"] = "research";
    AgentCategory["AUTOMATION"] = "automation";
    AgentCategory["CREATIVE"] = "creative";
})(AgentCategory = exports.AgentCategory || (exports.AgentCategory = {}));
var AgentMarketplace = /** @class */ (function () {
    function AgentMarketplace(openRouter) {
        this.logger = logger_1.Logger.getInstance();
        this.agents = new Map();
        this.templates = [];
        this.openRouter = openRouter;
        this.initializeTemplates();
        this.loadCommunityAgents();
    }
    AgentMarketplace.prototype.initializeTemplates = function () {
        this.templates = [
            {
                name: 'Code Reviewer',
                description: 'Expert code reviewer with focus on security and performance',
                category: AgentCategory.CODE,
                prompt: "You are an expert code reviewer. Analyze the provided code for:\n1. Security vulnerabilities\n2. Performance issues\n3. Code quality and maintainability\n4. Best practices adherence\n5. Potential bugs\n\nProvide detailed feedback with specific line references and improvement suggestions.",
                model: 'anthropic/claude-3.5-sonnet',
                capabilities: ['code-review', 'security-analysis', 'performance-optimization']
            },
            {
                name: 'Debug Assistant',
                description: 'Systematic debugging expert for complex issues',
                category: AgentCategory.DEBUG,
                prompt: "You are a debugging expert. Help debug code by:\n1. Analyzing error messages and stack traces\n2. Identifying root causes\n3. Suggesting systematic debugging approaches\n4. Providing step-by-step troubleshooting\n5. Recommending preventive measures\n\nBe methodical and thorough in your analysis.",
                model: 'swe-1.5',
                capabilities: ['error-analysis', 'root-cause-detection', 'troubleshooting']
            },
            {
                name: 'API Designer',
                description: 'RESTful API design and documentation specialist',
                category: AgentCategory.DESIGN,
                prompt: "You are an API design expert. Help design APIs by:\n1. Creating RESTful endpoint structures\n2. Defining request/response schemas\n3. Ensuring proper HTTP methods and status codes\n4. Designing authentication and authorization\n5. Writing comprehensive API documentation\n\nFollow industry best practices and standards.",
                model: 'anthropic/claude-3.5-sonnet',
                capabilities: ['api-design', 'schema-definition', 'documentation']
            },
            {
                name: 'Performance Analyzer',
                description: 'Code performance optimization specialist',
                category: AgentCategory.ANALYSIS,
                prompt: "You are a performance optimization expert. Analyze code for:\n1. Time complexity issues\n2. Memory usage optimization\n3. Database query optimization\n4. Caching opportunities\n5. Parallel processing possibilities\n\nProvide specific optimization recommendations with code examples.",
                model: 'anthropic/claude-3.5-sonnet',
                capabilities: ['performance-analysis', 'optimization', 'profiling']
            },
            {
                name: 'Technical Writer',
                description: 'Technical documentation and writing specialist',
                category: AgentCategory.WRITING,
                prompt: "You are a technical writing expert. Create documentation that is:\n1. Clear and concise\n2. Well-structured with proper headings\n3. Comprehensive yet accessible\n4. Include code examples where relevant\n5. Follow technical writing best practices\n\nFocus on clarity and user understanding.",
                model: 'z-ai/glm-5',
                capabilities: ['documentation', 'technical-writing', 'user-guides']
            }
        ];
    };
    AgentMarketplace.prototype.loadCommunityAgents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var communityAgents, _i, communityAgents_1, agent;
            return __generator(this, function (_a) {
                communityAgents = [
                    {
                        id: 'community-1',
                        name: 'React Component Generator',
                        description: 'Generates React components with TypeScript and Tailwind CSS',
                        category: AgentCategory.CODE,
                        creator: 'community-dev-123',
                        model: 'anthropic/claude-3.5-sonnet',
                        prompt: "Generate React components with:\n- TypeScript interfaces\n- Tailwind CSS styling\n- Proper accessibility\n- Responsive design\n- Component documentation",
                        capabilities: ['react', 'typescript', 'tailwind', 'component-generation'],
                        usage: 1250,
                        rating: 4.7,
                        price: 0.005,
                        tags: ['react', 'typescript', 'frontend'],
                        createdAt: new Date('2026-01-15'),
                        updatedAt: new Date('2026-02-10')
                    },
                    {
                        id: 'community-2',
                        name: 'Database Schema Designer',
                        description: 'Designs optimal database schemas with normalization',
                        category: AgentCategory.DESIGN,
                        creator: 'db-expert-456',
                        model: 'anthropic/claude-3.5-sonnet',
                        prompt: "Design database schemas that are:\n- Properly normalized (3NF)\n- Optimized for performance\n- Scalable architecture\n- Include proper indexes\n- Document relationships clearly",
                        capabilities: ['database-design', 'sql', 'normalization', 'optimization'],
                        usage: 890,
                        rating: 4.5,
                        price: 0.008,
                        tags: ['database', 'sql', 'schema'],
                        createdAt: new Date('2026-01-20'),
                        updatedAt: new Date('2026-02-08')
                    }
                ];
                for (_i = 0, communityAgents_1 = communityAgents; _i < communityAgents_1.length; _i++) {
                    agent = communityAgents_1[_i];
                    this.agents.set(agent.id, agent);
                }
                this.logger.info("[AgentMarketplace] Loaded ".concat(communityAgents.length, " community agents"));
                return [2 /*return*/];
            });
        });
    };
    AgentMarketplace.prototype.createAgent = function (agent) {
        return __awaiter(this, void 0, void 0, function () {
            var newAgent;
            return __generator(this, function (_a) {
                newAgent = __assign(__assign({}, agent), { id: "agent-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)), usage: 0, rating: 0, createdAt: new Date(), updatedAt: new Date() });
                this.agents.set(newAgent.id, newAgent);
                this.logger.info("[AgentMarketplace] Created new agent: ".concat(newAgent.name));
                return [2 /*return*/, newAgent];
            });
        });
    };
    AgentMarketplace.prototype.executeAgent = function (agentId, input) {
        return __awaiter(this, void 0, void 0, function () {
            var agent, startTime, response, responseTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        agent = this.agents.get(agentId);
                        if (!agent) {
                            throw new Error("Agent not found: ".concat(agentId));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        startTime = Date.now();
                        return [4 /*yield*/, this.openRouter.complete(agent.model, [
                                { role: 'system', content: agent.prompt },
                                { role: 'user', content: input }
                            ], {
                                max_tokens: 2000,
                                temperature: 0.7
                            })];
                    case 2:
                        response = _a.sent();
                        responseTime = Date.now() - startTime;
                        // Update usage statistics
                        agent.usage++;
                        agent.updatedAt = new Date();
                        this.logger.info("[AgentMarketplace] Executed agent ".concat(agent.name, " in ").concat(responseTime, "ms"));
                        return [2 /*return*/, response.choices[0].message.content];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.error("[AgentMarketplace] Agent execution failed: ".concat(error_1.message));
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AgentMarketplace.prototype.searchAgents = function (query, category) {
        return __awaiter(this, void 0, void 0, function () {
            var allAgents;
            return __generator(this, function (_a) {
                allAgents = Array.from(this.agents.values());
                return [2 /*return*/, allAgents.filter(function (agent) {
                        var matchesQuery = !query ||
                            agent.name.toLowerCase().includes(query.toLowerCase()) ||
                            agent.description.toLowerCase().includes(query.toLowerCase()) ||
                            agent.tags.some(function (tag) { return tag.toLowerCase().includes(query.toLowerCase()); });
                        var matchesCategory = !category || agent.category === category;
                        return matchesQuery && matchesCategory;
                    }).sort(function (a, b) {
                        // Sort by rating, then usage
                        if (b.rating !== a.rating)
                            return b.rating - a.rating;
                        return b.usage - a.usage;
                    })];
            });
        });
    };
    AgentMarketplace.prototype.getAgentTemplates = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, __spreadArray([], this.templates, true)];
            });
        });
    };
    AgentMarketplace.prototype.createAgentFromTemplate = function (templateId, customizations) {
        return __awaiter(this, void 0, void 0, function () {
            var template, agent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        template = this.templates[templateId];
                        if (!template) {
                            throw new Error("Template not found: ".concat(templateId));
                        }
                        return [4 /*yield*/, this.createAgent(__assign({ name: template.name, description: template.description, category: template.category, creator: 'user', model: template.model, prompt: template.prompt, capabilities: template.capabilities, tags: [], price: 0.01 }, customizations))];
                    case 1:
                        agent = _a.sent();
                        return [2 /*return*/, agent];
                }
            });
        });
    };
    AgentMarketplace.prototype.rateAgent = function (agentId, rating) {
        return __awaiter(this, void 0, void 0, function () {
            var agent;
            return __generator(this, function (_a) {
                agent = this.agents.get(agentId);
                if (!agent) {
                    throw new Error("Agent not found: ".concat(agentId));
                }
                if (rating < 1 || rating > 5) {
                    throw new Error('Rating must be between 1 and 5');
                }
                // Update rating (simple average for now)
                agent.rating = (agent.rating * agent.usage + rating) / (agent.usage + 1);
                agent.updatedAt = new Date();
                this.logger.info("[AgentMarketplace] Rated agent ".concat(agent.name, ": ").concat(rating, "/5"));
                return [2 /*return*/];
            });
        });
    };
    AgentMarketplace.prototype.getPopularAgents = function (limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.agents.values())
                        .sort(function (a, b) { return b.usage - a.usage; })
                        .slice(0, limit)];
            });
        });
    };
    AgentMarketplace.prototype.getTopRatedAgents = function (limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.agents.values())
                        .filter(function (agent) { return agent.rating > 0; })
                        .sort(function (a, b) { return b.rating - a.rating; })
                        .slice(0, limit)];
            });
        });
    };
    AgentMarketplace.prototype.getAgentsByCategory = function (category) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.agents.values())
                        .filter(function (agent) { return agent.category === category; })
                        .sort(function (a, b) { return b.rating - a.rating; })];
            });
        });
    };
    AgentMarketplace.prototype.showAgentMarketplace = function () {
        return __awaiter(this, void 0, void 0, function () {
            var popularAgents, topRated, categories, categoryCounts, _i, categories_1, category, count, dashboard, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPopularAgents(5)];
                    case 1:
                        popularAgents = _a.sent();
                        return [4 /*yield*/, this.getTopRatedAgents(5)];
                    case 2:
                        topRated = _a.sent();
                        categories = Object.values(AgentCategory);
                        categoryCounts = [];
                        _i = 0, categories_1 = categories;
                        _a.label = 3;
                    case 3:
                        if (!(_i < categories_1.length)) return [3 /*break*/, 6];
                        category = categories_1[_i];
                        return [4 /*yield*/, this.getAgentsByCategory(category)];
                    case 4:
                        count = (_a.sent()).length;
                        categoryCounts.push("- **".concat(category, "**: ").concat(count, " agents"));
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        dashboard = "\n# \uD83E\uDD16 Smart Router Agent Marketplace\n\n## \uD83D\uDD25 Popular Agents\n".concat(popularAgents.map(function (agent, index) {
                            return "".concat(index + 1, ". **").concat(agent.name, "** (").concat(agent.category, ")\n     - Creator: ").concat(agent.creator, "\n     - Usage: ").concat(agent.usage, "\n     - Rating: ").concat(agent.rating.toFixed(1), "/5 \u2B50\n     - Price: $").concat(agent.price.toFixed(3), "/request\n     - Capabilities: ").concat(agent.capabilities.join(', '));
                        }).join('\n\n'), "\n\n## \u2B50 Top Rated Agents\n").concat(topRated.map(function (agent, index) {
                            return "".concat(index + 1, ". **").concat(agent.name, "** (").concat(agent.category, ")\n     - Rating: ").concat(agent.rating.toFixed(1), "/5 \u2B50 (").concat(agent.usage, " uses)\n     - Description: ").concat(agent.description, "\n     - Model: ").concat(agent.model);
                        }).join('\n\n'), "\n\n## \uD83D\uDCC2 Categories\n").concat(categoryCounts.join('\n'), "\n\n## \uD83C\uDFAF Available Templates\n").concat(this.templates.map(function (template, index) {
                            return "".concat(index + 1, ". **").concat(template.name, "**\n     - Category: ").concat(template.category, "\n     - Description: ").concat(template.description, "\n     - Model: ").concat(template.model);
                        }).join('\n'), "\n\n## \uD83D\uDCA1 Quick Actions\n- Create agent from template: `smart.createAgentFromTemplate <template_id>`\n- Search agents: `smart.searchAgents <query>`\n- Execute agent: `smart.executeAgent <agent_id> <input>`\n\n---\n*Agent Marketplace v2.8.0 - Community-driven AI agents*\n    ");
                        return [4 /*yield*/, vscode.workspace.openTextDocument({
                                content: dashboard,
                                language: 'markdown'
                            })];
                    case 7:
                        doc = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(doc)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AgentMarketplace;
}());
exports.AgentMarketplace = AgentMarketplace;
