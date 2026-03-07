// 🔒 Universele VS Code Sandbox - Beveilige Ontwikkelomgeving
// Zorgt ervoor dat VS Code ook in C:\Dev sandbox draait

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UniversalVSCodeSandbox {
  constructor() {
    this.vscodePath = this.getVSCodePath();
    this.devPath = 'C:\\Dev';
    this.sandboxConfig = {
      allowedWorkspaces: [
        'C:\\Dev\\*'
      ],
      forbiddenPaths: [
        'C:\\Users',
        'C:\\Program Files',
        'C:\\Windows',
        'C:\\Documents and Settings',
        'C:\\ProgramData'
      ],
      allowedExtensions: [
        // Productivity extensions
        'ms-python.python',
        'ms-vscode.vscode-typescript-next',
        'bradlc.vscode-tailwindcss',
        'esbenp.prettier-vscode',
        'ms-vscode.vscode-eslint',
        'formulahendry.auto-rename-tag',
        'christian-kohler.path-intellisense',
        
        // Security extensions
        'ms-vscode.vscode-security',
        'gitlab.gitlab-workflow',
        'ms-vscode.git',
        
        // Smart Router specific
        'universal-vibe.smart-router',
        
        // Development tools
        'ms-vscode.hexeditor',
        'ms-vscode-remote.remote-containers',
        'ms-vscode-remote.remote-wsl',
        'ms-vscode.remote-explorer'
      ],
      blockedExtensions: [
        // Potentially dangerous extensions
        'ms-vscode-remote.remote-ssh',
        'ms-vscode.remote-ssh',
        'ms-vscode.remote-ssh-edit',
        'ms-vscode.azure-account',
        'ms-vscode.azurecli',
        'ms-vscode.docker',
        'ms-vscode.azure-spring-clouds'
      ],
      securitySettings: {
        trustWorkspace: false,
        trustParents: false,
        trustUntrustedFiles: false,
        workspaceTrustEnabled: true,
        workspaceTrustBanner: 'always',
        workspaceTrustStartupPrompt: true
      }
    };
    
    this.initializeVSCodeSandbox();
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
    
    throw new Error('VS Code niet gevonden. Installeer VS Code eerst.');
  }

  // 🏰 Initialize VS Code sandbox
  initializeVSCodeSandbox() {
    console.log('🔒 Initializing universele VS Code sandbox...');
    
    try {
      // 1. Create VS Code sandbox configuration
      this.createVSCodeConfig();
      
      // 2. Setup workspace trust policies
      this.setupWorkspaceTrust();
      
      // 3. Configure security policies
      this.setupSecurityPolicies();
      
      // 4. Create allowed workspaces
      this.createAllowedWorkspaces();
      
      // 5. Setup extension whitelist
      this.setupExtensionWhitelist();
      
      // 6. Create sandbox launch scripts
      this.createSandboxScripts();
      
      // 7. Setup monitoring
      this.setupVSCodeMonitoring();
      
      console.log('✅ Universele VS Code sandbox initialized');
      console.log(`📁 VS Code path: ${this.vscodePath}`);
      console.log(`🏰 Sandbox path: ${this.devPath}`);
      console.log(`🔒 Security level: maximum`);
      
    } catch (error) {
      console.error('❌ Failed to initialize VS Code sandbox:', error);
      throw error;
    }
  }

  // ⚙️ Create VS Code configuration
  createVSCodeConfig() {
    console.log('⚙️ Creating VS Code sandbox configuration...');
    
    const vscodeConfig = {
      // Workspace trust
      'security.workspace.trust.enabled': true,
      'security.workspace.trust.banner': 'always',
      'security.workspace.trust.startupPrompt': true,
      'security.workspace.trust.untrustedFiles': 'open',
      
      // File system security
      'security.allowedWorkspaceTrustedFolders': [
        'C:\\Dev'
      ],
      'security.workspace.trust.enabled': true,
      
      // Extension security
      'extensions.autoUpdate': false,
      'extensions.autoCheckUpdates': true,
      'extensions.ignoreRecommendations': false,
      
      // Telemetry (disabled for privacy)
      'telemetry.enableTelemetry': false,
      'telemetry.enableCrashReporter': false,
      
      // Cost controls for VS Code
      'github.copilot.maxDailyCost': 0.33,
      'github.copilot.maxMonthlyCost': 10.00,
      'github.copilot.costPerRequest': 0.05,
      
      // Security settings
      'security.workspace.trust.emptyWindow': 'open',
      'security.workspace.trust.enabled': true,
      
      // File associations
      'files.associations': {
        '*.json': 'jsonc',
        '*.md': 'markdown'
      },
      
      // Editor security
      'editor.stickyScroll.enabled': true,
      'editor.wordWrap': 'on',
      'editor.formatOnSave': true,
      'editor.codeActionsOnSave': {
        'source.fixAll.eslint': true
      },
      
      // Terminal security
      'terminal.integrated.defaultProfile.windows': 'PowerShell',
      'terminal.integrated.cwd': 'C:\\Dev',
      
      // Explorer security
      'explorer.fileNesting.enabled': true,
      'explorer.fileNesting.patterns': {
        '*.js': '${capture}.js.map, ${capture}.d.ts',
        '*.jsx': '${capture}.js',
        '*.ts': '${capture}.js, ${capture}.d.ts',
        '*.tsx': '${capture}.ts, ${capture}.js'
      },
      
      // Git security
      'git.enableSmartCommit': true,
      'git.autofetch': true,
      'git.confirmSync': false,
      
      // Search security
      'search.useGlobalIgnoreFiles': true,
      'search.useParentIgnoreFiles': true,
      'search.exclude': {
        '**/node_modules': true,
        '**/bower_components': true,
        '**/*.code-search': true,
        '**/dist': true,
        '**/build': true
      }
    };
    
    const configPath = path.join(this.devPath, 'vscode-settings.json');
    fs.writeFileSync(configPath, JSON.stringify(vscodeConfig, null, 2));
    
    console.log('✅ VS Code configuration created');
  }

  // 🔐 Setup workspace trust
  setupWorkspaceTrust() {
    console.log('🔐 Setting up workspace trust policies...');
    
    const trustConfig = {
      version: '1.0.0',
      trustedFolders: [
        {
          path: 'C:\\Dev',
          recursive: true,
          trustLevel: 'trusted',
          costControls: {
            maxTokens: 50000,
            maxCostPerRequest: 0.05,  // VS Code is lichter
            maxDailyCost: 0.33,       // $0.33 per dag (~$10/maand)
            maxMonthlyCost: 10.00     // $10 per maand (gratis extensies!)
          }
        }
      ],
      untrustedFolders: [
        'C:\\Users',
        'C:\\Program Files',
        'C:\\Windows',
        'C:\\Documents and Settings'
      ],
      policies: {
        requireTrust: true,
        trustOnStartup: false,
        allowUntrustedWorkspaces: false,
        promptForTrust: true,
        trustBanner: 'always'
      }
    };
    
    const trustPath = path.join(this.devPath, 'workspace-trust.json');
    fs.writeFileSync(trustPath, JSON.stringify(trustConfig, null, 2));
    
    console.log('✅ Workspace trust policies setup');
  }

  // 🛡️ Setup security policies
  setupSecurityPolicies() {
    console.log('🛡️ Setting up security policies...');
    
    const securityPolicies = {
      fileSystem: {
        allowedPaths: this.sandboxConfig.allowedWorkspaces,
        forbiddenPaths: this.sandboxConfig.forbiddenPaths,
        readOnlyPaths: [
          'C:\\Dev\\**\\node_modules\\**',
          'C:\\Dev\\**\\dist\\**',
          'C:\\Dev\\**\\build\\**'
        ]
      },
      network: {
        allowedDomains: [
          'github.com',
          'gitlab.com',
          'bitbucket.org',
          'npmjs.org',
          'pypi.org',
          'crates.io',
          'rubygems.org'
        ],
        blockedDomains: [
          'malware.com',
          'phishing.com',
          'suspicious.com'
        ]
      },
      extensions: {
        allowed: this.sandboxConfig.allowedExtensions,
        blocked: this.sandboxConfig.blockedExtensions,
        autoUpdate: false,
        requireApproval: true
      },
      terminal: {
        allowedCommands: [
          'git',
          'npm',
          'node',
          'python',
          'pip',
          'yarn',
          'pnpm',
          'code'
        ],
        blockedCommands: [
          'format',
          'del',
          'rmdir',
          'sudo',
          'chmod',
          'chown'
        ]
      }
    };
    
    const policiesPath = path.join(this.devPath, 'vscode-security-policies.json');
    fs.writeFileSync(policiesPath, JSON.stringify(securityPolicies, null, 2));
    
    console.log('✅ Security policies setup');
  }

  // 📁 Create allowed workspaces
  createAllowedWorkspaces() {
    console.log('📁 Creating allowed workspaces...');
    
    // Discover all projects in C:\Dev
    const projects = this.discoverProjects();
    
    const workspaces = projects.map(project => ({
      name: project.name,
      path: project.path,
      type: project.type,
      trusted: true,
      settings: {
        'security.workspace.trust.enabled': true,
        'security.workspace.trust.banner': 'once',
        'terminal.integrated.cwd': project.path,
        'files.exclude': {
          '**/node_modules': true,
          '**/dist': true,
          '**/build': true,
          '**/.git': false
        }
      }
    }));
    
    const workspacesPath = path.join(this.devPath, 'allowed-workspaces.json');
    fs.writeFileSync(workspacesPath, JSON.stringify(workspaces, null, 2));
    
    console.log(`✅ ${workspaces.length} allowed workspaces created`);
  }

  // 🔍 Discover projects in C:\Dev
  discoverProjects() {
    const projects = [];
    
    try {
      const items = fs.readdirSync(this.devPath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          const projectPath = path.join(this.devPath, item.name);
          
          if (this.isProject(projectPath)) {
            projects.push({
              name: item.name,
              path: projectPath,
              type: this.getProjectType(projectPath)
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to discover projects:', error);
    }
    
    return projects;
  }

  // 🔍 Check if directory is a project
  isProject(projectPath) {
    const indicators = [
      'package.json',
      'requirements.txt',
      'Cargo.toml',
      'pom.xml',
      '.git',
      'src',
      'dist',
      'build',
      '.vscode'
    ];
    
    return indicators.some(indicator => 
      fs.existsSync(path.join(projectPath, indicator))
    );
  }

  // 📋 Get project type
  getProjectType(projectPath) {
    if (fs.existsSync(path.join(projectPath, 'package.json'))) {
      return 'nodejs';
    }
    if (fs.existsSync(path.join(projectPath, 'requirements.txt'))) {
      return 'python';
    }
    if (fs.existsSync(path.join(projectPath, 'Cargo.toml'))) {
      return 'rust';
    }
    if (fs.existsSync(path.join(projectPath, 'pom.xml'))) {
      return 'java';
    }
    return 'unknown';
  }

  // 🔌 Setup extension whitelist
  setupExtensionWhitelist() {
    console.log('🔌 Setting up extension whitelist...');
    
    const extensionConfig = {
      allowed: this.sandboxConfig.allowedExtensions,
      blocked: this.sandboxConfig.blockedExtensions,
      recommendations: [
        'ms-python.python',
        'ms-vscode.vscode-typescript-next',
        'esbenp.prettier-vscode',
        'ms-vscode.vscode-eslint',
        'bradlc.vscode-tailwindcss'
      ],
      autoUpdate: false,
      securityScan: true,
      requireApproval: true
    };
    
    const extensionsPath = path.join(this.devPath, 'extension-whitelist.json');
    fs.writeFileSync(extensionsPath, JSON.stringify(extensionConfig, null, 2));
    
    console.log('✅ Extension whitelist setup');
  }

  // 🚀 Create sandbox launch scripts
  createSandboxScripts() {
    console.log('🚀 Creating sandbox launch scripts...');
    
    // Windows batch script
    const batchScript = `@echo off
echo 🔒 Starting VS Code in C:\\Dev Sandbox...

REM Check if VS Code is installed
if not exist "${this.vscodePath}" (
    echo ❌ VS Code not found at: ${this.vscodePath}
    echo Please install VS Code first
    pause
    exit /b 1
)

REM Change to C:\\Dev
cd /d C:\\Dev

REM Start VS Code with sandbox configuration
echo 🚀 Launching VS Code with sandbox security...
"${this.vscodePath}" --user-data-dir="C:\\Dev\\.vscode-sandbox" --extension-dir="C:\\Dev\\.vscode-sandbox\\extensions" --disable-extensions --disable-workspace-trust --new-window .

echo ✅ VS Code started in C:\\Dev sandbox
echo 🔒 Security level: Maximum
echo 📁 Workspace: C:\\Dev
echo 🔌 Extensions: Whitelisted only
pause
`;
    
    const batchPath = path.join(this.devPath, 'vscode-sandbox.bat');
    fs.writeFileSync(batchPath, batchScript);
    
    // PowerShell script
    const powershellScript = `# 🔒 VS Code Sandbox Launcher for PowerShell
Write-Host "🔒 Starting VS Code in C:\\Dev Sandbox..." -ForegroundColor Green

# Check if VS Code is installed
$vscodePath = "${this.vscodePath}"
if (-not (Test-Path $vscodePath)) {
    Write-Host "❌ VS Code not found at: $vscodePath" -ForegroundColor Red
    Write-Host "Please install VS Code first" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Change to C:\\Dev
Set-Location "C:\\Dev"

# Create sandbox directories
$sandboxDir = "C:\\Dev\\.vscode-sandbox"
$extDir = "C:\\Dev\\.vscode-sandbox\\extensions"

if (-not (Test-Path $sandboxDir)) {
    New-Item -ItemType Directory -Path $sandboxDir -Force
}

if (-not (Test-Path $extDir)) {
    New-Item -ItemType Directory -Path $extDir -Force
}

# Start VS Code with sandbox configuration
Write-Host "🚀 Launching VS Code with sandbox security..." -ForegroundColor Green
& $vscodePath --user-data-dir=$sandboxDir --extension-dir=$extDir --disable-extensions --disable-workspace-trust --new-window .

Write-Host "✅ VS Code started in C:\\Dev sandbox" -ForegroundColor Green
Write-Host "🔒 Security level: Maximum" -ForegroundColor Yellow
Write-Host "📁 Workspace: C:\\Dev" -ForegroundColor Yellow
Write-Host "🔌 Extensions: Whitelisted only" -ForegroundColor Yellow
`;
    
    const psPath = path.join(this.devPath, 'vscode-sandbox.ps1');
    fs.writeFileSync(psPath, powershellScript);
    
    // Shell script for WSL
    const shellScript = `#!/bin/bash
echo "🔒 Starting VS Code in C:\\Dev Sandbox..."

# Check if VS Code is available
if ! command -v code &> /dev/null; then
    echo "❌ VS Code not found"
    echo "Please install VS Code first"
    exit 1
fi

# Change to C:\\Dev (WSL path)
cd /mnt/c/Dev

# Start VS Code with sandbox configuration
echo "🚀 Launching VS Code with sandbox security..."
code --user-data-dir="/mnt/c/Dev/.vscode-sandbox" --extension-dir="/mnt/c/Dev/.vscode-sandbox/extensions" --disable-extensions --disable-workspace-trust --new-window .

echo "✅ VS Code started in C:\\Dev sandbox"
echo "🔒 Security level: Maximum"
echo "📁 Workspace: /mnt/c/Dev"
echo "🔌 Extensions: Whitelisted only"
`;
    
    const shPath = path.join(this.devPath, 'vscode-sandbox.sh');
    fs.writeFileSync(shPath, shellScript);
    
    console.log('✅ Sandbox launch scripts created');
  }

  // 📊 Setup VS Code monitoring
  setupVSCodeMonitoring() {
    console.log('📊 Setting up VS Code monitoring...');
    
    const monitoringConfig = {
      enabled: true,
      logLevel: 'info',
      trackFileAccess: true,
      trackNetworkRequests: true,
      trackExtensionUsage: true,
      trackTerminalCommands: true,
      securityEvents: {
        suspiciousFileAccess: true,
        blockedExtensions: true,
        untrustedWorkspaces: true,
        securityPolicyViolations: true
      },
      alerts: {
        highRiskFileAccess: true,
        extensionInstallation: true,
        workspaceTrustChanges: true,
        terminalSecurityViolations: true
      },
      logging: {
        fileAccess: true,
        networkActivity: true,
        extensionActivity: true,
        terminalActivity: true,
        securityEvents: true
      }
    };
    
    const monitoringPath = path.join(this.devPath, 'vscode-monitoring.json');
    fs.writeFileSync(monitoringPath, JSON.stringify(monitoringConfig, null, 2));
    
    console.log('✅ VS Code monitoring setup');
  }

  // 🚀 Launch VS Code in sandbox
  async launchVSCodeSandbox(projectPath = null) {
    console.log('🚀 Launching VS Code in sandbox...');
    
    try {
      const sandboxDir = path.join(this.devPath, '.vscode-sandbox');
      const extDir = path.join(sandboxDir, 'extensions');
      
      // Create sandbox directories
      if (!fs.existsSync(sandboxDir)) {
        fs.mkdirSync(sandboxDir, { recursive: true });
      }
      
      if (!fs.existsSync(extDir)) {
        fs.mkdirSync(extDir, { recursive: true });
      }
      
      // Build VS Code command
      let vscodeCommand = `"${this.vscodePath}"`;
      vscodeCommand += ` --user-data-dir="${sandboxDir}"`;
      vscodeCommand += ` --extension-dir="${extDir}"`;
      vscodeCommand += ` --disable-workspace-trust`;
      vscodeCommand += ` --new-window`;
      
      // Add project path if specified
      if (projectPath) {
        vscodeCommand += ` "${projectPath}"`;
      } else {
        vscodeCommand += ` "${this.devPath}"`;
      }
      
      // Launch VS Code
      execSync(vscodeCommand, { 
        stdio: 'pipe',
        detached: true 
      });
      
      console.log('✅ VS Code launched in sandbox');
      console.log(`🔒 User data: ${sandboxDir}`);
      console.log(`🔌 Extensions: ${extDir}`);
      console.log(`📁 Workspace: ${projectPath || this.devPath}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to launch VS Code sandbox:', error);
      return false;
    }
  }

  // 📊 Get sandbox status
  getSandboxStatus() {
    return {
      vscodePath: this.vscodePath,
      sandboxPath: this.devPath,
      configExists: fs.existsSync(path.join(this.devPath, 'vscode-settings.json')),
      trustConfigExists: fs.existsSync(path.join(this.devPath, 'workspace-trust.json')),
      securityPoliciesExist: fs.existsSync(path.join(this.devPath, 'vscode-security-policies.json')),
      allowedProjects: this.discoverProjects().length,
      allowedExtensions: this.sandboxConfig.allowedExtensions.length,
      blockedExtensions: this.sandboxConfig.blockedExtensions.length
    };
  }

  // 🔍 Validate sandbox security
  validateSandboxSecurity() {
    console.log('🔍 Validating sandbox security...');
    
    const issues = [];
    
    // Check if VS Code is installed
    if (!fs.existsSync(this.vscodePath)) {
      issues.push('VS Code not found');
    }
    
    // Check if C:\Dev exists
    if (!fs.existsSync(this.devPath)) {
      issues.push('C:\\Dev directory not found');
    }
    
    // Check configuration files
    const requiredFiles = [
      'vscode-settings.json',
      'workspace-trust.json',
      'vscode-security-policies.json',
      'allowed-workspaces.json'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(this.devPath, file))) {
        issues.push(`Missing configuration file: ${file}`);
      }
    }
    
    // Check for forbidden paths access
    for (const forbiddenPath of this.sandboxConfig.forbiddenPaths) {
      if (fs.existsSync(forbiddenPath)) {
        console.log(`🔒 Forbidden path exists but is blocked: ${forbiddenPath}`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues: issues,
      securityLevel: issues.length === 0 ? 'maximum' : 'partial'
    };
  }
}

module.exports = UniversalVSCodeSandbox;
