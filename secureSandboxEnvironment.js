const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 🔒 Secure Sandbox Environment - Veilige Ontwikkelomgeving
class SecureSandboxEnvironment {
  constructor() {
    this.sandboxPath = path.join(__dirname, 'sandbox');
    this.backupPath = path.join(__dirname, 'backups');
    this.configPath = path.join(__dirname, 'sandbox-config.json');
    this.logPath = path.join(__dirname, 'sandbox-logs');
    
    this.config = {
      sandbox: {
        enabled: true,
        isolation_level: 'high',
        auto_backup: true,
        rollback_enabled: true,
        monitoring_enabled: true
      },
      security: {
        file_access: 'restricted',
        network_access: 'isolated',
        process_execution: 'controlled',
        resource_limits: 'strict'
      },
      containers: {
        docker_enabled: true,
        python_isolated: true,
        node_isolated: true,
        database_isolated: true
      },
      safety: {
        auto_snapshot: true,
        change_detection: true,
        emergency_stop: true,
        recovery_procedures: true
      }
    };
    
    this.initializeSandbox();
  }

  // 🎯 Initialize secure sandbox
  initializeSandbox() {
    console.log('🔒 Initializing secure sandbox environment...');
    
    try {
      // 1. Create sandbox directory structure
      this.createSandboxStructure();
      
      // 2. Setup security configurations
      this.setupSecurityConfigurations();
      
      // 3. Initialize container isolation
      this.initializeContainerIsolation();
      
      // 4. Setup backup system
      this.setupBackupSystem();
      
      // 5. Initialize monitoring
      this.initializeMonitoring();
      
      // 6. Setup rollback procedures
      this.setupRollbackProcedures();
      
      // 7. Save configuration
      this.saveConfiguration();
      
      console.log('✅ Secure sandbox environment initialized successfully');
      console.log(`🔒 Sandbox path: ${this.sandboxPath}`);
      console.log(`💾 Backup path: ${this.backupPath}`);
      console.log(`📊 Log path: ${this.logPath}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize sandbox:', error);
      throw error;
    }
  }

  // 📁 Create sandbox directory structure
  createSandboxStructure() {
    console.log('📁 Creating sandbox directory structure...');
    
    const directories = [
      'workspace',
      'temp',
      'logs',
      'backups',
      'config',
      'data',
      'cache',
      'exports',
      'imports',
      'quarantine'
    ];
    
    // Create main sandbox directory
    if (!fs.existsSync(this.sandboxPath)) {
      fs.mkdirSync(this.sandboxPath, { recursive: true });
    }
    
    // Create subdirectories
    directories.forEach(dir => {
      const dirPath = path.join(this.sandboxPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    
    // Create backup directory
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
    
    // Create log directory
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true });
    }
    
    // Create .env file for sandbox
    const envContent = `
# 🔒 Secure Sandbox Environment
SANDBOX_ENABLED=true
SANDBOX_MODE=isolated
SANDBOX_LEVEL=high

# 🛡️ Security Settings
FILE_ACCESS=restricted
NETWORK_ACCESS=isolated
PROCESS_EXECUTION=controlled
RESOURCE_LIMITS=strict

# 🐳 Container Settings
DOCKER_ENABLED=true
PYTHON_ISOLATED=true
NODE_ISOLATED=true
DATABASE_ISOLATED=true

# 💾 Backup Settings
AUTO_BACKUP=true
BACKUP_INTERVAL=3600000
ROLLBACK_ENABLED=true

# 📊 Monitoring Settings
MONITORING_ENABLED=true
LOG_LEVEL=info
CHANGE_DETECTION=true

# 🚨 Safety Settings
EMERGENCY_STOP=true
RECOVERY_PROCEDURES=true
AUTO_SNAPSHOT=true
`;
    
    fs.writeFileSync(path.join(this.sandboxPath, '.env'), envContent.trim());
    
    console.log('✅ Sandbox directory structure created');
  }

  // 🔐 Setup security configurations
  setupSecurityConfigurations() {
    console.log('🔐 Setting up security configurations...');
    
    const securityConfig = {
      file_permissions: {
        read: ['workspace', 'config', 'data'],
        write: ['workspace', 'temp', 'cache', 'logs'],
        execute: ['workspace'],
        forbidden: ['system', 'private', 'sensitive']
      },
      network_rules: {
        allowed_hosts: ['localhost', '127.0.0.1'],
        blocked_hosts: ['*'],
        allowed_ports: [3000, 8080, 5432],
        blocked_ports: ['*'],
        outbound_access: false,
        inbound_access: false
      },
      process_limits: {
        max_memory: '512MB',
        max_cpu: '50%',
        max_processes: 10,
        max_file_size: '10MB',
        execution_timeout: 30000
      },
      resource_constraints: {
        disk_space: '1GB',
        network_bandwidth: '1MB/s',
        file_descriptors: 100,
        open_files: 50
      }
    };
    
    fs.writeFileSync(
      path.join(this.sandboxPath, 'security.json'),
      JSON.stringify(securityConfig, null, 2)
    );
    
    console.log('✅ Security configurations setup complete');
  }

  // 🐳 Initialize container isolation
  initializeContainerIsolation() {
    console.log('🐳 Initializing container isolation...');
    
    // Create Docker Compose configuration
    const dockerCompose = {
      version: '3.8',
      services: {
        'smart-router-sandbox': {
          image: 'node:18-alpine',
          container_name: 'smart-router-sandbox',
          working_dir: '/app',
          volumes: [
            `${this.sandboxPath}:/app`,
            `${this.backupPath}:/backups`
          ],
          environment: [
            'NODE_ENV=sandbox',
            'SANDBOX_MODE=isolated'
          ],
          networks: ['sandbox-network'],
          mem_limit: '512m',
          cpus: '0.5',
          security_opt: ['no-new-privileges:true'],
          read_only: true,
          tmpfs: {
            '/app/temp': 'noexec,nosuid,size=100m',
            '/app/cache': 'noexec,nosuid,size=50m'
          },
          restart: 'unless-stopped'
        },
        'smart-router-db': {
          image: 'postgres:15-alpine',
          container_name: 'smart-router-db-sandbox',
          environment: {
            'POSTGRES_DB': 'smart_router_sandbox',
            'POSTGRES_USER': 'sandbox_user',
            'POSTGRES_PASSWORD': 'sandbox_password'
          },
          volumes: [
            `${this.sandboxPath}/data:/var/lib/postgresql/data`
          ],
          networks: ['sandbox-network'],
          mem_limit: '256m',
          cpus: '0.25',
          restart: 'unless-stopped'
        }
      },
      networks: {
        'sandbox-network': {
          driver: 'bridge',
          internal: true
        }
      }
    };
    
    fs.writeFileSync(
      path.join(this.sandboxPath, 'docker-compose.yml'),
      this.generateYAML(dockerCompose)
    );
    
    // Create Dockerfile for sandbox
    const dockerfile = `
FROM node:18-alpine

# 🔒 Security setup
RUN addgroup -g 1001 -S nodejs
RUN adduser -S sandbox -u 1001

# 📁 Create app directory
WORKDIR /app

# 📦 Copy package files
COPY package*.json ./

# 🚀 Install dependencies
RUN npm ci --only=production && npm cache clean --force

# 👤 Change to non-root user
USER sandbox

# 🚪 Expose port
EXPOSE 3000

# 🎯 Start command
CMD ["npm", "start"]
`;
    
    fs.writeFileSync(path.join(this.sandboxPath, 'Dockerfile'), dockerfile.trim());
    
    console.log('✅ Container isolation initialized');
  }

  // 💾 Setup backup system
  setupBackupSystem() {
    console.log('💾 Setting up backup system...');
    
    const backupConfig = {
      enabled: true,
      interval: 3600000, // 1 hour
      max_backups: 10,
      compression: true,
      encryption: true,
      locations: {
        local: this.backupPath,
        remote: null // Could add cloud backup
      },
      include_patterns: [
        'workspace/**/*',
        'config/**/*',
        'data/**/*'
      ],
      exclude_patterns: [
        'temp/**/*',
        'cache/**/*',
        'logs/**/*',
        'node_modules/**/*'
      ],
      rollback: {
        enabled: true,
        max_rollback_points: 5,
        auto_rollback_on_error: true
      }
    };
    
    fs.writeFileSync(
      path.join(this.sandboxPath, 'backup-config.json'),
      JSON.stringify(backupConfig, null, 2)
    );
    
    // Create backup script
    const backupScript = `#!/bin/bash
# 🔒 Secure Sandbox Backup Script

SANDBOX_PATH="${this.sandboxPath}"
BACKUP_PATH="${this.backupPath}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="sandbox_backup_${TIMESTAMP}"

echo "🔒 Starting sandbox backup..."

# Create backup directory
mkdir -p "${BACKUP_PATH}/${BACKUP_NAME}"

# Backup workspace
if [ -d "${SANDBOX_PATH}/workspace" ]; then
    cp -r "${SANDBOX_PATH}/workspace" "${BACKUP_PATH}/${BACKUP_NAME}/"
    echo "✅ Workspace backed up"
fi

# Backup config
if [ -d "${SANDBOX_PATH}/config" ]; then
    cp -r "${SANDBOX_PATH}/config" "${BACKUP_PATH}/${BACKUP_NAME}/"
    echo "✅ Config backed up"
fi

# Backup data
if [ -d "${SANDBOX_PATH}/data" ]; then
    cp -r "${SANDBOX_PATH}/data" "${BACKUP_PATH}/${BACKUP_NAME}/"
    echo "✅ Data backed up"
fi

# Compress backup
cd "${BACKUP_PATH}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
rm -rf "${BACKUP_NAME}"

echo "✅ Backup completed: ${BACKUP_NAME}.tar.gz"

# Cleanup old backups (keep last 10)
ls -t ${BACKUP_PATH}/sandbox_backup_*.tar.gz | tail -n +11 | xargs -r rm
echo "🧹 Old backups cleaned up"
`;
    
    fs.writeFileSync(path.join(this.sandboxPath, 'backup.sh'), backupScript);
    fs.chmodSync(path.join(this.sandboxPath, 'backup.sh'), '755');
    
    console.log('✅ Backup system setup complete');
  }

  // 📊 Initialize monitoring
  initializeMonitoring() {
    console.log('📊 Initializing monitoring system...');
    
    const monitoringConfig = {
      enabled: true,
      log_level: 'info',
      metrics: {
        cpu_usage: true,
        memory_usage: true,
        disk_usage: true,
        network_activity: true,
        process_count: true,
        file_operations: true
      },
      alerts: {
        high_cpu_usage: { threshold: 80, enabled: true },
        high_memory_usage: { threshold: 80, enabled: true },
        disk_space_low: { threshold: 90, enabled: true },
        unusual_activity: { enabled: true },
        security_violation: { enabled: true }
      },
      logging: {
        file_operations: true,
        network_requests: true,
        process_execution: true,
        errors: true,
        security_events: true
      }
    };
    
    fs.writeFileSync(
      path.join(this.sandboxPath, 'monitoring.json'),
      JSON.stringify(monitoringConfig, null, 2)
    );
    
    console.log('✅ Monitoring system initialized');
  }

  // 🔄 Setup rollback procedures
  setupRollbackProcedures() {
    console.log('🔄 Setting up rollback procedures...');
    
    const rollbackConfig = {
      enabled: true,
      auto_rollback: true,
      rollback_points: 5,
      rollback_triggers: [
        'security_violation',
        'system_error',
        'data_corruption',
        'performance_degradation',
        'manual_trigger'
      ],
      rollback_procedures: {
        file_system: {
          enabled: true,
          method: 'snapshot',
          restore_time: '< 1 minute'
        },
        database: {
          enabled: true,
          method: 'transaction_rollback',
          restore_time: '< 30 seconds'
        },
        configuration: {
          enabled: true,
          method: 'version_control',
          restore_time: '< 10 seconds'
        },
        dependencies: {
          enabled: true,
          method: 'package_manager',
          restore_time: '< 2 minutes'
        }
      },
      emergency: {
        stop_all_processes: true,
        isolate_sandbox: true,
        notify_admin: true,
        create_incident_report: true
      }
    };
    
    fs.writeFileSync(
      path.join(this.sandboxPath, 'rollback.json'),
      JSON.stringify(rollbackConfig, null, 2)
    );
    
    // Create rollback script
    const rollbackScript = `#!/bin/bash
# 🔄 Secure Sandbox Rollback Script

SANDBOX_PATH="${this.sandboxPath}"
BACKUP_PATH="${this.backupPath}"
ROLLBACK_POINT="$1"

if [ -z "$ROLLBACK_POINT" ]; then
    echo "❌ Usage: $0 <backup_name>"
    echo "📋 Available backups:"
    ls -la "${BACKUP_PATH}/sandbox_backup_*.tar.gz" | tail -5
    exit 1
fi

echo "🔄 Starting sandbox rollback to: $ROLLBACK_POINT"

# Check if backup exists
BACKUP_FILE="${BACKUP_PATH}/${ROLLBACK_POINT}"
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Create temporary restore directory
TEMP_RESTORE="${SANDBOX_PATH}/temp_restore"
mkdir -p "$TEMP_RESTORE"

# Extract backup
cd "$TEMP_RESTORE"
tar -xzf "$BACKUP_FILE"

# Stop running processes
echo "⏹️ Stopping sandbox processes..."
docker-compose -f "${SANDBOX_PATH}/docker-compose.yml" down || true

# Backup current state (just in case)
CURRENT_BACKUP="rollback_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "${BACKUP_PATH}/${CURRENT_BACKUP}"
cp -r "${SANDBOX_PATH}/workspace" "${BACKUP_PATH}/${CURRENT_BACKUP}/" 2>/dev/null || true
cp -r "${SANDBOX_PATH}/config" "${BACKUP_PATH}/${CURRENT_BACKUP}/" 2>/dev/null || true
cp -r "${SANDBOX_PATH}/data" "${BACKUP_PATH}/${CURRENT_BACKUP}/" 2>/dev/null || true

# Restore files
echo "🔄 Restoring files..."
if [ -d "workspace" ]; then
    rm -rf "${SANDBOX_PATH}/workspace"
    cp -r "workspace" "${SANDBOX_PATH}/"
    echo "✅ Workspace restored"
fi

if [ -d "config" ]; then
    rm -rf "${SANDBOX_PATH}/config"
    cp -r "config" "${SANDBOX_PATH}/"
    echo "✅ Config restored"
fi

if [ -d "data" ]; then
    rm -rf "${SANDBOX_PATH}/data"
    cp -r "data" "${SANDBOX_PATH}/"
    echo "✅ Data restored"
fi

# Cleanup
rm -rf "$TEMP_RESTORE"

# Restart services
echo "🚀 Restarting sandbox services..."
docker-compose -f "${SANDBOX_PATH}/docker-compose.yml" up -d

echo "✅ Rollback completed successfully"
echo "📊 Current state backed up as: ${CURRENT_BACKUP}"
`;
    
    fs.writeFileSync(path.join(this.sandboxPath, 'rollback.sh'), rollbackScript);
    fs.chmodSync(path.join(this.sandboxPath, 'rollback.sh'), '755');
    
    console.log('✅ Rollback procedures setup complete');
  }

  // 🚀 Run code in secure sandbox
  async runInSandbox(code, options = {}) {
    console.log('🚀 Running code in secure sandbox...');
    
    try {
      // 1. Create snapshot before execution
      await this.createSnapshot();
      
      // 2. Validate code safety
      const safetyCheck = await this.validateCodeSafety(code);
      if (!safetyCheck.safe) {
        throw new Error(`Code safety check failed: ${safetyCheck.reason}`);
      }
      
      // 3. Execute in isolated environment
      const result = await this.executeInIsolation(code, options);
      
      // 4. Monitor execution
      await this.monitorExecution(result);
      
      // 5. Validate results
      const validation = await this.validateResults(result);
      
      // 6. Create backup if successful
      if (validation.success) {
        await this.createBackup();
      }
      
      console.log('✅ Code executed successfully in sandbox');
      return {
        success: true,
        result: result,
        safety: safetyCheck,
        validation: validation,
        execution_time: result.execution_time
      };
      
    } catch (error) {
      console.error('❌ Sandbox execution failed:', error);
      
      // Auto-rollback on error
      await this.emergencyRollback();
      
      return {
        success: false,
        error: error.message,
        rollback_performed: true
      };
    }
  }

  // 🔍 Validate code safety
  async validateCodeSafety(code) {
    console.log('🔍 Validating code safety...');
    
    const dangerousPatterns = [
      /rm\s+-rf/i,           // Dangerous file deletion
      /sudo/i,               // Privilege escalation
      /chmod\s+777/i,        // Dangerous permissions
      /system\s*\(/i,        // System calls
      /exec\s*\(/i,          // Process execution
      /eval\s*\(/i,          // Code evaluation
      /require\s*\(\s*['"]fs['"]\s*\)/i,  // File system access
      /require\s*\(\s*['"]child_process['"]\s*\)/i,  // Process execution
      /\.exec\s*\(/i,        // Command execution
      /\.spawn\s*\(/i,       // Process spawning
      /__dirname/i,          // Directory access
      /__filename/i,         // File access
      /process\.cwd/i,       // Working directory
      /os\.require/i,        // OS access
      /fs\.rmdir/i,          // Directory removal
      /fs\.unlink/i,         // File deletion
      /fs\.writeFileSync/i,  // File writing
    ];
    
    const suspiciousPatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
      /auth/i,
      /credential/i,
      /private/i,
      /sensitive/i
    ];
    
    // Check for dangerous patterns
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return {
          safe: false,
          reason: `Dangerous pattern detected: ${pattern.source}`,
          pattern: pattern.source
        };
      }
    }
    
    // Check for suspicious patterns
    const suspiciousMatches = [];
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(code)) {
        suspiciousMatches.push(pattern.source);
      }
    }
    
    if (suspiciousMatches.length > 0) {
      return {
        safe: false,
        reason: `Suspicious patterns detected: ${suspiciousMatches.join(', ')}`,
        patterns: suspiciousMatches
      };
    }
    
    // Check code length
    if (code.length > 10000) {
      return {
        safe: false,
        reason: 'Code too long (> 10KB)',
        length: code.length
      };
    }
    
    return {
      safe: true,
      reason: 'Code passed safety validation',
      warnings: suspiciousMatches
    };
  }

  // 🏃 Execute in isolation
  async executeInIsolation(code, options) {
    console.log('🏃 Executing code in isolation...');
    
    const startTime = Date.now();
    
    try {
      // Create temporary file for code
      const tempFile = path.join(this.sandboxPath, 'temp', 'execution.js');
      fs.writeFileSync(tempFile, code);
      
      // Execute in Docker container
      const command = `cd ${this.sandboxPath} && docker-compose run --rm smart-router-sandbox node temp/execution.js`;
      
      const result = execSync(command, {
        timeout: 30000,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const executionTime = Date.now() - startTime;
      
      // Cleanup
      fs.unlinkSync(tempFile);
      
      return {
        output: result,
        execution_time: executionTime,
        success: true
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        error: error.message,
        execution_time: executionTime,
        success: false
      };
    }
  }

  // 📊 Monitor execution
  async monitorExecution(result) {
    console.log('📊 Monitoring execution...');
    
    // Log execution details
    const logEntry = {
      timestamp: new Date().toISOString(),
      execution_time: result.execution_time,
      success: result.success,
      output_length: result.output ? result.output.length : 0,
      error: result.error || null
    };
    
    const logFile = path.join(this.logPath, 'execution.log');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    
    // Check for anomalies
    if (result.execution_time > 25000) {
      console.warn('⚠️ Long execution time detected');
    }
    
    if (result.output && result.output.length > 100000) {
      console.warn('⚠️ Large output detected');
    }
  }

  // ✅ Validate results
  async validateResults(result) {
    console.log('✅ Validating results...');
    
    const validation = {
      success: result.success,
      output_safe: true,
      no_sensitive_data: true,
      within_limits: true,
      errors: []
    };
    
    // Check for sensitive data in output
    if (result.output) {
      const sensitivePatterns = [
        /password/i,
        /secret/i,
        /token/i,
        /key/i,
        /credential/i
      ];
      
      for (const pattern of sensitivePatterns) {
        if (pattern.test(result.output)) {
          validation.no_sensitive_data = false;
          validation.errors.push(`Sensitive data detected: ${pattern.source}`);
        }
      }
    }
    
    // Check output size
    if (result.output && result.output.length > 1000000) {
      validation.within_limits = false;
      validation.errors.push('Output too large');
    }
    
    return validation;
  }

  // 📸 Create snapshot
  async createSnapshot() {
    console.log('📸 Creating sandbox snapshot...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotName = `snapshot_${timestamp}`;
    const snapshotPath = path.join(this.backupPath, snapshotName);
    
    // Create snapshot directory
    fs.mkdirSync(snapshotPath, { recursive: true });
    
    // Copy workspace
    const workspacePath = path.join(this.sandboxPath, 'workspace');
    if (fs.existsSync(workspacePath)) {
      this.copyDirectory(workspacePath, path.join(snapshotPath, 'workspace'));
    }
    
    // Copy config
    const configPath = path.join(this.sandboxPath, 'config');
    if (fs.existsSync(configPath)) {
      this.copyDirectory(configPath, path.join(snapshotPath, 'config'));
    }
    
    console.log(`✅ Snapshot created: ${snapshotName}`);
    return snapshotName;
  }

  // 💾 Create backup
  async createBackup() {
    console.log('💾 Creating sandbox backup...');
    
    try {
      execSync(`cd ${this.sandboxPath} && ./backup.sh`, { encoding: 'utf8' });
      console.log('✅ Backup created successfully');
    } catch (error) {
      console.error('❌ Backup failed:', error);
    }
  }

  // 🚨 Emergency rollback
  async emergencyRollback() {
    console.log('🚨 Performing emergency rollback...');
    
    try {
      // Get latest backup
      const backups = fs.readdirSync(this.backupPath)
        .filter(file => file.startsWith('sandbox_backup_'))
        .sort()
        .reverse();
      
      if (backups.length === 0) {
        console.error('❌ No backups available for rollback');
        return false;
      }
      
      const latestBackup = backups[0];
      
      // Perform rollback
      execSync(`cd ${this.sandboxPath} && ./rollback.sh ${latestBackup}`, { encoding: 'utf8' });
      
      console.log('✅ Emergency rollback completed');
      return true;
      
    } catch (error) {
      console.error('❌ Emergency rollback failed:', error);
      return false;
    }
  }

  // 🔧 Utility methods
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  generateYAML(obj) {
    const yaml = require('js-yaml');
    return yaml.dump(obj);
  }

  saveConfiguration() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  // 🚀 Start sandbox services
  async startSandbox() {
    console.log('🚀 Starting sandbox services...');
    
    try {
      execSync(`cd ${this.sandboxPath} && docker-compose up -d`, { encoding: 'utf8' });
      console.log('✅ Sandbox services started');
      return true;
    } catch (error) {
      console.error('❌ Failed to start sandbox services:', error);
      return false;
    }
  }

  // ⏹️ Stop sandbox services
  async stopSandbox() {
    console.log('⏹️ Stopping sandbox services...');
    
    try {
      execSync(`cd ${this.sandboxPath} && docker-compose down`, { encoding: 'utf8' });
      console.log('✅ Sandbox services stopped');
      return true;
    } catch (error) {
      console.error('❌ Failed to stop sandbox services:', error);
      return false;
    }
  }

  // 📊 Get sandbox status
  getSandboxStatus() {
    return {
      initialized: fs.existsSync(this.sandboxPath),
      running: this.isSandboxRunning(),
      config: this.config,
      paths: {
        sandbox: this.sandboxPath,
        backup: this.backupPath,
        logs: this.logPath
      }
    };
  }

  isSandboxRunning() {
    try {
      execSync('docker ps | grep smart-router-sandbox', { encoding: 'utf8' });
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = SecureSandboxEnvironment;
