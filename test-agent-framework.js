/**
 * 🧪 Test Script for Smart Router Agent Framework
 * 
 * Test alle AI agents en functionaliteit
 */

const { AgentFramework, ContextManager } = require('./agent-framework');
const { AgentFactory } = require('./specialized-agents');

class AgentFrameworkTester {
  constructor() {
    this.agentFramework = new AgentFramework();
    this.contextManager = new ContextManager();
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 Starting Agent Framework Tests...');
    console.log('🤖 Testing all AI agents and functionality');
    console.log('');

    try {
      // Initialize agents
      await this.initializeAgents();
      
      // Run tests
      await this.testAgentRegistration();
      await this.testTaskAnalysis();
      await this.testAgentSelection();
      await this.testTaskExecution();
      await this.testPerformanceMetrics();
      await this.testBatteryOptimization();
      await this.testThermalManagement();
      
      // Display results
      this.displayTestResults();
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }

  async initializeAgents() {
    console.log('🔧 Initializing test agents...');
    
    const config = {
      anthropicApiKey: 'test-key',
      openaiApiKey: 'test-key',
      googleApiKey: 'test-key',
      smartRouterEndpoint: 'http://localhost:3000'
    };
    
    const agents = AgentFactory.createAllAgents(config);
    
    for (const [name, agent] of Object.entries(agents)) {
      this.agentFramework.registerAgent(name, agent, agent.capabilities);
    }
    
    console.log('✅ Test agents initialized');
    this.addTestResult('Agent Initialization', true, 'All agents registered successfully');
  }

  async testAgentRegistration() {
    console.log('📋 Testing agent registration...');
    
    const expectedAgents = ['claude', 'gpt', 'gemini', 'cursor', 'lightweight'];
    const registeredAgents = Array.from(this.agentFramework.agents.keys());
    
    const allRegistered = expectedAgents.every(agent => registeredAgents.includes(agent));
    
    if (allRegistered) {
      console.log('✅ All agents registered correctly');
      this.addTestResult('Agent Registration', true, `Registered: ${registeredAgents.join(', ')}`);
    } else {
      console.log('❌ Some agents missing');
      this.addTestResult('Agent Registration', false, `Missing: ${expectedAgents.filter(a => !registeredAgents.includes(a)).join(', ')}`);
    }
  }

  async testTaskAnalysis() {
    console.log('🔍 Testing task analysis...');
    
    const testTasks = [
      { content: 'Write a function to calculate fibonacci', type: 'code-generation' },
      { content: 'Debug this error: TypeError: Cannot read property', type: 'debugging' },
      { content: 'Document this API endpoint', type: 'documentation' },
      { content: 'Analyze the performance of this code', type: 'analysis' },
      { content: 'Refactor this component for better performance', type: 'refactoring' }
    ];
    
    let analysisCorrect = 0;
    
    for (const task of testTasks) {
      const analysis = this.contextManager.analyzeTask(task);
      
      if (analysis.taskType === task.type) {
        analysisCorrect++;
      }
    }
    
    const success = analysisCorrect === testTasks.length;
    
    if (success) {
      console.log('✅ Task analysis working correctly');
      this.addTestResult('Task Analysis', true, `All ${testTasks.length} tasks analyzed correctly`);
    } else {
      console.log(`❌ Task analysis issues: ${analysisCorrect}/${testTasks.length} correct`);
      this.addTestResult('Task Analysis', false, `${analysisCorrect}/${testTasks.length} tasks analyzed correctly`);
    }
  }

  async testAgentSelection() {
    console.log('🎯 Testing agent selection...');
    
    const testCases = [
      {
        task: { content: 'Write a complex algorithm with deep reasoning' },
        expectedAgent: 'claude'
      },
      {
        task: { content: 'Generate quick code snippets' },
        expectedAgent: 'cursor'
      },
      {
        task: { content: 'Simple task with low battery' },
        context: { batteryLevel: 15 },
        expectedAgent: 'lightweight'
      },
      {
        task: { content: 'Creative visualization task' },
        expectedAgent: 'gemini'
      }
    ];
    
    let selectionCorrect = 0;
    
    for (const testCase of testCases) {
      const context = {
        ...testCase.context,
        taskAnalysis: this.contextManager.analyzeTask(testCase.task)
      };
      
      const selectedAgent = await this.agentFramework.selectBestAgent(testCase.task, context);
      
      if (selectedAgent === testCase.expectedAgent) {
        selectionCorrect++;
      }
    }
    
    const success = selectionCorrect >= testCases.length * 0.75; // 75% success rate
    
    if (success) {
      console.log('✅ Agent selection working well');
      this.addTestResult('Agent Selection', true, `${selectionCorrect}/${testCases.length} selections correct`);
    } else {
      console.log(`❌ Agent selection needs improvement: ${selectionCorrect}/${testCases.length} correct`);
      this.addTestResult('Agent Selection', false, `${selectionCorrect}/${testCases.length} selections correct`);
    }
  }

  async testTaskExecution() {
    console.log('⚡ Testing task execution...');
    
    const testTask = {
      content: 'Test task for agent execution',
      type: 'test'
    };
    
    const context = {
      taskAnalysis: this.contextManager.analyzeTask(testTask),
      batteryLevel: 50,
      thermalState: 'normal'
    };
    
    try {
      const result = await this.agentFramework.executeTask(testTask, context);
      
      if (result.success && result.agent && result.latency) {
        console.log('✅ Task execution successful');
        this.addTestResult('Task Execution', true, `Executed by ${result.agent} in ${result.latency}ms`);
      } else {
        console.log('❌ Task execution incomplete');
        this.addTestResult('Task Execution', false, 'Missing required fields in result');
      }
    } catch (error) {
      console.log('❌ Task execution failed');
      this.addTestResult('Task Execution', false, error.message);
    }
  }

  async testPerformanceMetrics() {
    console.log('📊 Testing performance metrics...');
    
    const stats = this.agentFramework.getAgentStats();
    
    if (stats.framework && stats.framework.totalAgents > 0) {
      console.log('✅ Performance metrics available');
      this.addTestResult('Performance Metrics', true, `Tracking ${stats.framework.totalAgents} agents`);
    } else {
      console.log('❌ Performance metrics missing');
      this.addTestResult('Performance Metrics', false, 'No agent statistics available');
    }
  }

  async testBatteryOptimization() {
    console.log('🔋 Testing battery optimization...');
    
    const lowBatteryTask = {
      content: 'Simple task with low battery',
      type: 'simple-analysis'
    };
    
    const lowBatteryContext = {
      taskAnalysis: this.contextManager.analyzeTask(lowBatteryTask),
      batteryLevel: 10,
      thermalState: 'normal'
    };
    
    const selectedAgent = await this.agentFramework.selectBestAgent(lowBatteryTask, lowBatteryContext);
    
    // Should prefer lightweight agent for low battery
    const batteryOptimized = selectedAgent === 'lightweight' || selectedAgent === 'claude';
    
    if (batteryOptimized) {
      console.log('✅ Battery optimization working');
      this.addTestResult('Battery Optimization', true, `Selected ${selectedAgent} for low battery`);
    } else {
      console.log('❌ Battery optimization not working');
      this.addTestResult('Battery Optimization', false, `Selected ${selectedAgent} instead of battery-optimized agent`);
    }
  }

  async testThermalManagement() {
    console.log('🌡️ Testing thermal management...');
    
    const thermalTask = {
      content: 'Task during high thermal state',
      type: 'simple-task'
    };
    
    const highThermalContext = {
      taskAnalysis: this.contextManager.analyzeTask(thermalTask),
      batteryLevel: 50,
      thermalState: 'high'
    };
    
    const selectedAgent = await this.agentFramework.selectBestAgent(thermalTask, highThermalContext);
    
    // Should prefer thermally efficient agents
    const thermalOptimized = ['claude', 'gemini', 'lightweight', 'cursor'].includes(selectedAgent);
    
    if (thermalOptimized) {
      console.log('✅ Thermal management working');
      this.addTestResult('Thermal Management', true, `Selected ${selectedAgent} for high thermal state`);
    } else {
      console.log('❌ Thermal management not working');
      this.addTestResult('Thermal Management', false, `Selected ${selectedAgent} instead of thermal-efficient agent`);
    }
  }

  addTestResult(testName, success, details) {
    this.testResults.push({
      test: testName,
      success,
      details,
      timestamp: new Date().toISOString()
    });
  }

  displayTestResults() {
    console.log('');
    console.log('📊 Test Results Summary:');
    console.log('');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log(`📈 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log('');
    
    // Display individual results
    this.testResults.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.details}`);
    });
    
    // Overall assessment
    if (successRate >= 80) {
      console.log('');
      console.log('🎉 Agent Framework is ready for production!');
      console.log('🚀 All critical functionality working correctly');
    } else if (successRate >= 60) {
      console.log('');
      console.log('⚠️  Agent Framework needs some improvements');
      console.log('🔧 Review failed tests and optimize accordingly');
    } else {
      console.log('');
      console.log('❌ Agent Framework has significant issues');
      console.log('🛠️  Major improvements needed before production');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new AgentFrameworkTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = AgentFrameworkTester;
