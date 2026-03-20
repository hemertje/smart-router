#!/usr/bin/env node

/**
 * 🚀 Smart Router - Cursor Integration
 * 
 * Multi-model intelligent routing voor Cursor IDE op MacBook M5
 * Optimal performance en cost efficiency voor vibe coding
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import Agent Framework
const { AgentFramework, ContextManager } = require('./agent-framework');
const { AgentFactory } = require('./specialized-agents');

class SmartRouterCursorIntegration {
  constructor(port = 3000) {
    this.port = port;
    this.app = express();
    
    // Initialize Agent Framework
    this.agentFramework = new AgentFramework();
    this.contextManager = new ContextManager();
    
    // Initialize agents
    this.initializeAgents();
    
    // Enhanced models with agent capabilities
    this.models = {
      // Ultra-fast voor autocomplete
      'cursor-haiku': {
        model: 'claude-3-5-haiku-20241022',
        provider: 'anthropic',
        max_tokens: 128,
        temperature: 0.1,
        latency_target: 50, // ms
        cost_per_token: 0.00000025,
        use_case: 'autocomplete',
        m5_optimized: true
      },
      
      // Balanced voor code generation
      'cursor-sonnet': {
        model: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic',
        max_tokens: 4096,
        temperature: 0.3,
        latency_target: 500, // ms
        cost_per_token: 0.000003,
        use_case: 'code_generation',
        m5_optimized: true
      },
      
      // Premium voor complexe taken
      'cursor-opus': {
        model: 'claude-3-opus-20240229',
        provider: 'anthropic',
        max_tokens: 8192,
        temperature: 0.2,
        latency_target: 2000, // ms
        cost_per_token: 0.000015,
        use_case: 'complex_reasoning',
        m5_optimized: true
      },
      
      // Vision voor PDF/Image taken
      'cursor-vision': {
        model: 'gpt-4-vision-preview',
        provider: 'openai',
        max_tokens: 4096,
        temperature: 0.1,
        latency_target: 3000, // ms
        cost_per_token: 0.00001,
        use_case: 'vision_tasks',
        m5_optimized: true
      },
      
      // Cost-effective voor bulk taken
      'cursor-flash': {
        model: 'gemini-1.5-flash',
        provider: 'google',
        max_tokens: 2048,
        temperature: 0.2,
        latency_target: 200, // ms
        cost_per_token: 0.000000075,
        use_case: 'bulk_processing',
        m5_optimized: true
      }
    };
    
    // Intelligent routing rules
    this.routingRules = [
      {
        name: 'autocomplete',
        condition: (req) => req.task_type === 'autocomplete' || req.max_tokens <= 128,
        model: 'cursor-haiku',
        priority: 1
      },
      {
        name: 'code_generation',
        condition: (req) => req.task_type === 'code_generation' && req.complexity < 0.7,
        model: 'cursor-sonnet',
        priority: 2
      },
      {
        name: 'complex_reasoning',
        condition: (req) => req.complexity > 0.7 || req.task_type === 'refactoring',
        model: 'cursor-opus',
        priority: 3
      },
      {
        name: 'vision_tasks',
        condition: (req) => req.task_type === 'vision' || req.task_type === 'pdf_extraction',
        model: 'cursor-vision',
        priority: 4
      },
      {
        name: 'bulk_processing',
        condition: (req) => req.task_type === 'bulk' || req.budget < 0.005,
        model: 'cursor-flash',
        priority: 5
      }
    ];
    
    // Security & monitoring
    this.security = {
      enabled: true,
      sandboxMode: true,
      auditLogging: true,
      threatDetection: true,
      rateLimiting: true,
      maxRequestsPerMinute: 100,
      requestTimeout: 30000,
      apiKeyEncryption: true,
      allowedDomains: [
        'api.anthropic.com',
        'api.openai.com',
        'generativelanguage.googleapis.com'
      ]
    };
    
    // Security monitoring
    this.securityMetrics = {
      requests: 0,
      blockedRequests: 0,
      securityViolations: 0,
      threatDetections: 0,
      auditLogs: [],
      startTime: Date.now()
    };
    
    // Initialize agents
    this.initializeAgents();
    
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  // Initialize all AI agents
  initializeAgents() {
    const config = {
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      googleApiKey: process.env.GOOGLE_API_KEY,
      smartRouterEndpoint: `http://localhost:${this.port}`
    };
    
    // Create and register agents
    const agents = AgentFactory.createAllAgents(config);
    
    for (const [name, agent] of Object.entries(agents)) {
      this.agentFramework.registerAgent(name, agent, agent.capabilities);
    }
    
    console.log('🤖 All AI agents initialized and registered');
    console.log('📊 Available agents:', Object.keys(agents));
  }
  
  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Security middleware
    this.app.use((req, res, next) => {
      // Rate limiting
      if (this.security.rateLimiting && !this.checkRateLimit(req)) {
        this.securityMetrics.blockedRequests++;
        return res.status(429).json({ error: 'Rate limit exceeded' });
      }
      
      // Security logging
      if (this.security.auditLogging) {
        this.logSecurityEvent('request', {
          ip: req.ip,
          method: req.method,
          path: req.path,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log(`🚀 ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
  }
  
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'Smart Router Cursor',
        version: '1.0.0',
        models: Object.keys(this.models),
        performance: this.getPerformanceMetrics()
      });
    });
    
    // Cursor compatibility endpoint
    this.app.post('/api/v1/chat/completions', async (req, res) => {
      try {
        const result = await this.handleCursorRequest(req);
        res.json(result);
      } catch (error) {
        console.error('❌ Error handling request:', error);
        res.status(500).json({
          error: 'Internal server error',
          message: error.message
        });
      }
    });
    
    // Model selection endpoint
    this.app.post('/api/v1/select-model', async (req, res) => {
      try {
        const model = this.selectOptimalModel(req.body);
        res.json({ selected_model: model, reasoning: this.getSelectionReasoning(req.body, model) });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Performance metrics
    this.app.get('/api/v1/metrics', (req, res) => {
      res.json(this.getPerformanceMetrics());
    });
    
    // Cost analysis
    this.app.get('/api/v1/costs', (req, res) => {
      res.json(this.getCostAnalysis());
    });
    
    // Vibe coding status
    this.app.get('/api/v1/vibe-status', (req, res) => {
      res.json(this.getVibeCodingStatus());
    });
    
    // Security status
    this.app.get('/api/v1/security-status', (req, res) => {
      res.json(this.getSecurityStatus());
    });
    
    // Security audit logs
    this.app.get('/api/v1/security-audit', (req, res) => {
      res.json(this.getSecurityAudit());
    });
    
    // Agent framework endpoints
    this.app.get('/api/v1/agents', (req, res) => {
      res.json(this.getAgentStats());
    });
    
    this.app.get('/api/v1/agents/:name/stats', (req, res) => {
      const agentName = req.params.name;
      const stats = this.agentFramework.getAgentStats()[agentName];
      if (stats) {
        res.json(stats);
      } else {
        res.status(404).json({ error: 'Agent not found' });
      }
    });
    
    this.app.post('/api/v1/agent-task', async (req, res) => {
      try {
        const result = await this.executeAgentTask(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }
  
  // Execute task using agent framework
  async executeAgentTask(task) {
    const context = {
      batteryLevel: this.getBatteryLevel(),
      thermalState: this.getThermalState(),
      timestamp: new Date().toISOString()
    };
    
    const result = await this.agentFramework.executeTask(task, context);
    
    // Log agent usage
    this.logSecurityEvent('agent-task', {
      agent: result.agent,
      taskType: task.type,
      latency: result.latency,
      success: result.success
    });
    
    return result;
  }
  
  // Get agent statistics
  getAgentStats() {
    return {
      agents: this.agentFramework.getAgentStats(),
      framework: {
        totalAgents: this.agentFramework.agents.size,
        totalTasks: Array.from(this.agentFramework.performance.values())
          .reduce((sum, perf) => sum + perf.tasks, 0),
        avgSuccessRate: this.calculateOverallSuccessRate()
      }
    };
  }
  
  // Calculate overall success rate
  calculateOverallSuccessRate() {
    const performances = Array.from(this.agentFramework.performance.values());
    const totalTasks = performances.reduce((sum, perf) => sum + perf.tasks, 0);
    const totalSuccess = performances.reduce((sum, perf) => sum + perf.success, 0);
    
    return totalTasks > 0 ? totalSuccess / totalTasks : 0;
  }
  
  // Get battery level (MacBook specific)
  getBatteryLevel() {
    try {
      // On macOS, we can use system_profiler
      const { execSync } = require('child_process');
      const output = execSync('system_profiler SPPowerDataType | grep "Charge Remaining"', { encoding: 'utf8' });
      const match = output.match(/(\d+)/);
      return match ? parseInt(match[1]) : 100;
    } catch (error) {
      return 100; // Default to full battery
    }
  }
  
  // Get thermal state
  getThermalState() {
    // Simplified thermal detection
    const cpuUsage = process.cpuUsage();
    const totalUsage = cpuUsage.user + cpuUsage.system;
    
    if (totalUsage > 1000000) return 'high';
    if (totalUsage > 500000) return 'medium';
    return 'normal';
  }
  
  // Security methods
  checkRateLimit(req) {
    const clientIp = req.ip;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    
    if (!this.rateLimitWindow) {
      this.rateLimitWindow = {};
    }
    
    if (!this.rateLimitWindow[clientIp]) {
      this.rateLimitWindow[clientIp] = {
        count: 0,
        resetTime: now + windowMs
      };
    }
    
    const client = this.rateLimitWindow[clientIp];
    
    if (now > client.resetTime) {
      client.count = 0;
      client.resetTime = now + windowMs;
    }
    
    client.count++;
    
    return client.count <= this.security.maxRequestsPerMinute;
  }
  
  logSecurityEvent(type, data) {
    if (!this.security.auditLogging) return;
    
    const event = {
      type,
      data,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.securityMetrics.auditLogs.push(event);
    
    // Keep only last 1000 logs
    if (this.securityMetrics.auditLogs.length > 1000) {
      this.securityMetrics.auditLogs = this.securityMetrics.auditLogs.slice(-1000);
    }
    
    console.log(`🔒 Security Event: ${type} - ${event.id}`);
  }
  
  getSecurityStatus() {
    const uptime = Date.now() - this.securityMetrics.startTime;
    
    return {
      security: {
        enabled: this.security.enabled,
        sandboxMode: this.security.sandboxMode,
        auditLogging: this.security.auditLogging,
        threatDetection: this.security.threatDetection,
        rateLimiting: this.security.rateLimiting
      },
      metrics: {
        uptime: uptime,
        requests: this.securityMetrics.requests,
        blockedRequests: this.securityMetrics.blockedRequests,
        securityViolations: this.securityMetrics.securityViolations,
        threatDetections: this.securityMetrics.threatDetections,
        auditLogCount: this.securityMetrics.auditLogs.length,
        blockRate: this.securityMetrics.requests > 0 ? 
          (this.securityMetrics.blockedRequests / this.securityMetrics.requests * 100).toFixed(2) + '%' : '0%'
      },
      configuration: {
        maxRequestsPerMinute: this.security.maxRequestsPerMinute,
        requestTimeout: this.security.requestTimeout,
        apiKeyEncryption: this.security.apiKeyEncryption,
        allowedDomains: this.security.allowedDomains
      }
    };
  }
  
  getSecurityAudit() {
    return {
      auditLogs: this.securityMetrics.auditLogs.slice(-100), // Last 100 events
      summary: {
        totalEvents: this.securityMetrics.auditLogs.length,
        eventsByType: this.getEventsByType(),
        recentActivity: this.securityMetrics.auditLogs.slice(-10)
      },
      securityLevel: this.calculateSecurityLevel()
    };
  }
  
  getEventsByType() {
    const events = {};
    
    this.securityMetrics.auditLogs.forEach(event => {
      events[event.type] = (events[event.type] || 0) + 1;
    });
    
    return events;
  }
  
  calculateSecurityLevel() {
    const metrics = this.securityMetrics;
    const totalRequests = metrics.requests + metrics.blockedRequests;
    
    if (totalRequests === 0) return 'high';
    
    const violationRate = metrics.securityViolations / totalRequests;
    const blockRate = metrics.blockedRequests / totalRequests;
    
    if (violationRate > 0.1 || blockRate > 0.2) return 'low';
    if (violationRate > 0.05 || blockRate > 0.1) return 'medium';
    return 'high';
  }
  
  async handleCursorRequest(req) {
    const startTime = Date.now();
    this.securityMetrics.requests++;
    
    try {
      // Security validation
      if (!this.validateRequest(req)) {
        this.securityMetrics.securityViolations++;
        throw new Error('Invalid request - security violation');
      }
      
      // Analyse request
      const analysis = this.analyzeRequest(req.body);
      
      // Select optimal model
      const selectedModel = this.selectOptimalModel(analysis);
      
      // Execute request
      const response = await this.executeRequest(selectedModel, req.body);
      
      // Track performance
      const latency = Date.now() - startTime;
      this.trackPerformance(selectedModel, latency, response);
      
      // Log successful request
      this.logSecurityEvent('success', {
        model: selectedModel.model,
        latency: latency,
        cost: response.smart_router?.cost
      });
      
      return response;
    } catch (error) {
      this.securityMetrics.securityViolations++;
      this.logSecurityEvent('error', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
  
  validateRequest(req) {
    // Validate request size
    if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 10 * 1024 * 1024) {
      return false; // 10MB limit
    }
    
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return false;
    }
    
    // Validate required fields
    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      return false;
    }
    
    return true;
  }
  
  analyzeRequest(request) {
    const messages = request.messages || [];
    const lastMessage = messages[messages.length - 1] || {};
    const content = lastMessage.content || '';
    
    // Task type detection
    const taskType = this.detectTaskType(content);
    
    // Complexity assessment
    const complexity = this.assessComplexity(content, messages.length);
    
    // Budget analysis
    const budget = request.max_tokens ? this.estimateBudget(request.max_tokens) : 0.01;
    
    // Context length
    const contextLength = this.calculateContextLength(messages);
    
    return {
      task_type: taskType,
      complexity: complexity,
      budget: budget,
      context_length: contextLength,
      max_tokens: request.max_tokens || 2048,
      temperature: request.temperature || 0.3,
      messages: messages
    };
  }
  
  detectTaskType(content) {
    const content_lower = content.toLowerCase();
    
    if (content_lower.length < 200 || content_lower.includes('complete') || content_lower.includes('autocomplete')) {
      return 'autocomplete';
    }
    
    if (content_lower.includes('pdf') || content_lower.includes('image') || content_lower.includes('analyze image')) {
      return 'vision';
    }
    
    if (content_lower.includes('refactor') || content_lower.includes('optimize') || content_lower.includes('complex')) {
      return 'complex_reasoning';
    }
    
    if (content_lower.includes('generate') || content_lower.includes('create') || content_lower.includes('implement')) {
      return 'code_generation';
    }
    
    if (content_lower.includes('bulk') || content_lower.includes('multiple') || content_lower.includes('batch')) {
      return 'bulk_processing';
    }
    
    return 'code_generation'; // default
  }
  
  assessComplexity(content, messageCount) {
    let complexity = 0.3; // base complexity
    
    // Length factor
    if (content.length > 1000) complexity += 0.2;
    if (content.length > 3000) complexity += 0.2;
    
    // Technical complexity
    const technicalTerms = ['algorithm', 'optimization', 'architecture', 'design pattern', 'concurrency'];
    technicalTerms.forEach(term => {
      if (content.toLowerCase().includes(term)) complexity += 0.1;
    });
    
    // Context complexity
    if (messageCount > 5) complexity += 0.1;
    if (messageCount > 10) complexity += 0.1;
    
    return Math.min(complexity, 1.0);
  }
  
  estimateBudget(maxTokens) {
    // Estimate cost based on token count
    const avgCostPerToken = 0.000003; // Claude 3.5 Sonnet rate
    return maxTokens * avgCostPerToken;
  }
  
  calculateContextLength(messages) {
    return messages.reduce((total, msg) => {
      return total + (msg.content ? msg.content.length : 0);
    }, 0);
  }
  
  selectOptimalModel(analysis) {
    // Find matching routing rule
    for (const rule of this.routingRules) {
      if (rule.condition(analysis)) {
        return this.models[rule.model];
      }
    }
    
    // Fallback to balanced model
    return this.models['cursor-sonnet'];
  }
  
  getSelectionReasoning(analysis, model) {
    const reasons = [];
    
    if (analysis.task_type === 'autocomplete') {
      reasons.push('Task type: autocomplete requires fast response');
    }
    
    if (analysis.complexity > 0.7) {
      reasons.push('High complexity requires advanced reasoning');
    }
    
    if (analysis.budget < 0.005) {
      reasons.push('Low budget requires cost-effective model');
    }
    
    if (analysis.context_length > 50000) {
      reasons.push('Large context requires high-capability model');
    }
    
    return {
      selected_model: model.model,
      reasoning: reasons,
      estimated_cost: analysis.max_tokens * model.cost_per_token,
      estimated_latency: model.latency_target
    };
  }
  
  async executeRequest(model, request) {
    const startTime = Date.now();
    
    try {
      let response;
      
      switch (model.provider) {
        case 'anthropic':
          response = await this.executeAnthropicRequest(model, request);
          break;
        case 'openai':
          response = await this.executeOpenAIRequest(model, request);
          break;
        case 'google':
          response = await this.executeGoogleRequest(model, request);
          break;
        default:
          throw new Error(`Unknown provider: ${model.provider}`);
      }
      
      // Add Smart Router metadata
      response.smart_router = {
        model_used: model.model,
        provider: model.provider,
        latency: Date.now() - startTime,
        cost: this.calculateCost(model, request),
        routing_confidence: this.calculateRoutingConfidence(request, model)
      };
      
      return response;
    } catch (error) {
      console.error(`❌ Error executing ${model.model}:`, error);
      throw error;
    }
  }
  
  async executeAnthropicRequest(model, request) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model.model,
        max_tokens: model.max_tokens,
        temperature: model.temperature,
        messages: request.messages
      })
    });
    
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert to OpenAI format for Cursor compatibility
    return {
      id: data.id,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: data.content[0].text
        },
        finish_reason: data.stop_reason
      }],
      usage: {
        prompt_tokens: data.usage.input_tokens,
        completion_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens
      }
    };
  }
  
  async executeOpenAIRequest(model, request) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not configured');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model.model,
        max_tokens: model.max_tokens,
        temperature: model.temperature,
        messages: request.messages
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async executeGoogleRequest(model, request) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_API_KEY not configured');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: request.messages.map(msg => ({
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          maxOutputTokens: model.max_tokens,
          temperature: model.temperature
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert to OpenAI format for Cursor compatibility
    return {
      id: `google-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: data.candidates[0].content.parts[0].text
        },
        finish_reason: data.candidates[0].finishReason
      }],
      usage: {
        prompt_tokens: data.usageMetadata.promptTokenCount,
        completion_tokens: data.usageMetadata.candidatesTokenCount,
        total_tokens: data.usageMetadata.totalTokenCount
      }
    };
  }
  
  calculateCost(model, request) {
    const estimatedTokens = request.max_tokens || model.max_tokens;
    return estimatedTokens * model.cost_per_token;
  }
  
  calculateRoutingConfidence(request, model) {
    // Simple confidence calculation based on task-model match
    const taskType = this.detectTaskType(request.messages[request.messages.length - 1]?.content || '');
    const idealModel = this.getIdealModelForTask(taskType);
    
    if (idealModel === model.model) {
      return 0.95;
    } else if (model.use_case === taskType) {
      return 0.85;
    } else {
      return 0.70;
    }
  }
  
  getIdealModelForTask(taskType) {
    const taskModelMap = {
      'autocomplete': 'claude-3-5-haiku-20241022',
      'code_generation': 'claude-3-5-sonnet-20241022',
      'complex_reasoning': 'claude-3-opus-20240229',
      'vision': 'gpt-4-vision-preview',
      'bulk_processing': 'gemini-1.5-flash'
    };
    
    return taskModelMap[taskType] || 'claude-3-5-sonnet-20241022';
  }
  
  trackPerformance(model, latency, response) {
    this.performance.latency.push(latency);
    
    // Keep only last 1000 latency measurements
    if (this.performance.latency.length > 1000) {
      this.performance.latency = this.performance.latency.slice(-1000);
    }
    
    // Track model usage
    const modelName = model.model;
    this.performance.model_usage[modelName] = (this.performance.model_usage[modelName] || 0) + 1;
    
    // Track costs
    if (response.smart_router) {
      this.performance.costs += response.smart_router.cost;
    }
  }
  
  getPerformanceMetrics() {
    const avgLatency = this.performance.latency.length > 0 
      ? this.performance.latency.reduce((a, b) => a + b, 0) / this.performance.latency.length 
      : 0;
    
    const uptime = Date.now() - this.performance.start_time;
    
    return {
      uptime: uptime,
      requests: this.performance.requests,
      errors: this.performance.errors,
      error_rate: this.performance.requests > 0 ? this.performance.errors / this.performance.requests : 0,
      average_latency: Math.round(avgLatency),
      total_cost: this.performance.costs,
      model_usage: this.performance.model_usage,
      requests_per_second: this.performance.requests / (uptime / 1000)
    };
  }
  
  getCostAnalysis() {
    const metrics = this.getPerformanceMetrics();
    
    return {
      total_cost: metrics.total_cost,
      cost_per_request: metrics.requests > 0 ? metrics.total_cost / metrics.requests : 0,
      cost_savings: this.calculateCostSavings(),
      most_expensive_model: this.getMostExpensiveModel(),
      cheapest_model: this.getCheapestModel(),
      budget_efficiency: this.calculateBudgetEfficiency()
    };
  }
  
  calculateCostSavings() {
    // Compare with using Claude 3.5 Sonnet for all requests
    const sonnetCost = 0.000003;
    const estimatedTotalCost = this.performance.requests * 2048 * sonnetCost; // Assume 2048 tokens avg
    const savings = estimatedTotalCost - this.performance.costs;
    
    return {
      estimated_single_model_cost: estimatedTotalCost,
      actual_smart_router_cost: this.performance.costs,
      savings: savings,
      savings_percentage: estimatedTotalCost > 0 ? (savings / estimatedTotalCost) * 100 : 0
    };
  }
  
  getMostExpensiveModel() {
    let maxCost = 0;
    let mostExpensive = null;
    
    for (const [modelName, usage] of Object.entries(this.performance.model_usage)) {
      const model = Object.values(this.models).find(m => m.model === modelName);
      if (model) {
        const totalCost = usage * model.max_tokens * model.cost_per_token;
        if (totalCost > maxCost) {
          maxCost = totalCost;
          mostExpensive = modelName;
        }
      }
    }
    
    return mostExpensive;
  }
  
  getCheapestModel() {
    let minCost = Infinity;
    let cheapest = null;
    
    for (const [modelName, usage] of Object.entries(this.performance.model_usage)) {
      const model = Object.values(this.models).find(m => m.model === modelName);
      if (model) {
        const totalCost = usage * model.max_tokens * model.cost_per_token;
        if (totalCost < minCost && usage > 0) {
          minCost = totalCost;
          cheapest = modelName;
        }
      }
    }
    
    return cheapest;
  }
  
  calculateBudgetEfficiency() {
    const metrics = this.getPerformanceMetrics();
    const targetCostPerRequest = 0.01; // Target cost per request
    const actualCostPerRequest = metrics.cost_per_request;
    
    return {
      target_cost_per_request: targetCostPerRequest,
      actual_cost_per_request: actualCostPerRequest,
      efficiency: actualCostPerRequest > 0 ? targetCostPerRequest / actualCostPerRequest : 0,
      within_budget: actualCostPerRequest <= targetCostPerRequest
    };
  }
  
  getVibeCodingStatus() {
    const metrics = this.getPerformanceMetrics();
    
    return {
      flow_state_active: metrics.average_latency < 500, // Fast responses indicate flow state
      vibe_score: this.calculateVibeScore(metrics),
      ai_partner_quality: this.calculateAIPartnerQuality(),
      creative_enhancement: this.calculateCreativeEnhancement(),
      recommendations: this.getVibeRecommendations(metrics)
    };
  }
  
  calculateVibeScore(metrics) {
    let score = 50; // Base score
    
    // Latency factor (faster = better vibe)
    if (metrics.average_latency < 100) score += 30;
    else if (metrics.average_latency < 500) score += 20;
    else if (metrics.average_latency < 1000) score += 10;
    
    // Error rate factor (fewer errors = better vibe)
    if (metrics.error_rate < 0.01) score += 20;
    else if (metrics.error_rate < 0.05) score += 10;
    
    // Cost efficiency factor (cost-effective = better vibe)
    const costAnalysis = this.getCostAnalysis();
    if (costAnalysis.savings_percentage > 50) score += 10;
    
    return Math.min(score, 100);
  }
  
  calculateAIPartnerQuality() {
    const metrics = this.getPerformanceMetrics();
    
    return {
      responsiveness: metrics.average_latency < 500 ? 'excellent' : 'good',
      reliability: metrics.error_rate < 0.01 ? 'excellent' : 'good',
      intelligence: 'high', // Based on model selection
      collaboration: 'seamless'
    };
  }
  
  calculateCreativeEnhancement() {
    const modelUsage = this.performance.model_usage;
    
    // Check if using advanced models for creative tasks
    const creativeModels = ['claude-3-opus-20240229', 'claude-3-5-sonnet-20241022'];
    const creativeUsage = creativeModels.reduce((sum, model) => sum + (modelUsage[model] || 0), 0);
    const totalUsage = Object.values(modelUsage).reduce((sum, usage) => sum + usage, 0);
    
    const creativeRatio = totalUsage > 0 ? creativeUsage / totalUsage : 0;
    
    return {
      creative_model_usage: creativeRatio,
      enhancement_level: creativeRatio > 0.5 ? 'high' : creativeRatio > 0.2 ? 'medium' : 'low',
      innovation_potential: creativeRatio > 0.3 ? 'high' : 'medium'
    };
  }
  
  getVibeRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.average_latency > 1000) {
      recommendations.push('Consider using faster models for better flow state');
    }
    
    if (metrics.error_rate > 0.05) {
      recommendations.push('High error rate detected - check API configuration');
    }
    
    if (metrics.cost_per_request > 0.02) {
      recommendations.push('Cost per request is high - consider using more efficient models');
    }
    
    const costAnalysis = this.getCostAnalysis();
    if (costAnalysis.savings_percentage < 30) {
      recommendations.push('Low cost savings - optimize model selection');
    }
    
    return recommendations;
  }
  
  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Smart Router Cursor Integration started on port ${this.port}`);
      console.log(`📊 Models available: ${Object.keys(this.models).join(', ')}`);
      console.log(`🎸 Ready for ultimate vibe coding experience!`);
    });
  }
}

// Start the Smart Router Cursor Integration
if (require.main === module) {
  const router = new SmartRouterCursor();
  router.start();
}

module.exports = SmartRouterCursor;
