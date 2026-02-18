// VS Code Chat Specific Debug
const { execSync } = require('child_process');
const fs = require('fs');

async function vscodeChatDebug() {
  console.log('🔍 VS Code Chat Specific Debug...\n');
  
  try {
    // Test 1: Check extension is enabled
    console.log('📋 1. Extension Status:');
    try {
      const result = execSync('code --list-extensions --show-versions | findstr smart-router', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Extension with version:', result.trim());
    } catch (error) {
      console.log('❌ Could not get extension version');
    }
    
    // Test 2: Check if there are any conflicting extensions
    console.log('\n📋 2. Check for Conflicting Extensions:');
    try {
      const extensions = execSync('code --list-extensions', { encoding: 'utf8' });
      const chatExtensions = extensions.split('\n').filter(ext => 
        ext.toLowerCase().includes('chat') || 
        ext.toLowerCase().includes('copilot') ||
        ext.toLowerCase().includes('ai') ||
        ext.toLowerCase().includes('assistant')
      );
      
      if (chatExtensions.length > 0) {
        console.log('⚠️  Potential conflicting extensions:');
        chatExtensions.forEach(ext => {
          if (ext.trim()) console.log('   -', ext.trim());
        });
      } else {
        console.log('✅ No obvious conflicting extensions');
      }
    } catch (error) {
      console.log('❌ Could not check extensions');
    }
    
    // Test 3: Check VS Code settings for chat
    console.log('\n📋 3. VS Code Chat Settings Check:');
    console.log('Manual check needed:');
    console.log('1. Press Ctrl+, (comma)');
    console.log('2. Search for "chat"');
    console.log('3. Check if chat is enabled');
    console.log('4. Look for "chat.experimental" settings');
    
    // Test 4: Check compiled extension for exact chat registration
    console.log('\n📋 4. Chat Registration Details:');
    const extensionPath = './out/extension.js';
    if (fs.existsSync(extensionPath)) {
      const extensionContent = fs.readFileSync(extensionPath, 'utf8');
      
      // Find the chat participant registration
      const chatMatch = extensionContent.match(/createChatParticipant\(['"]([^'"]+)['"]/);
      if (chatMatch) {
        console.log('✅ Chat participant registered with ID:', chatMatch[1]);
      } else {
        console.log('❌ Chat participant registration not found');
      }
      
      // Check for the handler function
      const handlerMatch = extensionContent.match(/async\s*\(\s*request\s*,\s*context\s*,\s*stream/);
      if (handlerMatch) {
        console.log('✅ Handler function pattern found');
      } else {
        console.log('❌ Handler function pattern not found');
      }
      
      // Check for activation event
      const activationMatch = extensionContent.match(/onChatParticipant:smart/);
      if (activationMatch) {
        console.log('✅ Activation event found');
      } else {
        console.log('❌ Activation event not found');
      }
    }
    
    console.log('\n🔧 VS Code Chat Troubleshooting Steps:');
    console.log('1. Restart VS Code completely (close all windows)');
    console.log('2. Open VS Code (not Windsurf)');
    console.log('3. Wait 30 seconds for extensions to load');
    console.log('4. Press Ctrl+Shift+I to open chat');
    console.log('5. Type @ and wait for suggestions (5-10 seconds)');
    console.log('6. If @smart appears, select it');
    console.log('7. Type "test" and send');
    
    console.log('\n🚨 If Still Not Working:');
    console.log('1. Help → Toggle Developer Tools');
    console.log('2. Console tab → Look for red errors');
    console.log('3. Search for "smart-router" in console');
    console.log('4. Look for "chat participant" errors');
    console.log('5. Try: Ctrl+Shift+P → "Developer: Reload Window"');
    
    console.log('\n📝 Manual Extension Check:');
    console.log('1. Ctrl+Shift+X → Extensions view');
    console.log('2. Search for "Smart Router"');
    console.log('3. Check if it shows "Enabled"');
    console.log('4. If disabled, click Enable');
    console.log('5. If enabled, click Disable then Enable');
    
    console.log('\n🎯 Alternative Test:');
    console.log('1. Create new VS Code window');
    console.log('2. Open any folder');
    console.log('3. Try @smart there');
    console.log('4. This rules out workspace-specific issues');
    
  } catch (error) {
    console.log(`❌ Debug failed: ${error.message}`);
  }
}

vscodeChatDebug();
