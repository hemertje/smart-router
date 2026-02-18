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
exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var Logger = /** @class */ (function () {
    function Logger() {
        this.logs = [];
        this.maxLogSize = 1000;
        this.outputChannel = null;
    }
    Logger.getInstance = function () {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    };
    Logger.prototype.setOutputChannel = function (channel) {
        this.outputChannel = channel;
    };
    Logger.prototype.log = function (level, message, context, error) {
        var entry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            context: context,
            error: error
        };
        this.logs.push(entry);
        // Keep only the last maxLogSize entries
        if (this.logs.length > this.maxLogSize) {
            this.logs = this.logs.slice(-this.maxLogSize);
        }
        // Output to VS Code channel if available
        if (this.outputChannel) {
            var levelStr = LogLevel[level];
            var logLine = "[".concat(entry.timestamp, "] ").concat(levelStr, ": ").concat(message);
            if (context) {
                this.outputChannel.appendLine(logLine);
                this.outputChannel.appendLine("Context: ".concat(JSON.stringify(context, null, 2)));
            }
            else {
                this.outputChannel.appendLine(logLine);
            }
            if (error) {
                this.outputChannel.appendLine("Error: ".concat(error.message));
                this.outputChannel.appendLine("Stack: ".concat(error.stack));
            }
        }
        // Also log to console for debugging
        var consoleMethod = level >= LogLevel.ERROR ? console.error :
            level >= LogLevel.WARN ? console.warn :
                level >= LogLevel.INFO ? console.info : console.debug;
        consoleMethod("[Smart Router] ".concat(message), context || '', error || '');
    };
    Logger.prototype.debug = function (message, context) {
        this.log(LogLevel.DEBUG, message, context);
    };
    Logger.prototype.info = function (message, context) {
        this.log(LogLevel.INFO, message, context);
    };
    Logger.prototype.warn = function (message, context) {
        this.log(LogLevel.WARN, message, context);
    };
    Logger.prototype.error = function (message, error, context) {
        this.log(LogLevel.ERROR, message, context, error);
    };
    Logger.prototype.getLogs = function (level, limit) {
        var filteredLogs = this.logs;
        if (level !== undefined) {
            filteredLogs = this.logs.filter(function (log) { return log.level >= level; });
        }
        if (limit) {
            filteredLogs = filteredLogs.slice(-limit);
        }
        return filteredLogs;
    };
    Logger.prototype.clearLogs = function () {
        this.logs = [];
        if (this.outputChannel) {
            this.outputChannel.clear();
        }
    };
    Logger.prototype.exportLogs = function () {
        return JSON.stringify(this.logs, null, 2);
    };
    // Performance logging
    Logger.prototype.logPerformance = function (operation, duration, context) {
        this.info("Performance: ".concat(operation, " completed in ").concat(duration.toFixed(2), "ms"), __assign({ operation: operation, duration: duration }, context));
    };
    // API logging
    Logger.prototype.logApiCall = function (model, tokens, cost, duration) {
        this.info("API Call: ".concat(model), {
            model: model,
            tokens: tokens,
            cost: cost,
            duration: duration,
            costPerToken: cost / tokens
        });
    };
    // Classification logging
    Logger.prototype.logClassification = function (query, intent, confidence, method) {
        this.debug("Classification: ".concat(intent), {
            query: query.substring(0, 100),
            intent: intent,
            confidence: confidence,
            method: method
        });
    };
    return Logger;
}());
exports.Logger = Logger;
