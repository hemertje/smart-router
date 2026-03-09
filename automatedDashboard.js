#!/usr/bin/env node

// 🚀 AUTOMATED DASHBOARD STARTER - VS CODE/WINDSURF INTEGRATION
// Start automatisch dashboard wanneer IDE opent

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class AutomatedDashboardStarter {
  constructor() {
    this.dashboardProcess = null;
    this.isRunning = false;
    this.projectRoot = this.findProjectRoot();
  }

  // 🔍 Vind project root
  findProjectRoot() {
    let currentDir = __dirname;
    
    while (currentDir !== path.dirname(currentDir)) {
      if (fs.existsSync(path.join(currentDir, 'package.json')) && 
          fs.existsSync(path.join(currentDir, 'realTimeDashboard.js'))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
    
    return __dirname; // Fallback
  }

  // 🚀 Start dashboard automatisch
  async startAutomatedDashboard() {
    if (this.isRunning) {
      console.log('📊 Dashboard already running');
      return;
    }

    try {
      console.log('🚀 Starting Smart Router Dashboard automatically...');
      
      // Start dashboard in background
      this.dashboardProcess = spawn('node', ['realTimeDashboard.js'], {
        cwd: this.projectRoot,
        detached: true,
        stdio: 'ignore',
        env: {
          ...process.env,
          AUTOMATED_START: 'true',
          SILENT_MODE: 'true'
        }
      });

      // Unref om process los te koppelen
      this.dashboardProcess.unref();
      
      this.isRunning = true;
      
      console.log('✅ Smart Router Dashboard started automatically');
      console.log('📊 Dashboard running in background');
      console.log('🔍 Monitoring GitHub repositories silently');
      
      // Monitor process (optional)
      this.monitorProcess();
      
    } catch (error) {
      console.error('❌ Failed to start automated dashboard:', error);
    }
  }

  // 🔍 Monitor dashboard process
  monitorProcess() {
    if (!this.dashboardProcess) return;

    this.dashboardProcess.on('error', (error) => {
      console.error('❌ Dashboard process error:', error);
      this.isRunning = false;
    });

    this.dashboardProcess.on('exit', (code) => {
      console.log(`📊 Dashboard process exited with code: ${code}`);
      this.isRunning = false;
      
      // Auto-restart na crash
      if (code !== 0) {
        console.log('🔄 Auto-restarting dashboard...');
        setTimeout(() => {
          this.startAutomatedDashboard();
        }, 5000);
      }
    });
  }

  // 🛑 Stop dashboard
  stopDashboard() {
    if (this.dashboardProcess && this.isRunning) {
      try {
        process.kill(-this.dashboardProcess.pid);
        this.isRunning = false;
        console.log('🛑 Dashboard stopped');
      } catch (error) {
        console.error('❌ Failed to stop dashboard:', error);
      }
    }
  }

  // 📊 Get status
  getStatus() {
    return {
      running: this.isRunning,
      pid: this.dashboardProcess ? this.dashboardProcess.pid : null,
      projectRoot: this.projectRoot,
      automated: true
    };
  }
}

// 🚀 Export voor gebruik
module.exports = AutomatedDashboardStarter;

// 🚀 Direct start als gerund wordt
if (require.main === module) {
  const starter = new AutomatedDashboardStarter();
  
  console.log('🚀 SMART ROUTER AUTOMATED DASHBOARD STARTER');
  console.log('==========================================');
  console.log('📊 Starting dashboard for VS Code/Windsurf integration...');
  console.log('');
  
  starter.startAutomatedDashboard();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping automated dashboard...');
    starter.stopDashboard();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping automated dashboard...');
    starter.stopDashboard();
    process.exit(0);
  });
}
