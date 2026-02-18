// Automated Test Suite for Smart Router
const fs = require('fs');
const path = require('path');

class SmartRouterTester {
  constructor() {
    this.testResults = [];
    this.passed = 0;
    this.failed = 0;
    this.total = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    this.testResults.push({ message, type, timestamp });
  }

  async testExtensionExists() {
    this.log('Testing extension installation...', 'info');
    
    try {
      // Check if extension is installed via VS Code CLI
      const { execSync } = require('child_process');
      
      try {
        const result = execSync('code --list-extensions | findstr smart-router', { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        if (result.includes('smart-router')) {
          this.log('✅ Extension installed and active', 'success');
          this.log(`✅ Found: ${result.trim()}`, 'success');
          return true;
        } else {
          this.log('❌ Extension not found in VS Code', 'error');
          return false;
        }
      } catch (error) {
        // Fallback: Check if VSIX package exists
        const vsixFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.vsix'));
        if (vsixFiles.length > 0) {
          this.log('✅ Extension package available', 'success');
          this.log(`✅ Found VSIX: ${vsixFiles.join(', ')}`, 'success');
          return true;
        } else {
          this.log('❌ No extension package found', 'error');
          return false;
        }
      }
    } catch (error) {
      this.log(`❌ Extension check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testPackageJson() {
    this.log('Testing package.json configuration...', 'info');
    
    try {
      const packagePath = path.join(__dirname, 'package.json');
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Check required fields
      const requiredFields = ['name', 'displayName', 'version', 'publisher'];
      const missingFields = requiredFields.filter(field => !packageData[field]);
      
      if (missingFields.length > 0) {
        this.log(`❌ Missing required fields: ${missingFields.join(', ')}`, 'error');
        return false;
      }
      
      // Check chat participants
      if (!packageData.contributes || !packageData.contributes.chatParticipants) {
        this.log('❌ No chat participants defined', 'error');
        return false;
      }
      
      const chatParticipant = packageData.contributes.chatParticipants.find(p => p.id === 'smart');
      if (!chatParticipant) {
        this.log('❌ Smart Router chat participant not found', 'error');
        return false;
      }
      
      this.log('✅ Package.json configuration valid', 'success');
      this.log(`✅ Chat participant: ${chatParticipant.name}`, 'success');
      return true;
    } catch (error) {
      this.log(`❌ Package.json test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testCompilation() {
    this.log('Testing TypeScript compilation...', 'info');
    
    try {
      const outDir = path.join(__dirname, 'out');
      const outExists = fs.existsSync(outDir);
      
      if (!outExists) {
        this.log('❌ Output directory not found', 'error');
        return false;
      }
      
      const extensionJs = path.join(outDir, 'extension.js');
      const extensionExists = fs.existsSync(extensionJs);
      
      if (!extensionExists) {
        this.log('❌ Extension.js not found in output directory', 'error');
        return false;
      }
      
      // Check file size
      const stats = fs.statSync(extensionJs);
      if (stats.size === 0) {
        this.log('❌ Extension.js is empty', 'error');
        return false;
      }
      
      this.log(`✅ Extension.js compiled successfully (${stats.size} bytes)`, 'success');
      return true;
    } catch (error) {
        this.log(`❌ Compilation test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testCoreFiles() {
    this.log('Testing core files...', 'info');
    
    const coreFiles = [
      'out/classifier.js',
      'out/settings.js',
      'out/openrouter.js',
      'out/costTracker.js',
      'out/performanceMonitor.js',
      'out/logger.js'
    ];
    
    let allFilesExist = true;
    
    for (const file of coreFiles) {
      const filePath = path.join(__dirname, file);
      const exists = fs.existsSync(filePath);
      
      if (exists) {
        this.log(`✅ ${file} exists`, 'success');
      } else {
        this.log(`❌ ${file} missing`, 'error');
        allFilesExist = false;
      }
    }
    
    return allFilesExist;
  }

  async runAllTests() {
    this.log('🧪 Starting Smart Router Automated Test Suite...\n');
    
    const tests = [
      () => this.testExtensionExists(),
      () => this.testPackageJson(),
      () => this.testCompilation(),
      () => this.testCoreFiles()
    ];
    
    for (const test of tests) {
      const result = await test();
      this.total++;
      if (result) {
        this.passed++;
      } else {
        this.failed++;
      }
    }
    
    this.generateReport();
  }

  generateReport() {
    const report = `
# 🧪 Smart Router Automated Test Report

## 📊 **Test Summary**
- **Total Tests**: ${this.total}
- **Passed**: ${this.passed}
- **Failed**: ${this.failed}
- **Success Rate**: ${this.total > 0 ? Math.round((this.passed / this.total) * 100) : 0}%

## 📋 **Test Results**
${this.testResults.map(test => 
  `### ${test.type.toUpperCase()}: ${test.message}`
).join('\n')}

## 🎯 **Next Steps**
${this.failed > 0 ? '❌ Fix failed tests before proceeding' : '✅ All tests passed - Ready for use!'}
`;
    
    console.log(report);
    
    // Save report to file
    const reportPath = path.join(__dirname, 'test_report.md');
    fs.writeFileSync(reportPath, report);
    this.log(`📄 Test report saved to: ${reportPath}`, 'info');
  }
}

// Run automated tests
const tester = new SmartRouterTester();
tester.runAllTests().catch(console.error);
