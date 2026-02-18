"use strict";
exports.__esModule = true;
exports.MetricsCollector = void 0;
var MetricsCollector = /** @class */ (function () {
    function MetricsCollector() {
        this.metrics = [];
        this.maxMetrics = 10000; // Keep last 10k requests
    }
    MetricsCollector.prototype.recordRequest = function (metric) {
        this.metrics.push(metric);
        // Keep only the last maxMetrics entries
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
    };
    MetricsCollector.prototype.getMetrics = function () {
        if (this.metrics.length === 0) {
            return {
                totalRequests: 0,
                totalCost: 0,
                averageResponseTime: 0,
                intentDistribution: {},
                modelDistribution: {},
                errorRate: 0,
                dailyStats: {},
                hourlyStats: {}
            };
        }
        var now = new Date();
        var thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        // Filter metrics from last 30 days
        var recentMetrics = this.metrics.filter(function (m) {
            return new Date(m.timestamp) >= thirtyDaysAgo;
        });
        var totalRequests = recentMetrics.length;
        var successfulRequests = recentMetrics.filter(function (m) { return m.success; }).length;
        var totalCost = recentMetrics.reduce(function (sum, m) { return sum + m.cost; }, 0);
        var totalResponseTime = recentMetrics.reduce(function (sum, m) { return sum + m.responseTime; }, 0);
        var averageResponseTime = totalResponseTime / totalRequests;
        var errorRate = (totalRequests - successfulRequests) / totalRequests;
        // Intent distribution
        var intentDistribution = recentMetrics.reduce(function (acc, m) {
            acc[m.intent] = (acc[m.intent] || 0) + 1;
            return acc;
        }, {});
        // Model distribution
        var modelDistribution = recentMetrics.reduce(function (acc, m) {
            acc[m.model] = (acc[m.model] || 0) + 1;
            return acc;
        }, {});
        // Daily stats
        var dailyStats = recentMetrics.reduce(function (acc, m) {
            var date = m.timestamp.split('T')[0];
            if (!acc[date]) {
                acc[date] = {
                    date: date,
                    requests: 0,
                    cost: 0,
                    averageResponseTime: 0,
                    errors: 0
                };
            }
            acc[date].requests++;
            acc[date].cost += m.cost;
            acc[date].errors += m.success ? 0 : 1;
            return acc;
        }, {});
        // Calculate average response times per day
        Object.keys(dailyStats).forEach(function (date) {
            var dayMetrics = recentMetrics.filter(function (m) { return m.timestamp.startsWith(date); });
            var dayResponseTime = dayMetrics.reduce(function (sum, m) { return sum + m.responseTime; }, 0);
            dailyStats[date].averageResponseTime = dayResponseTime / dayMetrics.length;
        });
        // Hourly stats (last 24 hours)
        var twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        var recentHourlyMetrics = this.metrics.filter(function (m) {
            return new Date(m.timestamp) >= twentyFourHoursAgo;
        });
        var hourlyStats = recentHourlyMetrics.reduce(function (acc, m) {
            var hour = m.timestamp.substring(0, 13); // YYYY-MM-DDTHH
            if (!acc[hour]) {
                acc[hour] = {
                    hour: hour,
                    requests: 0,
                    cost: 0,
                    averageResponseTime: 0,
                    errors: 0
                };
            }
            acc[hour].requests++;
            acc[hour].cost += m.cost;
            acc[hour].errors += m.success ? 0 : 1;
            return acc;
        }, {});
        // Calculate average response times per hour
        Object.keys(hourlyStats).forEach(function (hour) {
            var hourMetrics = recentHourlyMetrics.filter(function (m) { return m.timestamp.startsWith(hour); });
            var hourResponseTime = hourMetrics.reduce(function (sum, m) { return sum + m.responseTime; }, 0);
            hourlyStats[hour].averageResponseTime = hourResponseTime / hourMetrics.length;
        });
        return {
            totalRequests: totalRequests,
            totalCost: totalCost,
            averageResponseTime: averageResponseTime,
            intentDistribution: intentDistribution,
            modelDistribution: modelDistribution,
            errorRate: errorRate,
            dailyStats: dailyStats,
            hourlyStats: hourlyStats
        };
    };
    MetricsCollector.prototype.getTopIntents = function (limit) {
        if (limit === void 0) { limit = 10; }
        var metrics = this.getMetrics();
        var sorted = Object.entries(metrics.intentDistribution)
            .sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return b - a;
        })
            .slice(0, limit)
            .map(function (_a) {
            var intent = _a[0], count = _a[1];
            return ({
                intent: intent,
                count: count,
                percentage: (count / metrics.totalRequests) * 100
            });
        });
        return sorted;
    };
    MetricsCollector.prototype.getTopModels = function (limit) {
        if (limit === void 0) { limit = 10; }
        var metrics = this.getMetrics();
        var sorted = Object.entries(metrics.modelDistribution)
            .sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return b - a;
        })
            .slice(0, limit)
            .map(function (_a) {
            var model = _a[0], count = _a[1];
            return ({
                model: model,
                count: count,
                percentage: (count / metrics.totalRequests) * 100
            });
        });
        return sorted;
    };
    MetricsCollector.prototype.getCostTrend = function (days) {
        if (days === void 0) { days = 7; }
        var metrics = this.getMetrics();
        var sortedDates = Object.keys(metrics.dailyStats)
            .sort()
            .slice(-days);
        return sortedDates.map(function (date) { return ({
            date: date,
            cost: metrics.dailyStats[date].cost,
            requests: metrics.dailyStats[date].requests
        }); });
    };
    MetricsCollector.prototype.getPerformanceReport = function () {
        var metrics = this.getMetrics();
        return "\n\uD83D\uDCCA **Smart Router Performance Report**\n\n**Overall Metrics:**\n- Total Requests: ".concat(metrics.totalRequests, "\n- Total Cost: $").concat(metrics.totalCost.toFixed(2), "\n- Average Response Time: ").concat(metrics.averageResponseTime.toFixed(2), "ms\n- Error Rate: ").concat((metrics.errorRate * 100).toFixed(2), "%\n\n**Top Intents:**\n").concat(this.getTopIntents(5).map(function (_a) {
            var intent = _a.intent, count = _a.count, percentage = _a.percentage;
            return "- ".concat(intent, ": ").concat(count, " (").concat(percentage.toFixed(1), "%)");
        }).join('\n'), "\n\n**Top Models:**\n").concat(this.getTopModels(5).map(function (_a) {
            var model = _a.model, count = _a.count, percentage = _a.percentage;
            return "- ".concat(model, ": ").concat(count, " (").concat(percentage.toFixed(1), "%)");
        }).join('\n'), "\n\n**Recent Daily Costs (Last 7 Days):**\n").concat(this.getCostTrend(7).map(function (_a) {
            var date = _a.date, cost = _a.cost, requests = _a.requests;
            return "- ".concat(date, ": $").concat(cost.toFixed(2), " (").concat(requests, " requests)");
        }).join('\n'), "\n    ").trim();
    };
    MetricsCollector.prototype.exportMetrics = function () {
        return JSON.stringify(this.getMetrics(), null, 2);
    };
    MetricsCollector.prototype.clearMetrics = function () {
        this.metrics = [];
    };
    return MetricsCollector;
}());
exports.MetricsCollector = MetricsCollector;
