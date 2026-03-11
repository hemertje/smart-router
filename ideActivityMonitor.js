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

  // 🔄 Check IDE activity
  async checkIDEActivity() {
    const ideRunning = await this.isIDERunningNow();
    
    if (ideRunning && !this.isIDERunning) {
      // IDE started - start dashboard and scheduler
      await this.startDashboard();
      await this.startSilentScheduler();
      this.isIDERunning = true;
    } else if (!ideRunning && this.isIDERunning) {
      // IDE stopped - stop dashboard and scheduler
      await this.stopDashboard();
      await this.stopSilentScheduler();
      this.isIDERunning = false;
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
      // Silent - no console output
      return;
    }

    try {
      // Silent dashboard start
      
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
      
      // Silent confirmation
      
      // Monitor dashboard process
      this.monitorDashboardProcess();
      
    } catch (error) {
      // Silent error handling
    }
  }

  // 🚀 Start silent scheduler
  async startSilentScheduler() {
    if (this.schedulerProcess) {
      // Silent - no console output
      return;
    }

    try {
      // Silent scheduler start
      
      this.schedulerProcess = spawn('node', ['silentScheduler.js'], {
        cwd: this.projectRoot,
        detached: true,
        stdio: 'ignore',
        env: {
          ...process.env,
          SILENT_MODE: 'true',
          UNDERWATER_MODE: 'true'
        }
      });

      this.schedulerProcess.unref();
      
      // Silent confirmation
      
      // Monitor scheduler process
      this.monitorSchedulerProcess();
      
    } catch (error) {
      // Silent error handling
    }
  }

  // 🛑 Stop dashboard
  async stopDashboard() {
    if (!this.dashboardProcess) {
      // Silent - no console output
      return;
    }

    try {
      // Silent dashboard stop
      this.dashboardProcess.kill('SIGTERM');
      this.dashboardProcess = null;
      
    } catch (error) {
      // Silent error handling
    }
  }

  // 🛑 Stop silent scheduler
  async stopSilentScheduler() {
    if (!this.schedulerProcess) {
      // Silent - no console output
      return;
    }

    try {
      // Silent scheduler stop
      this.schedulerProcess.kill('SIGTERM');
      this.schedulerProcess = null;
      
    } catch (error) {
      // Silent error handling
    }
  }

  // 🔍 Monitor dashboard process
  monitorDashboardProcess() {
    if (!this.dashboardProcess) return;

    this.dashboardProcess.on('error', (error) => {
      // Silent error handling
      this.dashboardProcess = null;
    });

    this.dashboardProcess.on('close', (code) => {
      // Silent handling
      this.dashboardProcess = null;
    });
  }

  // 🔍 Monitor scheduler process
  monitorSchedulerProcess() {
    if (!this.schedulerProcess) return;

    this.schedulerProcess.on('error', (error) => {
      // Silent error handling
      this.schedulerProcess = null;
    });

    this.schedulerProcess.on('close', (code) => {
      // Silent handling
      this.schedulerProcess = null;
    });
  }

  // 🛑 Stop monitoring
  stopActivityMonitoring() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    
    // Silent stop of all processes
    this.stopDashboard();
    this.stopSilentScheduler();
  }

  // 📊 Get status
  getStatus() {
    return {
      monitoring: this.isMonitoring,
      ideRunning: this.isIDERunning,
      dashboardRunning: this.dashboardProcess !== null,
      schedulerRunning: this.schedulerProcess !== null,
      dashboardPid: this.dashboardProcess ? this.dashboardProcess.pid : null,
      schedulerPid: this.schedulerProcess ? this.schedulerProcess.pid : null,
      projectRoot: this.projectRoot,
      checkInterval: 30000
    };
  }
}

// 🚀 Export voor gebruik
module.exports = IDEActivityMonitor;

// 🚀 Direct run als gerund wordt
if (require.main === module) {
  const monitor = new IDEActivityMonitor();
  
  // Silent start - no console output
  monitor.startActivityMonitoring();
}
