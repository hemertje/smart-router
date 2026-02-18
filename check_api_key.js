// Check Smart Router API Key Configuration
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function checkApiKey() {
  console.log('🔍 Checking Smart Router API Key Configuration...\n');
  
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
    
    // Test 2: Check package.json for configuration
    console.log('\n📋 Testing package.json configuration...');
    const packagePath = './package.json';
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (packageData.contributes && packageData.contributes.configuration) {
      const config = packageData.contributes.configuration;
      console.log('✅ Configuration section found');
      
      const openrouterKey = config.properties?.['smartRouter.openrouterApiKey'];
      if (openrouterKey) {
        console.log('✅ OpenRouter API key setting defined');
        console.log(`✅ Description: ${openrouterKey.description}`);
        console.log(`✅ Default: ${openrouterKey.default || 'Not set'}`);
      } else {
        console.log('❌ OpenRouter API key setting not found');
        return false;
      }
    } else {
      console.log('❌ No configuration section found');
      return false;
    }
    
    // Test 3: Check settings.ts implementation
    console.log('\n📋 Testing settings implementation...');
    const settingsPath = './src/settings.ts';
    if (fs.existsSync(settingsPath)) {
      const settingsContent = fs.readFileSync(settingsPath, 'utf8');
      
      if (settingsContent.includes('openrouterApiKey')) {
        console.log('✅ OpenRouter API key implemented in settings');
      } else {
        console.log('❌ OpenRouter API key not implemented');
        return false;
      }
      
      if (settingsContent.includes('getSettings')) {
        console.log('✅ Settings getter implemented');
      } else {
        console.log('❌ Settings getter not implemented');
        return false;
      }
    } else {
      console.log('❌ Settings file not found');
      return false;
    }
    
    // Test 4: Check extension.ts for API key usage
    console.log('\n📋 Testing extension API key usage...');
    const extensionPath = './src/extension.ts';
    if (fs.existsSync(extensionPath)) {
      const extensionContent = fs.readFileSync(extensionPath, 'utf8');
      
      if (extensionContent.includes('SettingsManager.getSettings()')) {
        console.log('✅ Settings manager used in extension');
      } else {
        console.log('❌ Settings manager not used');
        return false;
      }
      
      if (extensionContent.includes('openrouterApiKey')) {
        console.log('✅ OpenRouter API key used in extension');
      } else {
        console.log('❌ OpenRouter API key not used in extension');
        return false;
      }
    } else {
      console.log('❌ Extension file not found');
      return false;
    }
    
    // Test 5: Instructions for user
    console.log('\n📝 API Key Configuration Instructions:');
    console.log('1. Open VS Code');
    console.log('2. Press Ctrl+, (comma) to open Settings');
    console.log('3. Search for "Smart Router"');
    console.log('4. Find "Smart Router: Openrouter Api Key"');
    console.log('5. Enter your OpenRouter API key');
    console.log('6. Save settings');
    
    console.log('\n🔑 To get an OpenRouter API key:');
    console.log('1. Go to https://openrouter.ai/');
    console.log('2. Sign up or login');
    console.log('3. Go to API Keys section');
    console.log('4. Create a new API key');
    console.log('5. Copy the key and paste it in VS Code settings');
    
    console.log('\n🧪 To test if API key works:');
    console.log('1. Open VS Code chat (Ctrl+Shift+I)');
    console.log('2. Type @smart');
    console.log('3. Send a message like "hello"');
    console.log('4. If you get a response, API key is working');
    console.log('5. If you get an error, check the API key');
    
    console.log('\n🎉 API Key configuration check completed!');
    console.log('✅ All components are ready for API key configuration');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Check failed: ${error.message}`);
    return false;
  }
}

checkApiKey();
