#!/usr/bin/env node

// 🚀 SINGLE SILENT SCHEDULER - VOORKOMT MEERDERE EMAILS!
// Process lock zorgt dat er maar 1 scheduler draait

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const cron = require('node-cron');

class SingleSilentScheduler {
  constructor() {
    this.lockFile = path.join(__dirname, 'scheduler.lock');
    this.dailyCheckPath = path.join(__dirname, 'simpleDailyCheck.js');
    this.isRunning = false;
    this.dailyMailSent = false;
    this.currentDate = new Date().toLocaleDateString('nl-NL');
  }

  // 🔒 Check if scheduler already running
  isSchedulerRunning() {
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
        startTime: new Date().toISOString(),
        date: this.currentDate
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

  // 🚀 Start single scheduler
  start() {
    // Check if already running
    if (this.isSchedulerRunning()) {
      // Silent exit - already running
      process.exit(0);
    }

    // Create lock file
    if (!this.createLockFile()) {
      // Silent exit - can't create lock
      process.exit(0);
    }

    this.isRunning = true;

    // Reset daily mail flag at midnight
    this.resetDailyMailFlag();

    // Check for catch-up on startup (laptop was off)
    this.checkCatchUpOnStartup();

    // Schedule daily check om 09:00 - SINGLE EXECUTION
    cron.schedule('0 9 * * *', () => {
      this.runDailyCheckOnce();
    }, {
      scheduled: true,
      timezone: "Europe/Amsterdam"
    });

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

  // 🔄 Reset daily mail flag at midnight
  resetDailyMailFlag() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow - now;

    setTimeout(() => {
      this.dailyMailSent = false;
      this.currentDate = new Date().toLocaleDateString('nl-NL');
      
      // Schedule next reset
      this.resetDailyMailFlag();
    }, msUntilMidnight);
  }

  // 📧 Run daily check - ONCE PER DAY
  runDailyCheckOnce() {
    if (!this.isRunning) return;

    const today = new Date().toLocaleDateString('nl-NL');
    
    // Check if mail already sent today
    if (this.dailyMailSent && today === this.currentDate) {
      // Mail already sent today - skip
      return;
    }

    try {
      // Run daily check
      const dailyCheck = spawn('node', [this.dailyCheckPath], {
        stdio: 'ignore',  // <- KEY: No console I/O
        cwd: __dirname,
        detached: true,
        env: {
          ...process.env,
          SILENT_MODE: 'true',
          UNDERWATER_MODE: 'true',
          SINGLE_EXECUTION: 'true'
        }
      });

      dailyCheck.unref(); // Let it run independently

      // Mark mail as sent
      this.dailyMailSent = true;
      this.currentDate = today;

      // Update lock file
      this.updateLockFile();

      dailyCheck.on('close', (code) => {
        // Silent handling
      });

      dailyCheck.on('error', () => {
        // Silent error handling
      });

    } catch (error) {
      // Silent error handling
    }
  }

  // � Check for catch-up on startup
  checkCatchUpOnStartup() {
    try {
      const today = new Date().toLocaleDateString('nl-NL');
      const now = new Date();
      const currentHour = now.getHours();
      
      // Only check if it's after 09:00 and before 23:00
      if (currentHour >= 9 && currentHour < 23) {
        // Check if daily results exist for today
        const resultsFile = path.join(__dirname, `simple-daily-results-${today.replace(/\//g, '-')}.json`);
        
        if (!fs.existsSync(resultsFile)) {
          // Check if mail was already sent today
          if (!this.dailyMailSent || today !== this.currentDate) {
            console.log('🔄 Late wake-up detected - running catch-up daily check');
            
            // Run catch-up daily check
            setTimeout(() => {
              this.runDailyCheckOnce();
            }, 5000); // Wait 5 seconds for system to stabilize
          }
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }

  // �🔒 Update lock file
  updateLockFile() {
    try {
      const lockInfo = {
        pid: process.pid,
        startTime: new Date().toISOString(),
        date: this.currentDate,
        dailyMailSent: this.dailyMailSent,
        lastMailTime: new Date().toISOString()
      };
      fs.writeFileSync(this.lockFile, JSON.stringify(lockInfo, null, 2));
    } catch (error) {
      // Silent error handling
    }
  }

  // 🛑 Stop scheduler
  stop() {
    this.isRunning = false;
    this.removeLockFile();
  }
}

// 🚀 Start single silent scheduler
if (require.main === module) {
  const scheduler = new SingleSilentScheduler();
  scheduler.start();
}

module.exports = SingleSilentScheduler;
