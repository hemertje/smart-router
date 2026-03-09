#!/usr/bin/env node

// 📅 SMART ROUTER SCHEDULER - AUTOMATED DAILY REPORTS
// Zorgt dat elke dag om 09:00 de mail verstuurd wordt

const { execSync } = require('child_process');
const cron = require('node-cron');
const path = require('path');

class SmartRouterScheduler {
  constructor() {
    this.isRunning = false;
    this.dailyCheckPath = path.join(__dirname, 'simpleDailyCheck.js');
  }

  // 🚀 Start de scheduler
  start() {
    console.log('📅 SMART ROUTER SCHEDULER V2.7.1');
    console.log('==================================');
    console.log('📧 Daily mail scheduled for 09:00');
    console.log('🔍 Real-time monitoring active');
    console.log('');

    // Schedule daily check om 09:00 (of wanneer dan ook)
    cron.schedule('0 9 * * *', () => {
      this.runDailyCheck();
    }, {
      scheduled: true,
      timezone: "Europe/Amsterdam"
    });

    // FLEXIBELE OPTIE - Mail versturen wanneer daily check gedraaid wordt
    // Dit is de PROACTIEVE aanpak - geen vaste tijd, maar wanneer de data klaar is

    // Schedule check elke 30 minuten voor real-time monitoring
    cron.schedule('*/30 * * * *', () => {
      this.runQuickCheck();
    });

    console.log('✅ Scheduler started successfully');
    console.log('📧 Next daily report: Tomorrow 09:00');
    console.log('🔍 Quick checks: Every 30 minutes');
    console.log('');
    console.log('🔄 Monitoring started... Press Ctrl+C to stop');

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping scheduler...');
      process.exit(0);
    });
  }

  // 📊 Run daily check (volledig)
  async runDailyCheck() {
    if (this.isRunning) {
      console.log('⚠️ Daily check already running, skipping...');
      return;
    }

    this.isRunning = true;
    const timestamp = new Date().toLocaleString();
    
    console.log(`📧 [${timestamp}] Running daily check...`);
    
    try {
      // Run de volledige daily check
      execSync(`node "${this.dailyCheckPath}"`, { 
        stdio: 'inherit',
        cwd: __dirname
      });
      
      console.log('✅ Daily check completed successfully');
      
    } catch (error) {
      console.error('❌ Daily check failed:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  // 🔍 Run quick check (real-time monitoring)
  async runQuickCheck() {
    const timestamp = new Date().toLocaleString();
    
    console.log(`🔍 [${timestamp}] Quick check...`);
    
    try {
      // Quick monitoring check
      const HyperIntelligentAggregator = require('./hyperIntelligentAggregator.js');
      const aggregator = new HyperIntelligentAggregator();
      
      // Quick aggregation (limit sources for speed)
      const quickResults = await aggregator.quickAggregation();
      
      if (quickResults.alerts && quickResults.alerts.length > 0) {
        console.log(`🚨 [${timestamp}] ${quickResults.alerts.length} alerts detected!`);
        
        // Send immediate alert for critical issues
        const criticalAlerts = quickResults.alerts.filter(a => a.type === 'critical');
        if (criticalAlerts.length > 0) {
          console.log(`🚨 [${timestamp}] ${criticalAlerts.length} CRITICAL alerts found!`);
          await this.sendCriticalAlerts(criticalAlerts);
        }
      } else {
        console.log(`✅ [${timestamp}] No alerts detected`);
      }
      
    } catch (error) {
      console.error(`❌ [${timestamp}] Quick check failed:`, error.message);
    }
  }

  // 🚨 Send critical alerts
  async sendCriticalAlerts(alerts) {
    try {
      const nodemailer = require('nodemailer');
      const fs = require('fs');
      
      // Load mail config
      const mailConfigPath = path.join('C:\\Users\\Gebruiker\\.smart-router', 'mail-config.json');
      const mailConfig = JSON.parse(fs.readFileSync(mailConfigPath, 'utf8'));
      
      // Create transporter
      const transporter = nodemailer.createTransporter({
        host: mailConfig.smtp.host,
        port: mailConfig.smtp.port,
        secure: mailConfig.smtp.secure,
        auth: mailConfig.smtp.auth
      });

      // Send critical alert
      const alertText = alerts.map(a => `🚨 ${a.title}: ${a.message}`).join('\n');
      
      await transporter.sendMail({
        from: mailConfig.smtp.auth.user,
        to: mailConfig.notifications.dailyReport.recipients[0],
        subject: `🚨 CRITICAL: Smart Router Alert - ${new Date().toLocaleString()}`,
        text: `Critical alerts detected:\n\n${alertText}\n\nCheck dashboard for details.\n\nSmart Router v2.7.1`
      });
      
      console.log('📧 Critical alerts sent successfully');
      
    } catch (error) {
      console.error('❌ Failed to send critical alerts:', error.message);
    }
  }
}

// 🚀 Start de scheduler
if (require.main === module) {
  const scheduler = new SmartRouterScheduler();
  scheduler.start();
}

module.exports = SmartRouterScheduler;
