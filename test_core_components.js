// Smart Router Core Components Test
const { IntentClassifier } = require('./out/classifier');
const { SettingsManager } = require('./out/settings');
const { OpenRouterClient } = require('./out/openrouter');
const { CostTracker } = require('./out/costTracker');
const { ProjectDetector } = require('./out/projectDetector');
const { Logger } = require('./out/logger');
const { RealTimePerformanceMonitor } = require('./out/performanceMonitor');

async function testCoreComponents() {
  console.log('🧪 Testing Smart Router Core Components...\n');
  
  // Test 1: Logger
  try {
    const logger = Logger.getInstance();
    console.log('✅ Logger initialized successfully');
  } catch (error) {
    console.log('❌ Logger failed:', error.message);
  }
  
  // Test 2: SettingsManager
  try {
    const settings = new SettingsManager();
    const apiKey = settings.getApiKey();
    console.log('✅ SettingsManager initialized');
    console.log('📋 API Key configured:', apiKey ? 'Yes' : 'No');
  } catch (error) {
    console.log('❌ SettingsManager failed:', error.message);
  }
  
  // Test 3: ProjectDetector
  try {
    const projectDetector = new ProjectDetector();
    console.log('✅ ProjectDetector initialized');
  } catch (error) {
    console.log('❌ ProjectDetector failed:', error.message);
  }
  
  // Test 4: IntentClassifier
  try {
    const classifier = new IntentClassifier();
    const testIntent = await classifier.classify('Help me debug this code');
    console.log('✅ IntentClassifier initialized');
    console.log('🎯 Test intent classification:', testIntent);
  } catch (error) {
    console.log('❌ IntentClassifier failed:', error.message);
  }
  
  // Test 5: OpenRouter Client (only if API key is configured)
  try {
    const settings = new SettingsManager();
    const apiKey = settings.getApiKey();
    if (apiKey) {
      const openRouter = new OpenRouterClient(apiKey);
      console.log('✅ OpenRouterClient initialized');
      console.log('🌐 Testing OpenRouter connection...');
      
      // Simple test request
      const result = await openRouter.complete('anthropic/claude-3.5-haiku', [
        { role: 'user', content: 'Hello, this is a test message.' }
      ], {
        max_tokens: 50,
        temperature: 0.7
      });
      
      console.log('✅ OpenRouter test successful');
      console.log('📝 Response:', result.choices[0].message.content.substring(0, 100) + '...');
    } else {
      console.log('⚠️ OpenRouter test skipped - No API key configured');
    }
  } catch (error) {
    console.log('❌ OpenRouter failed:', error.message);
  }
  
  // Test 6: CostTracker
  try {
    const projectDetector = new ProjectDetector();
    const costTracker = new CostTracker(projectDetector);
    console.log('✅ CostTracker initialized');
    
    // Test usage tracking
    await costTracker.trackUsage('debug', 'anthropic/claude-3.5-haiku', 100, 'Test', 0, {
      prompt: 30,
      completion: 70,
      total: 100
    });
    console.log('✅ CostTracker test successful');
  } catch (error) {
    console.log('❌ CostTracker failed:', error.message);
  }
  
  // Test 7: Performance Monitor
  try {
    const performanceMonitor = new RealTimePerformanceMonitor();
    const metrics = await performanceMonitor.getMetrics();
    console.log('✅ PerformanceMonitor initialized');
    console.log('📊 Performance metrics:', metrics);
  } catch (error) {
    console.log('❌ PerformanceMonitor failed:', error.message);
  }
  
  console.log('\n🎯 Core Components Test Complete!');
}

// Run tests
testCoreComponents().catch(console.error);
