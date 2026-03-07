// 💻 VS Code Auto Launcher - Automatische sandbox voor VS Code
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

class VSCodeAutoLauncher {
  constructor() {
    this.vscodePath = this.getVSCodePath();
    this.configPath = 'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Roaming\\Code\\User';
    this.sandboxConfigPath = 'C:\\Dev';
    this.isRunning = false;
    
    this.initializeVSCodeLauncher();
  }

  // 🔍 Get VS Code installation path
  getVSCodePath() {
    const possiblePaths = [
      'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
      'C:\\Program Files\\Microsoft VS Code\\Code.exe',
      'C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe'
    ];
    
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        return path;
      }
    }
    
    return 'code'; // Fallback to command
  }

  // 🚀 Initialize VS Code launcher
  initializeVSCodeLauncher() {
    console.log('💻 Initializing VS Code auto launcher...');
    
    try {
      // 1. Create VS Code silent monitor
      this.createVSCodeMonitor();
      
      // 2. Create VS Code wrapper
      this.createVSCodeWrapper();
      
      // 3. Create VS Code shortcuts
      this.createVSCodeShortcuts();
      
      console.log('✅ VS Code auto launcher initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize VS Code launcher:', error);
    }
  }

  // 🔇 Create VS Code silent monitor
  createVSCodeMonitor() {
    console.log('🔇 Creating VS Code silent monitor...');
    
    const monitorScript = `const fs = require('fs');
const { spawn, exec } = require('child_process');

class SilentVSCodeMonitor {
  constructor() {
    this.isRunning = false;
    this.checkInterval = null;
    this.sandboxActivated = false;
    this.startSilentMonitoring();
  }

  // 🔇 Start stille monitoring
  startSilentMonitoring() {
    this.checkInterval = setInterval(() => {
      this.checkVSCodeProcessSilent();
    }, 5000); // Check elke 5 seconden
  }

  // 🔇 Stille VS Code proces check
  checkVSCodeProcessSilent() {
    exec('tasklist /FI "IMAGENAME eq Code.exe"', { 
      windowsHide: true,
      encoding: 'utf8'
    }, (error, stdout, stderr) => {
      const isRunning = stdout.includes('Code.exe');
      
      if (isRunning && !this.isRunning) {
        this.activateVSCodeSandboxSilent();
        this.isRunning = true;
      } else if (!isRunning && this.isRunning) {
        this.isRunning = false;
      }
    });
  }

  // 🔇 Stille VS Code sandbox activatie
  activateVSCodeSandboxSilent() {
    const configPath = 'C:\\\\Users\\\\' + process.env.USERNAME + '\\\\AppData\\\\Roaming\\\\Code\\\\User\\\\settings.json';
    
    if (!fs.existsSync(configPath) || !this.sandboxActivated) {
      this.runVSCodeSandboxSetupSilent();
      this.sandboxActivated = true;
    }
  }

  // 🔇 Stille VS Code sandbox setup
  runVSCodeSandboxSetupSilent() {
    const setupProcess = spawn('node', ['universalVSCodeSandbox.js'], {
      cwd: 'C:\\\\Dev\\\\smart-router-v2.0.0',
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });
    
    setupProcess.unref();
  }

  // ⏹️ Stop monitoring
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// 🔇 Start stille VS Code monitor
new SilentVSCodeMonitor();
`;
    
    const monitorPath = path.join(this.sandboxConfigPath, 'vscode-monitor.js');
    fs.writeFileSync(monitorPath, monitorScript);
    
    console.log('✅ VS Code silent monitor created');
  }

  // 🌊 Create VS Code wrapper
  createVSCodeWrapper() {
    console.log('🌊 Creating VS Code wrapper...');
    
    const wrapperScript = `@echo off
REM 💻 VS Code Wrapper - Always starts with sandbox
REM Dit vervangt de originele VS Code shortcut

echo 💻 VS Code Sandbox Wrapper
echo 🔒 Ensuring sandbox is active...

REM Ensure we're in C:\\Dev
cd /d "C:\\Dev"

REM Check if VS Code sandbox is configured
if not exist "%APPDATA%\\Code\\User\\settings.json" (
    echo 🔒 Initializing VS Code sandbox...
    node universalVSCodeSandbox.js
)

REM Start VS Code with sandbox configuration
echo 🚀 Starting VS Code with sandbox protection...
"${this.vscodePath}" --user-data-dir="C:\\Dev\\.vscode-sandbox" --extension-dir="C:\\Dev\\.vscode-sandbox\\extensions" --disable-workspace-trust --new-window "C:\\Dev"

echo ✅ VS Code started with sandbox
`;
    
    const wrapperPath = path.join(this.sandboxConfigPath, 'vscode-wrapper.bat');
    fs.writeFileSync(wrapperPath, wrapperScript);
    
    console.log('✅ VS Code wrapper created');
  }

  // 🔗 Create VS Code shortcuts
  createVSCodeShortcuts() {
    console.log('🔗 Creating VS Code shortcuts...');
    
    const shortcutScript = `@echo off
REM 🔗 Creating VS Code sandbox shortcuts

echo 🔗 Creating VS Code sandbox shortcuts...

REM Desktop shortcut
echo Creating desktop shortcut...
powershell "$s = New-Object -ComObject WScript.Shell; $d = $s.SpecialFolders('Desktop'); $l = $s.CreateShortcut('$d\\\\VS Code Sandbox.lnk'); $l.TargetPath = 'C:\\\\Dev\\\\vscode-wrapper.bat'; $l.Save()"

REM Start Menu shortcut
echo Creating Start Menu shortcut...
powershell "$s = New-Object -ComObject WScript.Shell; $d = $s.SpecialFolders('Programs'); $l = $s.CreateShortcut('$d\\\\VS Code Sandbox.lnk'); $l.TargetPath = 'C:\\\\Dev\\\\vscode-wrapper.bat'; $l.Save()"

echo ✅ VS Code shortcuts created
echo 💻 Use 'VS Code Sandbox' shortcuts instead of original VS Code
`;
    
    const shortcutPath = path.join(this.sandboxConfigPath, 'create-vscode-shortcuts.bat');
    fs.writeFileSync(shortcutPath, shortcutScript);
    
    console.log('✅ VS Code shortcuts script created');
  }

  // 🚀 Start VS Code monitoring
  startVSCodeMonitoring() {
    console.log('🚀 Starting VS Code silent monitoring...');
    
    // Start the VS Code monitor
    const monitorProcess = spawn('node', ['vscode-monitor.js'], {
      cwd: this.sandboxConfigPath,
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });
    
    monitorProcess.unref();
    
    console.log('✅ VS Code silent monitoring started');
  }

  // 📊 Get VS Code launcher status
  getVSCodeLauncherStatus() {
    const files = [
      'vscode-monitor.js',
      'vscode-wrapper.bat',
      'create-vscode-shortcuts.bat'
    ];
    
    const status = {
      vscodePath: this.vscodePath,
      configPath: this.configPath,
      filesCreated: 0,
      filesTotal: files.length,
      monitoringActive: false
    };
    
    files.forEach(file => {
      if (fs.existsSync(path.join(this.sandboxConfigPath, file))) {
        status.filesCreated++;
      }
    });
    
    // Check if monitor is running
    try {
      execSync('tasklist /FI "IMAGENAME eq node.exe" | find "vscode-monitor"', { stdio: 'pipe' });
      status.monitoringActive = true;
    } catch {
      status.monitoringActive = false;
    }
    
    return status;
  }
}

module.exports = VSCodeAutoLauncher;
