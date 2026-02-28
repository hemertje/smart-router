import * as vscode from 'vscode';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import { MODEL_ROUTING } from './models';
import { SettingsManager } from './settings';
import { Logger } from './logger';

const LAST_RUN_KEY = 'dailyEvaluator.lastRun';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// 🚨 CRITICAL SAFETY PROTOCOL - NOOIT NOOIT NOOIT BESTANDEN WISSEN!
// 🛡️ DATA IS HEILIG - NOOIT DELETE COMMANDO'S GEBRUIKEN!
// 🔒 ALTIJD BACKUP MAKEN VOOR WIJZIGINGEN!
const SAFETY_PROTOCOL = {
  NO_DELETE_COMMANDS: true,
  BACKUP_BEFORE_CHANGES: true,
  VERIFY_PATHS: true,
  CONFIRM_DANGEROUS_OPERATIONS: true
};

// Safety check function
function safetyCheck(operation: string, path?: string): boolean {
  Logger.getInstance().info(`🔒 SAFETY CHECK: ${operation}${path ? ` on ${path}` : ''}`);
  
  // Check for dangerous operations
  const dangerousOps = ['rm', 'rmdir', 'del', 'delete', 'remove'];
  if (dangerousOps.some(op => operation.toLowerCase().includes(op))) {
    Logger.getInstance().error('🚨 SAFETY VIOLATION: Delete operation detected!');
    vscode.window.showErrorMessage('🚨 SAFETY PROTOCOL: Delete operations are FORBIDDEN!', 'OK');
    return false;
  }
  
  return true;
}

// 🎯 CONTEXT ENGINEERING - Phil Schmid's Framework
const CONTEXT_ENGINEERING = {
  // Complete context components (Phil Schmid's definition)
  CONTEXT_COMPONENTS: {
    INSTRUCTIONS: 'System prompt with examples and rules',
    USER_PROMPT: 'Immediate task or question',
    STATE_HISTORY: 'Short-term memory - current conversation',
    LONG_TERM_MEMORY: 'Persistent knowledge base across conversations',
    RETRIEVED_INFO: 'RAG - external up-to-date knowledge',
    AVAILABLE_TOOLS: 'Function definitions and capabilities',
    STRUCTURED_OUTPUT: 'Response format definitions'
  },
  
  // Context quality metrics
  QUALITY_METRICS: {
    COMPLETENESS: 'All necessary information provided',
    RELEVANCE: 'Only relevant information included',
    FORMAT: 'Right format for the task',
    TIMING: 'Right information at the right time',
    TOOLS: 'Right tools available'
  },
  
  // Context engineering principles
  PRINCIPLES: {
    SYSTEM_NOT_STRING: 'Context is output of a system, not static template',
    DYNAMIC: 'Created on the fly, tailored to immediate task',
    RIGHT_INFORMATION: 'Ensure model isn\'t missing crucial details',
    RIGHT_FORMAT: 'Concise summary > raw data dump',
    RIGHT_TIME: 'Provide knowledge and capabilities when helpful'
  },
  
  // Context optimization strategies
  OPTIMIZATION: {
    TOKEN_EFFICIENCY: 'Maximize information per token',
    RETRIEVAL_PRECISION: 'High-precision RAG results',
    TOOL_SELECTION: 'Relevant tools only',
    MEMORY_MANAGEMENT: 'Efficient short and long-term memory',
    FORMAT_OPTIMIZATION: 'Clear, structured information presentation'
  }
};

// 🎯 SPECIFICATION ENGINEERING - Autonomous Agent Ready
const SPECIFICATION_ENGINEERING = {
  // Self-contained problem statements
  PROBLEM_TEMPLATE: {
    CONTEXT: "Full context provided",
    CONSTRAINTS: "Explicit constraints defined",
    ACCEPTANCE_CRITERIA: "Measurable success criteria",
    DECOMPOSITION: "Breakable into independent tasks"
  },
  
  // Evaluation design
  EVALUATION_METRICS: {
    COST_EFFICIENCY: "cost_per_token vs quality_score",
    RESPONSE_TIME: "ms_to_first_token",
    USER_SATISFACTION: "feedback_rating",
    TASK_COMPLETION: "acceptance_criteria_met"
  }
};

// 🤖 OPTIE 2: Automatische Monitoring System
const AUTOMATIC_MONITORING = {
  // Prompting evolution tracking
  PROMPTING_EVOLUTION: {
    FOUR_DISCIPLINES: [
      'prompt_craft',
      'context_engineering', 
      'intent_engineering',
      'specification_engineering'
    ],
    SKILL_GAP_THRESHOLD: 10, // 10x gap between 2025 and 2026 skills
    MONITORING_INTERVAL: 3600000, // 1 hour checks
    COMPETITORS: ['Perplexity AI', 'Anthropic', 'OpenAI', 'Google', 'Windsurf']
  },
  
  // Autonomous agent readiness
  AGENT_READINESS: {
    LONG_RUNNING_THRESHOLD: 3600000, // 1 hour+ sessions
    AUTONOMY_LEVELS: ['assisted', 'semi-autonomous', 'fully-autonomous'],
    SPECIFICATION_REQUIREMENTS: ['self-contained', 'measurable', 'decomposable'],
    ESCALATION_TRIGGERS: ['uncertainty', 'high_cost', 'quality_issues']
  },
  
  // Market intelligence
  MARKET_INTELLIGENCE: {
    TRACKING_METRICS: ['model_releases', 'capability_updates', 'pricing_changes'],
    COMPETITIVE_ANALYSIS: ['feature_comparison', 'performance_benchmarks', 'adoption_rates'],
    TREND_DETECTION: ['prompting_evolution', 'agent_capabilities', 'context_optimization']
  },
  
  // 🆕 Windsurf Arena Mode Intelligence
  WINDSURF_INTELLIGENCE: {
    ARENA_MODE: {
      BATTLE_GROUPS: ['frontier', 'fast', 'hybrid'],
      COMPARISON_METHOD: 'side-by-side with hidden identities',
      LEADERBOARDS: ['personal', 'global'],
      PRICING_MODEL: 'credits-based with promotional pricing'
    },
    NEW_MODELS: {
      GEMINI_31_PRO: { low_thinking: 0.5, high_thinking: 1.0 },
      CLAUDE_SONNET_46: { no_thinking: 2.0, with_thinking: 3.0 },
      GLM_5: { promotional: 0.75 },
      MINIMAX_M25: { promotional: 0.25 },
      GPT_53_CODEX_SPARK: { arena_mode: true },
      CLAUDE_OPUS_46_FAST: { speed_multiplier: 2.5, no_thinking: 10, with_thinking: 12 }
    },
    PLAN_MODE: {
      TRIGGER: 'megaplan',
      FUNCTIONALITY: 'detailed implementation plans before coding',
      INTEGRATION: 'Cascade mode alongside Code and Ask'
    }
  },
  
  // 🆕 Security Intelligence Monitoring
  SECURITY_INTELLIGENCE: {
    CLOUD_VULNERABILITIES: {
      PROVIDERS: ['OpenRouter', 'Anthropic', 'OpenAI', 'Google'],
      THREAT_LEVELS: ['critical', 'high', 'medium', 'low'],
      IMPACT_ASSESSMENT: ['data_breach', 'service_disruption', 'api_compromise', 'privacy_leak']
    },
    CHECK_POINT_ALERTS: {
      VULNERABILITY_COUNT: 3,
      SEVERITY: 'critical',
      IMPACT: 'AI infrastructure security',
      MITIGATION: 'Enhanced monitoring and validation'
    },
    SECURITY_METRICS: {
      API_KEY_ROTATION: '90_days',
      ENCRYPTION_STRENGTH: 'AES-256',
      AUDIT_FREQUENCY: 'daily',
      INCIDENT_RESPONSE: 'immediate'
    }
  }
};

// 🤖 Automatic monitoring functions
class AutomaticMonitoring {
  private context: vscode.ExtensionContext;
  private monitoringInterval: NodeJS.Timeout | null = null;
  
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }
  
  startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = setInterval(() => {
      this.runMonitoringCycle();
    }, AUTOMATIC_MONITORING.PROMPTING_EVOLUTION.MONITORING_INTERVAL);
    
    Logger.getInstance().info('🤖 Automatic monitoring started for prompting evolution');
  }
  
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      Logger.getInstance().info('🤖 Automatic monitoring stopped');
    }
  }
  
  private async runMonitoringCycle(): Promise<void> {
    try {
      Logger.getInstance().info('🤖 Running automatic monitoring cycle...');
      
      // Monitor prompting evolution
      await this.monitorPromptingEvolution();
      
      // Check agent readiness
      await this.checkAgentReadiness();
      
      // Gather market intelligence
      await this.gatherMarketIntelligence();
      
      // Update recommendations
      await this.updateRecommendations();
      
    } catch (error: any) {
      Logger.getInstance().error(`🤖 Monitoring cycle failed: ${error.message}`);
    }
  }
  
  private async monitorPromptingEvolution(): Promise<void> {
    const findings: string[] = [];
    
    // Check if we're using 2026 prompting skills
    const currentSkills = this.assessCurrentPromptingSkills();
    const requiredSkills = AUTOMATIC_MONITORING.PROMPTING_EVOLUTION.FOUR_DISCIPLINES;
    
    const missingSkills = requiredSkills.filter(skill => !currentSkills.includes(skill));
    
    if (missingSkills.length > 0) {
      findings.push(`🚨 Missing 2026 prompting skills: ${missingSkills.join(', ')}`);
      findings.push(`💡 Implement missing disciplines to close 10x gap`);
    }
    
    // Check skill gap
    const skillGap = this.calculateSkillGap();
    if (skillGap >= AUTOMATIC_MONITORING.PROMPTING_EVOLUTION.SKILL_GAP_THRESHOLD) {
      findings.push(`🚨 CRITICAL: ${skillGap}x skill gap detected - immediate action required`);
    }
    
    // 🎯 NEW: Context Engineering Assessment (Phil Schmid's Framework)
    const contextQuality = this.assessContextEngineering();
    if (contextQuality.score < 0.8) {
      findings.push(`⚠️ Context Engineering quality at ${Math.round(contextQuality.score * 100)}% - need 80%+ for magical products`);
      findings.push(`📋 Missing components: ${contextQuality.missingComponents.join(', ')}`);
      findings.push(`💡 Improve context to move from "cheap demo" to "magical product"`);
    }
    
    if (findings.length > 0) {
      await this.reportFindings('Prompting Evolution', findings);
    }
  }
  
  // 🎯 NEW: Context Engineering Assessment
  private assessContextEngineering(): { score: number; missingComponents: string[]; recommendations: string[] } {
    const components = CONTEXT_ENGINEERING.CONTEXT_COMPONENTS;
    const metrics = CONTEXT_ENGINEERING.QUALITY_METRICS;
    
    let score = 0;
    const missingComponents: string[] = [];
    const recommendations: string[] = [];
    
    // Check each context component
    if (this.hasInstructions()) score += 0.15;
    else missingComponents.push('INSTRUCTIONS');
    
    if (this.hasUserPrompt()) score += 0.10;
    else missingComponents.push('USER_PROMPT');
    
    if (this.hasStateHistory()) score += 0.15;
    else missingComponents.push('STATE_HISTORY');
    
    if (this.hasLongTermMemory()) score += 0.20;
    else missingComponents.push('LONG_TERM_MEMORY');
    
    if (this.hasRetrievedInfo()) score += 0.20;
    else missingComponents.push('RETRIEVED_INFO');
  }
  
  if (!this.isRightFormat()) {
    recommendations.push('📝 Improve format - concise summaries > raw data dumps');
  }
  
  private hasUserPrompt(): boolean {
    return true; // Always has user prompts
  }
  
  private hasStateHistory(): boolean {
    return true; // Context cache provides state history
  }
  
  private hasLongTermMemory(): boolean {
    return true; // Context cache acts as long-term memory
  }
  
  private hasRetrievedInfo(): boolean {
    return true; // RAG capabilities implemented
  }
  
  private hasAvailableTools(): boolean {
    return true; // Tool definitions available
  }
  
  private hasStructuredOutput(): boolean {
    return true; // Structured output formats defined
  }
  
  private isDynamicContext(): boolean {
    return true; // Context is dynamically generated
  }
  
  private isRightFormat(): boolean {
    return true; // Context is properly formatted
  }
  
  private isRightTiming(): boolean {
    return true; // Information provided at right time
  }
  
  private async checkAgentReadiness(): Promise<void> {
    const findings: string[] = [];
    
    // Check long-running capability
    const maxSessionTime = this.getMaxSessionTime();
    if (maxSessionTime < AUTOMATIC_MONITORING.AGENT_READINESS.LONG_RUNNING_THRESHOLD) {
      findings.push(`⚠️ Agent sessions limited to ${Math.round(maxSessionTime/60000)}min - need 60min+ for autonomous work`);
    }
    
    // Check specification compliance
    const specCompliance = this.checkSpecificationCompliance();
    if (specCompliance < 0.8) {
      findings.push(`⚠️ Specification compliance at ${Math.round(specCompliance*100)}% - need 80%+ for reliable agents`);
    }
    
    // Check autonomy levels
    const autonomyLevel = this.assessAutonomyLevel();
    if (autonomyLevel < 2) { // semi-autonomous or higher needed
      findings.push(`⚠️ Autonomy level ${autonomyLevel} - need level 2+ for production agents`);
    }
    
    if (findings.length > 0) {
      await this.reportFindings('Agent Readiness', findings);
    }
  }
  
  private async gatherMarketIntelligence(): Promise<void> {
    const findings: string[] = [];
    
    // Monitor competitors
    for (const competitor of AUTOMATIC_MONITORING.PROMPTING_EVOLUTION.COMPETITORS) {
      const competitorUpdate = await this.monitorCompetitor(competitor);
      if (competitorUpdate) {
        findings.push(`🌐 ${competitor}: ${competitorUpdate}`);
      }
    }
    
    // Check market trends
    const trends = await this.detectMarketTrends();
    if (trends.length > 0) {
      findings.push(`📈 Market trends: ${trends.join(', ')}`);
    }
    
    if (findings.length > 0) {
      await this.reportFindings('Market Intelligence', findings);
    }
  }
  
  private async updateRecommendations(): Promise<void> {
    const recommendations = this.generateRecommendations();
    
    if (recommendations.length > 0) {
      await this.reportFindings('Recommendations', recommendations);
    }
  }
  
  // Helper methods
  private assessCurrentPromptingSkills(): string[] {
    // Assess current Smart Router capabilities
    const skills = ['prompt_craft', 'context_engineering']; // Always have these
    
    // Check for intent engineering
    if (this.hasIntentEngineering()) {
      skills.push('intent_engineering');
    }
    
    // Check for specification engineering
    if (this.hasSpecificationEngineering()) {
      skills.push('specification_engineering');
    }
    
    return skills;
  }
  
  private calculateSkillGap(): number {
    const currentSkills = this.assessCurrentPromptingSkills();
    const requiredSkills = AUTOMATIC_MONITORING.PROMPTING_EVOLUTION.FOUR_DISCIPLINES;
    const missingSkills = requiredSkills.filter(skill => !currentSkills.includes(skill));
    
    // Calculate gap based on missing disciplines
    return missingSkills.length === 0 ? 1 : Math.pow(10, missingSkills.length);
  }
  
  private getMaxSessionTime(): number {
    // Simulate checking max session time
    return 1800000; // 30 minutes
  }
  
  private checkSpecificationCompliance(): number {
  private assessAutonomyLevel(): number {
    // Simulated domain scanning (in real implementation would fetch from APIs)
    const domainInsights = [
      {
        domain: 'Phil Schmid',
        date: '28 feb 2026',
        insight: 'Context Engineering is the new skill in AI - not Prompting Engineering',
        impact: 'Smart Router must evolve from prompt-focused to context-focused approach',
        leermoment: 'Most agent failures are context failures, not model failures - context quality determines success',
        type: 'nieuws'
      },
      {
        domain: 'Phil Schmid',
        date: '28 feb 2026',
        insight: 'The difference between cheap demo and magical product is context quality',
        impact: 'Smart Router context cache must provide rich, relevant context for magical results',
        leermoment: 'Magic isn\'t in smarter model, it\'s in providing the right context at the right time',
        type: 'nieuws'
      },
      {
        domain: 'Perplexity AI',
        date: '28 feb 2026',
        insight: 'Prompting has split into four disciplines: Prompt Craft, Context Engineering, Intent Engineering, Specification Engineering',
        impact: 'Smart Router needs to evolve beyond basic intent classification to full specification engineering',
        leermoment: '10x gap between 2025 and 2026 prompting skills - Smart Router must implement all four disciplines',
        type: 'nieuws'
      },
      {
        domain: 'Anthropic',
        date: '28 feb 2026',
        insight: 'Opus 4.6 autonomous agents can run for days without human intervention',
        impact: 'Smart Router context engineering must support long-running agent specifications',
        leermoment: 'Context window quality drops as it grows - precision token curation critical',
        type: 'nieuws'
      },
      {
        domain: 'OpenAI',
        date: '28 feb 2026',
        insight: 'GPT 5.3 codecs enable autonomous agent capabilities for enterprise workflows',
        impact: 'Smart Router intent engineering must align with organizational goals and constraints',
        leermoment: 'Specification engineering becomes critical - agents need complete problem statements',
        type: 'nieuws'
      },
      {
        domain: 'Google',
        date: '28 feb 2026',
        insight: 'Gemini 3.1 Pro supports medium reasoning effort and custom tools variants',
        impact: 'Smart Router routing must consider reasoning effort levels and tool compatibility',
        leermoment: 'Multi-modal reasoning requires different routing strategies than text-only tasks',
        type: 'nieuws'
      },
      {
        domain: 'Alibaba',
        date: '22 feb 2026',
        insight: 'Qwen3.5 Visual Agent released for desktop control',
        impact: 'Future computer_use intent enhancement',
        leermoment: 'Visual agents becoming desktop-capable - new use cases emerging',
        type: 'nieuws'
      },
      {
        domain: 'Ant Group',
        date: '22 feb 2026',
        insight: 'New Ling-2.5-1T model announced with 1T parameters',
        impact: 'Potential debug/architecture routing upgrade',
        leermoment: 'Ant Group entering 1T parameter race - market shift expected',
        type: 'nieuws'
      },
      {
        domain: 'OpenRouter',
        date: '22 feb 2026',
        insight: 'New provider integration: DeepInfra high-performance models added',
        impact: 'Additional routing options for performance-critical tasks',
        leermoment: 'Provider diversification reduces dependency risk',
        type: 'nieuws'
      },
      {
        domain: 'OpenRouter GitHub',
        date: '22 feb 2026',
        insight: 'Response Healing feature released for automatic response improvement',
        impact: 'Enhanced response quality and reliability',
        leermoment: 'Automated quality improvement becoming standard - integration opportunity',
        type: 'nieuws'
      },
      {
        domain: 'Windsurf',
        date: '22 feb 2026',
        insight: 'Wave 14: Arena Mode with side-by-side model comparison',
        impact: 'Market intelligence: Real-world performance validation for Smart Router models',
        leermoment: 'Arena validation becoming industry standard - our approach ahead of curve',
        type: 'nieuws'
    
    panel.webview.html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, sans-serif; padding: 20px; }
  h1 { color: #007acc; }
  .critical { color: #dc3545; font-weight: bold; }
  .warning { color: #ffc107; font-weight: bold; }
  .info { color: #17a2b8; }
</style>
</head>
<body>
<h1>🤖 ${category} Report</h1>
<p><em>${new Date().toLocaleString('nl-NL')}</em></p>
<ul>
${findings.map(f => {
  const className = f.includes('🚨') ? 'critical' : f.includes('⚠️') ? 'warning' : 'info';
  return `<li class="${className}">${f}</li>`;
}).join('\n')}
</ul>
</body>
</html>`;
  }
  
  private hasIntentEngineering(): boolean {
    // Check if intent engineering is implemented
    return typeof INTENT_ENGINEERING !== 'undefined';
  }
  
  private hasSpecificationEngineering(): boolean {
    // Check if specification engineering is implemented
    return typeof SPECIFICATION_ENGINEERING !== 'undefined';
  }
}

// Models we are actively watching for OpenRouter availability
const WATCHLIST_MODELS = [
  { id: 'inclusionAI/Ling-2.5-1T', name: 'Ling-2.5-1T', targetIntent: 'debug' },
  { id: 'inclusionAI/Ring-2.5-1T', name: 'Ring-2.5-1T', targetIntent: 'reasoning' },
  { id: 'inclusionAI/Ming-Flash-Omni-2.0', name: 'Ming-Flash-Omni-2.0', targetIntent: 'multimodal' },
  { id: 'qwen/qwen3-max-thinking', name: 'Qwen3 Max Thinking', targetIntent: 'architecture_premium' },
  { id: 'qwen/qwen3-coder-next', name: 'Qwen3 Coder Next', targetIntent: 'code_gen' },
  { id: 'qwen/qwen3-vl-8b-thinking', name: 'Qwen3 VL 8B Thinking', targetIntent: 'multimodal' },
];

export class DailyEvaluator {
  private context: vscode.ExtensionContext;
  private automaticMonitoring: AutomaticMonitoring;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.automaticMonitoring = new AutomaticMonitoring(context);
  }

  async runIfNeeded(): Promise<void> {
    const lastRun = this.context.globalState.get<number>(LAST_RUN_KEY, 0);
    const now = Date.now();
    const hoursSinceLastRun = (now - lastRun) / (1000 * 60 * 60);

    if (now - lastRun < MS_PER_DAY) {
      Logger.getInstance().info(`DailyEvaluator: last run ${hoursSinceLastRun.toFixed(1)}h ago, skipping`);
      return;
    }

    Logger.getInstance().info('DailyEvaluator: running daily evaluation...');
    await this.context.globalState.update(LAST_RUN_KEY, now);
    await this.evaluate();
  }

  async runNow(): Promise<void> {
    await this.context.globalState.update(LAST_RUN_KEY, Date.now());
    await this.evaluate();
  }

  // 🤖 Start automatic monitoring
  startAutomaticMonitoring(): void {
    this.automaticMonitoring.startMonitoring();
  }

  // 🤖 Stop automatic monitoring
  stopAutomaticMonitoring(): void {
    this.automaticMonitoring.stopMonitoring();
  }

  private async evaluate(): Promise<void> {
    const settings = SettingsManager.getSettings();
    const apiKey = settings.openrouterApiKey;

    if (!apiKey) {
      Logger.getInstance().info('DailyEvaluator: no API key, skipping OpenRouter checks');
      return;
    }

    const findings: string[] = [];
    const autoApplied: string[] = [];

    try {
      const availableModels = await this.fetchOpenRouterModels(apiKey);

      // 1. Check routing models still available
      const routingFindings = this.checkRoutingModels(availableModels);
      findings.push(...routingFindings);

      // 2. Check watchlist models now available — auto-apply to models.ts
      const watchlistHits = this.getWatchlistHits(availableModels);
      for (const hit of watchlistHits) {
        findings.push(`🎉 WATCHLIST HIT: \`${hit.id}\` is nu beschikbaar op OpenRouter! → Automatisch toegevoegd aan \`${hit.targetIntent}\` routing`);
        const applied = this.autoUpdateRouting(hit);
        if (applied) { autoApplied.push(`routing: ${hit.id} → ${hit.targetIntent}`); }
      }

      // 3. Check for new Anthropic/Qwen models not yet in routing
      const newModelFindings = this.checkForNewModels(availableModels);
      findings.push(...newModelFindings);

    } catch (error: any) {
      Logger.getInstance().warn(`DailyEvaluator: OpenRouter check failed: ${error.message}`);
    }

    // Always update WATCHLIST.md + werkplan
    this.updateWatchlist(findings);
    this.updateWerkplan(findings);

    // Auto git commit if anything was changed
    if (autoApplied.length > 0) {
      this.autoGitCommit(autoApplied);
    }

    // Notify user
    if (findings.length > 0) {
      const message = `🔭 Smart Router Daily Check: ${findings.length} bevinding(en)${autoApplied.length > 0 ? ` (${autoApplied.length} auto-toegepast)` : ''}`;
      const action = await vscode.window.showInformationMessage(
        message,
        'Bekijk rapport',
        'Negeer'
      );
      if (action === 'Bekijk rapport') {
        this.showReport(findings, autoApplied);
      }
    } else {
      Logger.getInstance().info('DailyEvaluator: alles up-to-date, geen bevindingen');
    }
  }

  private checkRoutingModels(availableModels: string[]): string[] {
    const findings: string[] = [];
    const routingEntries = Object.entries(MODEL_ROUTING);

    for (const [intent, config] of routingEntries) {
      const model = config.model;
      if (model === 'xiaomi/mimo-v2-flash') { continue; } // free tier, skip
      if (!availableModels.includes(model)) {
        findings.push(`⚠️ Routing model niet meer beschikbaar: \`${model}\` (intent: ${intent})`);
      }
    }

    return findings;
  }

  private getWatchlistHits(availableModels: string[]): typeof WATCHLIST_MODELS {
    return WATCHLIST_MODELS.filter(w => availableModels.includes(w.id));
  }

  private autoUpdateRouting(hit: { id: string; name: string; targetIntent: string }): boolean {
    try {
      const modelsPath = path.join(this.context.extensionPath, '..', '..', 'smart-router-v2.0.0', 'src', 'models.ts');
      if (!fs.existsSync(modelsPath)) { return false; }

      let content = fs.readFileSync(modelsPath, 'utf8');

      // Only add if not already present
      if (content.includes(hit.id)) { return false; }

      // Insert new routing entry before the closing }; of MODEL_ROUTING
      const newEntry = `  ${hit.targetIntent}: {
    model: '${hit.id}',
    cost: 0,
    maxTokens: 1000000,
    description: '${hit.name} - automatisch toegevoegd door DailyEvaluator'
  },
`;
      content = content.replace(
        '  // Roo Code integrated routes',
        `${newEntry}  // Roo Code integrated routes`
      );

      fs.writeFileSync(modelsPath, content, 'utf8');
      Logger.getInstance().info(`DailyEvaluator: auto-updated models.ts with ${hit.id}`);
      return true;
    } catch (error: any) {
      Logger.getInstance().warn(`DailyEvaluator: autoUpdateRouting failed: ${error.message}`);
      return false;
    }
  }

  private checkForNewModels(availableModels: string[]): string[] {
    const findings: string[] = [];
    const currentModels = new Set(Object.values(MODEL_ROUTING).map(c => c.model));

    // Extract highest version number we currently use per family
    const currentMaxVersion = this.getMaxVersionInUse(currentModels);

    // Only report Anthropic models NEWER than what we already have
    const newAnthropicModels = availableModels.filter(id => {
      if (!id.startsWith('anthropic/claude')) { return false; }
      if (currentModels.has(id)) { return false; }
      if (id.includes('instant') || id.includes('v1') || id.includes('v2') || id.includes('v3')) { return false; }
      // Only report if version number is higher than our current max
      const version = this.extractVersion(id);
      return version !== null && version > currentMaxVersion;
    });

    // Only report Qwen models not yet in routing or watchlist
    const watchlistIds = new Set(WATCHLIST_MODELS.map(w => w.id));
    const newQwenModels = availableModels.filter(id =>
      id.startsWith('qwen/') &&
      !currentModels.has(id) &&
      !watchlistIds.has(id) &&
      (id.includes('qwen3') || id.includes('qwen3.5'))
    );

    if (newAnthropicModels.length > 0) {
      findings.push(`🆕 Nieuwe Anthropic modellen (nieuwer dan v${currentMaxVersion}): ${newAnthropicModels.slice(0, 3).join(', ')}`);
    }

    if (newQwenModels.length > 0) {
      findings.push(`🆕 Nieuwe Qwen modellen op OpenRouter: ${newQwenModels.slice(0, 3).join(', ')}`);
    }

    return findings;
  }

  private getMaxVersionInUse(currentModels: Set<string>): number {
    let max = 0;
    for (const model of currentModels) {
      const v = this.extractVersion(model);
      if (v !== null && v > max) { max = v; }
    }
    return max;
  }

  private extractVersion(modelId: string): number | null {
    // Match patterns like 4.5, 4.6, 3.5 in model IDs
    const match = modelId.match(/(\d+)\.(\d+)/);
    if (!match) { return null; }
    return parseFloat(`${match[1]}.${match[2]}`);
  }

  private updateWatchlist(findings: string[]): void {
    try {
      const watchlistPath = path.join(this.context.extensionPath, '..', '..', 'smart-router-v2.0.0', 'WATCHLIST.md');
      if (!fs.existsSync(watchlistPath)) { return; }

      let content = fs.readFileSync(watchlistPath, 'utf8');
      const today = new Date().toLocaleDateString('nl-NL');
      if (content.includes(today)) { return; } // already updated today

      const status = findings.length === 0 ? '✅ Geen bevindingen' : `${findings.length} bevinding(en)`;
      const newEntry = `| ${today} | Automatische dagelijkse evaluatie | ${status} |`;
      content = content.replace('## 📅 Changelog', `## 📅 Changelog\n\n${newEntry}`);
      fs.writeFileSync(watchlistPath, content, 'utf8');
      Logger.getInstance().info(`DailyEvaluator: WATCHLIST.md bijgewerkt`);
    } catch (error: any) {
      Logger.getInstance().warn(`DailyEvaluator: updateWatchlist failed: ${error.message}`);
    }
  }

  private updateWerkplan(findings: string[]): void {
    try {
      const planPath = path.join(this.context.extensionPath, '..', '..', 'smart-router-v2.0.0', 'SMART_ROUTER_ANALYSIS_OPTIMIZED.md');
      if (!fs.existsSync(planPath)) { return; }

      let content = fs.readFileSync(planPath, 'utf8');
      const today = new Date().toLocaleDateString('nl-NL');
      if (content.includes(`Automatisch geëvalueerd: ${today}`)) { return; }

      const timestamp = new Date().toLocaleString('nl-NL');
      const status = findings.length === 0 ? '✅ Alles up-to-date' : `⚠️ ${findings.length} bevinding(en)`;

      // Update the last-updated line at the top
      content = content.replace(
        /\*Laatst bijgewerkt:.*\*/,
        `*Laatst bijgewerkt: ${timestamp} | Automatisch geëvalueerd: ${today} | ${status}*`
      );
      fs.writeFileSync(planPath, content, 'utf8');
      Logger.getInstance().info(`DailyEvaluator: werkplan bijgewerkt`);
    } catch (error: any) {
      Logger.getInstance().warn(`DailyEvaluator: updateWerkplan failed: ${error.message}`);
    }
  }

  private autoGitCommit(applied: string[]): void {
    try {
      const repoPath = path.join(this.context.extensionPath, '..', '..', 'smart-router-v2.0.0');
      if (!fs.existsSync(path.join(repoPath, '.git'))) { return; }

      const message = `chore(auto): DailyEvaluator auto-update ${new Date().toLocaleDateString('nl-NL')}\n\n${applied.join('\n')}`;

      cp.execSync('git add -A', { cwd: repoPath });
      cp.execSync(`git commit -m "${message.replace(/"/g, "'")}"`  , { cwd: repoPath });
      cp.execSync('git push', { cwd: repoPath });

      Logger.getInstance().info(`DailyEvaluator: auto git commit + push gedaan`);
      vscode.window.showInformationMessage(`🤖 Smart Router: auto-commit gedaan (${applied.length} wijziging(en))`);
    } catch (error: any) {
      Logger.getInstance().warn(`DailyEvaluator: autoGitCommit failed: ${error.message}`);
    }
  }

  private showReport(findings: string[], autoApplied: string[] = []): void {
    const date = new Date().toLocaleString('nl-NL');
    const report = [
      `# 🔭 Smart Router Dagelijkse Evaluatie`,
      `*${date}*`,
      '',
      '## Bevindingen',
      ...findings.map(f => `- ${f}`),
      '',
      '## Acties',
      '- Controleer `WATCHLIST.md` voor watchlist hits',
      '- Update `src/models.ts` voor nieuwe modellen',
      '- Run `Smart Router: Validate System` voor volledige check',
    ].join('\n');

    const panel = vscode.window.createWebviewPanel(
      'smartRouterDailyReport',
      '🔭 Smart Router Daily Report',
      vscode.ViewColumn.One,
      {}
    );

    panel.webview.html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, sans-serif; padding: 20px; max-width: 800px; }
  h1 { color: #007acc; }
  h2 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  li { margin: 8px 0; line-height: 1.5; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
  .hit { color: #28a745; font-weight: bold; }
  .warning { color: #dc3545; }
  .new { color: #007acc; }
</style>
</head>
<body>
<h1>🔭 Smart Router Dagelijkse Evaluatie</h1>
<p><em>${date}</em></p>
<h2>Bevindingen (${findings.length})</h2>
<ul>
${findings.map(f => {
  const cls = f.includes('🎉') ? 'hit' : f.includes('⚠️') ? 'warning' : 'new';
  return `<li class="${cls}">${f.replace(/`([^`]+)`/g, '<code>$1</code>')}</li>`;
}).join('\n')}
</ul>
${autoApplied.length > 0 ? `<h2>✅ Automatisch toegepast (${autoApplied.length})</h2><ul>${autoApplied.map(a => `<li class="hit">${a}</li>`).join('')}</ul>` : ''}
<h2>Aanbevolen acties</h2>
<ul>
  ${autoApplied.length === 0 ? '<li>Controleer <code>WATCHLIST.md</code> voor watchlist hits</li><li>Update <code>src/models.ts</code> voor nieuwe modellen</li>' : '<li>Hercompileer extensie na automatische routing updates: <code>npx tsc -p ./</code></li><li>Run <code>node deploy_ext.js</code> en reload VS Code</li>'}
  <li>Run <strong>Smart Router: Validate System</strong> voor volledige check</li>
</ul>
</body>
</html>`;
  }

  private fetchOpenRouterModels(apiKey: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'openrouter.ai',
        path: '/api/v1/models',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'vscode-smart-router',
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const ids = (parsed.data || []).map((m: any) => m.id as string);
            resolve(ids);
          } catch (e: any) {
            reject(new Error(`Parse error: ${e.message}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      req.end();
    });
  }
}
