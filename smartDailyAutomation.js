// 🚀 SLIMME DAGELIJKSE AUTOMATISERING - 09:00 OF FIRST ACTIVE HOUR!

const cron = require('node-cron');
const SimpleDailyCheck = require('./simpleDailyCheck');
const fs = require('fs');
const path = require('path');

// 🤖 Slimme dagelijkse automatisering
class SmartDailyAutomation {
  constructor() {
    this.isRunning = false;
    this.dailyCheck = new SimpleDailyCheck();
    this.stateFile = path.join(__dirname, 'daily-automation-state.json');
    this.dailyJob = null;
    this.catchUpJob = null;
    this.lastRunDate = this.getLastRunDate();
  }

  // 📅 Laatste run datum laden
  getLastRunDate() {
    try {
      if (fs.existsSync(this.stateFile)) {
        const state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
        return state.lastRunDate;
      }
    } catch (error) {
      console.log('📝 Geen state file gevonden');
    }
    return null;
  }

  // 💾 Save state
  saveState(date) {
    try {
      const state = {
        lastRunDate: date,
        timestamp: new Date().toISOString(),
        nextRun: this.getNextRunTime()
      };
      fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('❌ State save failed:', error);
    }
  }

  // 🚀 Start slimme automatisering - NOG GEEN JOBS!
  startSmartAutomation() {
    console.log('🚀 START SLIMME DAGELIJKSE AUTOMATISERING!');
    console.log('📅 Laatste run:', this.lastRunDate || 'Nooit');
    
    // 🧪 Check of we nu moeten draaien
    this.checkAndRunIfMissed();
    
    // 📅 Start 09:00 job
    this.setupDailyJob();
    
    // 🔄 Start catch-up job
    this.setupCatchUpJob();
    
    console.log('✅ Slimme automatisering ACTIEF!');
    console.log('⏰ Geplande 09:00 checks + catch-up 09:05-17:00');
    console.log('🔄 Catch-up: draait hele dag van 09:05-17:00 als 09:00 gemist');
    
    // 🚀 EXIT SCRIPT - Laat jobs op achtergrond draaien
    console.log('🚀 Script finished. Jobs draaien op achtergrond!');
    process.exit(0);
  }

  // 📅 Setup 09:00 job
  setupDailyJob() {
    const dailyJob = cron.schedule('0 9 * * *', async () => {
      await this.executeDailyCheck('09:00 scheduled');
    }, {
      scheduled: true,
      timezone: "Europe/Amsterdam"
    });
    
    console.log('📅 09:00 job gestart');
  }

  // 🔄 Setup catch-up job
  setupCatchUpJob() {
    const catchUpJob = cron.schedule('*/5 * * * *', async () => {
      await this.checkAndRunIfMissed();
    }, {
      scheduled: true,
      timezone: "Europe/Amsterdam"
    });
    
    console.log('🔄 Catch-up job gestart (elke 5 minuten)');
  }

  // 🔄 Check of we gemiste run moeten uitvoeren
  async checkAndRunIfMissed() {
    const today = new Date().toLocaleDateString('nl-NL');
    const now = new Date();
    const currentHour = now.getHours();
    
    // 📊 Check of vandaag al gedraaid
    if (this.lastRunDate === today) {
      return; // Al gedraaid vandaag
    }

    // 🕐 Check of het 09:00 is geweest
    if (currentHour >= 9) {
      console.log(`🔄 Check voor gemiste 09:00 run...`);
      
      // 🕘 Check of we in het "first active hour" zijn (09:00-10:00 of eerste uur na start)
      const isActiveHour = this.isActiveHour(currentHour);
      
      if (isActiveHour) {
        console.log(`🚀 Active hour detected (${currentHour}:00) - voer gemiste daily check uit!`);
        await this.executeDailyCheck(`catch-up ${currentHour}:00`);
      }
    }
  }

  // 🕐 Check of het "active hour" is
  isActiveHour(currentHour) {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    
    // 🕘 09:00-10:00 is altijd active hour
    if (hour === 9) {
      return true;
    }
    
    // 🌅 Extended catch-up periode: 09:05-17:00
    if (hour >= 10 && hour < 17) {
      return true;
    }
    
    // 🖥️ Als de laptop net gestart is, eerste uur is active
    const uptime = process.uptime();
    if (uptime < 3600) { // Eerste uur
      return true;
    }
    
    return false;
  }

  // 🚀 Execute daily check
  async executeDailyCheck(trigger) {
    if (this.isRunning) {
      console.log('⏰ Daily check is al bezig...');
      return;
    }

    const today = new Date().toLocaleDateString('nl-NL');
    console.log(`🚀 START DAGELIJKSE CHECK - Trigger: ${trigger}`);
    this.isRunning = true;
    
    try {
      await this.dailyCheck.startSimpleDailyCheck();
      this.lastRunDate = today;
      this.saveState(today);
      console.log(`✅ Daily check compleet! (${trigger})`);
    } catch (error) {
      console.error(`❌ Daily check failed (${trigger}):`, error);
    } finally {
      this.isRunning = false;
    }
  }

  // 📊 Get status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRunDate: this.lastRunDate,
      nextRun: this.getNextRunTime(),
      timezone: 'Europe/Amsterdam',
      schedule: {
        daily: '0 9 * * * (09:00 elke dag)',
        catchUp: '*/5 * * * * (elke 5 minuten catch-up)'
      },
      activeHour: this.isActiveHour(new Date().getHours())
    };
  }

  // 📅 Bereken volgende run tijd
  getNextRunTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    return tomorrow.toLocaleString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 🛑 Stop automatisering
  stopAutomation() {
    if (this.dailyJob) {
      this.dailyJob.stop();
    }
    if (this.catchUpJob) {
      this.catchUpJob.stop();
    }
    console.log('🛑 Slimme automatisering gestopt');
  }
}

// 🚀 Start slimme automatisering
async function startSmartAutomation() {
  const scheduler = new SmartDailyAutomation();
  
  // 🚀 Start de slimme automatisering
  scheduler.startSmartAutomation();
  
  // 📊 Status
  console.log('📊 Status:', scheduler.getStatus());
  
  console.log('🚀 Slimme automatisering is actief! Nooit meer gemiste daily checks!');
  
  return scheduler;
}

// 🚀 Export voor gebruik
module.exports = SmartDailyAutomation;

// 🚀 Execute direct als script gerund wordt
if (require.main === module) {
  startSmartAutomation().catch(console.error);
}
