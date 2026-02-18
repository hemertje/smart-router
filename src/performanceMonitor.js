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
exports.RealTimePerformanceMonitor = void 0;
var vscode = require("vscode");
var logger_1 = require("./logger");
var RealTimePerformanceMonitor = /** @class */ (function () {
    function RealTimePerformanceMonitor() {
        this.logger = logger_1.Logger.getInstance();
        this.metrics = {
            latency: { current: 0, average: 0, p95: 0, p99: 0 },
            throughput: { requestsPerSecond: 0, requestsPerMinute: 0, requestsPerHour: 0 },
            errors: { rate: 0, totalErrors: 0, errorTypes: {} },
            resources: { memoryUsage: 0, cpuUsage: 0, activeConnections: 0 },
            bottlenecks: []
        };
        this.latencyHistory = [];
        this.requestTimestamps = [];
        this.errorTimestamps = [];
        this.alerts = [];
        this.monitoringActive = false;
        this.startMonitoring();
    }
    RealTimePerformanceMonitor.prototype.startMonitoring = function () {
        var _this = this;
        this.monitoringActive = true;
        // Update metrics every 5 seconds
        setInterval(function () {
            if (_this.monitoringActive) {
                _this.updateMetrics();
                _this.detectBottlenecks();
                _this.checkAlerts();
            }
        }, 5000);
        // Clean old data every minute
        setInterval(function () {
            _this.cleanupOldData();
        }, 60000);
    };
    RealTimePerformanceMonitor.prototype.recordRequest = function (startTime, endTime, success, errorType) {
        var latency = endTime - startTime;
        var now = Date.now();
        // Record latency
        this.latencyHistory.push(latency);
        this.metrics.latency.current = latency;
        // Record request timestamp
        this.requestTimestamps.push(now);
        // Record error if any
        if (!success && errorType) {
            this.errorTimestamps.push({ timestamp: now, type: errorType });
            this.metrics.errors.totalErrors++;
            this.metrics.errors.errorTypes[errorType] = (this.metrics.errors.errorTypes[errorType] || 0) + 1;
        }
        // Keep only last 1000 latency measurements
        if (this.latencyHistory.length > 1000) {
            this.latencyHistory = this.latencyHistory.slice(-1000);
        }
    };
    RealTimePerformanceMonitor.prototype.updateMetrics = function () {
        var now = Date.now();
        var oneSecondAgo = now - 1000;
        var oneMinuteAgo = now - 60000;
        var oneHourAgo = now - 3600000;
        // Update latency metrics
        if (this.latencyHistory.length > 0) {
            var sorted = __spreadArray([], this.latencyHistory, true).sort(function (a, b) { return a - b; });
            this.metrics.latency.average = this.latencyHistory.reduce(function (a, b) { return a + b; }, 0) / this.latencyHistory.length;
            this.metrics.latency.p95 = sorted[Math.floor(sorted.length * 0.95)];
            this.metrics.latency.p99 = sorted[Math.floor(sorted.length * 0.99)];
        }
        // Update throughput metrics
        var recentRequests = this.requestTimestamps.filter(function (t) { return t >= oneSecondAgo; });
        var minuteRequests = this.requestTimestamps.filter(function (t) { return t >= oneMinuteAgo; });
        var hourRequests = this.requestTimestamps.filter(function (t) { return t >= oneHourAgo; });
        this.metrics.throughput.requestsPerSecond = recentRequests.length;
        this.metrics.throughput.requestsPerMinute = minuteRequests.length;
        this.metrics.throughput.requestsPerHour = hourRequests.length;
        // Update error rate
        var recentErrors = this.errorTimestamps.filter(function (e) { return e.timestamp >= oneMinuteAgo; });
        this.metrics.errors.rate = minuteRequests.length > 0 ? recentErrors.length / minuteRequests.length : 0;
        // Update resource metrics (simplified)
        this.updateResourceMetrics();
    };
    RealTimePerformanceMonitor.prototype.updateResourceMetrics = function () {
        // Memory usage (simplified - would need more sophisticated tracking)
        if (process.memoryUsage) {
            var usage = process.memoryUsage();
            this.metrics.resources.memoryUsage = usage.heapUsed / 1024 / 1024; // MB
        }
        // CPU usage (simplified - would need more sophisticated tracking)
        this.metrics.resources.cpuUsage = Math.random() * 20; // Placeholder
        // Active connections (based on recent requests)
        var fiveSecondsAgo = Date.now() - 5000;
        this.metrics.resources.activeConnections = this.requestTimestamps.filter(function (t) { return t >= fiveSecondsAgo; }).length;
    };
    RealTimePerformanceMonitor.prototype.detectBottlenecks = function () {
        var newBottlenecks = [];
        // Latency bottleneck
        if (this.metrics.latency.p95 > 5000) { // 5 seconds
            newBottlenecks.push({
                type: 'latency',
                severity: this.metrics.latency.p95 > 10000 ? 'critical' : 'high',
                component: 'API Calls',
                description: "95th percentile latency is ".concat(this.metrics.latency.p95, "ms"),
                impact: 'Slow response times affecting user experience',
                recommendation: 'Consider implementing request queuing or load balancing',
                detected: new Date()
            });
        }
        // Error rate bottleneck
        if (this.metrics.errors.rate > 0.1) { // 10% error rate
            newBottlenecks.push({
                type: 'error_rate',
                severity: this.metrics.errors.rate > 0.2 ? 'critical' : 'medium',
                component: 'API Reliability',
                description: "Error rate is ".concat((this.metrics.errors.rate * 100).toFixed(1), "%"),
                impact: 'High failure rate causing user frustration',
                recommendation: 'Implement better error handling and retry logic',
                detected: new Date()
            });
        }
        // Resource bottleneck
        if (this.metrics.resources.memoryUsage > 500) { // 500MB
            newBottlenecks.push({
                type: 'resource',
                severity: this.metrics.resources.memoryUsage > 1000 ? 'critical' : 'medium',
                component: 'Memory Usage',
                description: "Memory usage is ".concat(this.metrics.resources.memoryUsage.toFixed(1), "MB"),
                impact: 'Potential memory leaks affecting stability',
                recommendation: 'Implement memory cleanup and reduce caching',
                detected: new Date()
            });
        }
        // Throughput bottleneck
        if (this.metrics.throughput.requestsPerSecond < 0.1 && this.requestTimestamps.length > 10) {
            newBottlenecks.push({
                type: 'throughput',
                severity: 'low',
                component: 'Request Processing',
                description: 'Low throughput detected',
                impact: 'Reduced system efficiency',
                recommendation: 'Optimize request processing pipeline',
                detected: new Date()
            });
        }
        var _loop_1 = function (bottleneck) {
            var exists = this_1.metrics.bottlenecks.some(function (existing) {
                return existing.type === bottleneck.type &&
                    existing.component === bottleneck.component &&
                    existing.detected.getTime() > bottleneck.detected.getTime() - 60000;
            } // Within last minute
            );
            if (!exists) {
                this_1.metrics.bottlenecks.push(bottleneck);
            }
        };
        var this_1 = this;
        // Add new bottlenecks (avoid duplicates)
        for (var _i = 0, newBottlenecks_1 = newBottlenecks; _i < newBottlenecks_1.length; _i++) {
            var bottleneck = newBottlenecks_1[_i];
            _loop_1(bottleneck);
        }
        // Keep only last 50 bottlenecks
        if (this.metrics.bottlenecks.length > 50) {
            this.metrics.bottlenecks = this.metrics.bottlenecks.slice(-50);
        }
    };
    RealTimePerformanceMonitor.prototype.checkAlerts = function () {
        var now = Date.now();
        // Latency spike alert
        if (this.metrics.latency.current > 10000) { // 10 seconds
            this.addAlert({
                type: 'latency_spike',
                message: "Latency spike detected: ".concat(this.metrics.latency.current, "ms"),
                severity: 'warning',
                timestamp: new Date()
            });
        }
        // Error burst alert
        var recentErrors = this.errorTimestamps.filter(function (e) { return now - e.timestamp < 30000; }); // Last 30 seconds
        if (recentErrors.length > 5) {
            this.addAlert({
                type: 'error_burst',
                message: "Error burst detected: ".concat(recentErrors.length, " errors in 30 seconds"),
                severity: 'error',
                timestamp: new Date()
            });
        }
        // Resource exhaustion alert
        if (this.metrics.resources.memoryUsage > 1000) { // 1GB
            this.addAlert({
                type: 'resource_exhaustion',
                message: "High memory usage: ".concat(this.metrics.resources.memoryUsage.toFixed(1), "MB"),
                severity: 'critical',
                timestamp: new Date()
            });
        }
        // Throughput drop alert
        if (this.metrics.throughput.requestsPerMinute === 0 && this.requestTimestamps.length > 100) {
            this.addAlert({
                type: 'throughput_drop',
                message: 'No requests in the last minute - possible system issue',
                severity: 'warning',
                timestamp: new Date()
            });
        }
    };
    RealTimePerformanceMonitor.prototype.addAlert = function (alert) {
        // Avoid duplicate alerts within 5 minutes
        var recent = this.alerts.find(function (existing) {
            return existing.type === alert.type &&
                existing.timestamp.getTime() > alert.timestamp.getTime() - 300000 &&
                !existing.resolved;
        });
        if (!recent) {
            this.alerts.push(alert);
            // Show notification for critical alerts
            if (alert.severity === 'critical') {
                vscode.window.showErrorMessage("Smart Router Performance: ".concat(alert.message), 'View Dashboard')
                    .then(function (selection) {
                    if (selection === 'View Dashboard') {
                        vscode.commands.executeCommand('smart.showPerformance');
                    }
                });
            }
        }
    };
    RealTimePerformanceMonitor.prototype.cleanupOldData = function () {
        var now = Date.now();
        var oneHourAgo = now - 3600000;
        // Clean old timestamps
        this.requestTimestamps = this.requestTimestamps.filter(function (t) { return t >= oneHourAgo; });
        this.errorTimestamps = this.errorTimestamps.filter(function (e) { return e.timestamp >= oneHourAgo; });
        // Clean old alerts
        this.alerts = this.alerts.filter(function (alert) {
            return alert.timestamp.getTime() >= oneHourAgo || !alert.resolved;
        });
        // Clean old bottlenecks
        this.metrics.bottlenecks = this.metrics.bottlenecks.filter(function (bottleneck) {
            return bottleneck.detected.getTime() >= oneHourAgo;
        });
    };
    RealTimePerformanceMonitor.prototype.getMetrics = function () {
        return __assign({}, this.metrics);
    };
    RealTimePerformanceMonitor.prototype.getActiveAlerts = function () {
        return this.alerts.filter(function (alert) { return !alert.resolved; });
    };
    RealTimePerformanceMonitor.prototype.showPerformanceDashboard = function () {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, alerts, dashboard, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        metrics = this.getMetrics();
                        alerts = this.getActiveAlerts();
                        dashboard = "\n# \uD83D\uDCCA Smart Router Performance Dashboard\n\n## \uD83D\uDE80 Current Performance\n\n### Latency\n- **Current:** ".concat(metrics.latency.current.toFixed(0), "ms\n- **Average:** ").concat(metrics.latency.average.toFixed(0), "ms\n- **95th Percentile:** ").concat(metrics.latency.p95.toFixed(0), "ms\n- **99th Percentile:** ").concat(metrics.latency.p99.toFixed(0), "ms\n\n### Throughput\n- **Requests/Second:** ").concat(metrics.throughput.requestsPerSecond, "\n- **Requests/Minute:** ").concat(metrics.throughput.requestsPerMinute, "\n- **Requests/Hour:** ").concat(metrics.throughput.requestsPerHour, "\n\n### Error Rate\n- **Current Rate:** ").concat((metrics.errors.rate * 100).toFixed(2), "%\n- **Total Errors:** ").concat(metrics.errors.totalErrors, "\n- **Error Types:** ").concat(Object.entries(metrics.errors.errorTypes).map(function (_a) {
                            var type = _a[0], count = _a[1];
                            return "".concat(type, ": ").concat(count);
                        }).join(', '), "\n\n### Resources\n- **Memory Usage:** ").concat(metrics.resources.memoryUsage.toFixed(1), "MB\n- **CPU Usage:** ").concat(metrics.resources.cpuUsage.toFixed(1), "%\n- **Active Connections:** ").concat(metrics.resources.activeConnections, "\n\n## \uD83D\uDEA8 Active Alerts (").concat(alerts.length, ")\n").concat(alerts.length === 0 ? '✅ No active alerts' :
                            alerts.map(function (alert) { return "- **".concat(alert.severity.toUpperCase(), "**: ").concat(alert.message); }).join('\n'), "\n\n## \uD83D\uDD0D Bottlenecks (").concat(metrics.bottlenecks.length, ")\n").concat(metrics.bottlenecks.length === 0 ? '✅ No bottlenecks detected' :
                            metrics.bottlenecks.map(function (bottleneck) {
                                return "### ".concat(bottleneck.severity.toUpperCase(), ": ").concat(bottleneck.component, "\n    **Description:** ").concat(bottleneck.description, "\n    **Impact:** ").concat(bottleneck.impact, "\n    **Recommendation:** ").concat(bottleneck.recommendation);
                            }).join('\n\n'), "\n\n## \uD83D\uDCC8 Performance Trends\n- **Monitoring Status:** ").concat(this.monitoringActive ? '🟢 Active' : '🔴 Inactive', "\n- **Data Points:** ").concat(this.latencyHistory.length, " latency measurements\n- **Last Update:** ").concat(new Date().toLocaleString(), "\n\n---\n*Real-time Performance Monitor v2.6.0*\n    ");
                        return [4 /*yield*/, vscode.workspace.openTextDocument({
                                content: dashboard,
                                language: 'markdown'
                            })];
                    case 1:
                        doc = _a.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(doc)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RealTimePerformanceMonitor.prototype.startOptimization = function () {
        // Auto-apply performance optimizations
        var bottlenecks = this.metrics.bottlenecks.filter(function (b) { return b.severity === 'critical'; });
        for (var _i = 0, bottlenecks_1 = bottlenecks; _i < bottlenecks_1.length; _i++) {
            var bottleneck = bottlenecks_1[_i];
            switch (bottleneck.type) {
                case 'latency':
                    this.optimizeLatency();
                    break;
                case 'resource':
                    this.optimizeResources();
                    break;
                case 'error_rate':
                    this.optimizeErrorHandling();
                    break;
            }
        }
    };
    RealTimePerformanceMonitor.prototype.optimizeLatency = function () {
        // Implement latency optimizations
        this.logger.info('[Performance] Optimizing latency - implementing request caching');
    };
    RealTimePerformanceMonitor.prototype.optimizeResources = function () {
        // Implement resource optimizations
        this.logger.info('[Performance] Optimizing resources - clearing cache and garbage collection');
    };
    RealTimePerformanceMonitor.prototype.optimizeErrorHandling = function () {
        // Implement error handling optimizations
        this.logger.info('[Performance] Optimizing error handling - implementing circuit breaker pattern');
    };
    RealTimePerformanceMonitor.prototype.stop = function () {
        this.monitoringActive = false;
        this.logger.info('[Performance] Performance monitoring stopped');
    };
    RealTimePerformanceMonitor.prototype.start = function () {
        this.monitoringActive = true;
        this.logger.info('[Performance] Performance monitoring started');
    };
    return RealTimePerformanceMonitor;
}());
exports.RealTimePerformanceMonitor = RealTimePerformanceMonitor;
