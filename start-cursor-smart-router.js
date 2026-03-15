#!/usr/bin/env node

/**
 * 🚀 Smart Router - Cursor MacBook Ultimate Startup Script
 * 
 * Start de ultieme vibe coding omgeving voor Cursor op MacBook M5
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class CursorSmartRouterStarter {
  constructor() {
    this.port = process.env.CURSOR_PORT || 3000;
    this.envFile = path.join(__dirname, '.env.cursor');
    this.exampleEnvFile = path.join(__dirname, '.env.cursor.example');
    this.logFile = path.join(__dirname, 'cursor-smart-router.log');
    
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
    this.log('🚀 Starting Smart Router - Cursor MacBook Ultimate Setup', 'bright');
    this.log('🍎 Optimized for MacBook M5 with vibe coding enhancements', 'cyan');
    
    try {
      // Step 1: Environment setup
      await this.setupEnvironment();
      
      // Step 2: Check dependencies
      await this.checkDependencies();
      
      // Step 3: Start Smart Router
      await this.startSmartRouter();
      
      // Step 4: Configure Cursor
      await this.configureCursor();
      
      // Step 5: Start monitoring
      await this.startMonitoring();
      
      this.log('🎉 Smart Router Cursor integration ready!', 'green');
      this.log('🎸 Ultimate vibe coding experience activated', 'magenta');
      this.log('📊 Open Cursor and start coding with AI partnership!', 'cyan');
      
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
    this.log('🤖 Starting Smart Router server...', 'yellow');
    
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
    this.log('✅ Smart Router server started', 'green');
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
    this.log('⚙️  Configuring Cursor integration...', 'yellow');
    
    const cursorConfig = {
      "cursor.ai.provider": "custom",
      "cursor.ai.baseUrl": `http://localhost:${this.port}/api/v1`,
      "cursor.ai.model": "auto",
      "cursor.ai.routing": "intelligent",
      "cursor.ai.costOptimization": true,
      "cursor.ai.fallback": true,
      "cursor.ai.contextWindow": "200k",
      "cursor.ai.streaming": true,
      
      "cursor.smartRouter": {
        "enabled": true,
        "endpoint": `http://localhost:${this.port}`,
        "modelSelection": "automatic",
        "costThreshold": 0.01,
        "performanceMode": "balanced",
        "fallbackEnabled": true
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
        "thermalManagement": "auto"
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
    
    this.log('✅ Cursor configuration updated', 'green');
    this.log(`📁 Config file: ${configFile}`, 'cyan');
  }
  
  async startMonitoring() {
    this.log('📊 Starting performance monitoring...', 'yellow');
    
    const monitorInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:${this.port}/api/v1/metrics`);
        const metrics = await response.json();
        
        this.log(`📈 Performance: ${metrics.requests_per_second.toFixed(2)} req/s, ${metrics.average_latency}ms avg latency`, 'cyan');
        
        // Check vibe status
        const vibeResponse = await fetch(`http://localhost:${this.port}/api/v1/vibe-status`);
        const vibeStatus = await vibeResponse.json();
        
        if (vibeStatus.flow_state_active) {
          this.log('🌊 Flow state active - optimal vibe coding!', 'green');
        }
        
      } catch (error) {
        this.log('⚠️  Monitoring error (server may be restarting)', 'yellow');
      }
    }, 30000); // Every 30 seconds
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      this.log('🛑 Shutting down Smart Router...', 'yellow');
      clearInterval(monitorInterval);
      
      if (this.smartRouterProcess) {
        this.smartRouterProcess.kill();
      }
      
      this.log('👋 Smart Router stopped', 'green');
      process.exit(0);
    });
    
    this.log('✅ Monitoring started', 'green');
  }
  
  displayStartupInfo() {
    console.log(`
${this.colors.bright}${this.colors.cyan}
🚀 Smart Router - Cursor MacBook Ultimate Edition
🍎 Optimized for MacBook M5 with vibe coding enhancements
🎸 Ready for ultimate AI partnership experience

📊 Server Information:
   • Port: ${this.port}
   • Health: http://localhost:${this.port}/health
   • Metrics: http://localhost:${this.port}/api/v1/metrics
   • Vibe Status: http://localhost:${this.port}/api/v1/vibe-status

🎸 Cursor Integration:
   • Custom AI Provider: Smart Router
   • Multi-Model Routing: Automatic
   • Cost Optimization: Enabled
   • Flow State Detection: Active

🤖 Available Models:
   • Claude 3.5 Haiku (Ultra-fast autocomplete)
   • Claude 3.5 Sonnet (Balanced code generation)
   • Claude 3 Opus (Complex reasoning)
   • GPT-4 Vision (PDF/Image analysis)
   • Gemini 1.5 Flash (Cost-effective bulk)

🎯 Next Steps:
   1. Open Cursor IDE
   2. Check Smart Router integration
   3. Start coding with AI partnership
   4. Enjoy ultimate vibe coding experience!

${this.colors.green}✅ Smart Router is ready for ultimate vibe coding!${this.colors.reset}
    `);
  }
}

// Start the Smart Router
if (require.main === module) {
  const starter = new CursorSmartRouterStarter();
  starter.start().then(() => {
    starter.displayStartupInfo();
  }).catch(error => {
    console.error('❌ Failed to start Smart Router:', error);
    process.exit(1);
  });
}

module.exports = CursorSmartRouterStarter;
