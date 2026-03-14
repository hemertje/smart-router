#!/usr/bin/env node

// 🔄 CATCH-UP SCHEDULER - VOOR LATE WAKE-UP!
// Checkt of daily check gemist is en voert uit indien nodig

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class CatchUpScheduler {
  constructor() {
    this.lockFile = path.join(__dirname, 'catch-up.lock');
    this.dailyCheckPath = path.join(__dirname, 'simpleDailyCheck.js');
    this.schedulerLockFile = path.join(__dirname, 'scheduler.lock');
  }

  // 🔒 Check if catch-up already running
  isCatchUpRunning() {
    try {
      if (fs.existsSync(this.lockFile)) {
        const lockData = fs.readFileSync(this.lockFile, 'utf8');
        const lockInfo = JSON.parse(lockData);
        
        try {
          process.kill(lockInfo.pid, 0);
          return true;
        } catch (e) {
          fs.unlinkSync(this.lockFile);
          return false;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // 🔒 Create catch-up lock
  createCatchUpLock() {
    try {
      const lockInfo = {
        pid: process.pid,
        startTime: new Date().toISOString(),
        type: 'catch-up'
      };
      fs.writeFileSync(this.lockFile, JSON.stringify(lockInfo, null, 2));
      return true;
    } catch (error) {
      return false;
    }
  }

  // 🕐 Check if daily check missed today
  wasDailyCheckMissed() {
    try {
      const today = new Date().toLocaleDateString('nl-NL');
      const now = new Date();
      const currentHour = now.getHours();
      
      // Check if it's after 09:00 and before midnight
      if (currentHour < 9 || currentHour >= 24) {
        return false; // Too early or too late
      }

      // Check if daily results exist for today
      const resultsFile = path.join(__dirname, `simple-daily-results-${today.replace(/\//g, '-')}.json`);
      
      if (fs.existsSync(resultsFile)) {
        return false; // Daily check already done
      }

      // Check scheduler lock file
      if (fs.existsSync(this.schedulerLockFile)) {
        const schedulerData = JSON.parse(fs.readFileSync(this.schedulerLockFile, 'utf8'));
        
        // Check if mail was sent today
        if (schedulerData.dailyMailSent && schedulerData.date === today) {
          return false; // Mail already sent
        }
      }

      return true; // Daily check was missed
    } catch (error) {
      return false;
    }
  }

  // 🚀 Run catch-up daily check
  runCatchUpCheck() {
    if (!this.wasDailyCheckMissed()) {
      console.log('✅ No catch-up needed - daily check already done or not time yet');
      this.removeCatchUpLock();
      return;
    }

    console.log('🔄 Running catch-up daily check...');

    try {
      const dailyCheck = spawn('node', [this.dailyCheckPath], {
        stdio: 'ignore',
        cwd: __dirname,
        detached: true,
        env: {
          ...process.env,
          CATCH_UP_MODE: 'true',
          SILENT_MODE: 'true',
          UNDERWATER_MODE: 'true'
        }
      });

      dailyCheck.unref();

      dailyCheck.on('close', (code) => {
        console.log('✅ Catch-up daily check completed');
        this.removeCatchUpLock();
      });

      dailyCheck.on('error', (error) => {
        console.log('❌ Catch-up daily check failed');
        this.removeCatchUpLock();
      });

    } catch (error) {
      console.log('❌ Error running catch-up check');
      this.removeCatchUpLock();
    }
  }

  // 🔒 Remove catch-up lock
  removeCatchUpLock() {
    try {
      if (fs.existsSync(this.lockFile)) {
        fs.unlinkSync(this.lockFile);
      }
    } catch (error) {
      // Silent error handling
    }
  }

  // 🚀 Start catch-up scheduler
  start() {
    // Check if already running
    if (this.isCatchUpRunning()) {
      process.exit(0);
    }

    // Create lock file
    if (!this.createCatchUpLock()) {
      process.exit(0);
    }

    // Run catch-up check immediately
    this.runCatchUpCheck();

    // Schedule catch-up check every hour between 09:00 and 23:00
    setInterval(() => {
      this.runCatchUpCheck();
    }, 60 * 60 * 1000); // Every hour

    // Clean exit
    process.on('SIGINT', () => {
      this.removeCatchUpLock();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.removeCatchUpLock();
      process.exit(0);
    });
  }
}

// 🚀 Start catch-up scheduler
if (require.main === module) {
  const scheduler = new CatchUpScheduler();
  scheduler.start();
}

module.exports = CatchUpScheduler;
