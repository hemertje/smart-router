#!/usr/bin/env node

// 🔍 IDE ACTIVITY MONITOR - Dashboard start alleen bij IDE activiteit
// Monitor VS Code/Windsurf processen en start/stop dashboard automatisch

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class IDEActivityMonitor {
  constructor() {
    this.dashboardProcess = null;
    this.isMonitoring = false;
    this.isIDERunning = false;
    this.projectRoot = this.findProjectRoot();
    this.checkInterval = 30000; // Check elke 30 seconden
    this.monitoringTimer = null;
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
    
    return __dirname;
  }

  // 🚀 Start activity monitoring
  startActivityMonitoring() {
    if (this.isMonitoring) {
      console.log('📊 Activity monitoring already running');
      return;
    }

    console.log('🔍 Starting IDE activity monitoring...');
    this.isMonitoring = true;
    
    // Start monitoring loop
    this.monitoringTimer = setInterval(() => {
      this.checkIDEActivity();
    }, this.checkInterval);

    // Directe check
    this.checkIDEActivity();
  }

  // 🔍 Check IDE activity
  async checkIDEActivity() {
    try {
      const ideRunning = await this.isIDERunningNow();
      
      if (ideRunning && !this.isIDERunning) {
        // IDE net gestart -> start dashboard
        console.log('🚀 IDE detected - starting dashboard...');
        await this.startDashboard();
        this.isIDERunning = true;
      } else if (!ideRunning && this.isIDERunning) {
        // IDE gestopt -> stop dashboard
        console.log('🛑 IDE not detected - stopping dashboard...');
        await this.stopDashboard();
        this.isIDERunning = false;
      }
      
    } catch (error) {
      console.error('❌ Error checking IDE activity:', error);
    }
  }

  // 🔍 Check of IDE nu draait
  async isIDERunningNow() {
    const platform = os.platform();
    let command = '';

    if (platform === 'win32') {
      // Windows
      command = 'tasklist /fi "imagename eq Code.exe" /fi "imagename eq Windsurf.exe"';
    } else if (platform === 'darwin') {
      // macOS
      command = 'ps aux | grep -E "(Visual Studio Code|Windsurf)" | grep -v grep';
    } else {
      // Linux
      command = 'ps aux | grep -E "(code|windsurf)" | grep -v grep';
    }

    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          resolve(false);
          return;
        }
        
        const isRunning = stdout.length > 0;
        resolve(isRunning);
      });
    });
  }

  // 🚀 Start dashboard
  async startDashboard() {
    if (this.dashboardProcess) {
      console.log('📊 Dashboard already running');
      return;
    }

    try {
      console.log('🚀 Starting Smart Router dashboard...');
      
      this.dashboardProcess = spawn('node', ['silentDashboard.js'], {
        cwd: this.projectRoot,
        detached: true,
        stdio: 'ignore',
        env: {
          ...process.env,
          IDE_ACTIVITY_MODE: 'true',
          SILENT_MODE: 'true',
          UNDERWATER_MODE: 'true'
        }
      });

      this.dashboardProcess.unref();
      
      console.log('✅ Dashboard started - 100% underwater operation');
      
      // Monitor dashboard process
      this.monitorDashboardProcess();
      
    } catch (error) {
      console.error('❌ Failed to start dashboard:', error);
    }
  }

  // 🛑 Stop dashboard
  async stopDashboard() {
    if (!this.dashboardProcess) {
      console.log('📊 Dashboard not running');
      return;
    }

    try {
      console.log('🛑 Stopping dashboard...');
      
      // Probeer graceful shutdown
      if (this.dashboardProcess.pid) {
        process.kill(this.dashboardProcess.pid);
      }
      
      this.dashboardProcess = null;
      console.log('✅ Dashboard stopped - IDE is inactive');
      
    } catch (error) {
      console.error('❌ Failed to stop dashboard:', error);
    }
  }

  // 🔍 Monitor dashboard process
  monitorDashboardProcess() {
    if (!this.dashboardProcess) return;

    this.dashboardProcess.on('error', (error) => {
      console.error('❌ Dashboard process error:', error);
      this.dashboardProcess = null;
    });

    this.dashboardProcess.on('exit', (code) => {
      console.log(`📊 Dashboard process exited with code: ${code}`);
      this.dashboardProcess = null;
      
      // Auto-restart als IDE nog actief is
      if (code !== 0 && this.isIDERunning) {
        console.log('🔄 Auto-restarting dashboard (IDE still active)...');
        setTimeout(() => {
          this.startDashboard();
        }, 5000);
      }
    });
  }

  // 🛑 Stop monitoring
  stopActivityMonitoring() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    
    this.isMonitoring = false;
    console.log('🛑 IDE activity monitoring stopped');
  }

  // 📊 Get status
  getStatus() {
    return {
      monitoring: this.isMonitoring,
      ideRunning: this.isIDERunning,
      dashboardRunning: this.dashboardProcess !== null,
      dashboardPid: this.dashboardProcess ? this.dashboardProcess.pid : null,
      projectRoot: this.projectRoot,
      checkInterval: this.checkInterval
    };
  }
}

// 🚀 Export voor gebruik
module.exports = IDEActivityMonitor;

// 🚀 Direct run als gerund wordt
if (require.main === module) {
  const monitor = new IDEActivityMonitor();
  
  console.log('🔍 SMART ROUTER IDE ACTIVITY MONITOR');
  console.log('======================================');
  console.log('📊 Monitoring VS Code/Windsurf activity...');
  console.log('🚀 Dashboard will start/stop automatically');
  console.log('');
  
  monitor.startActivityMonitoring();
  
  // Status display elke minuut
  setInterval(() => {
    const status = monitor.getStatus();
    console.log(`📊 Status: IDE ${status.ideRunning ? '✅ Active' : '❌ Inactive'}, Dashboard ${status.dashboardRunning ? '✅ Running' : '❌ Stopped'}`);
  }, 60000);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping IDE activity monitor...');
    monitor.stopActivityMonitoring();
    monitor.stopDashboard();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping IDE activity monitor...');
    monitor.stopActivityMonitoring();
    monitor.stopDashboard();
    process.exit(0);
  });
}
