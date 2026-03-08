// 🚀 FORCEER SIMPELE MANUAL RUN!

const SmartDailyAutomation = require('./smartDailyAutomation');

// 🚀 Forceer manual run met simpele check
async function forceSimpleRun() {
  console.log('🚀 FORCEER SIMPELE MANUAL RUN - WORKING EMAIL!');
  
  const scheduler = new SmartDailyAutomation();
  
  // 🧪 Clear state om te forceren
  scheduler.lastRunDate = null;
  
  // 🚀 Forceer de check
  await scheduler.checkAndRunIfMissed();
  
  console.log('✅ Simpele manual run compleet!');
}

// 🚀 Execute
forceSimpleRun().catch(console.error);
