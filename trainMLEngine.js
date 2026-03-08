// 🚀 TRAIN SMART ROUTER ML ENGINE
const SmartRouterMLEngine = require('./smartRouterMLEngine');

async function trainMLEngine() {
  console.log('🚀 Starting Smart Router ML Engine Training...');
  
  try {
    // Initialize ML Engine
    const mlEngine = new SmartRouterMLEngine();
    
    // Train the model
    await mlEngine.trainModel(100);
    
    // Get model status
    const status = mlEngine.getModelStatus();
    console.log('📊 Model Status:', status);
    
    // Test predictions
    const testFeatures = {
      source_relevance: 0.9,
      update_frequency: 0.8,
      source_type: 0.9,
      has_ai_keywords: 1,
      is_competitor: 1,
      engagement_potential: 0.8
    };
    
    const prediction = mlEngine.predict(testFeatures);
    console.log('🔮 Test Prediction:', prediction);
    
    // Start continuous learning
    await mlEngine.continuousLearning();
    
    console.log('✅ ML Engine Training Completed!');
    
  } catch (error) {
    console.error('❌ ML Engine Training Failed:', error);
  }
}

// Run training
trainMLEngine();
