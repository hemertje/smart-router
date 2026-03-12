#!/usr/bin/env node

// 🚀 SINGLE IDE ACTIVITY MONITOR - VOORKOMT MEERDERE PROCESSSEN!
// Process lock zorgt dat er maar 1 activity monitor draait

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

class SingleIDEActivityMonitor {
  constructor() {
    this.lockFile = path.join(__dirname, 'ide-monitor.lock');
    this.projectRoot = __dirname;
    this.isRunning = false;
    this.isIDERunning = false;
    this.checkInterval = 30000; // 30 seconden
  }

  // 🔒 Check if monitor already running
  isMonitorRunning() {
    try {
      if (fs.existsSync(this.lockFile)) {
        const lockData = fs.readFileSync(this.lockFile, 'utf8');
        const lockInfo = JSON.parse(lockData);
        
        // Check if process is still alive
        try {
          process.kill(lockInfo.pid, 0); // Signal 0 - doesn't kill, just checks
          return true; // Process is still running
        } catch (e) {
          // Process is dead, remove lock file
          fs.unlinkSync(this.lockFile);
          return false;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // 🔒 Create lock file
  createLockFile() {
    try {
      const lockInfo = {
        pid: process.pid,
        startTime: new Date().toISOString()
      };
      fs.writeFileSync(this.lockFile, JSON.stringify(lockInfo, null, 2));
      return true;
    } catch (error) {
      return false;
    }
  }

  // 🔒 Remove lock file
  removeLockFile() {
    try {
      if (fs.existsSync(this.lockFile)) {
        fs.unlinkSync(this.lockFile);
      }
    } catch (error) {
      // Silent error handling
    }
  }

  // 🚀 Start single activity monitor
  start() {
    // Check if already running
    if (this.isMonitorRunning()) {
      // Silent exit - already running
      process.exit(0);
    }

    // Create lock file
    if (!this.createLockFile()) {
      // Silent exit - can't create lock
      process.exit(0);
    }

    this.isRunning = true;

    // Start monitoring loop
    this.monitoringTimer = setInterval(() => {
      this.checkIDEActivity();
    }, this.checkInterval);

    // Directe check
    this.checkIDEActivity();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.stop();
      process.exit(0);
    });

    // Silent start - no console output
  }

  // 🔄 Check IDE activity
  async checkIDEActivity() {
    const ideRunning = await this.isIDERunningNow();
    
    if (ideRunning && !this.isIDERunning) {
      // IDE started - start single scheduler
      await this.startSingleScheduler();
      this.isIDERunning = true;
    } else if (!ideRunning && this.isIDERunning) {
      // IDE stopped - stop scheduler
      await this.stopScheduler();
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
      const { exec } = require('child_process');
      exec(command, (error, stdout) => {
        const isRunning = stdout.length > 0;
        resolve(isRunning);
      });
    });
  }

  // 🚀 Start single scheduler
  async startSingleScheduler() {
    try {
      // Start single silent scheduler
      const scheduler = spawn('node', ['singleSilentScheduler.js'], {
        cwd: this.projectRoot,
        detached: true,
        stdio: 'ignore',
        env: {
          ...process.env,
          SILENT_MODE: 'true',
          UNDERWATER_MODE: 'true'
        }
      });

      scheduler.unref();
      
    } catch (error) {
      // Silent error handling
    }
  }

  // 🛑 Stop scheduler
  async stopScheduler() {
    try {
      // Remove scheduler lock file to stop it
      const schedulerLockFile = path.join(this.projectRoot, 'scheduler.lock');
      if (fs.existsSync(schedulerLockFile)) {
        const lockData = fs.readFileSync(schedulerLockFile, 'utf8');
        const lockInfo = JSON.parse(lockData);
        
        try {
          process.kill(lockInfo.pid, 'SIGTERM');
        } catch (e) {
          // Process already dead
        }
        
        fs.unlinkSync(schedulerLockFile);
      }
      
    } catch (error) {
      // Silent error handling
    }
  }

  // 🛑 Stop monitoring
  stop() {
    this.isRunning = false;
    
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    
    // Stop scheduler
    this.stopScheduler();
    
    // Remove lock file
    this.removeLockFile();
  }
}

// 🚀 Start single IDE activity monitor
if (require.main === module) {
  const monitor = new SingleIDEActivityMonitor();
  monitor.start();
}

module.exports = SingleIDEActivityMonitor;
