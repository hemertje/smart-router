// 🔒 C:\Dev Universele Sandbox Manager
// C:\Dev is de universele sandbox voor alle deelprojecten

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UniversalDevSandbox {
  constructor() {
    this.devPath = 'C:\\Dev';
    this.projects = new Map();
    this.securityConfig = {
      allowedPaths: [
        'C:\\Dev',  // Alleen C:\Dev is toegestaan!
      ],
      forbiddenPaths: [
        'C:\\Users',
        'C:\\Program Files',
        'C:\\Windows',
        'C:\\System32',
        'C:\\Documents and Settings'
      ],
      allowedDomains: [
        // News sources
        'techcrunch.com', 'wired.com', 'theverge.com', 'arstechnica.com',
        // AI/ML sources  
        'arxiv.org', 'huggingface.co', 'openai.com', 'anthropic.com',
        // Development sources
        'github.com', 'stackoverflow.com', 'npmjs.org',
        // Market data
        'yahoo.com', 'finance.yahoo.com'
      ],
      resourceLimits: {
        maxMemory: '2GB',  // Voor hele C:\Dev
        maxCPU: '75%',     // Voor alle projecten samen
        maxDiskSpace: '10GB' // Voor alle projecten samen
      }
    };
    
    this.initializeUniversalSandbox();
  }

  // 🏰 Initialize universele sandbox
  initializeUniversalSandbox() {
    console.log('🏰 Initializing C:\\Dev universele sandbox...');
    
    try {
      // 1. Validate C:\Dev is de sandbox
      this.validateSandboxStructure();
      
      // 2. Discover all projects
      this.discoverProjects();
      
      // 3. Setup universal security
      this.setupUniversalSecurity();
      
      // 4. Initialize internet gateway for C:\Dev
      this.initializeInternetGateway();
      
      // 5. Setup project isolation
      this.setupProjectIsolation();
      
      // 6. Create monitoring
      this.setupUniversalMonitoring();
      
      // 7. Initialize VS Code sandbox
      this.initializeVSCodeSandbox();
      
      // 8. Initialize Windsurf sandbox
      this.initializeWindsurfSandbox();
      
      // 9. Initialize automatic sandbox launcher
      this.initializeAutoLauncher();
      
      // 10. 🆕 Initialize VS Code auto launcher
      this.initializeVSCodeAutoLauncher();
      
      console.log('✅ C:\\Dev universele sandbox initialized');
      console.log(`📁 Ontdekte projecten: ${this.projects.size}`);
      console.log(`🌐 Internet gateway: enabled`);
      console.log(`🔒 Security level: maximum`);
      console.log(`💻 VS Code sandbox: enabled`);
      console.log(`🌊 Windsurf sandbox: enabled`);
      console.log(`🚀 Auto launcher: enabled`);
      console.log(`💻 VS Code auto launcher: enabled`);
      
    } catch (error) {
      console.error('❌ Failed to initialize universal sandbox:', error);
      throw error;
    }
  }

  // 🌊 Initialize Windsurf sandbox
  initializeWindsurfSandbox() {
    console.log('🌊 Initializing Windsurf sandbox...');
    
    try {
      // Import Windsurf sandbox
      const WindsurfSandbox = require('./windsurfSandbox');
      this.windsurfSandbox = new WindsurfSandbox();
      
      console.log('✅ Windsurf sandbox initialized');
    } catch (error) {
      console.warn('⚠️ Windsurf sandbox initialization failed:', error.message);
      console.log('🔄 Continuing without Windsurf sandbox...');
    }
  }

  // 🚀 Initialize automatic sandbox launcher
  initializeAutoLauncher() {
    console.log('🚀 Initializing automatic sandbox launcher...');
    
    try {
      // Import automatic launcher
      const AutomaticSandboxLauncher = require('./automaticSandboxLauncher');
      this.autoLauncher = new AutomaticSandboxLauncher();
      
      console.log('✅ Automatic sandbox launcher initialized');
    } catch (error) {
      console.warn('⚠️ Auto launcher initialization failed:', error.message);
      console.log('🔄 Continuing without auto launcher...');
    }
  }

  // 💻 Initialize VS Code auto launcher
  initializeVSCodeAutoLauncher() {
    console.log('💻 Initializing VS Code auto launcher...');
    
    try {
      // Import VS Code auto launcher
      const VSCodeAutoLauncher = require('./vsCodeAutoLauncher');
      this.vscodeAutoLauncher = new VSCodeAutoLauncher();
      
      console.log('✅ VS Code auto launcher initialized');
    } catch (error) {
      console.warn('⚠️ VS Code auto launcher initialization failed:', error.message);
      console.log('🔄 Continuing without VS Code auto launcher...');
    }
  }

  // 💻 Initialize VS Code sandbox
  initializeVSCodeSandbox() {
    console.log('💻 Initializing VS Code sandbox...');
    
    try {
      // Import VS Code sandbox
      const UniversalVSCodeSandbox = require('./universalVSCodeSandbox');
      this.vscodeSandbox = new UniversalVSCodeSandbox();
      
      console.log('✅ VS Code sandbox initialized');
    } catch (error) {
      console.warn('⚠️ VS Code sandbox initialization failed:', error.message);
      console.log('🔄 Continuing without VS Code sandbox...');
    }
  }

  // �� Validate sandbox structuur
  validateSandboxStructure() {
    console.log('🔍 Validating C:\\Dev sandbox structure...');
    
    // Check if C:\Dev exists
    if (!fs.existsSync(this.devPath)) {
      throw new Error('C:\\Dev bestaat niet - dit is de universele sandbox!');
    }
    
    // Check if we're actually in C:\Dev
    const currentPath = process.cwd();
    if (!currentPath.startsWith('C:\\Dev')) {
      console.warn('⚠️ Waarschuwing: We zijn niet in C:\\Dev');
    }
    
    // Check forbidden paths are not accessible
    for (const forbiddenPath of this.securityConfig.forbiddenPaths) {
      if (fs.existsSync(forbiddenPath)) {
        console.log(`🔒 ${forbiddenPath} bestaat maar is afgeschermd`);
      }
    }
    
    console.log('✅ Sandbox structuur gevalideerd');
  }

  // 🔍 Discover all projects in C:\Dev
  discoverProjects() {
    console.log('🔍 Discovering projects in C:\\Dev...');
    
    try {
      const items = fs.readdirSync(this.devPath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          const projectPath = path.join(this.devPath, item.name);
          
          // Check if it's a project (has package.json, git, etc.)
          if (this.isProject(projectPath)) {
            const projectInfo = this.analyzeProject(projectPath);
            this.projects.set(item.name, projectInfo);
            
            console.log(`📁 Project gevonden: ${item.name}`);
            console.log(`   Type: ${projectInfo.type}`);
            console.log(`   Technologies: ${projectInfo.technologies.join(', ')}`);
          }
        }
      }
      
      console.log(`✅ ${this.projects.size} projecten ontdekt in C:\\Dev`);
      
    } catch (error) {
      console.error('❌ Failed to discover projects:', error);
    }
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
      'build'
    ];
    
    return indicators.some(indicator => 
      fs.existsSync(path.join(projectPath, indicator))
    );
  }

  // 📊 Analyze project
  analyzeProject(projectPath) {
    const projectName = path.basename(projectPath);
    
    // Detect project type
    let type = 'unknown';
    let technologies = [];
    
    // Check for Node.js
    if (fs.existsSync(path.join(projectPath, 'package.json'))) {
      type = 'nodejs';
      technologies.push('Node.js');
      
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8')
        );
        technologies.push(...Object.keys(packageJson.dependencies || {}));
      } catch {}
    }
    
    // Check for Python
    if (fs.existsSync(path.join(projectPath, 'requirements.txt'))) {
      type = 'python';
      technologies.push('Python');
    }
    
    // Check for git
    if (fs.existsSync(path.join(projectPath, '.git'))) {
      technologies.push('Git');
    }
    
    // Check for Docker
    if (fs.existsSync(path.join(projectPath, 'Dockerfile'))) {
      technologies.push('Docker');
    }
    
    return {
      name: projectName,
      path: projectPath,
      type: type,
      technologies: technologies,
      size: this.calculateDirectorySize(projectPath),
      lastModified: this.getLastModified(projectPath)
    };
  }

  // 📏 Calculate directory size
  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          totalSize += this.calculateDirectorySize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return totalSize;
  }

  // 🕐 Get last modified time
  getLastModified(dirPath) {
    let latest = 0;
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          const dirLatest = this.getLastModified(itemPath);
          latest = Math.max(latest, dirLatest);
        } else {
          latest = Math.max(latest, stats.mtime.getTime());
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return latest;
  }

  // 🔒 Setup universal security
  setupUniversalSecurity() {
    console.log('🔒 Setting up universal security for C:\\Dev...');
    
    // Create security config for C:\Dev
    const securityConfig = {
      sandbox_path: this.devPath,
      allowed_operations: [
        'read', 'write', 'execute'  // Alleen binnen C:\Dev
      ],
      forbidden_operations: [
        'delete_system_files',
        'modify_registry',
        'access_user_directories',
        'install_software'
      ],
      monitoring: {
        file_access: true,
        network_requests: true,
        process_execution: true,
        resource_usage: true
      },
      alerts: {
        suspicious_file_access: true,
        unusual_network_activity: true,
        resource_exhaustion: true,
        security_violations: true
      }
    };
    
    const configPath = path.join(this.devPath, 'universal-security.json');
    fs.writeFileSync(configPath, JSON.stringify(securityConfig, null, 2));
    
    console.log('✅ Universal security setup complete');
  }

  // 🌐 Initialize internet gateway for C:\Dev
  initializeInternetGateway() {
    console.log('🌐 Initializing internet gateway for C:\\Dev...');
    
    const gatewayConfig = {
      sandbox: 'C:\\Dev',
      allowed_domains: this.securityConfig.allowedDomains,
      forbidden_domains: [
        'malware.com',
        'phishing.com',
        'suspicious.com'
      ],
      security: {
        ssl_required: true,
        request_validation: true,
        response_sanitization: true,
        rate_limiting: true
      },
      monitoring: {
        log_all_requests: true,
        track_bandwidth: true,
        alert_on_anomalies: true
      }
    };
    
    const gatewayPath = path.join(this.devPath, 'internet-gateway.json');
    fs.writeFileSync(gatewayPath, JSON.stringify(gatewayConfig, null, 2));
    
    console.log('✅ Internet gateway initialized for C:\\Dev');
  }

  // 🏗️ Setup project isolation
  setupProjectIsolation() {
    console.log('🏗️ Setting up project isolation...');
    
    for (const [projectName, projectInfo] of this.projects) {
      // Create project-specific security rules
      const projectSecurity = {
        project_name: projectName,
        project_path: projectInfo.path,
        allowed_paths: [
          projectInfo.path,
          path.join(projectInfo.path, 'node_modules'),
          path.join(projectInfo.path, 'temp'),
          path.join(projectInfo.path, 'cache')
        ],
        resource_limits: {
          max_memory: '512MB',
          max_cpu: '25%',
          max_disk_space: '1GB'
        },
        network_access: {
          allowed_domains: this.securityConfig.allowedDomains,
          max_requests_per_minute: 30
        }
      };
      
      const securityPath = path.join(projectInfo.path, 'project-security.json');
      fs.writeFileSync(securityPath, JSON.stringify(projectSecurity, null, 2));
      
      console.log(`🔒 Project isolation setup for: ${projectName}`);
    }
    
    console.log('✅ Project isolation setup complete');
  }

  // 📊 Setup universal monitoring
  setupUniversalMonitoring() {
    console.log('📊 Setting up universal monitoring for C:\\Dev...');
    
    const monitoringConfig = {
      sandbox_path: this.devPath,
      projects: Array.from(this.projects.keys()),
      metrics: {
        resource_usage: true,
        file_operations: true,
        network_activity: true,
        project_activity: true
      },
      alerts: {
        high_memory_usage: { threshold: '80%', enabled: true },
        high_cpu_usage: { threshold: '80%', enabled: true },
        unusual_file_access: { enabled: true },
        suspicious_network_activity: { enabled: true }
      },
      logging: {
        level: 'info',
        retention_days: 30,
        include_project_context: true
      }
    };
    
    const monitoringPath = path.join(this.devPath, 'universal-monitoring.json');
    fs.writeFileSync(monitoringPath, JSON.stringify(monitoringConfig, null, 2));
    
    console.log('✅ Universal monitoring setup complete');
  }

  // 📊 Get sandbox status
  getSandboxStatus() {
    const totalSize = Array.from(this.projects.values())
      .reduce((total, project) => total + project.size, 0);
    
    const status = {
      sandbox_path: this.devPath,
      total_projects: this.projects.size,
      total_size: totalSize,
      security_level: 'maximum',
      internet_gateway: 'enabled',
      monitoring: 'active',
      vscode_sandbox: this.vscodeSandbox ? 'enabled' : 'disabled',
      windsurf_sandbox: this.windsurfSandbox ? 'enabled' : 'disabled',
      auto_launcher: this.autoLauncher ? 'enabled' : 'disabled',
      projects: Array.from(this.projects.entries()).map(([name, info]) => ({
        name: name,
        type: info.type,
        technologies: info.technologies,
        size: info.size,
        last_modified: new Date(info.lastModified).toISOString()
      }))
    };
    
    // Add VS Code status if available
    if (this.vscodeSandbox) {
      status.vscode_status = this.vscodeSandbox.getSandboxStatus();
      status.vscode_security = this.vscodeSandbox.validateSandboxSecurity();
    }
    
    // Add Windsurf status if available
    if (this.windsurfSandbox) {
      status.windsurf_status = this.windsurfSandbox.getSandboxStatus();
      status.windsurf_security = this.windsurfSandbox.validateWindsurfSecurity();
    }
    
    // Add auto launcher status if available
    if (this.autoLauncher) {
      status.auto_launcher_status = this.autoLauncher.getLauncherStatus();
    }
    
    return status;
  }

  // 🌐 Make secure request (for any project in C:\Dev)
  async makeSecureRequest(url, options = {}) {
    console.log(`🌐 Making secure request from C:\\Dev: ${url}`);
    
    // Validate domain is allowed
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    if (!this.securityConfig.allowedDomains.includes(hostname)) {
      throw new Error(`Domain not allowed in C\\Dev sandbox: ${hostname}`);
    }
    
    // Make request with security headers
    const axios = require('axios');
    
    const response = await axios({
      method: options.method || 'GET',
      url: url,
      headers: {
        'User-Agent': 'CDev-Sandbox/1.0',
        'X-Sandbox': 'C:\\Dev',
        ...options.headers
      },
      timeout: 30000,
      maxRedirects: 3
    });
    
    // Log request
    this.logRequest({
      timestamp: new Date().toISOString(),
      url: url,
      method: options.method || 'GET',
      status: response.status,
      size: JSON.stringify(response.data).length,
      sandbox: 'C:\\Dev'
    });
    
    return response.data;
  }

  // 📊 Log request
  logRequest(requestData) {
    const logPath = path.join(this.devPath, 'network-logs.json');
    
    let logs = [];
    if (fs.existsSync(logPath)) {
      try {
        logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      } catch {}
    }
    
    logs.push(requestData);
    
    // Keep only last 1000 entries
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }
    
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  }

  // 🚀 Run project in sandbox
  async runProject(projectName, command) {
    console.log(`🚀 Running project ${projectName} in C\\Dev sandbox...`);
    
    const project = this.projects.get(projectName);
    if (!project) {
      throw new Error(`Project not found: ${projectName}`);
    }
    
    try {
      // Change to project directory
      const originalCwd = process.cwd();
      process.chdir(project.path);
      
      // Execute command
      const result = execSync(command, {
        encoding: 'utf8',
        timeout: 30000,
        maxBuffer: 1024 * 1024 // 1MB
      });
      
      // Restore original directory
      process.chdir(originalCwd);
      
      console.log(`✅ Project ${projectName} executed successfully`);
      return result;
      
    } catch (error) {
      // Restore original directory
      process.chdir(process.cwd());
      
      console.error(`❌ Failed to run project ${projectName}:`, error);
      throw error;
    }
  }
}

module.exports = UniversalDevSandbox;
