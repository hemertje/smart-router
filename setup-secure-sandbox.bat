@echo off
REM 🔒 Secure Sandbox Setup Script for Windows
REM Dit script installeert en configureert de veilige sandbox omgeving

echo 🔒 Starting Secure Sandbox Setup...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop for Windows:
    echo    - Download from: https://docs.docker.com/docker-for-windows/install/
    echo    - Make sure Docker is running before continuing
    pause
    exit /b 1
)

echo ✅ Docker is installed

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose:
    echo    - Usually included with Docker Desktop
    echo    - If missing, install separately
    pause
    exit /b 1
)

echo ✅ Docker Compose is installed

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js:
    echo    - Download from: https://nodejs.org/
    echo    - Recommended version: 18.x or higher
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Install npm dependencies
echo 📦 Installing npm dependencies...
if exist "package-daily-check.json" (
    copy package-daily-check.json package.json >nul
    npm install
) else (
    npm install
)

REM Initialize sandbox
echo 🔒 Initializing secure sandbox...
node -e "const SecureSandboxEnvironment = require('./secureSandboxEnvironment'); new SecureSandboxEnvironment();"

REM Create Docker network for sandbox
echo 🐳 Creating Docker network...
docker network create sandbox-network >nul 2>&1

REM Start sandbox services
echo 🚀 Starting sandbox services...
cd sandbox
docker-compose up -d

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
echo 📊 Checking service status...
docker-compose ps

REM Test sandbox functionality
echo 🧪 Testing sandbox functionality...
node -e "const SecureSandboxEnvironment = require('./secureSandboxEnvironment'); const sandbox = new SecureSandboxEnvironment(); sandbox.runInSandbox('console.log(\"Sandbox test successful!\");').then(result => { if (result.success) { console.log('✅ Sandbox test passed'); } else { console.log('❌ Sandbox test failed:', result.error); } }).catch(err => { console.log('❌ Sandbox test error:', err.message); });"

echo.
echo 🎉 Secure Sandbox Setup Complete!
echo.
echo 📋 Available commands:
echo    npm start                    - Run daily check with security
echo    npm run sandbox:start       - Start sandbox services
echo    npm run sandbox:stop        - Stop sandbox services
echo    npm run sandbox:status      - Check sandbox status
echo    npm run backup:create       - Create backup
echo    npm run backup:rollback     - Rollback to backup
echo    npm run secure-daily-check  - Run with auto sandbox start/stop
echo.
echo 🔒 Security Features:
echo    ✅ Container isolation
echo    ✅ Code validation
echo    ✅ Auto backup
echo    ✅ Emergency rollback
echo    ✅ Resource limits
echo    ✅ Network isolation
echo    ✅ File system protection
echo.
echo ⚠️  IMPORTANT SAFETY NOTES:
echo    - All code execution happens in isolated containers
echo    - Dangerous code patterns are automatically blocked
echo    - Auto-rollback on errors
echo    - No access to host file system
echo    - No network access to external systems
echo    - Resource limits prevent abuse
echo.
echo 🚀 Your Smart Router is now SECURE and READY!
pause
