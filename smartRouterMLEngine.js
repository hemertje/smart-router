// 🧠 SMART ROUTER MACHINE LEARNING ENGINE
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SmartRouterMLEngine {
  constructor() {
    this.modelPath = path.join(__dirname, 'ml-models');
    this.trainingData = [];
    this.model = null;
    this.isTraining = false;
    this.predictionHistory = [];
    
    this.initializeMLEngine();
  }

  // 🎯 Initialize ML Engine
  initializeMLEngine() {
    console.log('🧠 Initializing Smart Router Machine Learning Engine...');
    
    // Create ML models directory
    if (!fs.existsSync(this.modelPath)) {
      fs.mkdirSync(this.modelPath, { recursive: true });
    }
    
    // Load existing training data
    this.loadTrainingData();
    
    // Initialize or load model
    this.initializeModel();
    
    console.log('✅ Smart Router ML Engine initialized!');
  }

  // 📊 Load Training Data
  loadTrainingData() {
    const trainingDataPath = path.join(this.modelPath, 'training-data.json');
    
    if (fs.existsSync(trainingDataPath)) {
      this.trainingData = JSON.parse(fs.readFileSync(trainingDataPath, 'utf8'));
      console.log(`📊 Loaded ${this.trainingData.length} training samples`);
    } else {
      // Initialize with Smart Router specific data
      this.trainingData = this.generateInitialTrainingData();
      this.saveTrainingData();
    }
  }

  // 🎯 Generate Initial Training Data
  generateInitialTrainingData() {
    const initialData = [];
    
    // Smart Router performance data
    const performanceData = this.collectSmartRouterPerformanceData();
    initialData.push(...performanceData);
    
    // User interaction data
    const interactionData = this.collectUserInteractionData();
    initialData.push(...interactionData);
    
    // System optimization data
    const optimizationData = this.collectSystemOptimizationData();
    initialData.push(...optimizationData);
    
    return initialData;
  }

  // 📈 Collect Smart Router Performance Data
  collectSmartRouterPerformanceData() {
    const performanceData = [];
    
    try {
      // Git commit data
      const gitLog = execSync('git log --oneline --since="1 month ago" --pretty=format:"%H|%s|%ct"', { cwd: __dirname }).toString();
      const commits = gitLog.split('\n').filter(line => line.trim());
      
      commits.forEach(commit => {
        const [hash, ...messageParts] = commit.split('|');
        const message = messageParts.slice(0, -1).join('|');
        const timestamp = parseInt(messageParts[messageParts.length - 1]);
        
        performanceData.push({
          type: 'performance',
          source: 'git_commits',
          features: this.extractCommitFeatures(message),
          target: this.calculatePerformanceImpact(message),
          timestamp,
          metadata: { hash, message }
        });
      });
      
      // Package.json dependencies
      const packageJsonPath = path.join(__dirname, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const dependencies = Object.keys(packageJson.dependencies || {});
        
        performanceData.push({
          type: 'performance',
          source: 'dependencies',
          features: {
            dependency_count: dependencies.length,
            security_packages: dependencies.filter(d => d.includes('security') || d.includes('auth')).length,
            ml_packages: dependencies.filter(d => d.includes('ml') || d.includes('ai')).length,
            update_frequency: this.calculateUpdateFrequency(dependencies)
          },
          target: this.assessDependencyPerformance(dependencies),
          timestamp: Date.now(),
          metadata: { dependencies }
        });
      }
      
    } catch (error) {
      console.error('Error collecting performance data:', error);
    }
    
    return performanceData;
  }

  // 🔍 Extract Commit Features
  extractCommitFeatures(commitMessage) {
    const features = {
      message_length: commitMessage.length,
      has_security_keywords: /security|auth|vulnerability|patch|fix/i.test(commitMessage),
      has_performance_keywords: /performance|optimize|speed|fast/i.test(commitMessage),
      has_ai_keywords: /ai|intelligence|learning|ml|model/i.test(commitMessage),
      has_feature_keywords: /feature|add|new|implement/i.test(commitMessage),
      urgency_score: this.calculateUrgencyScore(commitMessage),
      complexity_score: this.calculateComplexityScore(commitMessage)
    };
    
    return features;
  }

  // 📊 Calculate Performance Impact
  calculatePerformanceImpact(commitMessage) {
    let impact = 0.5; // baseline
    
    if (/security|vulnerability|patch/i.test(commitMessage)) {
      impact += 0.3;
    }
    if (/performance|optimize|speed/i.test(commitMessage)) {
      impact += 0.2;
    }
    if (/fix|bug|error/i.test(commitMessage)) {
      impact += 0.1;
    }
    if (/feature|add|new/i.test(commitMessage)) {
      impact += 0.1;
    }
    
    return Math.min(1, impact);
  }

  // 🎯 Calculate Urgency Score
  calculateUrgencyScore(commitMessage) {
    let score = 0;
    
    if (/critical|urgent|hotfix/i.test(commitMessage)) score += 0.8;
    if (/important|priority/i.test(commitMessage)) score += 0.5;
    if (/security|vulnerability/i.test(commitMessage)) score += 0.7;
    if (/performance|optimize/i.test(commitMessage)) score += 0.3;
    
    return Math.min(1, score);
  }

  // 🧮 Calculate Complexity Score
  calculateComplexityScore(commitMessage) {
    let score = 0.2; // baseline
    
    score += Math.min(commitMessage.length / 100, 0.3);
    score += (commitMessage.match(/\//g) || []).length * 0.1;
    score += (commitMessage.match(/[A-Z][a-z]+[A-Z]/g) || []).length * 0.1;
    
    return Math.min(1, score);
  }

  // 📦 Calculate Update Frequency
  calculateUpdateFrequency(dependencies) {
    // Simulate update frequency check
    return dependencies.length * 0.1;
  }

  // 🔍 Assess Dependency Performance
  assessDependencyPerformance(dependencies) {
    let score = 0.5;
    
    // Check for modern dependencies
    if (dependencies.includes('express')) score += 0.1;
    if (dependencies.includes('nodemailer')) score += 0.1;
    if (dependencies.includes('axios')) score += 0.1;
    
    // Check for security dependencies
    if (dependencies.some(d => d.includes('security') || d.includes('auth'))) {
      score += 0.2;
    }
    
    return Math.min(1, score);
  }

  // 👥 Collect User Interaction Data
  collectUserInteractionData() {
    const interactionData = [];
    
    // Email interaction data
    const emailHistoryPath = path.join(__dirname, 'email-history.json');
    if (fs.existsSync(emailHistoryPath)) {
      const emailHistory = JSON.parse(fs.readFileSync(emailHistoryPath, 'utf8'));
      
      emailHistory.forEach(email => {
        interactionData.push({
          type: 'interaction',
          source: 'email',
          features: {
            email_length: email.content?.length || 0,
            has_security_content: /security|threat|vulnerability/i.test(email.content || ''),
            has_performance_content: /performance|optimize|speed/i.test(email.content || ''),
            time_of_day: new Date(email.timestamp).getHours(),
            day_of_week: new Date(email.timestamp).getDay()
          },
          target: this.calculateEngagementScore(email),
          timestamp: email.timestamp,
          metadata: { email_id: email.id }
        });
      });
    }
    
    return interactionData;
  }

  // 📈 Calculate Engagement Score
  calculateEngagementScore(email) {
    let score = 0.5;
    
    if (email.opened) score += 0.2;
    if (email.clicked) score += 0.3;
    if (email.replied) score += 0.3;
    
    return Math.min(1, score);
  }

  // ⚙️ Collect System Optimization Data
  collectSystemOptimizationData() {
    const optimizationData = [];
    
    // System performance metrics
    const systemMetrics = this.collectSystemMetrics();
    optimizationData.push(systemMetrics);
    
    // Code quality metrics
    const codeMetrics = this.collectCodeMetrics();
    optimizationData.push(codeMetrics);
    
    return optimizationData;
  }

  // 📊 Collect System Metrics
  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      type: 'optimization',
      source: 'system_metrics',
      features: {
        memory_usage: memUsage.heapUsed / memUsage.heapTotal,
        cpu_usage: cpuUsage.user + cpuUsage.system,
        uptime: process.uptime(),
        active_handles: process._getActiveHandles().length
      },
      target: this.calculateSystemHealth(memUsage, cpuUsage),
      timestamp: Date.now(),
      metadata: { memUsage, cpuUsage }
    };
  }

  // 🔍 Collect Code Metrics
  collectCodeMetrics() {
    const codeMetrics = {
      type: 'optimization',
      source: 'code_metrics',
      features: {
        total_files: this.countFiles(__dirname),
        js_files: this.countFiles(__dirname, '.js'),
        json_files: this.countFiles(__dirname, '.json'),
        total_lines: this.countTotalLines(__dirname),
        test_files: this.countFiles(__dirname, '.test.js')
      },
      target: this.calculateCodeQuality(),
      timestamp: Date.now(),
      metadata: {}
    };
    
    return codeMetrics;
  }

  // 📁 Count Files
  countFiles(dir, extension = null) {
    let count = 0;
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          count += this.countFiles(fullPath, extension);
        } else if (stat.isFile()) {
          if (!extension || item.endsWith(extension)) {
            count++;
          }
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible directories
    }
    
    return count;
  }

  // 📄 Count Total Lines
  countTotalLines(dir) {
    let totalLines = 0;
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          totalLines += this.countTotalLines(fullPath);
        } else if (stat.isFile() && item.endsWith('.js')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            totalLines += content.split('\n').length;
          } catch (error) {
            // Ignore files that can't be read
          }
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible directories
    }
    
    return totalLines;
  }

  // 🏥 Calculate System Health
  calculateSystemHealth(memUsage, cpuUsage) {
    let health = 1.0;
    
    // Memory health
    const memRatio = memUsage.heapUsed / memUsage.heapTotal;
    if (memRatio > 0.8) health -= 0.3;
    else if (memRatio > 0.6) health -= 0.1;
    
    // CPU health
    const cpuTotal = cpuUsage.user + cpuUsage.system;
    if (cpuTotal > 1000000) health -= 0.2; // High CPU usage
    
    return Math.max(0, health);
  }

  // 📈 Calculate Code Quality
  calculateCodeQuality() {
    let quality = 0.5;
    
    // Base quality on file structure
    const jsFiles = this.countFiles(__dirname, '.js');
    const testFiles = this.countFiles(__dirname, '.test.js');
    
    if (testFiles > 0) quality += 0.2; // Has tests
    if (jsFiles > 5) quality += 0.1; // Good file organization
    
    return Math.min(1, quality);
  }

  // 🧠 Initialize Model
  initializeModel() {
    const modelPath = path.join(this.modelPath, 'smart-router-model.json');
    
    if (fs.existsSync(modelPath)) {
      this.model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
      console.log('🧠 Loaded existing ML model');
    } else {
      this.model = this.createInitialModel();
      this.saveModel();
    }
  }

  // 🎯 Create Initial Model
  createInitialModel() {
    return {
      type: 'neural_network',
      architecture: 'feed_forward',
      layers: [
        { type: 'input', size: 10 },
        { type: 'hidden', size: 20, activation: 'relu' },
        { type: 'hidden', size: 10, activation: 'relu' },
        { type: 'output', size: 1, activation: 'sigmoid' }
      ],
      weights: this.initializeWeights(),
      bias: this.initializeBias(),
      training_history: [],
      performance_metrics: {
        accuracy: 0.5,
        loss: 1.0,
        precision: 0.5,
        recall: 0.5
      },
      created_at: Date.now(),
      last_updated: Date.now()
    };
  }

  // 🔢 Initialize Weights
  initializeWeights() {
    const weights = [];
    const layers = [10, 20, 10, 1];
    
    for (let i = 0; i < layers.length - 1; i++) {
      const layerWeights = [];
      for (let j = 0; j < layers[i]; j++) {
        const neuronWeights = [];
        for (let k = 0; k < layers[i + 1]; k++) {
          neuronWeights.push((Math.random() - 0.5) * 2); // Random weights between -1 and 1
        }
        layerWeights.push(neuronWeights);
      }
      weights.push(layerWeights);
    }
    
    return weights;
  }

  // 🎯 Initialize Bias
  initializeBias() {
    return [0, 0, 0]; // Bias for each hidden layer and output layer
  }

  // 🚀 Train Model
  async trainModel(epochs = 100) {
    if (this.isTraining) {
      console.log('⚠️ Model is already training');
      return;
    }
    
    this.isTraining = true;
    console.log('🚀 Starting Smart Router ML model training...');
    
    try {
      for (let epoch = 0; epoch < epochs; epoch++) {
        const epochLoss = await this.trainEpoch();
        
        // Update training history
        this.model.training_history.push({
          epoch: epoch + 1,
          loss: epochLoss,
          timestamp: Date.now()
        });
        
        // Log progress
        if (epoch % 10 === 0) {
          console.log(`📊 Epoch ${epoch + 1}/${epochs}, Loss: ${epochLoss.toFixed(4)}`);
        }
      }
      
      // Update performance metrics
      this.updatePerformanceMetrics();
      
      // Save trained model
      this.saveModel();
      
      console.log('✅ Model training completed!');
      
    } catch (error) {
      console.error('❌ Model training failed:', error);
    } finally {
      this.isTraining = false;
    }
  }

  // 📊 Train Epoch
  async trainEpoch() {
    let totalLoss = 0;
    const batchSize = Math.min(32, this.trainingData.length);
    
    // Shuffle training data
    const shuffledData = [...this.trainingData].sort(() => Math.random() - 0.5);
    
    // Process in batches
    for (let i = 0; i < shuffledData.length; i += batchSize) {
      const batch = shuffledData.slice(i, i + batchSize);
      const batchLoss = await this.processBatch(batch);
      totalLoss += batchLoss;
    }
    
    return totalLoss / shuffledData.length;
  }

  // 🔄 Process Batch
  async processBatch(batch) {
    let batchLoss = 0;
    
    for (const sample of batch) {
      // Forward pass
      const prediction = this.forwardPass(sample.features);
      
      // Calculate loss
      const loss = this.calculateLoss(prediction, sample.target);
      batchLoss += loss;
      
      // Backward pass (gradient descent)
      this.backwardPass(sample.features, sample.target, prediction, 0.01); // Learning rate: 0.01
    }
    
    return batchLoss / batch.length;
  }

  // 🔮 Forward Pass
  forwardPass(features) {
    // Convert features to array
    const inputVector = this.featuresToVector(features);
    
    // Simple neural network forward pass
    let activation = inputVector;
    
    for (let layer = 0; layer < this.model.layers.length - 1; layer++) {
      activation = this.matrixMultiply(activation, this.model.weights[layer]);
      
      // Add bias
      if (layer < this.model.bias.length) {
        activation = activation.map(val => val + this.model.bias[layer]);
      }
      
      // Apply activation function
      activation = this.applyActivation(activation, this.model.layers[layer + 1].activation);
    }
    
    return activation[0]; // Return single output value
  }

  // 🔄 Backward Pass
  backwardPass(features, target, prediction, learningRate) {
    // Simplified backward pass
    const error = prediction - target;
    
    // Update weights (simplified gradient descent)
    for (let layer = 0; layer < this.model.weights.length; layer++) {
      for (let i = 0; i < this.model.weights[layer].length; i++) {
        for (let j = 0; j < this.model.weights[layer][i].length; j++) {
          this.model.weights[layer][i][j] -= learningRate * error * 0.1; // Simplified gradient
        }
      }
    }
    
    // Update bias
    for (let i = 0; i < this.model.bias.length; i++) {
      this.model.bias[i] -= learningRate * error * 0.1;
    }
  }

  // 📊 Calculate Loss
  calculateLoss(prediction, target) {
    return Math.pow(prediction - target, 2); // Mean squared error
  }

  // 🔢 Features to Vector
  featuresToVector(features) {
    // Convert feature object to fixed-size vector
    const vector = [];
    
    // Common features
    vector.push(features.message_length || 0);
    vector.push(features.has_security_keywords ? 1 : 0);
    vector.push(features.has_performance_keywords ? 1 : 0);
    vector.push(features.has_ai_keywords ? 1 : 0);
    vector.push(features.urgency_score || 0);
    vector.push(features.complexity_score || 0);
    vector.push(features.dependency_count || 0);
    vector.push(features.memory_usage || 0);
    vector.push(features.cpu_usage || 0);
    vector.push(features.total_files || 0);
    
    // Pad or truncate to 10 elements
    while (vector.length < 10) {
      vector.push(0);
    }
    
    return vector.slice(0, 10);
  }

  // 🧮 Matrix Multiply
  matrixMultiply(vector, weights) {
    const result = [];
    
    for (let j = 0; j < weights[0].length; j++) {
      let sum = 0;
      for (let i = 0; i < vector.length; i++) {
        sum += vector[i] * weights[i][j];
      }
      result.push(sum);
    }
    
    return result;
  }

  // 🎯 Apply Activation Function
  applyActivation(values, activation) {
    switch (activation) {
      case 'relu':
        return values.map(val => Math.max(0, val));
      case 'sigmoid':
        return values.map(val => 1 / (1 + Math.exp(-val)));
      case 'tanh':
        return values.map(val => Math.tanh(val));
      default:
        return values;
    }
  }

  // 📈 Update Performance Metrics
  updatePerformanceMetrics() {
    const predictions = this.trainingData.map(sample => ({
      prediction: this.forwardPass(sample.features),
      target: sample.target
    }));
    
    // Calculate accuracy
    const correct = predictions.filter(p => 
      Math.abs(p.prediction - p.target) < 0.1
    ).length;
    
    this.model.performance_metrics = {
      accuracy: correct / predictions.length,
      loss: this.calculateAverageLoss(predictions),
      precision: this.calculatePrecision(predictions),
      recall: this.calculateRecall(predictions)
    };
  }

  // 📊 Calculate Average Loss
  calculateAverageLoss(predictions) {
    const totalLoss = predictions.reduce((sum, p) => 
      sum + this.calculateLoss(p.prediction, p.target), 0
    );
    return totalLoss / predictions.length;
  }

  // 🎯 Calculate Precision
  calculatePrecision(predictions) {
    const truePositives = predictions.filter(p => 
      p.prediction > 0.5 && p.target > 0.5
    ).length;
    
    const falsePositives = predictions.filter(p => 
      p.prediction > 0.5 && p.target <= 0.5
    ).length;
    
    return truePositives / (truePositives + falsePositives) || 0;
  }

  // 📈 Calculate Recall
  calculateRecall(predictions) {
    const truePositives = predictions.filter(p => 
      p.prediction > 0.5 && p.target > 0.5
    ).length;
    
    const falseNegatives = predictions.filter(p => 
      p.prediction <= 0.5 && p.target > 0.5
    ).length;
    
    return truePositives / (truePositives + falseNegatives) || 0;
  }

  // 🔮 Make Prediction
  predict(features) {
    if (!this.model) {
      throw new Error('Model not trained yet');
    }
    
    const prediction = this.forwardPass(features);
    
    // Store prediction history
    this.predictionHistory.push({
      features,
      prediction,
      timestamp: Date.now()
    });
    
    // Keep only last 100 predictions
    if (this.predictionHistory.length > 100) {
      this.predictionHistory = this.predictionHistory.slice(-100);
    }
    
    return prediction;
  }

  // 📊 Get Model Status
  getModelStatus() {
    return {
      is_training: this.isTraining,
      training_samples: this.trainingData.length,
      model_accuracy: this.model?.performance_metrics?.accuracy || 0,
      model_loss: this.model?.performance_metrics?.loss || 1.0,
      last_prediction: this.predictionHistory[this.predictionHistory.length - 1],
      model_created: this.model?.created_at,
      last_updated: this.model?.last_updated
    };
  }

  // 💾 Save Model
  saveModel() {
    const modelPath = path.join(this.modelPath, 'smart-router-model.json');
    fs.writeFileSync(modelPath, JSON.stringify(this.model, null, 2));
  }

  // 💾 Save Training Data
  saveTrainingData() {
    const trainingDataPath = path.join(this.modelPath, 'training-data.json');
    fs.writeFileSync(trainingDataPath, JSON.stringify(this.trainingData, null, 2));
  }

  // 🔄 Add Training Sample
  addTrainingSample(features, target, type = 'performance') {
    this.trainingData.push({
      type,
      features,
      target,
      timestamp: Date.now(),
      metadata: {}
    });
    
    // Save updated training data
    this.saveTrainingData();
  }

  // 🚀 Continuous Learning
  async continuousLearning() {
    console.log('🔄 Starting continuous learning...');
    
    try {
      // Collect new data
      const newData = this.collectNewTrainingData();
      
      // Add to training set
      newData.forEach(sample => {
        this.addTrainingSample(sample.features, sample.target, sample.type);
      });
      
      // Retrain model with new data
      if (newData.length > 10) {
        await this.trainModel(50); // Quick retrain
      }
      
      console.log('✅ Continuous learning completed');
      
    } catch (error) {
      console.error('❌ Continuous learning failed:', error);
    }
  }

  // 📊 Collect New Training Data
  collectNewTrainingData() {
    const newData = [];
    
    // Collect latest performance data
    const latestPerformance = this.collectSmartRouterPerformanceData();
    newData.push(...latestPerformance);
    
    // Collect latest interaction data
    const latestInteractions = this.collectUserInteractionData();
    newData.push(...latestInteractions);
    
    // Filter for recent data (last hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return newData.filter(sample => sample.timestamp > oneHourAgo);
  }
}

// 🚀 Export for use in Smart Router
module.exports = SmartRouterMLEngine;
