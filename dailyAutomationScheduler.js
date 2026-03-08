// 🚀 09:00 AUTOMATISCHE DAILY CHECK - CRON JOB SETUP!

const cron = require('node-cron');
const LiveDailyCheck = require('./liveDailyCheck');

// 🤖 Setup 09:00 dagelijkse automatisering
class DailyAutomationScheduler {
  constructor() {
    this.isRunning = false;
    this.dailyCheck = new LiveDailyCheck();
  }

  // ⏰ Start de 09:00 automatisering
  startDailyAutomation() {
    console.log('🚀 START 09:00 DAGELIJKSE AUTOMATISERING SETUP!');
    
    // 📅 Every day at 09:00 AM
    const dailyJob = cron.schedule('0 9 * * *', async () => {
      if (this.isRunning) {
        console.log('⏰ Daily check is al bezig...');
        return;
      }

      console.log('🚀 START 09:00 DAGELIJKSE CHECK - AUTOMATISCH!');
      this.isRunning = true;
      
      try {
        await this.dailyCheck.startLiveDailyCheck();
        console.log('✅ 09:00 dagelijkse check compleet!');
      } catch (error) {
        console.error('❌ 09:00 check failed:', error);
      } finally {
        this.isRunning = false;
      }
    }, {
      scheduled: false,
      timezone: "Europe/Amsterdam"
    });

    // 🚀 Start de job
    dailyJob.start();
    
    console.log('✅ 09:00 dagelijkse automatisering is ACTIEF!');
    console.log('⏰ Volgende check: morgen 09:00 uur');
    
    return dailyJob;
  }

  // 🔍 Test de daily check nu (voor testing)
  async testDailyCheck() {
    console.log('🧪 TEST DAILY CHECK NU...');
    
    try {
      await this.dailyCheck.startLiveDailyCheck();
      console.log('✅ Test daily check compleet!');
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  // 📊 Check status
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.getNextRunTime(),
      timezone: 'Europe/Amsterdam',
      schedule: '0 9 * * * (09:00 elke dag)'
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
}

// 🚀 Start de automatisering - GEEN LOOP!
async function setupDailyAutomation() {
  const scheduler = new DailyAutomationScheduler();
  
  // 🚀 Start de 09:00 automatisering
  const dailyJob = scheduler.startDailyAutomation();
  
  // 🧪 Test nu (geen user input meer)
  console.log('🧪 Testing daily check nu...');
  await scheduler.testDailyCheck();
  
  // 📊 Status check
  console.log('📊 Status:', scheduler.getStatus());
  
  console.log('🚀 Automatisering is actief! Script finished.');
  
  return dailyJob;
}

// 🚀 Export voor gebruik
module.exports = DailyAutomationScheduler;

// 🚀 Execute direct als script gerund wordt
if (require.main === module) {
  setupDailyAutomation();
}
