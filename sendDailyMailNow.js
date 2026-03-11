#!/usr/bin/env node

// 🚀 IMMEDIATE DAILY MAIL TRIGGER
// Verstuur de daily mail nu - voor testing

const { spawn } = require('child_process');
const path = require('path');

class ImmediateMailTrigger {
  constructor() {
    this.dailyCheckPath = path.join(__dirname, 'simpleDailyCheck.js');
  }

  // 🚀 Send daily mail now
  async sendDailyMailNow() {
    console.log('🚀 SENDING DAILY MAIL NOW...');
    console.log('=================================');
    console.log('📧 Running daily check immediately');
    console.log('🔍 Collecting real-time intelligence');
    console.log('📊 Generating email report');
    console.log('');

    try {
      // Run daily check
      const dailyCheck = spawn('node', [this.dailyCheckPath], {
        stdio: 'inherit',
        cwd: __dirname
      });

      dailyCheck.on('close', (code) => {
        if (code === 0) {
          console.log('');
          console.log('✅ Daily mail sent successfully!');
          console.log('📧 Check your inbox for the report');
          console.log('🎯 Next automated mail: Tomorrow 09:00');
        } else {
          console.error('❌ Daily check failed with code:', code);
        }
      });

      dailyCheck.on('error', (error) => {
        console.error('❌ Error running daily check:', error);
      });

    } catch (error) {
      console.error('❌ Error triggering daily mail:', error);
    }
  }
}

// 🚀 Send daily mail now
const trigger = new ImmediateMailTrigger();
trigger.sendDailyMailNow();
