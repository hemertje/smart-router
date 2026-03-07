// 🔑 Windsurf API Key Setup - Configureer AI toegang
const fs = require('fs');
const path = require('path');

class WindsurfAPIKeySetup {
  constructor() {
    this.configPath = 'C:\\Users\\' + process.env.USERNAME + '\\.windsurf';
    this.setupAPIKeys();
  }

  // 🔑 Setup API keys voor Windsurf
  setupAPIKeys() {
    console.log('🔑 Setting up Windsurf API keys...');
    
    try {
      // 1. Create API key configuration
      this.createAPIKeyConfig();
      
      // 2. Setup environment variables
      this.setupEnvironmentVariables();
      
      // 3. Update Windsurf settings with API keys
      this.updateWindsurfSettings();
      
      // 4. Create API key guide
      this.createAPIKeyGuide();
      
      console.log('✅ Windsurf API key setup completed');
      console.log('🔑 Please configure your API keys in the guide file');
      
    } catch (error) {
      console.error('❌ Failed to setup API keys:', error);
    }
  }

  // 🔑 Create API key configuration
  createAPIKeyConfig() {
    console.log('🔑 Creating API key configuration...');
    
    const apiConfig = {
      providers: {
        anthropic: {
          name: "Anthropic Claude",
          apiKey: "", // USER MUST FILL THIS
          baseUrl: "https://api.anthropic.com",
          models: [
            "claude-3-5-sonnet-20241022",
            "claude-3-haiku-20240307"
          ],
          setupGuide: "https://console.anthropic.com/"
        },
        openai: {
          name: "OpenAI GPT",
          apiKey: "", // USER MUST FILL THIS
          baseUrl: "https://api.openai.com/v1",
          models: [
            "gpt-4o",
            "gpt-4o-mini",
            "o1-preview",
            "o1-mini"
          ],
          setupGuide: "https://platform.openai.com/api-keys"
        }
      },
      defaultProvider: "anthropic",
      fallbackProvider: "openai",
      security: {
        encryptKeys: true,
        rotateKeys: false,
        keyRotationDays: 90
      }
    };
    
    const configPath = path.join(this.configPath, 'api-keys.json');
    fs.writeFileSync(configPath, JSON.stringify(apiConfig, null, 2));
    
    console.log('✅ API key configuration created');
  }

  // 🌍 Setup environment variables
  setupEnvironmentVariables() {
    console.log('🌍 Setting up environment variables...');
    
    const envScript = `@echo off
REM 🔑 Windsurf API Key Environment Setup

echo 🔑 Setting up Windsurf API keys...

REM Anthropic Claude API Key
set ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY_HERE

REM OpenAI API Key  
set OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

REM Windsurf specific
set WINDSURF_API_KEY=YOUR_WINDSURF_API_KEY_HERE

echo ✅ Environment variables set
echo 🔑 Please replace YOUR_*_API_KEY_HERE with actual keys
echo 📋 See api-keys.json for configuration guide
pause
`;
    
    const envPath = path.join(this.configPath, 'setup-env.bat');
    fs.writeFileSync(envPath, envScript);
    
    console.log('✅ Environment setup script created');
  }

  // ⚙️ Update Windsurf settings with API configuration
  updateWindsurfSettings() {
    console.log('⚙️ Updating Windsurf settings...');
    
    // Read current settings
    const settingsPath = path.join(this.configPath, 'settings.json');
    let settings = {};
    
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }
    
    // Add API configuration
    settings.api = {
      providers: {
        anthropic: {
          enabled: true,
          apiKey: "${ANTHROPIC_API_KEY}",
          baseUrl: "https://api.anthropic.com"
        },
        openai: {
          enabled: true,
          apiKey: "${OPENAI_API_KEY}",
          baseUrl: "https://api.openai.com/v1"
        }
      },
      defaultProvider: "anthropic",
      fallbackProvider: "openai",
      retryAttempts: 3,
      timeout: 30000
    };
    
    // Write updated settings
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    
    console.log('✅ Windsurf settings updated');
  }

  // 📋 Create API key setup guide
  createAPIKeyGuide() {
    console.log('📋 Creating API key setup guide...');
    
    const guide = `# 🔑 Windsurf API Key Setup Guide

## 🚨 BELANGRIJK: API KEYS VEREIST!

Windsurf heeft API keys nodig om AI modellen te gebruiken. Zonder keys werkt de AI niet!

## 📋 STAPPENPLAN:

### 1️⃣ Anthropic Claude API Key (Aanbevolen)
1. Ga naar: https://console.anthropic.com/
2. Login of maak een account
3. Ga naar "API Keys"
4. Klik op "Create Key"
5. Kopieer de key (begint met sk-ant-...)
6. Sla de key op in api-keys.json

### 2️⃣ OpenAI API Key (Alternatief)
1. Ga naar: https://platform.openai.com/api-keys
2. Login of maak een account
3. Klik op "Create new secret key"
4. Geef een naam (bv "Windsurf")
5. Kopieer de key (begint met sk-...)
6. Sla de key op in api-keys.json

### 3️⃣ Configureer api-keys.json
Open dit bestand: C:\\\\Users\\\\${process.env.USERNAME}\\\\.windsurf\\\\api-keys.json

Vervang:
\`\`\`json
"apiKey": "",  // <-- PLAATS HIER JE API KEY
\`\`\`

Naar:
\`\`\`json
"apiKey": "sk-ant-jouw-echte-api-key-hier",
\`\`\`

### 4️⃣ Start Windsurf opnieuw
1. Sluit alle Windsurf vensters
2. Start Windsurf opnieuw
3. AI functionaliteit zou moeten werken!

## 💰 KOSTEN:

### Anthropic Claude:
- Claude 3.5 Sonnet: ~$3 per 1M input tokens
- Claude 3 Haiku: ~$0.25 per 1M input tokens
- Gratis tier: $5 gratis credits

### OpenAI:
- GPT-4o: ~$5 per 1M input tokens  
- GPT-4o Mini: ~$0.15 per 1M input tokens
- Gratis tier: $5 gratis credits

## 🔒 VEILIGHEID:
- 🛡️ Deel je API keys met niemand
- 🔐 Keys worden opgeslagen in lokale configuratie
- 🚀 Gebruik environment variables voor extra security
- 📊 Monitor je usage in de provider dashboards

## 🆘 HULP:
- Anthropic Support: https://support.anthropic.com/
- OpenAI Support: https://help.openai.com/
- Windsurf Issues: https://github.com/windsurf-ai/windsurf/issues

## ✅ CHECKLIST:
- [ ] Anthropic API key verkregen
- [ ] OpenAI API key verkregen (optioneel)
- [ ] api-keys.json geconfigureerd
- [ ] Windsurf herstart
- [ ] AI functionaliteit getest

## 🎯 RESULTAAT:
✅ Windsurf AI werkt volledig
✅ Code generation mogelijk
✅ Code review beschikbaar
✅ Debug assistentie actief
✅ Complete AI ervaring
`;
    
    const guidePath = path.join(this.configPath, 'API_KEY_SETUP_GUIDE.md');
    fs.writeFileSync(guidePath, guide);
    
    console.log('✅ API key setup guide created');
  }
}

// 🔑 Start API key setup
new WindsurfAPIKeySetup();
