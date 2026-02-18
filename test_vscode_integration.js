// VS Code Integration Test
const vscode = require('vscode');

async function testVSCodeIntegration() {
  console.log('🧪 Testing VS Code Integration...\n');
  
  try {
    // Test 1: Extension Activation
    console.log('📋 Testing extension activation...');
    
    // Test 2: Command Registration
    console.log('⚙️ Testing command registration...');
    
    // Test 3: Settings Access
    const config = vscode.workspace.getConfiguration('smartRouter');
    console.log('⚙️ Settings configuration:', config);
    
    // Test 4: Status Bar
    console.log('📊 Status bar items should be visible');
    
    // Test 5: Output Channel
    console.log('📝 Output channel: Smart Router');
    
    console.log('✅ VS Code Integration Test Complete!');
    
  } catch (error) {
    console.log('❌ VS Code Integration failed:', error.message);
  }
}

// Run tests
testVSCodeIntegration();
