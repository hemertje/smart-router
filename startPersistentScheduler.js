#!/usr/bin/env node

// 🚀 PERSISTENT SCHEDULER - START AUTOMATED DAILY MAIL
// Zorgt dat de scheduler altijd draait en herstart bij crash

const { spawn } = require('child_process');
const path = require('path');

class PersistentScheduler {
  constructor() {
    this.schedulerPath = path.join(__dirname, 'scheduler.js');
    this.isRunning = false;
    this.restartAttempts = 0;
    this.maxRestarts = 10;
  }

  // 🚀 Start persistent scheduler
  start() {
    console.log('🚀 STARTING PERSISTENT SCHEDULER...');
    console.log('=====================================');
    console.log('📧 Daily mail will be sent at 09:00');
    console.log('🔍 Real-time monitoring every 30 minutes');
    console.log('🔄 Auto-restart enabled');
    console.log('');

    this.startScheduler();
  }

  // 🔄 Start scheduler process
  startScheduler() {
    if (this.isRunning) {
      console.log('📊 Scheduler already running');
      return;
    }

    console.log('🔄 Starting scheduler process...');
    
    this.schedulerProcess = spawn('node', [this.schedulerPath], {
      stdio: 'inherit',
      cwd: __dirname
    });

    this.isRunning = true;
    this.restartAttempts = 0;

    // Handle process exit
    this.schedulerProcess.on('close', (code) => {
      this.isRunning = false;
      
      if (code !== 0 && this.restartAttempts < this.maxRestarts) {
        this.restartAttempts++;
        console.log(`🔄 Scheduler crashed (code: ${code}) - Restart attempt ${this.restartAttempts}/${this.maxRestarts}`);
        
        // Wait 5 seconds before restart
        setTimeout(() => {
          this.startScheduler();
        }, 5000);
      } else if (this.restartAttempts >= this.maxRestarts) {
        console.log('❌ Max restart attempts reached - Giving up');
      }
    });

    // Handle process error
    this.schedulerProcess.on('error', (error) => {
      console.error('❌ Scheduler process error:', error);
      this.isRunning = false;
    });

    console.log('✅ Persistent scheduler started successfully');
  }

  // 🛑 Stop persistent scheduler
  stop() {
    if (this.schedulerProcess) {
      console.log('🛑 Stopping persistent scheduler...');
      this.schedulerProcess.kill('SIGINT');
      this.isRunning = false;
    }
  }
}

// 🚀 Start persistent scheduler
const persistentScheduler = new PersistentScheduler();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down persistent scheduler...');
  persistentScheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down persistent scheduler...');
  persistentScheduler.stop();
  process.exit(0);
});

// Start the persistent scheduler
persistentScheduler.start();
