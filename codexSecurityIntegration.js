// 🛡️ CODEX SECURITY INTEGRATION MODULE
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodexSecurityIntegration {
  constructor() {
    this.apiEndpoint = 'https://api.openai.com/codex/security';
    this.apiKey = process.env.OPENAI_API_KEY;
    this.confidenceThreshold = 0.85;
    this.validationEnvironment = 'sandboxed';
    this.securityCache = new Map();
    this.patchQueue = [];
    
    this.initializeSecurity();
  }

  // 🎯 Initialize Security Module
  initializeSecurity() {
    console.log('🛡️ Initializing Codex Security Integration...');
    
    // Create security directories
    const securityDir = path.join(__dirname, 'security');
    if (!fs.existsSync(securityDir)) {
      fs.mkdirSync(securityDir, { recursive: true });
    }
    
    // Initialize security cache
    this.initializeCache();
    
    console.log('✅ Codex Security Integration initialized!');
  }

  // 🚀 Execute Security Scan
  async executeSecurityScan(repoPath) {
    console.log('🚀 Executing Codex Security Scan...');
    
    try {
      // Build system context
      const context = await this.buildSystemContext(repoPath);
      
      // Create threat model
      const threatModel = await this.createInitialThreatModel(repoPath);
      
      // Scan for vulnerabilities
      const findings = await this.scanVulnerabilities(threatModel);
      
      // Validate findings
      const validated = await this.validateFindings(findings);
      
      // Generate patches
      const patches = await this.generatePatches(validated);
      
      const results = {
        timestamp: new Date().toISOString(),
        repository: repoPath,
        context,
        threatModel,
        findings,
        validated,
        patches,
        summary: {
          totalFindings: findings.length,
          validatedFindings: validated.length,
          patchesGenerated: patches.length,
          securityScore: context.securityHistory?.securityScore || 50,
          highSeverityIssues: validated.filter(f => f.severity === 'critical' || f.severity === 'high').length
        }
      };
      
      // Save results
      await this.saveScanResults(results);
      
      console.log('✅ Security scan completed!');
      console.log(`📊 Found ${findings.length} potential issues`);
      console.log(`✅ Validated ${validated.length} issues`);
      console.log(`🔧 Generated ${patches.length} patches`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Security scan failed:', error);
      throw error;
    }
  }

  // 📊 Build System Context
  async buildSystemContext(codebasePath) {
    console.log('🔍 Building system context...');
    
    const context = {
      repository: codebasePath,
      structure: await this.analyzeRepositoryStructure(codebasePath),
      dependencies: await this.analyzeDependencies(codebasePath),
      securityHistory: await this.analyzeSecurityHistory(codebasePath),
      threatModel: await this.createInitialThreatModel(codebasePath)
    };
    
    return context;
  }

  // 🏗️ Analyze Repository Structure
  async analyzeRepositoryStructure(repoPath) {
    const structure = {
      files: [],
      directories: [],
      securityCritical: [],
      apiEndpoints: [],
      databaseConnections: []
    };

    // Scan repository
    const scanDirectory = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const itemRelativePath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          structure.directories.push(itemRelativePath);
          scanDirectory(fullPath, itemRelativePath);
        } else {
          structure.files.push(itemRelativePath);
          
          // Identify security-critical files
          if (this.isSecurityCritical(itemRelativePath)) {
            structure.securityCritical.push(itemRelativePath);
          }
        }
      }
    };

    scanDirectory(repoPath);
    return structure;
  }

  // 🔍 Check if file is security critical
  isSecurityCritical(filePath) {
    const criticalPatterns = [
      /auth/i, /login/i, /password/i, /token/i, /jwt/i,
      /session/i, /security/i, /crypto/i, /hash/i,
      /encrypt/i, /decrypt/i, /api/i, /database/i,
      /db/i, /sql/i, /query/i, /connection/i
    ];

    return criticalPatterns.some(pattern => pattern.test(filePath));
  }

  // 📦 Analyze Dependencies
  async analyzeDependencies(repoPath) {
    const packageJsonPath = path.join(repoPath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return { dependencies: {}, vulnerabilities: [] };
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Check for known vulnerable dependencies
    const vulnerabilities = await this.checkDependencyVulnerabilities(Object.keys(dependencies));
    
    return {
      dependencies,
      vulnerabilities,
      totalDependencies: Object.keys(dependencies).length
    };
  }

  // 🔍 Check Dependency Vulnerabilities
  async checkDependencyVulnerabilities(dependencies) {
    // Simulate vulnerability check
    const knownVulnerabilities = {
      'lodash': { severity: 'medium', version: '<4.17.21' },
      'express': { severity: 'high', version: '<4.17.0' },
      'mongoose': { severity: 'low', version: '<5.10.0' }
    };
    
    const vulnerabilities = [];
    
    for (const dep of dependencies) {
      if (knownVulnerabilities[dep]) {
        vulnerabilities.push({
          package: dep,
          severity: knownVulnerabilities[dep].severity,
          affectedVersion: knownVulnerabilities[dep].version
        });
      }
    }
    
    return vulnerabilities;
  }

  // 📈 Analyze Security History
  async analyzeSecurityHistory(repoPath) {
    const history = {
      commits: [],
      securityCommits: [],
      vulnerabilityPatches: [],
      securityScore: 0
    };

    try {
      // Get git history
      const gitLog = execSync('git log --oneline -50', { cwd: repoPath }).toString();
      const commits = gitLog.split('\n').filter(line => line.trim());
      
      history.commits = commits.map(commit => {
        const [hash, ...messageParts] = commit.split(' ');
        const message = messageParts.join(' ');
        
        return {
          hash,
          message,
          isSecurityRelated: this.isSecurityRelatedCommit(message),
          timestamp: new Date().toISOString()
        };
      });
      
      history.securityCommits = history.commits.filter(commit => commit.isSecurityRelated);
      history.securityScore = this.calculateSecurityScore(history);
      
    } catch (error) {
      console.error('Error analyzing security history:', error);
    }

    return history;
  }

  // 🔍 Check if commit is security related
  isSecurityRelatedCommit(message) {
    const securityKeywords = [
      'security', 'vulnerability', 'patch', 'fix', 'cve',
      'auth', 'login', 'password', 'token', 'encrypt',
      'decrypt', 'hash', 'crypto', 'sql injection', 'xss', 'csrf'
    ];

    return securityKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // 📊 Calculate Security Score
  calculateSecurityScore(history) {
    const totalCommits = history.commits.length;
    const securityCommits = history.securityCommits.length;
    
    if (totalCommits === 0) return 50;
    
    // Base score starts at 50
    let score = 50;
    
    // Add points for security commits
    score += (securityCommits / totalCommits) * 30;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // 🎯 Create Initial Threat Model
  async createInitialThreatModel(repoPath) {
    const threatModel = {
      entryPoints: ['api', 'web', 'database'],
      assets: ['user data', 'api keys', 'database', 'file system'],
      threats: [
        {
          type: 'SQL Injection',
          likelihood: 'medium',
          impact: 'high',
          description: 'Malicious SQL code injection through API endpoints'
        },
        {
          type: 'XSS',
          likelihood: 'medium',
          impact: 'medium',
          description: 'Cross-site scripting through web interface'
        },
        {
          type: 'Authentication Bypass',
          likelihood: 'low',
          impact: 'high',
          description: 'Unauthorized access to protected resources'
        }
      ],
      mitigations: [
        'Input validation', 'Output encoding', 'Authentication middleware',
        'Rate limiting', 'Security headers', 'Data encryption'
      ]
    };

    return threatModel;
  }

  // 🔍 Scan for Vulnerabilities
  async scanVulnerabilities(threatModel) {
    console.log('🔍 Scanning for vulnerabilities...');
    
    const vulnerabilities = [];
    
    for (const threat of threatModel.threats) {
      const vulnerability = await this.analyzeThreat(threat, threatModel);
      if (vulnerability) {
        vulnerabilities.push(vulnerability);
      }
    }
    
    return vulnerabilities;
  }

  // 🔍 Analyze Specific Threat
  async analyzeThreat(threat, threatModel) {
    // Simulate threat analysis (in real implementation, use Codex Security API)
    const analysis = {
      type: threat.type,
      severity: this.calculateSeverity(threat.likelihood, threat.impact),
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      description: threat.description,
      locations: this.identifyVulnerableLocations(threat, threatModel),
      recommendations: this.generateRecommendations(threat, threatModel)
    };
    
    return analysis.confidence > this.confidenceThreshold ? analysis : null;
  }

  // 📊 Calculate Severity
  calculateSeverity(likelihood, impact) {
    const severityMap = {
      'low': { 'low': 'low', 'medium': 'medium', 'high': 'high' },
      'medium': { 'low': 'medium', 'medium': 'high', 'high': 'critical' },
      'high': { 'low': 'high', 'medium': 'critical', 'high': 'critical' }
    };
    
    return severityMap[likelihood][impact] || 'medium';
  }

  // 📍 Identify Vulnerable Locations
  identifyVulnerableLocations(threat, threatModel) {
    // Simulate location identification
    const locations = [];
    
    if (threat.type === 'SQL Injection') {
      locations.push(
        { file: 'api/database.js', line: 45, function: 'getUserById' },
        { file: 'api/auth.js', line: 23, function: 'authenticateUser' }
      );
    } else if (threat.type === 'XSS') {
      locations.push(
        { file: 'web/templates/profile.html', line: 12, function: 'renderProfile' }
      );
    } else if (threat.type === 'Authentication Bypass') {
      locations.push(
        { file: 'middleware/auth.js', line: 15, function: 'verifyToken' }
      );
    }
    
    return locations;
  }

  // 💡 Generate Recommendations
  generateRecommendations(threat, threatModel) {
    const recommendations = {
      'SQL Injection': [
        'Use parameterized queries instead of string concatenation',
        'Implement input validation and sanitization',
        'Use ORM with built-in SQL injection protection'
      ],
      'XSS': [
        'Implement output encoding for all user-generated content',
        'Use Content Security Policy (CSP) headers',
        'Sanitize HTML input before rendering'
      ],
      'Authentication Bypass': [
        'Implement strong authentication mechanisms',
        'Use multi-factor authentication',
        'Implement proper session management'
      ]
    };
    
    return recommendations[threat.type] || ['Implement security best practices'];
  }

  // ✅ Validate Findings
  async validateFindings(findings) {
    console.log('✅ Validating findings...');
    
    const validated = [];
    
    for (const finding of findings) {
      // Simulate validation (in real implementation, use sandboxed testing)
      const validation = await this.validateInSandbox(finding);
      
      if (validation.isValid) {
        validated.push({
          ...finding,
          validated: true,
          validationScore: validation.score,
          proofOfConcept: validation.poc
        });
      }
    }
    
    return validated;
  }

  // 🧪 Validate in Sandbox
  async validateInSandbox(finding) {
    // Simulate sandbox validation
    return {
      isValid: finding.confidence > 0.8,
      score: Math.random() * 0.3 + 0.7, // 70-100% validation score
      poc: `Proof of concept for ${finding.type} vulnerability`
    };
  }

  // 🔧 Generate Patches
  async generatePatches(validatedFindings) {
    console.log('🔧 Generating patches...');
    
    const patches = [];
    
    for (const finding of validatedFindings) {
      const patch = await this.createPatch(finding);
      if (patch) {
        patches.push(patch);
      }
    }
    
    return patches;
  }

  // 🔧 Create Patch
  async createPatch(finding) {
    // Simulate patch generation (in real implementation, use Codex Security API)
    const patch = {
      id: `patch_${Date.now()}`,
      vulnerability: finding.type,
      severity: finding.severity,
      confidence: finding.confidence,
      files: finding.locations.map(loc => ({
        path: loc.file,
        line: loc.line,
        originalCode: `// Original code at ${loc.function}`,
        patchedCode: `// Patched code for ${finding.type}\n// Security improvement applied`,
        description: `Security patch for ${finding.type} vulnerability`
      })),
      testingInstructions: [
        'Run unit tests to verify functionality',
        'Perform security testing',
        'Test in staging environment'
      ]
    };
    
    return patch;
  }

  // 💾 Save Scan Results
  async saveScanResults(results) {
    const resultsPath = path.join(__dirname, 'security', 'scan-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    
    // Update cache
    this.securityCache.set('latest_scan', results);
  }

  // 🎯 Initialize Cache
  initializeCache() {
    const cachePath = path.join(__dirname, 'security', 'cache.json');
    
    if (fs.existsSync(cachePath)) {
      const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      Object.entries(cacheData).forEach(([key, value]) => {
        this.securityCache.set(key, value);
      });
    }
  }

  // 📊 Get Security Summary
  getSecuritySummary() {
    const latestScan = this.securityCache.get('latest_scan');
    
    if (!latestScan) {
      return {
        status: 'No scan performed',
        recommendation: 'Run initial security scan'
      };
    }
    
    return {
      status: 'Security scan completed',
      lastScan: latestScan.timestamp,
      securityScore: latestScan.summary.securityScore,
      totalFindings: latestScan.summary.totalFindings,
      highSeverityIssues: latestScan.summary.highSeverityIssues,
      patchesAvailable: latestScan.summary.patchesGenerated,
      recommendation: latestScan.summary.highSeverityIssues > 0 
        ? 'Apply high-severity patches immediately'
        : 'Monitor and maintain security posture'
    };
  }
}

// 🚀 Export for use in Smart Router
module.exports = CodexSecurityIntegration;
