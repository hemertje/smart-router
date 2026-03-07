// 🚀 Automatic Sandbox Launcher - Start automatisch sandbox bij Windsurf opstart
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const process = require('process');

class AutomaticSandboxLauncher {
  constructor() {
    this.windsurfPath = this.getWindsurfPath();
    this.configPath = 'C:\\Users\\' + process.env.USERNAME + '\\.windsurf';
    this.sandboxConfigPath = 'C:\\Dev';
    this.isRunning = false;
    this.windsurfProcesses = new Set();
    
    this.initializeAutoLauncher();
  }

  // 🔍 Get Windsurf installation path
  getWindsurfPath() {
    const possiblePaths = [
      'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Programs\\Windsurf\\Windsurf.exe',
      'C:\\Program Files\\Windsurf\\Windsurf.exe',
      'C:\\Program Files (x86)\\Windsurf\\Windsurf.exe'
    ];
    
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        return path;
      }
    }
    
    return 'windsurf'; // Fallback to command
  }

  // 🚀 Initialize automatic launcher
  initializeAutoLauncher() {
    console.log('🚀 Initializing automatic sandbox launcher...');
    
    try {
      // 1. Create Windows service/launcher
      this.createWindowsLauncher();
      
      // 2. Create startup script
      this.createStartupScript();
      
      // 3. Create registry entry for auto-start
      this.createRegistryEntry();
      
      // 4. Create process monitor
      this.createProcessMonitor();
      
      // 5. Create Windsurf wrapper
      this.createWindsurfWrapper();
      
      console.log('✅ Automatic sandbox launcher initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize automatic launcher:', error);
    }
  }

  // 🪟 Create Windows launcher
  createWindowsLauncher() {
    console.log('🪟 Creating Windows launcher...');
    
    const launcherScript = `@echo off
REM 🚀 Automatic Windsurf Sandbox Launcher
REM Dit script start automatisch de sandbox wanneer Windsurf start

echo 🚀 Automatic Windsurf Sandbox Launcher
echo 🔒 Monitoring for Windsurf processes...

:monitor_loop
REM Check if Windsurf is running
tasklist /FI "IMAGENAME eq Windsurf.exe" 2>NUL | find /I /N "Windsurf.exe">NUL
if %ERRORLEVEL% equ 0 (
    echo 🌊 Windsurf detected - checking sandbox status...
    
    REM Check if sandbox is already active
    if not exist "%USERPROFILE%\\.windsurf\\settings.json" (
        echo ⚠️ Sandbox not configured - activating...
        call "C:\\Dev\\windsurf-sandbox.bat"
    ) else (
        echo ✅ Sandbox already active
    )
    
    REM Wait before next check
    timeout /T 5 /NOBREAK >NUL
) else (
    REM Windsurf not running, wait longer
    timeout /T 10 /NOBREAK >NUL
)

goto monitor_loop
`;
    
    const launcherPath = path.join(this.sandboxConfigPath, 'windsurf-auto-launcher.bat');
    fs.writeFileSync(launcherPath, launcherScript);
    
    console.log('✅ Windows launcher created');
  }

  // 🚀 Create startup script
  createStartupScript() {
    console.log('🚀 Creating startup script...');
    
    const startupScript = `@echo off
REM 🚀 Windsurf Auto-Start with Sandbox
REM Dit script start Windsurf automatisch met sandbox

echo 🚀 Starting Windsurf with automatic sandbox...
cd /d "C:\\Dev"

REM Check if sandbox config exists
if not exist "%USERPROFILE%\\.windsurf\\settings.json" (
    echo 🔒 Initializing sandbox configuration...
    node universalDevSandbox.js
)

REM Start Windsurf with sandbox
echo 🌊 Starting Windsurf in sandbox...
"${this.windsurfPath}" --config-dir="%USERPROFILE%\\.windsurf" --disable-telemetry --new-window "C:\\Dev"

echo ✅ Windsurf started with automatic sandbox protection
`;
    
    const startupPath = path.join(this.sandboxConfigPath, 'start-windsurf-sandbox.bat');
    fs.writeFileSync(startupPath, startupScript);
    
    console.log('✅ Startup script created');
  }

  // 📝 Create registry entry
  createRegistryEntry() {
    console.log('📝 Creating registry entry...');
    
    const registryScript = `Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run]
"WindsurfSandbox"="C:\\\\Dev\\\\windsurf-auto-launcher.bat"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Classes\\windsurf\\shell\\open\\command]
@="C:\\\\Dev\\\\start-windsurf-sandbox.bat \\"%1\\""
`;
    
    const registryPath = path.join(this.sandboxConfigPath, 'windsurf-sandbox.reg');
    fs.writeFileSync(registryPath, registryScript);
    
    // Create batch script to apply registry
    const applyRegistryScript = `@echo off
REM 📝 Applying Windsurf sandbox registry entries
echo 📝 Adding Windsurf sandbox to Windows registry...

REM Apply registry file
regedit /s "C:\\Dev\\windsurf-sandbox.reg"

echo ✅ Registry entries applied
echo 🔄 Restart Windows to activate auto-launcher
`;
    
    const applyPath = path.join(this.sandboxConfigPath, 'apply-registry.bat');
    fs.writeFileSync(applyPath, applyRegistryScript);
    
    console.log('✅ Registry entry created');
  }

  // 📊 Create process monitor
  createProcessMonitor() {
    console.log('📊 Creating silent process monitor...');
    
    const monitorScript = `const fs = require('fs');
const { spawn, exec } = require('child_process');

class SilentWindsurfMonitor {
  constructor() {
    this.isRunning = false;
    this.checkInterval = null;
    this.sandboxActivated = false;
    this.startSilentMonitoring();
  }

  // 🔇 Start stille monitoring (geen console output)
  startSilentMonitoring() {
    this.checkInterval = setInterval(() => {
      this.checkWindsurfProcessSilent();
    }, 5000); // Check elke 5 seconden (minder frequent)
  }

  // 🔇 Stille Windsurf proces check
  checkWindsurfProcessSilent() {
    exec('tasklist /FI "IMAGENAME eq Windsurf.exe"', { 
      windowsHide: true,  // Verberg console window
      encoding: 'utf8'
    }, (error, stdout, stderr) => {
      const isRunning = stdout.includes('Windsurf.exe');
      
      if (isRunning && !this.isRunning) {
        this.activateSandboxSilent();
        this.isRunning = true;
      } else if (!isRunning && this.isRunning) {
        this.isRunning = false;
      }
    });
  }

  // 🔇 Stille sandbox activatie
  activateSandboxSilent() {
    const configPath = 'C:\\\\Users\\\\' + process.env.USERNAME + '\\\\.windsurf\\\\settings.json';
    
    if (!fs.existsSync(configPath) || !this.sandboxActivated) {
      this.runSandboxSetupSilent();
      this.sandboxActivated = true;
    }
  }

  // 🔇 Stille sandbox setup
  runSandboxSetupSilent() {
    const setupProcess = spawn('node', ['universalDevSandbox.js'], {
      cwd: 'C:\\\\Dev\\\\smart-router-v2.0.0',
      detached: true,
      stdio: 'ignore',  // Geen console output
      windowsHide: true  // Verberg console window
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

// 🔇 Start stille monitor
new SilentWindsurfMonitor();
`;
    
    const monitorPath = path.join(this.sandboxConfigPath, 'windsurf-monitor.js');
    fs.writeFileSync(monitorPath, monitorScript);
    
    console.log('✅ Silent process monitor created');
  }

  // 🌊 Create Windsurf wrapper
  createWindsurfWrapper() {
    console.log('🌊 Creating Windsurf wrapper...');
    
    const wrapperScript = `@echo off
REM 🌊 Windsurf Wrapper - Always starts with sandbox
REM Dit vervangt de originele Windsurf shortcut

echo 🌊 Windsurf Sandbox Wrapper
echo 🔒 Ensuring sandbox is active...

REM Ensure we're in C:\\Dev
cd /d "C:\\Dev"

REM Check if sandbox is configured
if not exist "%USERPROFILE%\\.windsurf\\settings.json" (
    echo 🔒 Initializing sandbox...
    node universalDevSandbox.js
)

REM Start Windsurf with sandbox configuration
echo 🚀 Starting Windsurf with sandbox protection...
"${this.windsurfPath}" --config-dir="%USERPROFILE%\\.windsurf" --disable-telemetry %*

echo ✅ Windsurf started with sandbox
`;
    
    const wrapperPath = path.join(this.sandboxConfigPath, 'windsurf-wrapper.bat');
    fs.writeFileSync(wrapperPath, wrapperScript);
    
    // Create shortcut replacement script
    const shortcutScript = `@echo off
REM 🔄 Replace Windsurf shortcuts with sandbox wrapper

echo 🔄 Creating Windsurf sandbox shortcuts...

REM Desktop shortcut
echo Creating desktop shortcut...
powershell "$s = New-Object -ComObject WScript.Shell; $d = $s.SpecialFolders('Desktop'); $l = $s.CreateShortcut('$d\\\\Windsurf Sandbox.lnk'); $l.TargetPath = 'C:\\\\Dev\\\\windsurf-wrapper.bat'; $l.Save()"

REM Start Menu shortcut
echo Creating Start Menu shortcut...
powershell "$s = New-Object -ComObject WScript.Shell; $d = $s.SpecialFolders('Programs'); $l = $s.CreateShortcut('$d\\\\Windsurf Sandbox.lnk'); $l.TargetPath = 'C:\\\\Dev\\\\windsurf-wrapper.bat'; $l.Save()"

echo ✅ Shortcuts created
echo 🌊 Use 'Windsurf Sandbox' shortcuts instead of original Windsurf
`;
    
    const shortcutPath = path.join(this.sandboxConfigPath, 'create-shortcuts.bat');
    fs.writeFileSync(shortcutPath, shortcutScript);
    
    console.log('✅ Windsurf wrapper created');
  }

  // 🚀 Start automatic monitoring
  startAutoMonitoring() {
    console.log('🚀 Starting automatic monitoring...');
    
    // Start the process monitor
    const monitorProcess = spawn('node', ['windsurf-monitor.js'], {
      cwd: this.sandboxConfigPath,
      detached: true,
      stdio: 'ignore'
    });
    
    monitorProcess.unref();
    
    // Start the Windows launcher
    const launcherProcess = spawn('cmd', ['/c', 'windsurf-auto-launcher.bat'], {
      cwd: this.sandboxConfigPath,
      detached: true,
      stdio: 'ignore'
    });
    
    launcherProcess.unref();
    
    console.log('✅ Automatic monitoring started');
  }

  // 📊 Get launcher status
  getLauncherStatus() {
    const files = [
      'windsurf-auto-launcher.bat',
      'start-windsurf-sandbox.bat',
      'windsurf-sandbox.reg',
      'apply-registry.bat',
      'windsurf-monitor.js',
      'windsurf-wrapper.bat',
      'create-shortcuts.bat'
    ];
    
    const status = {
      launcherPath: this.windsurfPath,
      configPath: this.configPath,
      filesCreated: 0,
      filesTotal: files.length,
      monitoringActive: false,
      registryApplied: false
    };
    
    files.forEach(file => {
      if (fs.existsSync(path.join(this.sandboxConfigPath, file))) {
        status.filesCreated++;
      }
    });
    
    // Check if monitor is running
    try {
      execSync('tasklist /FI "IMAGENAME eq node.exe" | find "windsurf-monitor"', { stdio: 'pipe' });
      status.monitoringActive = true;
    } catch {
      status.monitoringActive = false;
    }
    
    return status;
  }

  // 🔧 Setup automatic startup
  setupAutoStartup() {
    console.log('🔧 Setting up automatic startup...');
    
    try {
      // Apply registry entries
      execSync('apply-registry.bat', { 
        cwd: this.sandboxConfigPath,
        stdio: 'pipe'
      });
      
      // Create shortcuts
      execSync('create-shortcuts.bat', { 
        cwd: this.sandboxConfigPath,
        stdio: 'pipe'
      });
      
      // Start monitoring
      this.startAutoMonitoring();
      
      console.log('✅ Automatic startup configured');
      console.log('🔄 Restart Windows to activate all features');
      
    } catch (error) {
      console.error('❌ Failed to setup auto startup:', error);
    }
  }
}

module.exports = AutomaticSandboxLauncher;
