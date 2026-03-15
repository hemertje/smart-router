#!/usr/bin/env node

// 🧪 EMAIL CONFIGURATION TESTER
// Test Gmail SMTP connection en authentication

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailConfigTester {
  constructor() {
    this.mailConfigPath = path.join('C:', 'Users', 'Gebruiker', '.smart-router', 'mail-config.json');
    this.testResults = {
      timestamp: new Date().toISOString(),
      configLoaded: false,
      connectionTest: false,
      authTest: false,
      sendTest: false,
      errors: []
    };
  }

  // 📋 Laad mail configuratie
  loadMailConfig() {
    try {
      const configData = fs.readFileSync(this.mailConfigPath, 'utf8');
      this.mailConfig = JSON.parse(configData);
      this.testResults.configLoaded = true;
      console.log('✅ Mail configuration loaded successfully');
      console.log(`📧 SMTP: ${this.mailConfig.smtp.host}:${this.mailConfig.smtp.port}`);
      console.log(`👤 User: ${this.mailConfig.smtp.auth.user}`);
      return true;
    } catch (error) {
      this.testResults.errors.push(`Config load failed: ${error.message}`);
      console.log('❌ Failed to load mail configuration');
      console.log(`🔍 Error: ${error.message}`);
      return false;
    }
  }

  // 🔍 Test SMTP connection
  async testConnection() {
    console.log('🔍 Testing SMTP connection...');
    
    try {
      const transporter = nodemailer.createTransport(this.mailConfig.smtp);
      
      // Test connection
      await transporter.verify();
      this.testResults.connectionTest = true;
      console.log('✅ SMTP connection successful');
      return true;
    } catch (error) {
      this.testResults.errors.push(`Connection test failed: ${error.message}`);
      console.log('❌ SMTP connection failed');
      console.log(`🔍 Error: ${error.message}`);
      console.log(`🔍 Code: ${error.code}`);
      return false;
    }
  }

  // 🔐 Test authentication
  async testAuthentication() {
    console.log('🔐 Testing SMTP authentication...');
    
    try {
      const transporter = nodemailer.createTransport(this.mailConfig.smtp);
      
      // Test authentication
      await transporter.verify();
      this.testResults.authTest = true;
      console.log('✅ SMTP authentication successful');
      return true;
    } catch (error) {
      this.testResults.errors.push(`Auth test failed: ${error.message}`);
      console.log('❌ SMTP authentication failed');
      console.log(`🔍 Error: ${error.message}`);
      console.log(`🔍 Code: ${error.code}`);
      console.log(`🔍 Command: ${error.command}`);
      
      // Specifieke Gmail troubleshooting
      if (error.code === 'EAUTH') {
        console.log('\n🔧 Gmail Authentication Troubleshooting:');
        console.log('1. Check if 2FA is enabled on Gmail account');
        console.log('2. Generate new App Password:');
        console.log('   - Go to Google Account settings');
        console.log('   - Security → 2-Step Verification → App passwords');
        console.log('   - Generate new app password for "Smart Router"');
        console.log('3. Update mail-config.json with new app password');
        console.log('4. Check if Gmail account is blocked');
      }
      
      return false;
    }
  }

  // 📧 Test email sending
  async testEmailSending() {
    console.log('📧 Testing email sending...');
    
    try {
      const transporter = nodemailer.createTransport(this.mailConfig.smtp);
      
      const testMail = {
        from: this.mailConfig.smtp.auth.user,
        to: this.mailConfig.smtp.auth.user,
        subject: '🧪 Smart Router Email Test',
        html: `
          <h2>🧪 Email Configuration Test</h2>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Status:</strong> Email sending test successful</p>
          <p><strong>SMTP:</strong> ${this.mailConfig.smtp.host}:${this.mailConfig.smtp.port}</p>
          <p><strong>This is a test email from Smart Router.</strong></p>
          <hr>
          <p><em>If you receive this email, the configuration is working correctly.</em></p>
        `
      };
      
      await transporter.sendMail(testMail);
      this.testResults.sendTest = true;
      console.log('✅ Test email sent successfully');
      return true;
    } catch (error) {
      this.testResults.errors.push(`Send test failed: ${error.message}`);
      console.log('❌ Test email sending failed');
      console.log(`🔍 Error: ${error.message}`);
      console.log(`🔍 Code: ${error.code}`);
      return false;
    }
  }

  // 📊 Genereer rapport
  generateReport() {
    const report = {
      timestamp: this.testResults.timestamp,
      summary: {
        configLoaded: this.testResults.configLoaded,
        connectionTest: this.testResults.connectionTest,
        authTest: this.testResults.authTest,
        sendTest: this.testResults.sendTest,
        overallStatus: this.testResults.connectionTest && this.testResults.authTest && this.testResults.sendTest
      },
      errors: this.testResults.errors,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  // 💡 Genereer aanbevelingen
  generateRecommendations() {
    const recommendations = [];
    
    if (!this.testResults.configLoaded) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Fix mail configuration file',
        details: 'Check if mail-config.json exists and is valid JSON'
      });
    }
    
    if (!this.testResults.connectionTest) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Fix SMTP connection',
        details: 'Check network connectivity and SMTP settings'
      });
    }
    
    if (!this.testResults.authTest) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Fix Gmail authentication',
        details: 'Generate new App Password and update mail-config.json'
      });
    }
    
    if (!this.testResults.sendTest) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Fix email sending',
        details: 'Check email content and recipient settings'
      });
    }
    
    return recommendations;
  }

  // 💾 Sla test resultaten op
  saveTestResults() {
    const report = this.generateReport();
    const reportPath = path.join(__dirname, 'email-test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Test results saved to: ${reportPath}`);
  }

  // 🚀 Run complete test
  async run() {
    console.log('🧪 Starting Email Configuration Test...\n');
    
    // Laad configuratie
    if (!this.loadMailConfig()) {
      this.saveTestResults();
      return false;
    }
    
    console.log('\n' + '='.repeat(50));
    
    // Test connection
    await this.testConnection();
    
    console.log('\n' + '='.repeat(50));
    
    // Test authentication
    await this.testAuthentication();
    
    console.log('\n' + '='.repeat(50));
    
    // Test email sending (als authentication werkt)
    if (this.testResults.authTest) {
      await this.testEmailSending();
    } else {
      console.log('⏭️  Skipping email send test (authentication failed)');
    }
    
    console.log('\n' + '='.repeat(50));
    
    // Genereer rapport
    const report = this.generateReport();
    console.log('\n📊 TEST SUMMARY:');
    console.log(`✅ Config Loaded: ${report.summary.configLoaded}`);
    console.log(`✅ Connection Test: ${report.summary.connectionTest}`);
    console.log(`✅ Auth Test: ${report.summary.authTest}`);
    console.log(`✅ Send Test: ${report.summary.sendTest}`);
    console.log(`🎯 Overall Status: ${report.summary.overallStatus ? 'WORKING' : 'FAILED'}`);
    
    if (report.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      report.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => {
        console.log(`  [${rec.priority}] ${rec.action}: ${rec.details}`);
      });
    }
    
    this.saveTestResults();
    
    return report.summary.overallStatus;
  }
}

// 🚀 Run Email Test
if (require.main === module) {
  const tester = new EmailConfigTester();
  tester.run().catch(console.error);
}

module.exports = EmailConfigTester;
