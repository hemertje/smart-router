// Test @smart chat command functionality
const { execSync } = require('child_process');

async function testChatCommand() {
  console.log('🧪 Testing @smart Chat Command...\n');
  
  try {
    // Test 1: Check if extension is installed
    console.log('📋 Testing extension installation...');
    const result = execSync('code --list-extensions | findstr smart-router', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.includes('smart-router')) {
      console.log('✅ Extension installed and active');
      console.log(`✅ Found: ${result.trim()}`);
    } else {
      console.log('❌ Extension not found in VS Code');
      return false;
    }
    
    // Test 2: Check package.json configuration
    console.log('\n📋 Testing package.json chat participant...');
    const fs = require('fs');
    const packagePath = './package.json';
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (packageData.contributes && packageData.contributes.chatParticipants) {
      const chatParticipant = packageData.contributes.chatParticipants.find(p => p.id === 'smart');
      if (chatParticipant) {
        console.log('✅ Chat participant found in package.json');
        console.log(`✅ Name: ${chatParticipant.name}`);
        console.log(`✅ Description: ${chatParticipant.description}`);
      } else {
        console.log('❌ Smart Router chat participant not found');
        return false;
      }
    } else {
      console.log('❌ No chat participants defined');
      return false;
    }
    
    // Test 3: Check compiled extension.js for chat handler
    console.log('\n📋 Testing compiled extension...');
    const extensionPath = './out/extension.js';
    if (fs.existsSync(extensionPath)) {
      const extensionContent = fs.readFileSync(extensionPath, 'utf8');
      
      if (extensionContent.includes('createChatParticipant')) {
        console.log('✅ Chat participant registration found');
      } else {
        console.log('❌ Chat participant registration not found');
        return false;
      }
      
      if (extensionContent.includes('ChatRequestHandler')) {
        console.log('✅ Chat request handler found');
      } else {
        console.log('❌ Chat request handler not found');
        return false;
      }
    } else {
      console.log('❌ Compiled extension.js not found');
      return false;
    }
    
    console.log('\n🎉 All tests passed! @smart command should work now.');
    console.log('\n📝 To test in VS Code:');
    console.log('1. Open VS Code');
    console.log('2. Open Chat (Ctrl+Shift+I or click chat icon)');
    console.log('3. Type @smart in the chat input');
    console.log('4. Send a message like "help me write a function"');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

testChatCommand();
