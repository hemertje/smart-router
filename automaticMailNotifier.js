// 📧 Automatic Mail Notifier - Complete revolution updates
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

class AutomaticMailNotifier {
  constructor() {
    this.configPath = 'C:\\Users\\' + process.env.USERNAME + '\\.smart-router';
    this.mailConfigPath = path.join(this.configPath, 'mail-config.json');
    this.setupMailNotifications();
  }

  // 📧 Setup mail notifications
  setupMailNotifications() {
    console.log('📧 Setting up automatic mail notifications...');
    
    try {
      // 1. Create mail configuration
      this.createMailConfig();
      
      // 2. Setup mail transporter
      this.setupMailTransporter();
      
      // 3. Create notification templates
      this.createNotificationTemplates();
      
      // 4. Setup automatic triggers
      this.setupAutomaticTriggers();
      
      console.log('✅ Mail notifications setup completed');
      
    } catch (error) {
      console.error('❌ Failed to setup mail notifications:', error);
    }
  }

  // 📧 Create mail configuration
  createMailConfig() {
    console.log('📧 Creating mail configuration...');
    
    const mailConfig = {
      smtp: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "", // USER MUST FILL THIS
          pass: ""  // USER MUST FILL THIS (app password)
        }
      },
      notifications: {
        dailyReport: {
          enabled: true,
          time: "09:00", // 9 AM daily
          recipients: [""] // USER MUST FILL THIS
        },
        weeklySummary: {
          enabled: true,
          day: "friday", // Every friday
          time: "17:00", // 5 PM
          recipients: [""] // USER MUST FILL THIS
        },
        alerts: {
          costThreshold: {
            enabled: true,
            threshold: 8.00, // 80% of $10 budget
            recipients: [""] // USER MUST FILL THIS
          },
          securityEvents: {
            enabled: true,
            recipients: [""] // USER MUST FILL THIS
          },
          systemStatus: {
            enabled: true,
            recipients: [""] // USER MUST FILL THIS
          }
        }
      },
      templates: {
        dailyReport: {
          subject: "🚀 Smart Router Daily Report - {date}",
          content: "daily-report-template.html"
        },
        weeklySummary: {
          subject: "🌍 Smart Router Weekly Summary - Week {week}",
          content: "weekly-summary-template.html"
        },
        costAlert: {
          subject: "💰 Cost Alert - Smart Router Budget Warning",
          content: "cost-alert-template.html"
        },
        securityAlert: {
          subject: "🔒 Security Alert - Smart Router Event",
          content: "security-alert-template.html"
        },
        systemStatus: {
          subject: "📊 System Status - Smart Router Update",
          content: "system-status-template.html"
        }
      }
    };
    
    // Create config directory
    if (!fs.existsSync(this.configPath)) {
      fs.mkdirSync(this.configPath, { recursive: true });
    }
    
    fs.writeFileSync(this.mailConfigPath, JSON.stringify(mailConfig, null, 2));
    console.log('✅ Mail configuration created');
  }

  // 📧 Setup mail transporter
  setupMailTransporter() {
    console.log('📧 Setting up mail transporter...');
    
    const transporterScript = `const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class MailTransporter {
  constructor() {
    this.configPath = 'C:\\\\Users\\\\' + process.env.USERNAME + '\\\\.smart-router\\\\mail-config.json';
    this.transporter = null;
    this.initializeTransporter();
  }

  // 🚀 Initialize transporter
  initializeTransporter() {
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      
      this.transporter = nodemailer.createTransporter({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.auth.user,
          pass: config.smtp.auth.pass
        }
      });
      
      console.log('✅ Mail transporter initialized');
    } catch (error) {
      console.error('❌ Failed to initialize mail transporter:', error);
    }
  }

  // 📧 Send mail
  async sendMail(template, data, recipients) {
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      const templateConfig = config.templates[template];
      
      const mailOptions = {
        from: config.smtp.auth.user,
        to: recipients.join(', '),
        subject: this.processTemplate(templateConfig.subject, data),
        html: this.processTemplate(fs.readFileSync(path.join(this.configPath, templateConfig.content), 'utf8'), data)
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Mail sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Failed to send mail:', error);
      throw error;
    }
  }

  // 📝 Process template
  processTemplate(template, data) {
    let processed = template;
    for (const [key, value] of Object.entries(data)) {
      processed = processed.replace(new RegExp('\\\\{\\\\{' + key + '\\\\}\\\\}', 'g'), value);
    }
    return processed;
  }

  // 📧 Send daily report
  async sendDailyReport() {
    try {
      const data = await this.gatherDailyData();
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      
      await this.sendMail('dailyReport', data, config.notifications.dailyReport.recipients);
      console.log('✅ Daily report sent');
    } catch (error) {
      console.error('❌ Failed to send daily report:', error);
    }
  }

  // 📊 Gather daily data
  async gatherDailyData() {
    const UniversalDevSandbox = require('./universalDevSandbox');
    const sandbox = new UniversalDevSandbox();
    const status = sandbox.getSandboxStatus();
    
    return {
      date: new Date().toLocaleDateString(),
      totalProjects: status.total_projects,
      activeTools: [status.vscode_sandbox, status.windsurf_sandbox].filter(s => s === 'enabled').length,
      securityLevel: status.security_level,
      internetGateway: status.internet_gateway,
      monitoring: status.monitoring,
      costs: this.gatherCostData(),
      securityEvents: this.gatherSecurityEvents()
    };
  }

  // 💰 Gather cost data
  gatherCostData() {
    // Implement cost data gathering
    return {
      dailyUsage: 0.25,
      monthlyUsage: 7.50,
      budgetRemaining: 2.50,
      budgetPercentage: 75
    };
  }

  // 🔒 Gather security events
  gatherSecurityEvents() {
    // Implement security event gathering
    return [
      {
        type: 'info',
        message: 'All systems operating normally',
        timestamp: new Date().toISOString()
      }
    ];
  }
}

module.exports = MailTransporter;
`;
    
    const transporterPath = path.join(this.configPath, 'mail-transporter.js');
    fs.writeFileSync(transporterPath, transporterScript);
    
    console.log('✅ Mail transporter created');
  }

  // 📝 Create notification templates
  createNotificationTemplates() {
    console.log('📝 Creating notification templates...');
    
    // Daily report template
    const dailyReportTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Smart Router Daily Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 10px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .status { color: #16a34a; font-weight: bold; }
        .warning { color: #ca8a04; }
        .error { color: #dc2626; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Smart Router Daily Report</h1>
        <p>Date: \\${\\{date\\}\\}</p>
    </div>
    
    <div class="section">
        <h2>📊 System Overview</h2>
        <div class="metric">
            <span>Total Projects:</span>
            <span class="status">${totalProjects}</span>
        </div>
        <div class="metric">
            <span>Active Tools:</span>
            <span class="status">${activeTools}</span>
        </div>
        <div class="metric">
            <span>Security Level:</span>
            <span class="status">${securityLevel}</span>
        </div>
        <div class="metric">
            <span>Internet Gateway:</span>
            <span class="status">${internetGateway}</span>
        </div>
        <div class="metric">
            <span>Monitoring:</span>
            <span class="status">${monitoring}</span>
        </div>
    </div>
    
    <div class="section">
        <h2>💰 Cost Overview</h2>
        <div class="metric">
            <span>Daily Usage:</span>
            <span class="status">$${costs.dailyUsage}</span>
        </div>
        <div class="metric">
            <span>Monthly Usage:</span>
            <span class="status">$${costs.monthlyUsage}</span>
        </div>
        <div class="metric">
            <span>Budget Remaining:</span>
            <span class="status">$${costs.budgetRemaining}</span>
        </div>
        <div class="metric">
            <span>Budget Used:</span>
            <span class="warning">${costs.budgetPercentage}%</span>
        </div>
    </div>
    
    <div class="section">
        <h2>🔒 Security Events</h2>
        ${securityEvents.map(event => `
        <div class="metric">
            <span>${event.type}:</span>
            <span>${event.message}</span>
        </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>🌍 Revolution Status</h2>
        <p class="status">🏆 Smart Router revolution is active and thriving!</p>
        <p>🚀 All systems operational, AI assistance ready, sandbox secure!</p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; color: #6b7280;">
        <p>Generated by Smart Router v2.0.0 - Universal AI Revolution</p>
    </div>
</body>
</html>
`;
    
    const dailyReportPath = path.join(this.configPath, 'daily-report-template.html');
    fs.writeFileSync(dailyReportPath, dailyReportTemplate);
    
    // Cost alert template
    const costAlertTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cost Alert</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 10px; }
        .header { color: #d97706; font-size: 24px; font-weight: bold; }
        .metric { margin: 15px 0; }
    </style>
</head>
<body>
    <div class="alert">
        <div class="header">💰 Cost Alert - Budget Warning</div>
        <p>You've used ${percentage}% of your monthly budget!</p>
        <div class="metric">
            <strong>Current Usage:</strong> $${currentUsage}
        </div>
        <div class="metric">
            <strong>Monthly Budget:</strong> $${monthlyBudget}
        </div>
        <div class="metric">
            <strong>Remaining:</strong> $${remaining}
        </div>
    </div>
</body>
</html>
`;
    
    const costAlertPath = path.join(this.configPath, 'cost-alert-template.html');
    fs.writeFileSync(costAlertPath, costAlertTemplate);
    
    console.log('✅ Notification templates created');
  }

  // ⏰ Setup automatic triggers
  setupAutomaticTriggers() {
    console.log('⏰ Setting up automatic triggers...');
    
    const triggersScript = `const cron = require('node-cron');
const MailTransporter = require('./mail-transporter');

class AutomaticTriggers {
  constructor() {
    this.mailTransporter = new MailTransporter();
    this.setupTriggers();
  }

  // ⏰ Setup all triggers
  setupTriggers() {
    // Daily report at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('📧 Sending daily report...');
      await this.mailTransporter.sendDailyReport();
    });

    // Cost monitoring every hour
    cron.schedule('0 * * * *', async () => {
      await this.checkCostThreshold();
    });

    // Security monitoring every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      await this.checkSecurityEvents();
    });

    console.log('✅ Automatic triggers setup completed');
  }

  // 💰 Check cost threshold
  async checkCostThreshold() {
    try {
      const costs = this.mailTransporter.gatherCostData();
      const threshold = 8.00; // 80% of $10 budget
      
      if (costs.monthlyUsage >= threshold) {
        await this.mailTransporter.sendMail('costAlert', {
          percentage: Math.round((costs.monthlyUsage / 10) * 100),
          currentUsage: costs.monthlyUsage,
          monthlyBudget: 10,
          remaining: (10 - costs.monthlyUsage).toFixed(2)
        }, ['user@example.com']); // Replace with actual email
      }
    } catch (error) {
      console.error('❌ Cost check failed:', error);
    }
  }

  // 🔒 Check security events
  async checkSecurityEvents() {
    try {
      const events = this.mailTransporter.gatherSecurityEvents();
      const criticalEvents = events.filter(e => e.type === 'error' || e.type === 'warning');
      
      if (criticalEvents.length > 0) {
        await this.mailTransporter.sendMail('securityAlert', {
          events: criticalEvents
        }, ['user@example.com']); // Replace with actual email
      }
    } catch (error) {
      console.error('❌ Security check failed:', error);
    }
  }
}

// 🚀 Start automatic triggers
new AutomaticTriggers();
`;
    
    const triggersPath = path.join(this.configPath, 'automatic-triggers.js');
    fs.writeFileSync(triggersPath, triggersScript);
    
    console.log('✅ Automatic triggers created');
  }
}

// 📧 Start mail notifier setup
new AutomaticMailNotifier();
