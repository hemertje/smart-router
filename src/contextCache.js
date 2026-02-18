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
exports.__esModule = true;
exports.ContextCache = void 0;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var logger_1 = require("./logger");
var ContextCache = /** @class */ (function () {
    function ContextCache(maxEntries, maxAge) {
        if (maxEntries === void 0) { maxEntries = 1000; }
        if (maxAge === void 0) { maxAge = 24 * 60 * 60 * 1000; }
        this.cache = new Map();
        this.logger = logger_1.Logger.getInstance();
        this.maxEntries = maxEntries;
        this.maxAge = maxAge;
        this.cacheFile = path.join(vscode.workspace.rootPath || '', '.vscode', 'smart-router-cache.json');
        this.loadCache();
    }
    /**
     * Voeg context entry toe
     */
    ContextCache.prototype.add = function (entry) {
        var id = this.generateId();
        var fullEntry = __assign(__assign({}, entry), { id: id, timestamp: Date.now() });
        var key = this.getCacheKey(entry.projectId, entry.workspaceId);
        var entries = this.cache.get(key) || [];
        // Voeg nieuwe entry toe
        entries.push(fullEntry);
        // Limit aantal entries
        if (entries.length > this.maxEntries) {
            entries.shift(); // Verwijder oudste
        }
        this.cache.set(key, entries);
        this.saveCache();
        this.logger.info("[Context Cache] Entry toegevoegd: ".concat(id));
    };
    /**
     * Get context voor een project/workspace
     */
    ContextCache.prototype.getContext = function (projectId, workspaceId, limit) {
        var _this = this;
        if (limit === void 0) { limit = 10; }
        var key = this.getCacheKey(projectId, workspaceId);
        var entries = this.cache.get(key) || [];
        // Filter op leeftijd
        var now = Date.now();
        var validEntries = entries.filter(function (e) { return now - e.timestamp < _this.maxAge; });
        // Sorteer op timestamp (nieuwste eerst)
        validEntries.sort(function (a, b) { return b.timestamp - a.timestamp; });
        return validEntries.slice(0, limit);
    };
    /**
     * Get relevante context voor query
     */
    ContextCache.prototype.getRelevantContext = function (query, projectId, workspaceId) {
        var _this = this;
        var context = this.getContext(projectId, workspaceId, 50);
        // Simple relevance scoring based on keyword overlap
        var queryWords = query.toLowerCase().split(/\s+/);
        return context
            .map(function (entry) { return ({
            entry: entry,
            score: _this.calculateRelevance(entry, queryWords)
        }); })
            .filter(function (item) { return item.score > 0; })
            .sort(function (a, b) { return b.score - a.score; })
            .slice(0, 5)
            .map(function (item) { return item.entry; });
    };
    /**
     * Clear cache voor project/workspace
     */
    ContextCache.prototype.clear = function (projectId, workspaceId) {
        var key = this.getCacheKey(projectId, workspaceId);
        this.cache["delete"](key);
        this.saveCache();
        this.logger.info("[Context Cache] Cache geleegd voor: ".concat(key));
    };
    /**
     * Clear alle cache
     */
    ContextCache.prototype.clearAll = function () {
        this.cache.clear();
        this.saveCache();
        this.logger.info('[Context Cache] Alle cache geleegd');
    };
    /**
     * Get cache statistieken
     */
    ContextCache.prototype.getStats = function (projectId, workspaceId) {
        var entries = this.getContext(projectId, workspaceId);
        var totalCost = entries.reduce(function (sum, e) { return sum + e.cost; }, 0);
        var totalTokens = entries.reduce(function (sum, e) { return sum + (e.tokens || 0); }, 0);
        // Intent breakdown
        var mostUsedIntents = {};
        entries.forEach(function (e) {
            mostUsedIntents[e.intent] = (mostUsedIntents[e.intent] || 0) + 1;
        });
        return {
            totalEntries: entries.length,
            totalCost: totalCost,
            totalTokens: totalTokens,
            averageResponseTime: 0,
            mostUsedIntents: mostUsedIntents
        };
    };
    /**
     * Export context voor backup
     */
    ContextCache.prototype["export"] = function (projectId, workspaceId) {
        var entries = this.getContext(projectId, workspaceId);
        return JSON.stringify(entries, null, 2);
    };
    /**
     * Import context
     */
    ContextCache.prototype["import"] = function (data) {
        var _this = this;
        data.forEach(function (entry) {
            var key = _this.getCacheKey(entry.projectId, entry.workspaceId);
            var entries = _this.cache.get(key) || [];
            entries.push(entry);
            _this.cache.set(key, entries);
        });
        this.saveCache();
        this.logger.info("[Context Cache] ".concat(data.length, " entries ge\u00EFmporteerd"));
    };
    /**
     * Cleanup oude entries
     */
    ContextCache.prototype.cleanup = function () {
        var _this = this;
        var now = Date.now();
        var totalRemoved = 0;
        for (var _i = 0, _a = this.cache; _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], entries = _b[1];
            var validEntries = entries.filter(function (e) { return now - e.timestamp < _this.maxAge; });
            var removed = entries.length - validEntries.length;
            totalRemoved += removed;
            if (validEntries.length === 0) {
                this.cache["delete"](key);
            }
            else {
                this.cache.set(key, validEntries);
            }
        }
        if (totalRemoved > 0) {
            this.saveCache();
            this.logger.info("[Context Cache] Cleanup: ".concat(totalRemoved, " oude entries verwijderd"));
        }
    };
    /**
     * Genereer cache key
     */
    ContextCache.prototype.getCacheKey = function (projectId, workspaceId) {
        return "".concat(projectId || 'global', "-").concat(workspaceId || 'default');
    };
    /**
     * Genereer unieke ID
     */
    ContextCache.prototype.generateId = function () {
        return "ctx-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
    };
    /**
     * Bereken relevance score
     */
    ContextCache.prototype.calculateRelevance = function (entry, queryWords) {
        var entryWords = "".concat(entry.query, " ").concat(entry.response).toLowerCase().split(/\s+/);
        var score = 0;
        queryWords.forEach(function (word) {
            if (word.length > 2) { // Negeer korte woorden
                var matches = entryWords.filter(function (w) { return w.includes(word) || word.includes(w); }).length;
                score += matches;
            }
        });
        // Time decay (recentere entries zijn relevanter)
        var hoursOld = (Date.now() - entry.timestamp) / (1000 * 60 * 60);
        score *= Math.exp(-hoursOld / 24); // Halveer score elke 24 uur
        return score;
    };
    /**
     * Save cache naar file
     */
    ContextCache.prototype.saveCache = function () {
        try {
            var data = Array.from(this.cache.entries()).map(function (_a) {
                var key = _a[0], entries = _a[1];
                return ({
                    key: key,
                    entries: entries
                });
            });
            var dir = path.dirname(this.cacheFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
        }
        catch (error) {
            this.logger.error('[Context Cache] Failed to save cache', error);
        }
    };
    /**
     * Load cache van file
     */
    ContextCache.prototype.loadCache = function () {
        var _this = this;
        try {
            if (fs.existsSync(this.cacheFile)) {
                var data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
                data.forEach(function (item) {
                    _this.cache.set(item.key, item.entries);
                });
                this.logger.info("[Context Cache] Cache geladen: ".concat(this.cache.size, " keys"));
            }
        }
        catch (error) {
            this.logger.error('[Context Cache] Failed to load cache', error);
        }
    };
    return ContextCache;
}());
exports.ContextCache = ContextCache;
