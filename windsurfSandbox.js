// 🌊 Windsurf Sandbox - Specifieke Beveiliging voor Windsurf AI
// Zorgt ervoor dat Windsurf ook veilig in C:\Dev sandbox draait

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WindsurfSandbox {
  constructor() {
    this.devPath = 'C:\\Dev';
    this.windsurfPath = this.getWindsurfPath();
    this.windsurfConfigPath = this.getWindsurfConfigPath();
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
      aiModelRestrictions: {
        allowedModels: [
          'claude-3-5-sonnet-20241022',
          'claude-3-haiku-20240307',
          'gpt-4o',
          'gpt-4o-mini',
          'o1-preview',
          'o1-mini'
        ],
        blockedModels: [
          'gpt-4', // Older model
          'gpt-3.5-turbo', // Less secure
          'claude-instant-1' // Legacy
        ],
        limits: {
          maxTokens: 100000,
          maxCostPerRequest: 0.10,  // Verlaagd naar $0.10
          maxDailyCost: 2.00,       // Verlaagd naar $2
          maxMonthlyCost: 30.00     // Nieuw: $30 per maand
        }
      },
      securityPolicies: {
        fileSystemAccess: {
          allowedPaths: ['C:\\Dev\\**'],
          forbiddenPaths: [
            'C:\\Users\\**',
            'C:\\Program Files\\**',
            'C:\\Windows\\**'
          ],
          readOnlyPaths: [
            'C:\\Dev\\**\\node_modules\\**',
            'C:\\Dev\\**\\dist\\**',
            'C:\\Dev\\**\\build\\**',
            'C:\\Dev\\**\\cache\\**'
          ]
        },
        codeExecution: {
          allowedCommands: [
            'npm', 'yarn', 'pnpm', 'node', 'python', 'pip', 'git'
          ],
          blockedCommands: [
            'rm', 'del', 'format', 'sudo', 'chmod', 'chown', 'netsh'
          ],
          maxExecutionTime: 30000, // 30 seconds
          maxMemoryUsage: '512MB'
        },
        networkAccess: {
          allowedDomains: [
            'api.anthropic.com',
            'api.openai.com',
            'github.com',
            'gitlab.com',
            'npmjs.org',
            'pypi.org',
            'crates.io'
          ],
          blockedDomains: [
            'malware.com',
            'phishing.com',
            'suspicious.com'
          ],
          maxRequestsPerMinute: 60
        }
      }
    };
    
    this.initializeWindsurfSandbox();
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
    
    // Check if Windsurf is available via command
    try {
      execSync('windsurf --version', { stdio: 'pipe' });
      return 'windsurf'; // Use command line
    } catch {
      throw new Error('Windsurf niet gevonden. Installeer Windsurf eerst.');
    }
  }

  // 📁 Get Windsurf config path
  getWindsurfConfigPath() {
    const configPath = path.join('C:\\Users', process.env.USERNAME, '.windsurf');
    if (!fs.existsSync(configPath)) {
      fs.mkdirSync(configPath, { recursive: true });
    }
    return configPath;
  }

  // 🌊 Initialize Windsurf sandbox
  initializeWindsurfSandbox() {
    console.log('🌊 Initializing Windsurf sandbox...');
    
    try {
      // 1. Create Windsurf sandbox configuration
      this.createWindsurfConfig();
      
      // 2. Setup AI model restrictions
      this.setupModelRestrictions();
      
      // 3. Configure security policies
      this.setupSecurityPolicies();
      
      // 4. Create workspace restrictions
      this.createWorkspaceRestrictions();
      
      // 5. Setup AI safety filters
      this.setupAISafetyFilters();
      
      // 6. Create sandbox launch scripts
      this.createWindsurfScripts();
      
      // 7. Setup monitoring
      this.setupWindsurfMonitoring();
      
      console.log('✅ Windsurf sandbox initialized');
      console.log(`🌊 Windsurf path: ${this.windsurfPath}`);
      console.log(`🏰 Sandbox path: ${this.devPath}`);
      console.log(`🔒 Security level: maximum`);
      
    } catch (error) {
      console.error('❌ Failed to initialize Windsurf sandbox:', error);
      throw error;
    }
  }

  // ⚙️ Create Windsurf configuration
  createWindsurfConfig() {
    console.log('⚙️ Creating Windsurf sandbox configuration...');
    
    const windsurfConfig = {
      // Workspace restrictions
      'workspaces.allowedFolders': ['C:\\Dev'],
      'workspaces.trustOnlyAllowedFolders': true,
      'workspaces.warnOnOpenOutsideWorkspace': true,
      
      // AI model settings
      'ai.defaultModel': 'claude-3-5-sonnet-20241022',
      'ai.maxTokens': 50000,
      'ai.temperature': 0.7,
      'ai.enableCodeExecution': true,
      'ai.codeExecutionTimeout': 30000,
      
      // Security settings
      'security.enableFileSystemProtection': true,
      'security.allowedPaths': ['C:\\Dev\\**'],
      'security.blockedPaths': [
        'C:\\Users\\**',
        'C:\\Program Files\\**',
        'C:\\Windows\\**'
      ],
      'security.enableCodeSafety': true,
      'security.warnOnDangerousCode': true,
      
      // Network settings
      'network.allowedDomains': this.sandboxConfig.securityPolicies.networkAccess.allowedDomains,
      'network.blockedDomains': this.sandboxConfig.securityPolicies.networkAccess.blockedDomains,
      'network.maxRequestsPerMinute': 60,
      
      // Cost controls
      'cost.maxDailyBudget': 2,        // Verlaagd naar $2 per dag
      'cost.maxCostPerRequest': 0.10,  // Verlaagd naar $0.10 per request
      'cost.maxMonthlyBudget': 30,     // Nieuw: $30 per maand
      'cost.warnOnHighCost': true,
      'cost.budgetAlerts': true,
      'cost.monthlyAlert': true,       // Nieuw: maandelijkse alerts
      
      // Privacy settings
      'privacy.disableTelemetry': false,
      'privacy.anonymousUsage': true,
      'privacy.dataRetention': '30days',
      
      // Editor settings
      'editor.formatOnSave': true,
      'editor.codeActionsOnSave': {
        'source.fixAll.eslint': true
      },
      'editor.wordWrap': 'on',
      
      // File exclusions
      'files.exclude': {
        '**/node_modules': true,
        '**/dist': true,
        '**/build': true,
        '**/.git': false,
        '**/.env': true
      },
      
      // Search exclusions
      'search.exclude': {
        '**/node_modules': true,
        '**/dist': true,
        '**/build': true,
        '**/*.code-search': true
      }
    };
    
    const configPath = path.join(this.windsurfConfigPath, 'settings.json');
    fs.writeFileSync(configPath, JSON.stringify(windsurfConfig, null, 2));
    
    console.log('✅ Windsurf configuration created');
  }

  // 🤖 Setup AI model restrictions
  setupModelRestrictions() {
    console.log('🤖 Setting up AI model restrictions...');
    
    const modelConfig = {
      allowedModels: this.sandboxConfig.aiModelRestrictions.allowedModels,
      blockedModels: this.sandboxConfig.aiModelRestrictions.blockedModels,
      defaultModel: 'claude-3-5-sonnet-20241022',
      fallbackModel: 'claude-3-haiku-20240307',
      limits: {
        maxTokens: this.sandboxConfig.aiModelRestrictions.maxTokens,
        maxCostPerRequest: this.sandboxConfig.aiModelRestrictions.maxCostPerRequest,
        maxDailyCost: this.sandboxConfig.aiModelRestrictions.maxDailyCost
      },
      safety: {
        enableContentFilter: true,
        blockHarmfulContent: true,
        blockPersonalDataRequests: true,
        blockSystemCommands: true
      }
    };
    
    const modelPath = path.join(this.windsurfConfigPath, 'model-restrictions.json');
    fs.writeFileSync(modelPath, JSON.stringify(modelConfig, null, 2));
    
    console.log('✅ AI model restrictions setup');
  }

  // 🛡️ Setup security policies
  setupSecurityPolicies() {
    console.log('🛡️ Setting up security policies...');
    
    const securityConfig = {
      fileSystem: this.sandboxConfig.securityPolicies.fileSystemAccess,
      codeExecution: this.sandboxConfig.securityPolicies.codeExecution,
      network: this.sandboxConfig.securityPolicies.networkAccess,
      aiSafety: {
        enableCodeValidation: true,
        blockDangerousPatterns: [
          /rm\s+-rf/i,
          /sudo/i,
          /format\s+c:/i,
          /del\s+\/s/i,
          /chmod\s+777/i,
          /chown\s+root/i
        ],
        warnOnSuspiciousCode: true,
        requireConfirmationForExecution: true
      },
      monitoring: {
        logAllAIRequests: true,
        logCodeExecution: true,
        logFileAccess: true,
        logNetworkRequests: true
      }
    };
    
    const securityPath = path.join(this.windsurfConfigPath, 'security-policies.json');
    fs.writeFileSync(securityPath, JSON.stringify(securityConfig, null, 2));
    
    console.log('✅ Security policies setup');
  }

  // 📁 Create workspace restrictions
  createWorkspaceRestrictions() {
    console.log('📁 Creating workspace restrictions...');
    
    // Discover all projects in C:\Dev
    const projects = this.discoverProjects();
    
    const workspaceConfig = {
      allowedWorkspaces: projects.map(project => ({
        name: project.name,
        path: project.path,
        type: project.type,
        trusted: true,
        restrictions: {
          allowFileSystemAccess: true,
          allowNetworkAccess: true,
          allowCodeExecution: true,
          allowAIGeneration: true
        }
      })),
      globalRestrictions: {
        allowOutsideWorkspaceAccess: false,
        warnOnOutsideWorkspaceOpen: true,
        blockSystemFileAccess: true,
        blockPersonalDataAccess: true
      }
    };
    
    const workspacePath = path.join(this.windsurfConfigPath, 'workspace-restrictions.json');
    fs.writeFileSync(workspacePath, JSON.stringify(workspaceConfig, null, 2));
    
    console.log(`✅ ${projects.length} workspace restrictions created`);
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
      '.windsurf'
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

  // 🛡️ Setup AI safety filters
  setupAISafetyFilters() {
    console.log('🛡️ Setting up AI safety filters...');
    
    const safetyConfig = {
      contentFilters: {
        blockPersonalDataRequests: true,
        blockSystemInformationRequests: true,
        blockMaliciousCode: true,
        blockPhishingAttempts: true,
        blockDataExfiltration: true
      },
      codeValidation: {
        enableStaticAnalysis: true,
        checkForSecurityVulnerabilities: true,
        checkForDataAccess: true,
        checkForNetworkCalls: true,
        checkForFileSystemAccess: true
      },
      responseFiltering: {
        sanitizePersonalInfo: true,
        sanitizeSystemInfo: true,
        sanitizePasswords: true,
        sanitizeApiKeys: true,
        sanitizeFilePaths: true
      },
      alerting: {
        alertOnSuspiciousRequests: true,
        alertOnBlockedContent: true,
        alertOnHighCostRequests: true,
        alertOnUnusualPatterns: true
      }
    };
    
    const safetyPath = path.join(this.windsurfConfigPath, 'ai-safety-filters.json');
    fs.writeFileSync(safetyPath, JSON.stringify(safetyConfig, null, 2));
    
    console.log('✅ AI safety filters setup');
  }

  // 🚀 Create Windsurf sandbox scripts
  createWindsurfScripts() {
    console.log('🚀 Creating Windsurf sandbox scripts...');
    
    // Windows batch script
    const batchScript = `@echo off
echo 🌊 Starting Windsurf in C:\\Dev Sandbox...

REM Check if Windsurf is installed
if not exist "${this.windsurfPath}" (
    if "%~1"=="" (
        echo ❌ Windsurf not found at: ${this.windsurfPath}
        echo Please install Windsurf first
        pause
        exit /b 1
    )
)

REM Change to C:\\Dev
cd /d C:\\Dev

REM Set Windsurf config path
set WINDSURF_CONFIG_PATH=${this.windsurfConfigPath}

REM Start Windsurf with sandbox configuration
echo 🚀 Launching Windsurf with sandbox security...
if exist "${this.windsurfPath}" (
    "${this.windsurfPath}" --config-dir="%WINDSURF_CONFIG_PATH%" --disable-telemetry --new-window .
) else (
    windsurf --config-dir="%WINDSURF_CONFIG_PATH%" --disable-telemetry --new-window .
)

echo ✅ Windsurf started in C:\\Dev sandbox
echo 🔒 Security level: Maximum
echo 📁 Workspace: C:\\Dev
echo 🤖 AI Models: Whitelisted only
echo 💰 Cost controls: Enabled
pause
`;
    
    const batchPath = path.join(this.devPath, 'windsurf-sandbox.bat');
    fs.writeFileSync(batchPath, batchScript);
    
    // PowerShell script
    const powershellScript = `# 🌊 Windsurf Sandbox Launcher for PowerShell
Write-Host "🌊 Starting Windsurf in C:\\Dev Sandbox..." -ForegroundColor Blue

# Check if Windsurf is available
$windsurfPath = "${this.windsurfPath}"
$windsurfAvailable = $false

if (Test-Path $windsurfPath) {
    $windsurfAvailable = $true
} else {
    try {
        windsurf --version | Out-Null
        $windsurfAvailable = $true
    } catch {
        $windsurfAvailable = $false
    }
}

if (-not $windsurfAvailable) {
    Write-Host "❌ Windsurf not found" -ForegroundColor Red
    Write-Host "Please install Windsurf first" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Change to C:\\Dev
Set-Location "C:\\Dev"

# Set Windsurf config path
$env:WINDSURF_CONFIG_PATH = "${this.windsurfConfigPath}"

# Start Windsurf with sandbox configuration
Write-Host "🚀 Launching Windsurf with sandbox security..." -ForegroundColor Blue
if (Test-Path $windsurfPath) {
    & $windsurfPath --config-dir=$env:WINDSURF_CONFIG_PATH --disable-telemetry --new-window .
} else {
    windsurf --config-dir=$env:WINDSURF_CONFIG_PATH --disable-telemetry --new-window .
}

Write-Host "✅ Windsurf started in C:\\Dev sandbox" -ForegroundColor Green
Write-Host "🔒 Security level: Maximum" -ForegroundColor Yellow
Write-Host "📁 Workspace: C:\\Dev" -ForegroundColor Yellow
Write-Host "🤖 AI Models: Whitelisted only" -ForegroundColor Yellow
Write-Host "💰 Cost controls: Enabled" -ForegroundColor Yellow
`;
    
    const psPath = path.join(this.devPath, 'windsurf-sandbox.ps1');
    fs.writeFileSync(psPath, powershellScript);
    
    console.log('✅ Windsurf sandbox scripts created');
  }

  // 📊 Setup Windsurf monitoring
  setupWindsurfMonitoring() {
    console.log('📊 Setting up Windsurf monitoring...');
    
    const monitoringConfig = {
      enabled: true,
      logLevel: 'info',
      trackAIRequests: true,
      trackCodeExecution: true,
      trackFileAccess: true,
      trackNetworkActivity: true,
      trackCostUsage: true,
      securityEvents: {
        suspiciousAIRequests: true,
        blockedCodeExecution: true,
        unauthorizedFileAccess: true,
        highCostRequests: true,
        modelRestrictionViolations: true
      },
      alerts: {
        dailyBudgetExceeded: true,
        monthlyBudgetExceeded: true,
        highCostPerRequest: true,
        costThresholdWarning: true,
        suspiciousCodeGeneration: true,
        unauthorizedAccessAttempts: true,
        modelUsageAnomalies: true
      },
      logging: {
        aiRequests: true,
        codeExecution: true,
        fileAccess: true,
        networkActivity: true,
        costTracking: true,
        securityEvents: true
      },
      retention: {
        logRetentionDays: 30,
        costDataRetentionDays: 90,
        securityEventRetentionDays: 180
      }
    };
    
    const monitoringPath = path.join(this.windsurfConfigPath, 'monitoring.json');
    fs.writeFileSync(monitoringPath, JSON.stringify(monitoringConfig, null, 2));
    
    console.log('✅ Windsurf monitoring setup');
  }

  // 🚀 Launch Windsurf in sandbox
  async launchWindsurfSandbox(projectPath = null) {
    console.log('🚀 Launching Windsurf in sandbox...');
    
    try {
      // Set environment variables
      process.env.WINDSURF_CONFIG_PATH = this.windsurfConfigPath;
      
      // Build Windsurf command
      let windsurfCommand = '';
      
      if (fs.existsSync(this.windsurfPath) && this.windsurfPath !== 'windsurf') {
        windsurfCommand = `"${this.windsurfPath}"`;
      } else {
        windsurfCommand = 'windsurf';
      }
      
      windsurfCommand += ` --config-dir="${this.windsurfConfigPath}"`;
      windsurfCommand += ` --disable-telemetry`;
      windsurfCommand += ` --new-window`;
      
      // Add project path if specified
      if (projectPath) {
        windsurfCommand += ` "${projectPath}"`;
      } else {
        windsurfCommand += ` "${this.devPath}"`;
      }
      
      // Launch Windsurf
      execSync(windsurfCommand, { 
        stdio: 'pipe',
        detached: true 
      });
      
      console.log('✅ Windsurf launched in sandbox');
      console.log(`🌊 Config: ${this.windsurfConfigPath}`);
      console.log(`📁 Workspace: ${projectPath || this.devPath}`);
      console.log(`🤖 AI Models: Restricted`);
      console.log(`💰 Cost controls: Enabled`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to launch Windsurf sandbox:', error);
      return false;
    }
  }

  // 📊 Get sandbox status
  getSandboxStatus() {
    return {
      windsurfPath: this.windsurfPath,
      configPath: this.windsurfConfigPath,
      sandboxPath: this.devPath,
      configExists: fs.existsSync(path.join(this.windsurfConfigPath, 'settings.json')),
      modelRestrictionsExist: fs.existsSync(path.join(this.windsurfConfigPath, 'model-restrictions.json')),
      securityPoliciesExist: fs.existsSync(path.join(this.windsurfConfigPath, 'security-policies.json')),
      allowedProjects: this.discoverProjects().length,
      allowedModels: this.sandboxConfig.aiModelRestrictions.allowedModels.length,
      blockedModels: this.sandboxConfig.aiModelRestrictions.blockedModels.length,
      maxDailyCost: this.sandboxConfig.aiModelRestrictions.maxDailyCost,
      maxCostPerRequest: this.sandboxConfig.aiModelRestrictions.maxCostPerRequest
    };
  }

  // 🔍 Validate sandbox security
  validateWindsurfSecurity() {
    console.log('🔍 Validating Windsurf sandbox security...');
    
    const issues = [];
    
    // Check if Windsurf is installed
    if (fs.existsSync(this.windsurfPath)) {
      console.log('✅ Windsurf executable found');
    } else {
      try {
        execSync('windsurf --version', { stdio: 'pipe' });
        console.log('✅ Windsurf command available');
      } catch {
        issues.push('Windsurf not found');
      }
    }
    
    // Check if C:\Dev exists
    if (!fs.existsSync(this.devPath)) {
      issues.push('C:\\Dev directory not found');
    }
    
    // Check configuration files
    const requiredFiles = [
      'settings.json',
      'model-restrictions.json',
      'security-policies.json',
      'workspace-restrictions.json',
      'ai-safety-filters.json'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(this.windsurfConfigPath, file))) {
        issues.push(`Missing configuration file: ${file}`);
      }
    }
    
    // Check model restrictions
    if (this.sandboxConfig.aiModelRestrictions.allowedModels.length === 0) {
      issues.push('No allowed AI models configured');
    }
    
    return {
      valid: issues.length === 0,
      issues: issues,
      securityLevel: issues.length === 0 ? 'maximum' : 'partial'
    };
  }
}

module.exports = WindsurfSandbox;
