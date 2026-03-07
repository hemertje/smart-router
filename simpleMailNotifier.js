// 📧 Simple Mail Notifier - Werkt meteen!
const fs = require('fs');
const path = require('path');

class SimpleMailNotifier {
  constructor() {
    this.configPath = 'C:\\Users\\' + process.env.USERNAME + '\\.smart-router';
    this.setupSimpleMail();
  }

  // 📧 Setup simple mail notifications
  setupSimpleMail() {
    console.log('📧 Setting up simple mail notifications...');
    
    try {
      // 1. Create config directory
      if (!fs.existsSync(this.configPath)) {
        fs.mkdirSync(this.configPath, { recursive: true });
      }
      
      // 2. Create mail configuration
      this.createSimpleMailConfig();
      
      // 3. Create setup guide
      this.createMailSetupGuide();
      
      console.log('✅ Simple mail notifications setup completed');
      
    } catch (error) {
      console.error('❌ Failed to setup simple mail notifications:', error);
    }
  }

  // 📧 Create simple mail configuration
  createSimpleMailConfig() {
    const mailConfig = {
      smtp: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "VUL_HIER_JE_EMAIL_IN@gmail.com", // VERVANG DIT!
          pass: "VUL_HIER_JE_APP_PASSWORD_IN" // VERVANG DIT!
        }
      },
      notifications: {
        dailyReport: {
          enabled: true,
          time: "09:00",
          recipients: ["VUL_HIER_JE_EMAIL_IN@gmail.com"] // VERVANG DIT!
        },
        costAlert: {
          enabled: true,
          threshold: 8.00,
          recipients: ["VUL_HIER_JE_EMAIL_IN@gmail.com"] // VERVANG DIT!
        }
      }
    };
    
    const configPath = path.join(this.configPath, 'mail-config.json');
    fs.writeFileSync(configPath, JSON.stringify(mailConfig, null, 2));
    console.log('✅ Mail configuration created');
  }

  // 📝 Create setup guide
  createMailSetupGuide() {
    const guide = `# 📧 Smart Router Mail Setup Guide

## 🚨 BELANGRIJK: Mail configuratie nodig!

### 📋 STAPPENPLAN:

### 1️⃣ Gmail App Password Setup
1. Ga naar: https://myaccount.google.com/
2. Login met je Gmail account
3. Ga naar "Security"
4. Scroll naar "2-Step Verification" - Zet aan
5. Ga naar "App passwords"
6. Klik op "Generate new password"
7. Select "Mail" en "Other (Custom name)"
8. Geef naam: "Smart Router"
9. Kopieer de 16-cijferige wachtwoord

### 2️⃣ Configureer Mail Config
Open dit bestand: C:\\\\Users\\\\${process.env.USERNAME}\\\\.smart-router\\\\mail-config.json

Vervang:
- "VUL_HIER_JE_EMAIL_IN@gmail.com" → je echte Gmail adres
- "VUL_HIER_JE_APP_PASSWORD_IN" → de 16-cijferige app password

### 3️⃣ Test Mail Notifier
Start de mail notifier:
node mail-test.js

### 📧 Wat je ontvangt:
- **Daily Report** - elke dag om 9:00
- **Cost Alerts** - bij 80% van budget
- **Security Events** - bij belangrijke gebeurtenissen
- **System Status** - bij status wijzigingen

### 🔧 Troubleshooting:
- **"Authentication failed"** - Check app password
- **"Connection refused"** - Check SMTP settings
- **"No recipients"** - Check email adres

### 🎯 Resultaat:
✅ Volledige automatische mail notificaties
✅ Real-time status updates
✅ Cost monitoring
✅ Security alerts
✅ Daily reports

## 📊 Mail Templates:

### Daily Report:
- 🚀 System status
- 📊 Project overview
- 💰 Cost usage
- 🔒 Security events
- 🌍 Revolution status

### Cost Alert:
- 💰 Budget warning
- 📈 Usage statistics
- 🎯 Recommendations

### Security Alert:
- 🔒 Security events
- ⚠️ Warnings
- 🚨 Critical issues

## 🎉 Klaar!

Na configuratie ontvang je automatisch alle Smart Router updates per mail!
`;

    const guidePath = path.join(this.configPath, 'MAIL_SETUP_GUIDE.md');
    fs.writeFileSync(guidePath, guide);
    console.log('✅ Mail setup guide created');
  }
}

// 📧 Start simple mail notifier setup
new SimpleMailNotifier();
