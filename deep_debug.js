// Deep Debug for @smart chat command
const { execSync } = require('child_process');
const fs = require('fs');

async function deepDebug() {
  console.log('🔍 Deep Debug for @smart Chat Command...\n');
  
  try {
    // Test 1: Check extension is actually loaded
    console.log('📋 1. Extension Loading Status:');
    try {
      const result = execSync('code --list-extensions | findstr smart-router', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Extension installed:', result.trim());
    } catch (error) {
      console.log('❌ Extension not found');
      return;
    }
    
    // Test 2: Check package.json activation events
    console.log('\n📋 2. Package.json Activation Events:');
    const packagePath = './package.json';
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (packageData.activationEvents) {
      console.log('✅ Activation events:');
      packageData.activationEvents.forEach(event => {
        console.log('   -', event);
      });
      
      const chatEvent = packageData.activationEvents.find(e => e.includes('smart'));
      if (chatEvent) {
        console.log('✅ Chat activation event found:', chatEvent);
      } else {
        console.log('❌ Chat activation event missing');
      }
    }
    
    // Test 3: Check compiled extension for exact patterns
    console.log('\n📋 3. Compiled Extension Analysis:');
    const extensionPath = './out/extension.js';
    if (fs.existsSync(extensionPath)) {
      const extensionContent = fs.readFileSync(extensionPath, 'utf8');
      
      // Check for chat participant creation
      const createMatch = extensionContent.match(/createChatParticipant\s*\(\s*['"]([^'"]+)['"]/);
      if (createMatch) {
        console.log('✅ Chat participant created with ID:', createMatch[1]);
      } else {
        console.log('❌ Chat participant creation not found');
      }
      
      // Check for handler function
      const handlerMatch = extensionContent.match(/async\s*\(\s*request\s*,\s*context\s*,\s*stream\s*,\s*token\s*\)/);
      if (handlerMatch) {
        console.log('✅ Handler function signature found');
      } else {
        console.log('❌ Handler function signature not found');
      }
      
      // Check for subscription
      const subscriptionMatch = extensionContent.match(/context\.subscriptions\.push\s*\(\s*smart\s*\)/);
      if (subscriptionMatch) {
        console.log('✅ Chat participant added to subscriptions');
      } else {
        console.log('❌ Chat participant not added to subscriptions');
      }
      
      // Check for errors in handler
      const errorHandlingMatch = extensionContent.match(/catch\s*\(\s*error\s*:\s*any\s*\)/);
      if (errorHandlingMatch) {
        console.log('✅ Error handling implemented');
      } else {
        console.log('❌ Error handling not found');
      }
    }
    
    // Test 4: Check VS Code version compatibility
    console.log('\n📋 4. VS Code Version Compatibility:');
    try {
      const versionResult = execSync('code --version', { encoding: 'utf8' });
      const lines = versionResult.split('\n');
      const version = lines[0];
      console.log('✅ VS Code version:', version);
      
      const requiredVersion = packageData.engines.vscode.replace('^', '');
      console.log('✅ Required version:', requiredVersion);
      
      // Check if version supports chat participants
      const majorVersion = parseInt(version.split('.')[0]);
      const minorVersion = parseInt(version.split('.')[1]);
      
      if (majorVersion > 1 || (majorVersion === 1 && minorVersion >= 74)) {
        console.log('✅ Version supports chat participants');
      } else {
        console.log('❌ Version too old for chat participants');
      }
    } catch (error) {
      console.log('❌ Could not check version compatibility');
    }
    
    // Test 5: Check for potential issues
    console.log('\n📋 5. Potential Issues Check:');
    
    // Check if extension is in development mode
    if (fs.existsSync('./.vscode/launch.json')) {
      console.log('⚠️  Development mode detected - may affect chat registration');
    }
    
    // Check for multiple chat participants
    if (packageData.contributes.chatParticipants.length > 1) {
      console.log('⚠️  Multiple chat participants defined');
    }
    
    // Check for missing dependencies
    if (!fs.existsSync('./node_modules/vscode')) {
      console.log('❌ VS Code module not found in node_modules');
    }
    
    console.log('\n🔧 Advanced Troubleshooting Steps:');
    console.log('1. Open VS Code Developer Tools (Help → Toggle Developer Tools)');
    console.log('2. Console tab → Clear console');
    console.log('3. Open chat (Ctrl+Shift+I)');
    console.log('4. Type @smart and watch console for errors');
    console.log('5. Look for: "Failed to register chat participant"');
    console.log('6. Look for: "Extension activation failed"');
    console.log('7. Look for: "Cannot read property of undefined"');
    
    console.log('\n🚨 Manual Extension Reload:');
    console.log('1. Ctrl+Shift+P');
    console.log('2. Type "Developer: Reload Window"');
    console.log('3. Wait for complete reload');
    console.log('4. Test @smart again');
    
    console.log('\n📝 Alternative Registration Method:');
    console.log('If current method fails, we may need to use:');
    console.log('- vscode.window.registerChatParticipant');
    console.log('- Different activation event');
    console.log('- Manual chat registration');
    
  } catch (error) {
    console.log(`❌ Deep debug failed: ${error.message}`);
  }
}

deepDebug();
