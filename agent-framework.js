/**
 * Smart Router Agent Framework
 * Multi-Agent Orchestration for AI Development
 */

class AgentFramework {
  constructor() {
    this.agents = new Map();
    this.capabilities = new Map();
    this.performance = new Map();
    this.context = new ContextManager();
  }

  // Register new AI agent
  registerAgent(name, agent, capabilities) {
    this.agents.set(name, agent);
    this.capabilities.set(name, capabilities);
    this.performance.set(name, {
      tasks: 0,
      success: 0,
      avgLatency: 0,
      userSatisfaction: 0
    });
    
    console.log(`🤖 Agent ${name} registered with capabilities:`, capabilities);
  }

  // Select best agent for task
  async selectBestAgent(task, context) {
    const taskType = this.analyzeTaskType(task);
    const candidates = this.getCandidatesForTask(taskType);
    
    let bestAgent = null;
    let bestScore = -1;
    
    for (const agentName of candidates) {
      const score = await this.calculateAgentScore(agentName, task, context);
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agentName;
      }
    }
    
    console.log(`🎯 Selected agent ${bestAgent} with score ${bestScore}`);
    return bestAgent;
  }

  // Execute task with selected agent
  async executeTask(task, context = {}) {
    // 1. Analyze task
    const taskAnalysis = this.context.analyzeTask(task);
    
    // 2. Select best agent
    const agentName = await this.selectBestAgent(task, taskAnalysis);
    
    // 3. Execute with agent
    const agent = this.agents.get(agentName);
    const startTime = Date.now();
    
    try {
      const result = await agent.execute(task, {
        ...context,
        taskAnalysis,
        agentName
      });
      
      // 4. Update performance metrics
      const latency = Date.now() - startTime;
      this.updatePerformance(agentName, true, latency);
      
      return {
        success: true,
        result,
        agent: agentName,
        latency,
        confidence: result.confidence || 0.8
      };
      
    } catch (error) {
      this.updatePerformance(agentName, false, Date.now() - startTime);
      throw error;
    }
  }

  // Calculate agent score for task
  async calculateAgentScore(agentName, task, context) {
    const capabilities = this.capabilities.get(agentName);
    const performance = this.performance.get(agentName);
    
    let score = 0;
    
    // Capability match (40%)
    score += this.calculateCapabilityMatch(capabilities, task) * 0.4;
    
    // Historical performance (30%)
    score += this.calculatePerformanceScore(performance) * 0.3;
    
    // Context suitability (20%)
    score += this.calculateContextScore(agentName, context) * 0.2;
    
    // Current system state (10%)
    score += this.calculateSystemScore(agentName) * 0.1;
    
    return score;
  }

  // Analyze task type
  analyzeTaskType(task) {
    const content = task.content || task.message || '';
    
    // Code generation - more specific patterns
    if (/\b(function|class|const|let|var|def|import|export|=>)\b/.test(content) ||
        /\b(write|create|implement|build|generate)\s+\b(code|function|class|method)\b/i.test(content)) {
      return 'code-generation';
    }
    
    // Debugging - more specific patterns
    if (/\b(error|bug|exception|issue|problem|debug|fix|troubleshoot)\b/i.test(content) ||
        /\b(failed|failing|crash|broken|not working|undefined|null)\b/i.test(content)) {
      return 'debugging';
    }
    
    // Documentation - more specific patterns
    if (/\b(document|explain|comment|describe|summary|readme|guide)\b/i.test(content) ||
        /\b(documentation|docs|comments|explanation|description)\b/i.test(content)) {
      return 'documentation';
    }
    
    // Analysis - more specific patterns
    if (/\b(analyze|review|check|validate|verify|examine|inspect)\b/i.test(content) ||
        /\b(analysis|review|audit|assessment|evaluation)\b/i.test(content)) {
      return 'analysis';
    }
    
    // Refactoring - more specific patterns
    if (/\b(refactor|improve|optimize|enhance|rewrite|restructure)\b/i.test(content) ||
        /\b(better|faster|cleaner|more efficient)\b.*\b(code|function|method)\b/i.test(content)) {
      return 'refactoring';
    }
    
    return 'general';
  }

  // Get candidates for task type
  getCandidatesForTask(taskType) {
    const candidates = [];
    
    for (const [agentName, capabilities] of this.capabilities) {
      if (capabilities.taskTypes.includes(taskType) || capabilities.taskTypes.includes('general')) {
        candidates.push(agentName);
      }
    }
    
    return candidates.length > 0 ? candidates : Array.from(this.agents.keys());
  }

  // Calculate capability match
  calculateCapabilityMatch(capabilities, task) {
    const taskType = this.analyzeTaskType(task);
    const taskComplexity = this.estimateTaskComplexity(task);
    
    let match = 0;
    
    // Task type match
    if (capabilities.taskTypes.includes(taskType)) {
      match += 0.8;
    } else if (capabilities.taskTypes.includes('general')) {
      match += 0.4;
    }
    
    // Complexity match
    if (capabilities.maxComplexity >= taskComplexity) {
      match += 0.2;
    }
    
    return Math.min(match, 1.0);
  }

  // Calculate performance score
  calculatePerformanceScore(performance) {
    if (performance.tasks === 0) return 0.5; // Neutral for new agents
    
    const successRate = performance.success / performance.tasks;
    const latencyScore = Math.max(0, 1 - (performance.avgLatency / 10000)); // 10s max
    const satisfactionScore = performance.userSatisfaction;
    
    return (successRate * 0.4 + latencyScore * 0.3 + satisfactionScore * 0.3);
  }

  // Calculate context score
  calculateContextScore(agentName, context) {
    const capabilities = this.capabilities.get(agentName);
    
    // Battery optimization for MacBook
    if (context.batteryLevel && context.batteryLevel < 20) {
      // Strongly prefer battery-optimized agents
      if (capabilities.batteryOptimized) {
        return 0.9; // Very high score for battery optimization
      } else {
        return 0.3; // Low score for non-battery optimized
      }
    }
    
    // Thermal management
    if (context.thermalState === 'high') {
      if (capabilities.thermalEfficient) {
        return 0.8; // High score for thermal efficiency
      } else {
        return 0.4; // Lower score for non-thermal efficient
      }
    }
    
    return 0.7; // Neutral baseline
  }

  // Calculate system score
  calculateSystemScore(agentName) {
    // Current load balancing
    const performance = this.performance.get(agentName);
    const avgTasks = Array.from(this.performance.values())
      .reduce((sum, p) => sum + p.tasks, 0) / this.performance.size;
    
    // Prefer less loaded agents
    if (performance.tasks < avgTasks) {
      return 0.8;
    } else if (performance.tasks > avgTasks * 1.5) {
      return 0.4;
    }
    
    return 0.6;
  }

  // Update performance metrics
  updatePerformance(agentName, success, latency) {
    const performance = this.performance.get(agentName);
    
    performance.tasks++;
    if (success) {
      performance.success++;
    }
    
    // Update average latency
    performance.avgLatency = (performance.avgLatency * (performance.tasks - 1) + latency) / performance.tasks;
  }

  // Estimate task complexity
  estimateTaskComplexity(task) {
    const content = task.content || task.message || '';
    
    // Simple heuristic
    let complexity = 1;
    
    complexity += content.length / 1000; // Length factor
    complexity += (content.match(/\bfunction\b/g) || []).length * 0.5;
    complexity += (content.match(/\bclass\b/g) || []).length * 0.3;
    complexity += (content.match(/\bif\b/g) || []).length * 0.1;
    complexity += (content.match(/\bfor\b/g) || []).length * 0.1;
    complexity += (content.match(/\bwhile\b/g) || []).length * 0.1;
    
    return Math.min(complexity, 10); // Max complexity 10
  }

  // Get agent statistics
  getAgentStats() {
    const stats = {};
    
    for (const [name, performance] of this.performance) {
      stats[name] = {
        ...performance,
        successRate: performance.tasks > 0 ? performance.success / performance.tasks : 0,
        capabilities: this.capabilities.get(name)
      };
    }
    
    return stats;
  }
}

// Context Manager for deep context analysis
class ContextManager {
  constructor() {
    this.projectContext = new Map();
    this.userPreferences = new Map();
    this.sessionHistory = [];
  }

  analyzeTask(task) {
    return {
      taskType: this.analyzeTaskType(task),
      complexity: this.estimateComplexity(task),
      domain: this.identifyDomain(task),
      urgency: this.assessUrgency(task),
      context: this.gatherContext(task)
    };
  }

  analyzeTaskType(task) {
    const content = task.content || task.message || '';
    
    const patterns = {
      'code-generation': /\b(function|class|const|let|var|def|import|export)\b/,
      'debugging': /\b(error|bug|exception|issue|problem|debug|fix)\b/,
      'documentation': /\b(document|explain|comment|describe|summary)\b/,
      'analysis': /\b(analyze|review|check|validate|verify)\b/,
      'refactoring': /\b(refactor|improve|optimize|enhance|rewrite)\b/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(content)) {
        return type;
      }
    }
    
    return 'general';
  }

  estimateComplexity(task) {
    const content = task.content || task.message || '';
    
    // Complexity factors
    const factors = {
      length: content.length / 1000,
      functions: (content.match(/\bfunction\b/g) || []).length * 0.5,
      classes: (content.match(/\bclass\b/g) || []).length * 0.3,
      conditionals: (content.match(/\b(if|else|switch)\b/g) || []).length * 0.1,
      loops: (content.match(/\b(for|while|do)\b/g) || []).length * 0.1,
      imports: (content.match(/\b(import|require|include)\b/g) || []).length * 0.2
    };
    
    const complexity = Object.values(factors).reduce((sum, factor) => sum + factor, 1);
    return Math.min(complexity, 10);
  }

  identifyDomain(task) {
    const content = task.content || task.message || '';
    
    const domains = {
      'web': /\b(html|css|javascript|react|vue|angular|node|express)\b/,
      'mobile': /\b(ios|android|swift|kotlin|react-native|flutter)\b/,
      'ai': /\b(ai|machine|learning|neural|model|training|inference)\b/,
      'data': /\b(database|sql|nosql|mongodb|postgresql|redis)\b/,
      'devops': /\b(docker|kubernetes|ci|cd|deploy|pipeline)\b/
    };
    
    for (const [domain, pattern] of Object.entries(domains)) {
      if (pattern.test(content)) {
        return domain;
      }
    }
    
    return 'general';
  }

  assessUrgency(task) {
    const content = task.content || task.message || '';
    
    const urgentPatterns = [
      /\burgent\b/i,
      /\basap\b/i,
      /\bimmediate\b/i,
      /\bcritical\b/i,
      /\bblocker\b/i
    ];
    
    return urgentPatterns.some(pattern => pattern.test(content)) ? 'high' : 'normal';
  }

  gatherContext(task) {
    return {
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      recentTasks: this.getRecentTasks(),
      projectState: this.getProjectState(),
      userPreferences: this.getUserPreferences()
    };
  }

  getSessionId() {
    return 'session-' + Date.now();
  }

  getRecentTasks() {
    return this.sessionHistory.slice(-5);
  }

  getProjectState() {
    // This would integrate with project analysis
    return {
      language: 'javascript',
      framework: 'node',
      testCoverage: 85,
      lastModified: new Date().toISOString()
    };
  }

  getUserPreferences() {
    return {
      preferredStyle: 'functional',
      codeStyle: 'es6+',
      documentationLevel: 'detailed'
    };
  }
}

module.exports = { AgentFramework, ContextManager };
