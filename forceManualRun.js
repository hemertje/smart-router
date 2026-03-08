// 🚀 MANUAL DAILY CHECK - FORCEER EEN RUN VOOR TESTING!

const SmartDailyAutomation = require('./smartDailyAutomation');

// 🚀 Forceer manual run
async function forceManualRun() {
  console.log('🚀 FORCEER MANUAL DAILY CHECK - TESTING!');
  
  const scheduler = new SmartDailyAutomation();
  
  // 🧪 Clear state om te forceren
  scheduler.lastRunDate = null;
  
  // 🚀 Forceer de check
  await scheduler.checkAndRunIfMissed();
  
  console.log('✅ Manual run compleet!');
}

// 🚀 Execute
forceManualRun().catch(console.error);
