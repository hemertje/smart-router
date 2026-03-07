// 📧 Mail Test Script - Test je mail configuratie
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class MailTester {
  constructor() {
    this.configPath = 'C:\\Users\\' + process.env.USERNAME + '\\.smart-router\\mail-config.json';
    this.testMailConfiguration();
  }

  // 📧 Test mail configuration
  async testMailConfiguration() {
    console.log('📧 Testing mail configuration...');
    
    try {
      // Load config
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      
      // Create transporter
      const transporter = nodemailer.createTransporter({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.auth.user,
          pass: config.smtp.auth.pass
        }
      });
      
      console.log('✅ Mail transporter created');
      
      // Test connection
      await transporter.verify();
      console.log('✅ SMTP connection verified');
      
      // Send test mail
      const testMail = await transporter.sendMail({
        from: config.smtp.auth.user,
        to: config.notifications.dailyReport.recipients[0],
        subject: '🚀 Smart Router Mail Test - Configuration Working!',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Mail Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 10px; color: #155724; }
        .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .info { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="success">
        <div class="header">🎉 Mail Configuration Successful!</div>
        <div class="info">📧 Your Smart Router mail notifications are working!</div>
        <div class="info">🚀 You will receive daily reports and alerts automatically.</div>
        <div class="info">💰 Cost monitoring is active.</div>
        <div class="info">🔒 Security alerts are enabled.</div>
        <div class="info">🌍 The revolution is being monitored!</div>
    </div>
    
    <div style="text-align: center; margin-top: 30px; color: #6b7280;">
        <p>Test sent at: ${new Date().toLocaleString()}</p>
        <p>Smart Router v2.0.0 - Universal AI Revolution</p>
    </div>
</body>
</html>
      });
      
      console.log('✅ Test mail sent successfully!');
      console.log('📧 Check your inbox for the test email');
      console.log('🎉 Your mail notifications are now active!');
      
    } catch (error) {
      console.error('❌ Mail test failed:', error.message);
      console.log('📋 Please check your configuration:');
      console.log('1. Gmail app password is correct');
      console.log('2. Email address is correct');
      console.log('3. 2-Step verification is enabled');
      console.log('4. App password is generated correctly');
    }
  }
}

// 📧 Start mail test
new MailTester();
