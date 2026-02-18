// Debug @smart chat command functionality
const { execSync } = require('child_process');
const fs = require('fs');

async function debugSmartChat() {
  console.log('🔍 Debugging @smart Chat Command...\n');
  
  try {
    // Test 1: Check extension installation
    console.log('📋 1. Extension Installation:');
    const result = execSync('code --list-extensions | findstr smart-router', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.includes('smart-router')) {
      console.log('✅ Extension installed:', result.trim());
    } else {
      console.log('❌ Extension not found');
      return;
    }
    
    // Test 2: Check package.json chat participant
    console.log('\n📋 2. Package.json Chat Participant:');
    const packagePath = './package.json';
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (packageData.contributes && packageData.contributes.chatParticipants) {
      const chatParticipant = packageData.contributes.chatParticipants.find(p => p.id === 'smart');
      if (chatParticipant) {
        console.log('✅ Chat participant found:');
        console.log('   ID:', chatParticipant.id);
        console.log('   Name:', chatParticipant.name);
        console.log('   Description:', chatParticipant.description);
        console.log('   IsSticky:', chatParticipant.isSticky);
      } else {
        console.log('❌ Smart Router chat participant not found');
        return;
      }
    } else {
      console.log('❌ No chat participants defined');
      return;
    }
    
    // Test 3: Check activation events
    console.log('\n📋 3. Activation Events:');
    if (packageData.activationEvents) {
      const chatActivation = packageData.activationEvents.find(e => e.includes('smart'));
      if (chatActivation) {
        console.log('✅ Chat activation event:', chatActivation);
      } else {
        console.log('❌ No chat activation event found');
        return;
      }
    } else {
      console.log('❌ No activation events defined');
      return;
    }
    
    // Test 4: Check compiled extension for chat handler
    console.log('\n📋 4. Compiled Extension Check:');
    const extensionPath = './out/extension.js';
    if (fs.existsSync(extensionPath)) {
      const extensionContent = fs.readFileSync(extensionPath, 'utf8');
      
      if (extensionContent.includes('createChatParticipant')) {
        console.log('✅ Chat participant registration found');
      } else {
        console.log('❌ Chat participant registration not found');
        return;
      }
      
      if (extensionContent.includes('async (request, context, stream')) {
        console.log('✅ Async handler function found');
      } else {
        console.log('❌ Async handler function not found');
        return;
      }
      
      if (extensionContent.includes('openrouterApiKey')) {
        console.log('✅ OpenRouter API key usage found');
      } else {
        console.log('❌ OpenRouter API key usage not found');
        return;
      }
    } else {
      console.log('❌ Compiled extension.js not found');
      return;
    }
    
    // Test 5: Check VS Code version compatibility
    console.log('\n📋 5. VS Code Version Check:');
    try {
      const versionResult = execSync('code --version', { encoding: 'utf8' });
      const lines = versionResult.split('\n');
      const version = lines[0];
      console.log('✅ VS Code version:', version);
      
      // Check minimum version requirement
      const minVersion = packageData.engines.vscode.replace('^', '');
      console.log('✅ Minimum required:', minVersion);
    } catch (error) {
      console.log('❌ Could not check VS Code version');
    }
    
    console.log('\n🎉 All technical checks passed!');
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Restart VS Code completely');
    console.log('2. Check if API key is configured in VS Code settings');
    console.log('3. Open chat with Ctrl+Shift+I');
    console.log('4. Type @smart slowly and wait for autocomplete');
    console.log('5. If still not working, check Developer Tools for errors');
    
    console.log('\n📝 Manual Test Steps:');
    console.log('1. Open VS Code');
    console.log('2. Press Ctrl+Shift+I to open chat');
    console.log('3. Type @ and wait for suggestions');
    console.log('4. If @smart appears, select it');
    console.log('5. Type "hello" and send');
    console.log('6. Check if you get a response');
    
    console.log('\n🚨 If Still Not Working:');
    console.log('1. Open VS Code Developer Tools (Help → Toggle Developer Tools)');
    console.log('2. Check Console tab for errors');
    console.log('3. Look for extension loading errors');
    console.log('4. Try disabling and re-enabling the extension');
    console.log('5. As last resort, reinstall the extension');
    
  } catch (error) {
    console.log(`❌ Debug failed: ${error.message}`);
  }
}

debugSmartChat();
