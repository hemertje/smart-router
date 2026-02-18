"use strict";
exports.__esModule = true;
exports.IntentClassifier = void 0;
var models_1 = require("./models");
var PATTERNS = {
    simple: [
        'git', 'status', 'ls', 'cd', 'help', 'what is', 'list', 'show',
        'check', 'verify', 'tell me', 'explain', 'describe'
    ],
    code_gen: [
        'create', 'generate', 'implement', 'add', 'build', 'write',
        'make', 'develop', 'code', 'function', 'class', 'api'
    ],
    debug: [
        'why', 'error', 'not working', 'failed', 'broken', 'issue',
        'problem', 'fix', 'debug', 'troubleshoot', 'wrong'
    ],
    architecture: [
        'design', 'plan', 'should', 'architecture', 'structure',
        'pattern', 'approach', 'strategy', 'best practice', 'organize'
    ]
};
var IntentClassifier = /** @class */ (function () {
    function IntentClassifier() {
    }
    IntentClassifier.prototype.classify = function (query) {
        var lowerQuery = query.toLowerCase();
        // Handle empty query
        if (!lowerQuery || lowerQuery.trim() === '') {
            return 'simple';
        }
        // Count matches for each intent
        var scores = {
            simple: this.countMatches(lowerQuery, PATTERNS.simple),
            code_gen: this.countMatches(lowerQuery, PATTERNS.code_gen),
            debug: this.countMatches(lowerQuery, PATTERNS.debug),
            architecture: this.countMatches(lowerQuery, PATTERNS.architecture),
            architecture_screening: 0,
            architecture_screening_alt: 0,
            architecture_premium: 0 // Not used in direct classification
        };
        // Find intent with highest score
        var bestIntent = Object.entries(scores).reduce(function (a, b) {
            return scores[a[0]] > scores[b[0]] ? a : b;
        })[0];
        // If no patterns matched, default to simple
        if (scores[bestIntent] === 0) {
            return 'simple';
        }
        return bestIntent;
    };
    IntentClassifier.prototype.countMatches = function (query, patterns) {
        return patterns.reduce(function (count, pattern) {
            return query.includes(pattern) ? count + 1 : count;
        }, 0);
    };
    IntentClassifier.prototype.getRouting = function (intent) {
        return {
            intent: intent,
            config: models_1.MODEL_ROUTING[intent],
            confidence: 0.7 // Rule-based confidence
        };
    };
    return IntentClassifier;
}());
exports.IntentClassifier = IntentClassifier;
