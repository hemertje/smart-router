#!/bin/bash

# 🚀 Smart Router Daily Check Automation Setup
echo "🚀 Setting up Smart Router Daily Check Automation..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install nodemailer dotenv

# 2. Create environment file
echo "🔧 Creating environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file - please update with your email credentials"
else
    echo "⚠️  .env file already exists - please ensure it's configured"
fi

# 3. Create systemd service (Linux/Mac)
echo "🔧 Setting up systemd service..."
cat > smart-router-daily.service << EOF
[Unit]
Description=Smart Router Daily Check Automation
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
ExecStart=/usr/bin/node $(which node) dailyCheckAutomation.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Created smart-router-daily.service"
echo "📋 To install systemd service:"
echo "   sudo cp smart-router-daily.service /etc/systemd/system/"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl enable smart-router-daily"
echo "   sudo systemctl start smart-router-daily"

# 4. Test run
echo "🧪 Running test execution..."
node -e "
const { DailyCheckAutomation } = require('./dailyCheckAutomation.js');
const automation = new DailyCheckAutomation();
console.log('✅ Daily Check Automation ready to run!');
console.log('📧 Email functionality will work once .env is configured');
console.log('🕐 Schedule: Daily at 09:00');
"

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure .env with your email credentials"
echo "2. Test with: node dailyCheckAutomation.js"
echo "3. Schedule with systemd service or cron job"
echo ""
echo "📧 Daily reports will be sent to: ${RECIPIENT_EMAIL:-your-email@example.com}"
echo "🕐 Schedule: Daily at 09:00 (${TIMEZONE:-Europe/Amsterdam})"
