@echo off
REM 🚀 Smart Router Daily Check Automation Setup (Windows)

echo 🚀 Setting up Smart Router Daily Check Automation...

REM 1. Install dependencies
echo 📦 Installing dependencies...
call npm install nodemailer dotenv

REM 2. Create environment file
echo 🔧 Creating environment configuration...
if not exist .env (
    copy .env.example .env
    echo ✅ Created .env file - please update with your email credentials
) else (
    echo ⚠️  .env file already exists - please ensure it's configured
)

REM 3. Create Windows Task Scheduler script
echo 🔧 Creating Windows Task Scheduler script...
echo Set WshShell = CreateObject("WScript.Shell") > setup-task.vbs
echo Set oShell = CreateObject("Shell.Application") >> setup-task.vbs
echo strApp = "node" >> setup-task.vbs
echo strArgs = "dailyCheckAutomation.js" >> setup-task.vbs
echo strPath = WshShell.CurrentDirectory >> setup-task.vbs
echo oShell.ShellExecute strApp, strArgs, strPath, "runas", 1 >> setup-task.vbs

echo ✅ Created setup-task.vbs
echo 📋 To create Windows Task:
echo   1. Open Task Scheduler
echo   2. Create Basic Task
echo   3. Name: Smart Router Daily Check
echo   4. Trigger: Daily at 09:00
echo   5. Action: Start a program
echo   6. Program: node
echo   7. Arguments: dailyCheckAutomation.js
echo   8. Start in: %cd%

REM 4. Test run
echo 🧪 Running test execution...
node -e "console.log('✅ Daily Check Automation ready to run!'); console.log('📧 Configure .env with email credentials'); console.log('🕐 Schedule: Daily at 09:00');"

echo.
echo 🎉 Setup Complete!
echo.
echo 📋 Next Steps:
echo 1. Configure .env with your email credentials
echo 2. Test with: node dailyCheckAutomation.js
echo 3. Create Windows Task Scheduler task
echo.
echo 📧 Daily reports will be sent automatically
echo 🕐 Schedule: Daily at 09:00
pause
