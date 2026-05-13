/**
 * Universal Orchestrator - Smart Router v3.0
 * 
 * Single entry point. AI decides:
 * 1. Which tool (Windsurf vs Claude Code)
 * 2. Which model (via OpenRouter or Claude native)
 * 
 * No thinking required. Optimal path always.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class UniversalOrchestrator {
  constructor() {
    this.config = {
      windsurf: {
        executable: 'windsurf',
        workspace: '~/Projects/DAO_Zendure',
        providers: ['openrouter', 'anthropic'],
        optimalFor: [
          'yaml_editing', 'quick_fix', 'multi_file', 'dashboard', 
          'refactor', 'syntax_fix', 'entity_update'
        ],
        responseTime: 'realtime',
        features: ['inline_edits', 'file_explorer', 'git_integration']
      },
      
      claudeCode: {
        executable: 'claude',
        workspace: '~/Projects/DAO_Zendure',
        provider: 'anthropic_native',
        optimalFor: [
          'complex_analysis', 'autonomous_debug', 'project_search',
          'ml_training', 'architecture', 'monitoring', 'reporting'
        ],
        responseTime: 'async',
        features: ['/goal', '/plan', 'subagents', 'persistent_memory', 'background']
      }
    };
  }

  /**
   * Main entry: classify intent and route to optimal tool
   */
  async orchestrate(userIntent, options = {}) {
    console.log('🔮 Smart Router v3.0 - Universal Orchestrator\n');
    console.log(`📝 Intent: "${userIntent}"\n`);

    // Step 1: Decide tool
    const toolDecision = this.selectTool(userIntent);
    console.log(`🎯 Tool Decision: ${toolDecision.tool}`);
    console.log(`   Confidence: ${toolDecision.confidence}/5`);
    console.log(`   Reason: ${toolDecision.reason}\n`);

    // Step 2: Execute
    if (toolDecision.tool === 'windsurf') {
      return await this.routeToWindsurf(userIntent, options);
    } else {
      return await this.routeToClaudeCode(userIntent, options);
    }
  }

  /**
   * Tool selection based on intent analysis
   */
  selectTool(intent) {
    const scores = { windsurf: 0, claudeCode: 0 };
    const reasons = [];

    // Windsurf patterns (IDE tasks)
    const windsurfKeywords = [
      /fix\s+(yaml|syntax|indentation)/i,
      /edit\s+/i,
      /update\s+(entity|sensor|automation)/i,
      /add\s+(helper|sensor|automation)/i,
      /refactor\s+/i,
      /dashboard\s+/i,
      /quick\s+/i,
      /\.ya?ml/i,
      /file\s+/i,
      /code\s+/i
    ];

    // Claude Code patterns (Agent tasks)
    const claudeKeywords = [
      /analyse/i,
      /analyze/i,
      /investigate/i,
      /debug\s+(complex|history)/i,
      /ml\s+/i,
      /training/i,
      /forecast/i,
      /optimize\s+(strategy|plan)/i,
      /architecture/i,
      /monitor/i,
      /report/i,
      /background/i,
      /goal/i,
      /why\s+/i,
      /what\s+if/i
    ];

    windsurfKeywords.forEach(pattern => {
      if (pattern.test(intent)) {
        scores.windsurf += 2;
        if (!reasons.some(r => r.includes('file editing'))) {
          reasons.push('Detected file editing task');
        }
      }
    });

    claudeKeywords.forEach(pattern => {
      if (pattern.test(intent)) {
        scores.claudeCode += 2;
        if (!reasons.some(r => r.includes('analysis'))) {
          reasons.push('Detected analysis/monitoring task');
        }
      }
    });

    // Additional heuristics
    if (intent.length < 50 && !intent.includes('?')) {
      scores.windsurf += 1;
      reasons.push('Short, direct command');
    }
    
    if (intent.length > 100 || intent.includes('?')) {
      scores.claudeCode += 1;
      reasons.push('Complex or exploratory query');
    }

    // Decision
    const winner = scores.windsurf >= scores.claudeCode ? 'windsurf' : 'claudeCode';
    const confidence = Math.abs(scores.windsurf - scores.claudeCode);
    
    return {
      tool: winner,
      confidence: Math.min(confidence, 5),
      reason: reasons[0] || 'Default routing',
      scores
    };
  }

  /**
   * Route to Windsurf with smart model selection
   */
  async routeToWindsurf(intent, options) {
    console.log('🌊 Opening Windsurf (IDE + Smart Model Routing)...\n');
    
    // Determine optimal model via smart-router logic
    const modelSelection = this.selectModelForWindsurf(intent);
    console.log(`🤖 Model: ${modelSelection.model}`);
    console.log(`   Provider: ${modelSelection.provider}\n`);

    // Prepare workspace
    const workspace = options.workspace || this.config.windsurf.workspace;
    const targetFile = options.file || null;

    // Create context file for Cascade
    const contextFile = path.join(process.cwd(), '.windsurf_context.json');
    const context = {
      intent,
      model: modelSelection,
      timestamp: new Date().toISOString(),
      project: 'DAO_Zendure',
      type: 'smart_routed'
    };
    fs.writeFileSync(contextFile, JSON.stringify(context, null, 2));

    // Launch Windsurf
    const args = [workspace];
    if (targetFile) args.push(targetFile);

    const windsurf = spawn(this.config.windsurf.executable, args, {
      stdio: 'inherit',
      detached: true
    });

    console.log(`✅ Windsurf opened`);
    console.log(`📁 Workspace: ${workspace}`);
    console.log(`💡 Context: ${contextFile}`);
    console.log(`📝 Copy intent into Cascade chat to start\n`);

    windsurf.unref();

    return {
      tool: 'windsurf',
      model: modelSelection,
      workspace,
      contextFile,
      status: 'opened'
    };
  }

  /**
   * Select optimal model for Windsurf via OpenRouter
   */
  selectModelForWindsurf(intent) {
    // Smart model selection logic
    const isComplex = intent.length > 100 || 
                      /analyse|analyze|complex|architecture/.test(intent);
    const isQuick = /quick|fix|edit|syntax/.test(intent);
    const needsVision = /image|pdf|screenshot/.test(intent);

    if (needsVision) {
      return { model: 'gpt-4-vision', provider: 'openrouter', reason: 'Vision required' };
    }
    
    if (isComplex) {
      return { model: 'claude-3.5-sonnet', provider: 'openrouter', reason: 'Complex reasoning' };
    }
    
    if (isQuick) {
      return { model: 'claude-3.5-haiku', provider: 'openrouter', reason: 'Speed prioritized' };
    }

    // Default: balanced
    return { model: 'claude-3.5-sonnet', provider: 'openrouter', reason: 'Balanced performance' };
  }

  /**
   * Route to Claude Code for autonomous execution
   */
  async routeToClaudeCode(intent, options) {
    console.log('🤖 Opening Claude Code (Autonomous Agent)...\n');

    const isGoalWorthy = intent.length > 80 || 
                         /analyse|analyze|investigate|monitor/.test(intent);

    if (isGoalWorthy && options.useGoal !== false) {
      // Use /goal for autonomous execution
      console.log('🎯 Autonomous mode: Using /goal\n');
      
      const goalScript = `#!/bin/bash
cd ${this.config.claudeCode.workspace}
claude
# Type: /goal "${intent.replace(/"/g, '\\"')}"`;

      const scriptPath = path.join(process.cwd(), '.claude_goal.sh');
      fs.writeFileSync(scriptPath, goalScript);
      fs.chmodSync(scriptPath, '755');

      // Also create a direct command file
      const cmdFile = path.join(process.cwd(), '.claude_command.txt');
      fs.writeFileSync(cmdFile, `/goal "${intent}"`);

      console.log(`📄 Script: ${scriptPath}`);
      console.log(`📄 Command: ${cmdFile}`);
      console.log(`\n💡 Execute:\n   ${scriptPath}`);
      console.log(`   Then paste from ${cmdFile}\n`);

      return {
        tool: 'claudeCode',
        mode: '/goal',
        scriptPath,
        cmdFile,
        intent,
        status: 'ready'
      };
    } else {
      // Interactive mode
      console.log('💬 Interactive mode\n');
      
      const claude = spawn(this.config.claudeCode.executable, 
        [this.config.claudeCode.workspace], {
        stdio: 'inherit',
        detached: true
      });

      console.log(`✅ Claude Code opened`);
      console.log(`📝 Type your query to start\n`);

      claude.unref();

      return {
        tool: 'claudeCode',
        mode: 'interactive',
        workspace: this.config.claudeCode.workspace,
        status: 'opened'
      };
    }
  }
}

module.exports = UniversalOrchestrator;

// CLI usage
if (require.main === module) {
  const orchestrator = new UniversalOrchestrator();
  const intent = process.argv.slice(2).join(' ') || 
    'Analyze DAO Zendure project structure and suggest optimizations';
  
  orchestrator.orchestrate(intent).catch(console.error);
}
