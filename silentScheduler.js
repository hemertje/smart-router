#!/usr/bin/env node

// 🚀 SILENT SCHEDULER - 100% ONDERWATER OPERATION
// Complete silent scheduler met zero console output

const { spawn } = require('child_process');
const cron = require('node-cron');
const path = require('path');

class SilentScheduler {
  constructor() {
    this.dailyCheckPath = path.join(__dirname, 'simpleDailyCheck.js');
    this.isRunning = false;
    this.restartAttempts = 0;
    this.maxRestarts = 10;
  }

  // 🚀 Start silent scheduler
  start() {
    // No console output - complete silent mode
    this.isRunning = true;
    this.restartAttempts = 0;

    // Schedule daily check om 09:00 - SILENT
    cron.schedule('0 9 * * *', () => {
      this.runDailyCheckSilent();
    }, {
      scheduled: true,
      timezone: "Europe/Amsterdam"
    });

    // Schedule check elke 30 minuten - SILENT
    cron.schedule('*/30 * * * *', () => {
      this.runQuickCheckSilent();
    });

    // Handle graceful shutdown - SILENT
    process.on('SIGINT', () => {
      this.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.stop();
      process.exit(0);
    });

    // No console output - 100% underwater
  }

  // 🔄 Run daily check - COMPLETELY SILENT
  runDailyCheckSilent() {
    if (!this.isRunning) return;

    try {
      const dailyCheck = spawn('node', [this.dailyCheckPath], {
        stdio: 'ignore',  // <- KEY: No console I/O
        cwd: __dirname,
        detached: true,
        env: {
          ...process.env,
          SILENT_MODE: 'true',
          UNDERWATER_MODE: 'true'
        }
      });

      dailyCheck.unref(); // Let it run independently

      dailyCheck.on('close', (code) => {
        // Silent handling - no console output
        if (code !== 0 && this.restartAttempts < this.maxRestarts) {
          this.restartAttempts++;
          // Silent restart after 30 seconds
          setTimeout(() => {
            this.runDailyCheckSilent();
          }, 30000);
        }
      });

      dailyCheck.on('error', () => {
        // Silent error handling
      });

    } catch (error) {
      // Silent error handling
    }
  }

  // 🔄 Run quick check - COMPLETELY SILENT
  runQuickCheckSilent() {
    if (!this.isRunning) return;

    try {
      // Quick check without email - just monitoring
      const quickCheck = spawn('node', [this.dailyCheckPath], {
        stdio: 'ignore',  // <- KEY: No console I/O
        cwd: __dirname,
        detached: true,
        env: {
          ...process.env,
          SILENT_MODE: 'true',
          UNDERWATER_MODE: 'true',
          QUICK_CHECK: 'true'
        }
      });

      quickCheck.unref(); // Let it run independently

    } catch (error) {
      // Silent error handling
    }
  }

  // 🛑 Stop silent scheduler
  stop() {
    this.isRunning = false;
    // Silent shutdown - no console output
  }
}

// 🚀 Start silent scheduler - COMPLETELY UNDERWATER
if (require.main === module) {
  const silentScheduler = new SilentScheduler();
  silentScheduler.start();
}

module.exports = SilentScheduler;
