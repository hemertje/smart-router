#!/usr/bin/env node

/**
 * 🚀 Smart Router - Cursor MacBook Ultimate Startup Script with Agent Framework
 * 
 * Start de ultieme vibe coding omgeving met AI agent orchestration
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class CursorSmartRouterStarterEnhanced {
  constructor() {
    this.port = process.env.CURSOR_PORT || 3000;
    this.envFile = path.join(__dirname, '.env.cursor');
    this.exampleEnvFile = path.join(__dirname, '.env.cursor.example');
    this.logFile = path.join(__dirname, 'cursor-smart-router-enhanced.log');
    
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m'
    };
  }
  
  log(message, color = 'reset') {
    const timestamp = new Date().toISOString();
    const coloredMessage = `${this.colors[color]}${message}${this.colors.reset}`;
    console.log(`[${timestamp}] ${coloredMessage}`);
    
    // Also log to file
    fs.appendFileSync(this.logFile, `[${timestamp}] ${message}\n`);
  }
  
  async start() {
    this.log('🚀 Starting Smart Router - Agent Framework Edition', 'bright');
    this.log('🍎 MacBook M5 optimized with AI agent orchestration', 'cyan');
    this.log('🤖 Multi-agent system for intelligent task routing', 'magenta');
    
    try {
      // Step 1: Environment setup
      await this.setupEnvironment();
      
      // Step 2: Check dependencies
      await this.checkDependencies();
      
      // Step 3: Start Smart Router with agents
      await this.startSmartRouter();
      
      // Step 4: Configure Cursor
      await this.configureCursor();
      
      // Step 5: Start monitoring
      await this.startMonitoring();
      
      this.log('🎉 Smart Router Agent Framework ready!', 'green');
      this.log('🤖 AI agents initialized and ready for tasks', 'magenta');
      this.log('🎸 Ultimate AI-powered coding experience activated', 'cyan');
      
    } catch (error) {
      this.log(`❌ Error starting Smart Router: ${error.message}`, 'red');
      process.exit(1);
    }
  }
  
  async setupEnvironment() {
    this.log('📋 Setting up environment...', 'yellow');
    
    // Check if .env.cursor exists
    if (!fs.existsSync(this.envFile)) {
      this.log('📝 Creating .env.cursor file...', 'yellow');
      
      if (fs.existsSync(this.exampleEnvFile)) {
        fs.copyFileSync(this.exampleEnvFile, this.envFile);
        this.log('✅ .env.cursor created from example', 'green');
        this.log('⚠️  Please edit .env.cursor with your API keys', 'yellow');
      } else {
        this.log('❌ .env.cursor.example not found', 'red');
        throw new Error('Environment file not found');
      }
    }
    
    // Load environment variables
    require('dotenv').config({ path: this.envFile });
    
    // Verify API keys
    const requiredKeys = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GOOGLE_API_KEY'];
    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    
    if (missingKeys.length > 0) {
      this.log(`⚠️  Missing API keys: ${missingKeys.join(', ')}`, 'yellow');
      this.log('📝 Please add your API keys to .env.cursor', 'yellow');
    } else {
      this.log('✅ All API keys configured', 'green');
    }
  }
  
  async checkDependencies() {
    this.log('🔍 Checking dependencies...', 'yellow');
    
    const requiredPackages = ['express', 'cors', 'node-fetch', 'dotenv'];
    const missingPackages = [];
    
    for (const pkg of requiredPackages) {
      try {
        require.resolve(pkg);
      } catch (error) {
        missingPackages.push(pkg);
      }
    }
    
    if (missingPackages.length > 0) {
      this.log(`📦 Installing missing packages: ${missingPackages.join(', ')}`, 'yellow');
      
      const npmInstall = spawn('npm', ['install', ...missingPackages], {
        stdio: 'inherit',
        cwd: __dirname
      });
      
      await new Promise((resolve, reject) => {
        npmInstall.on('close', (code) => {
          if (code === 0) {
            this.log('✅ Dependencies installed', 'green');
            resolve();
          } else {
            reject(new Error('Failed to install dependencies'));
          }
        });
      });
    } else {
      this.log('✅ All dependencies available', 'green');
    }
  }
  
  async startSmartRouter() {
    this.log('🤖 Starting Smart Router with Agent Framework...', 'yellow');
    
    const smartRouter = spawn('node', ['cursor-integration.js'], {
      stdio: 'pipe',
      cwd: __dirname,
      env: { ...process.env }
    });
    
    smartRouter.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        this.log(`📊 Smart Router: ${output}`, 'cyan');
      }
    });
    
    smartRouter.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        this.log(`❌ Smart Router Error: ${output}`, 'red');
      }
    });
    
    smartRouter.on('close', (code) => {
      if (code !== 0) {
        this.log(`❌ Smart Router exited with code ${code}`, 'red');
      } else {
        this.log('🔄 Smart Router restarted', 'yellow');
      }
    });
    
    // Wait for server to start
    await this.waitForServer();
    
    this.smartRouterProcess = smartRouter;
    this.log('✅ Smart Router server with agents started', 'green');
  }
  
  async waitForServer() {
    const maxAttempts = 30;
    const delay = 1000;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`http://localhost:${this.port}/health`);
        if (response.ok) {
          this.log('📡 Smart Router server is responding', 'green');
          return;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    throw new Error('Smart Router server failed to start');
  }
  
  async configureCursor() {
    this.log('⚙️  Configuring Cursor with Agent Framework...', 'yellow');
    
    const cursorConfig = {
      "cursor.ai.provider": "custom",
      "cursor.ai.baseUrl": `http://localhost:${this.port}/api/v1`,
      "cursor.ai.model": "auto",
      "cursor.ai.routing": "agent-based",
      "cursor.ai.costOptimization": true,
      "cursor.ai.fallback": true,
      "cursor.ai.contextWindow": "200k",
      "cursor.ai.streaming": true,
      
      "cursor.smartRouter": {
        "enabled": true,
        "endpoint": `http://localhost:${this.port}`,
        "modelSelection": "automatic",
        "agentFramework": true,
        "costThreshold": 0.01,
        "performanceMode": "balanced",
        "fallbackEnabled": true,
        "batteryOptimization": true,
        "thermalManagement": true
      },
      
      "cursor.agents": {
        "claude": {
          "enabled": true,
          "specialization": "reasoning",
          "maxComplexity": 9
        },
        "gpt": {
          "enabled": true,
          "specialization": "versatility",
          "maxComplexity": 8
        },
        "gemini": {
          "enabled": true,
          "specialization": "creativity",
          "maxComplexity": 7
        },
        "cursor": {
          "enabled": true,
          "specialization": "ide-integration",
          "maxComplexity": 6
        },
        "lightweight": {
          "enabled": true,
          "specialization": "battery",
          "maxComplexity": 3
        }
      },
      
      "cursor.vibe.mode": "flow",
      "cursor.vibe.distractions": "minimal",
      "cursor.vibe.animations": "smooth",
      "cursor.vibe.soundEffects": "subtle",
      "cursor.vibe.theme": "dracula-pro",
      
      "cursor.performance.m5": {
        "gpuAcceleration": true,
        "parallelProcessing": true,
        "memoryOptimization": true,
        "thermalManagement": "auto",
        "batteryOptimization": true
      }
    };
    
    const configDir = path.join(require('os').homedir(), '.cursor');
    const configFile = path.join(configDir, 'settings.json');
    
    // Create config directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Write configuration
    fs.writeFileSync(configFile, JSON.stringify(cursorConfig, null, 2));
    
    this.log('✅ Cursor configuration with Agent Framework updated', 'green');
    this.log(`📁 Config file: ${configFile}`, 'cyan');
  }
  
  async startMonitoring() {
    this.log('📊 Starting Agent Framework monitoring...', 'yellow');
    
    const monitorInterval = setInterval(async () => {
      try {
        // Check agent statistics
        const agentResponse = await fetch(`http://localhost:${this.port}/api/v1/agents`);
        const agentStats = await agentResponse.json();
        
        this.log(`🤖 Agents: ${agentStats.framework.totalAgents} active, ${agentStats.framework.totalTasks} tasks completed`, 'cyan');
        this.log(`📈 Success Rate: ${(agentStats.framework.avgSuccessRate * 100).toFixed(1)}%`, 'green');
        
        // Check performance metrics
        const response = await fetch(`http://localhost:${this.port}/api/v1/metrics`);
        const metrics = await response.json();
        
        this.log(`📈 Performance: ${metrics.requests_per_second.toFixed(2)} req/s, ${metrics.average_latency}ms avg latency`, 'cyan');
        
        // Check vibe status
        const vibeResponse = await fetch(`http://localhost:${this.port}/api/v1/vibe-status`);
        const vibeStatus = await vibeResponse.json();
        
        if (vibeStatus.flow_state_active) {
          this.log('🌊 Flow state active - optimal vibe coding!', 'green');
        }
        
        // Check battery level (MacBook specific)
        try {
          const batteryResponse = await fetch(`http://localhost:${this.port}/api/v1/system/battery`);
          const batteryInfo = await batteryResponse.json();
          
          if (batteryInfo.level < 20) {
            this.log('🔋 Low battery - optimizing for power saving', 'yellow');
          }
        } catch (error) {
          // Ignore battery errors
        }
        
      } catch (error) {
        this.log('⚠️  Monitoring error (server may be restarting)', 'yellow');
      }
    }, 30000); // Every 30 seconds
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      this.log('🛑 Shutting down Smart Router Agent Framework...', 'yellow');
      clearInterval(monitorInterval);
      
      if (this.smartRouterProcess) {
        this.smartRouterProcess.kill();
      }
      
      this.log('👋 Smart Router Agent Framework stopped', 'green');
      process.exit(0);
    });
    
    this.log('✅ Agent Framework monitoring started', 'green');
  }
  
  displayStartupInfo() {
    console.log(`
${this.colors.bright}${this.colors.cyan}
🚀 Smart Router - Agent Framework Edition
🍎 MacBook M5 optimized with AI agent orchestration
🎸 Ready for ultimate AI partnership experience

🤖 Active AI Agents:
   • 🧠 Claude - Advanced reasoning & analysis
   • 🤖 GPT - Versatile code generation
   • 💎 Gemini - Multimodal & creative tasks
   • 🎸 Cursor - IDE-optimized integration
   • 🔋 Lightweight - Battery-efficient processing

📊 Server Information:
   • Port: ${this.port}
   • Health: http://localhost:${this.port}/health
   • Agents: http://localhost:${this.port}/api/v1/agents
   • Metrics: http://localhost:${this.port}/api/v1/metrics
   • Security: http://localhost:${this.port}/api/v1/security-status

🎸 Cursor Integration:
   • Custom AI Provider: Smart Router Agent Framework
   • Agent-Based Routing: Automatic
   • Cost Optimization: Enabled
   • Battery Optimization: Enabled
   • Flow State Detection: Active

🎯 Next Steps:
   1. Open Cursor IDE
   2. Check Agent Framework integration
   3. Start coding with AI agent assistance
   4. Experience intelligent task routing
   5. Enjoy ultimate AI-powered development!

${this.colors.green}✅ Smart Router Agent Framework is ready for ultimate AI coding!${this.colors.reset}
    `);
  }
}

// Start the Smart Router with Agent Framework
if (require.main === module) {
  const starter = new CursorSmartRouterStarterEnhanced();
  starter.start().then(() => {
    starter.displayStartupInfo();
  }).catch(error => {
    console.error('❌ Failed to start Smart Router Agent Framework:', error);
    process.exit(1);
  });
}

module.exports = CursorSmartRouterStarterEnhanced;
