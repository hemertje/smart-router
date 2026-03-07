#!/bin/bash

# 🔒 Secure Sandbox Setup Script
# Dit script installeert en configureert de veilige sandbox omgeving

echo "🔒 Starting Secure Sandbox Setup..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   - Windows: https://docs.docker.com/docker-for-windows/install/"
    echo "   - Mac: https://docs.docker.com/docker-for-mac/install/"
    echo "   - Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   - Windows: Included with Docker Desktop"
    echo "   - Mac: Included with Docker Desktop"
    echo "   - Linux: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   - Download from: https://nodejs.org/"
    echo "   - Recommended version: 18.x or higher"
    exit 1
fi

echo "✅ Node.js is installed"

# Install npm dependencies
echo "📦 Installing npm dependencies..."
if [ -f "package-daily-check.json" ]; then
    cp package-daily-check.json package.json
    npm install
else
    npm install
fi

# Initialize sandbox
echo "🔒 Initializing secure sandbox..."
node -e "const SecureSandboxEnvironment = require('./secureSandboxEnvironment'); new SecureSandboxEnvironment();"

# Create Docker network for sandbox
echo "🐳 Creating Docker network..."
docker network create sandbox-network 2>/dev/null || echo "Network already exists"

# Start sandbox services
echo "🚀 Starting sandbox services..."
cd sandbox
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "📊 Checking service status..."
docker-compose ps

# Test sandbox functionality
echo "🧪 Testing sandbox functionality..."
node -e "
const SecureSandboxEnvironment = require('./secureSandboxEnvironment');
const sandbox = new SecureSandboxEnvironment();
sandbox.runInSandbox('console.log(\"Sandbox test successful!\");').then(result => {
    if (result.success) {
        console.log('✅ Sandbox test passed');
    } else {
        console.log('❌ Sandbox test failed:', result.error);
    }
}).catch(err => {
    console.log('❌ Sandbox test error:', err.message);
});
"

echo ""
echo "🎉 Secure Sandbox Setup Complete!"
echo ""
echo "📋 Available commands:"
echo "   npm start                    - Run daily check with security"
echo "   npm run sandbox:start       - Start sandbox services"
echo "   npm run sandbox:stop        - Stop sandbox services"
echo "   npm run sandbox:status      - Check sandbox status"
echo "   npm run backup:create       - Create backup"
echo "   npm run backup:rollback     - Rollback to backup"
echo "   npm run secure-daily-check  - Run with auto sandbox start/stop"
echo ""
echo "🔒 Security Features:"
echo "   ✅ Container isolation"
echo "   ✅ Code validation"
echo "   ✅ Auto backup"
echo "   ✅ Emergency rollback"
echo "   ✅ Resource limits"
echo "   ✅ Network isolation"
echo "   ✅ File system protection"
echo ""
echo "⚠️  IMPORTANT SAFETY NOTES:"
echo "   - All code execution happens in isolated containers"
echo "   - Dangerous code patterns are automatically blocked"
echo "   - Auto-rollback on errors"
echo "   - No access to host file system"
echo "   - No network access to external systems"
echo "   - Resource limits prevent abuse"
echo ""
echo "🚀 Your Smart Router is now SECURE and READY!"
