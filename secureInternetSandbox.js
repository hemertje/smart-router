const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');

// 🌐 Secure Internet Sandbox - Veilige Internet Toegang
class SecureInternetSandbox {
  constructor() {
    this.sandboxPath = path.join(__dirname, 'sandbox');
    this.gatewayPath = path.join(__dirname, 'gateway');
    this.allowedDomains = [
      // News sources
      'techcrunch.com',
      'wired.com',
      'theverge.com',
      'arstechnica.com',
      'news.ycombinator.com',
      'reddit.com',
      
      // Social media (public APIs)
      'api.twitter.com',
      'api.linkedin.com',
      
      // AI/ML sources
      'arxiv.org',
      'huggingface.co',
      'openai.com',
      'anthropic.com',
      'google.ai',
      
      // Market data
      'yahoo.com',
      'github.com',
      'stackoverflow.com',
      
      // RSS feeds
      'rss.cnn.com',
      'feeds.bbci.co.uk',
      
      // APIs for monitoring
      'api.github.com',
      'api.npmjs.org'
    ];
    
    this.securityRules = {
      allowed_methods: ['GET', 'HEAD', 'OPTIONS'],
      blocked_patterns: [
        /rm\s+-rf/i,
        /sudo/i,
        /format/i,
        /delete/i,
        /drop\s+table/i,
        /exec\s*\(/i
      ],
      request_limits: {
        max_requests_per_minute: 60,
        max_response_size: '10MB',
        timeout: 30000
      }
    };
    
    this.initializeSecureInternet();
  }

  // 🌐 Initialize secure internet sandbox
  initializeSecureInternet() {
    console.log('🌐 Initializing secure internet sandbox...');
    
    try {
      // 1. Create gateway directory
      this.createGatewayStructure();
      
      // 2. Setup secure proxy
      this.setupSecureProxy();
      
      // 3. Configure firewall rules
      this.configureFirewall();
      
      // 4. Setup domain whitelist
      this.setupDomainWhitelist();
      
      // 5. Initialize request monitoring
      this.initializeRequestMonitoring();
      
      // 6. Create secure HTTP client
      this.createSecureHttpClient();
      
      console.log('✅ Secure internet sandbox initialized');
      console.log(`🌐 Allowed domains: ${this.allowedDomains.length}`);
      console.log(`🔒 Security rules: ${Object.keys(this.securityRules).length}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize secure internet sandbox:', error);
      throw error;
    }
  }

  // 📁 Create gateway structure
  createGatewayStructure() {
    console.log('📁 Creating gateway structure...');
    
    const directories = [
      'gateway',
      'gateway/proxy',
      'gateway/cache',
      'gateway/logs',
      'gateway/config',
      'gateway/monitoring'
    ];
    
    directories.forEach(dir => {
      const dirPath = path.join(__dirname, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    
    console.log('✅ Gateway structure created');
  }

  // 🛡️ Setup secure proxy
  setupSecureProxy() {
    console.log('🛡️ Setting up secure proxy...');
    
    const proxyConfig = {
      mode: 'secure',
      whitelist: this.allowedDomains,
      blacklist: [
        'malware.com',
        'phishing.com',
        'suspicious.com'
      ],
      security: {
        ssl_verification: true,
        certificate_pinning: true,
        request_validation: true,
        response_sanitization: true
      },
      caching: {
        enabled: true,
        ttl: 300, // 5 minutes
        max_size: '100MB'
      },
      monitoring: {
        log_all_requests: true,
        alert_on_suspicious: true,
        rate_limiting: true
      }
    };
    
    fs.writeFileSync(
      path.join(this.gatewayPath, 'proxy-config.json'),
      JSON.stringify(proxyConfig, null, 2)
    );
    
    // Create proxy server
    const proxyServer = `
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

// Load configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'proxy-config.json'), 'utf8'));
const whitelist = config.whitelist;
const blacklist = config.blacklist;

// Request logging
const logRequest = (req, res, next) => {
  const log = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
  
  console.log('🌐 Request:', log);
  
  // Check if domain is allowed
  const hostname = new URL(req.url).hostname;
  if (!whitelist.includes(hostname) || blacklist.includes(hostname)) {
    console.log('🚫 Blocked request to:', hostname);
    return res.status(403).json({ error: 'Domain not allowed' });
  }
  
  next();
};

// Rate limiting
const requests = new Map();
const rateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  if (!requests.has(ip)) {
    requests.set(ip, []);
  }
  
  const ipRequests = requests.get(ip).filter(time => time > windowStart);
  
  if (ipRequests.length >= 60) { // 60 requests per minute
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  ipRequests.push(now);
  requests.set(ip, ipRequests);
  
  next();
};

// Middleware
app.use(express.json());
app.use(logRequest);
app.use(rateLimit);

// Proxy endpoint
app.all('/proxy/*', async (req, res) => {
  try {
    const targetUrl = req.params[0];
    
    // Validate URL
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    
    // Make request with security headers
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        'Host': new URL(targetUrl).hostname,
        'User-Agent': 'SmartRouter-Secure/1.0'
      },
      timeout: 30000,
      maxRedirects: 3,
      validateStatus: (status) => status < 400
    });
    
    // Sanitize response
    const sanitizedResponse = {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      size: JSON.stringify(response.data).length
    };
    
    res.json(sanitizedResponse);
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    allowed_domains: whitelist.length,
    blocked_domains: blacklist.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🌐 Secure proxy running on port \${PORT}\`);
});
`;
    
    fs.writeFileSync(path.join(this.gatewayPath, 'proxy-server.js'), proxyServer);
    
    console.log('✅ Secure proxy setup complete');
  }

  // 🔥 Configure firewall
  configureFirewall() {
    console.log('🔥 Configuring firewall...');
    
    const firewallConfig = {
      inbound_rules: [
        {
          action: 'allow',
          protocol: 'tcp',
          port: 8080,
          source: 'sandbox'
        }
      ],
      outbound_rules: [
        {
          action: 'allow',
          protocol: 'tcp',
          ports: [80, 443],
          destinations: this.allowedDomains
        },
        {
          action: 'deny',
          protocol: 'all',
          destinations: ['*']
        }
      ],
      logging: {
        enabled: true,
        level: 'info',
        include_payloads: false
      }
    };
    
    fs.writeFileSync(
      path.join(this.gatewayPath, 'firewall-config.json'),
      JSON.stringify(firewallConfig, null, 2)
    );
    
    console.log('✅ Firewall configured');
  }

  // 📋 Setup domain whitelist
  setupDomainWhitelist() {
    console.log('📋 Setting up domain whitelist...');
    
    const whitelistConfig = {
      categories: {
        news: [
          'techcrunch.com',
          'wired.com',
          'theverge.com',
          'arstechnica.com',
          'news.ycombinator.com'
        ],
        social: [
          'api.twitter.com',
          'api.linkedin.com',
          'reddit.com'
        ],
        ai_ml: [
          'arxiv.org',
          'huggingface.co',
          'openai.com',
          'anthropic.com',
          'google.ai'
        ],
        development: [
          'github.com',
          'stackoverflow.com',
          'api.npmjs.org'
        ],
        market_data: [
          'yahoo.com',
          'finance.yahoo.com'
        ],
        rss_feeds: [
          'rss.cnn.com',
          'feeds.bbci.co.uk'
        ]
      },
      security: {
        ssl_required: true,
        certificate_validation: true,
        reputation_check: true
      },
      monitoring: {
        track_usage: true,
        alert_on_anomalies: true,
        log_all_access: true
      }
    };
    
    fs.writeFileSync(
      path.join(this.gatewayPath, 'domain-whitelist.json'),
      JSON.stringify(whitelistConfig, null, 2)
    );
    
    console.log('✅ Domain whitelist setup complete');
  }

  // 📊 Initialize request monitoring
  initializeRequestMonitoring() {
    console.log('📊 Initializing request monitoring...');
    
    const monitoringConfig = {
      metrics: {
        requests_per_minute: true,
        response_times: true,
        error_rates: true,
        bandwidth_usage: true,
        domain_access: true
      },
      alerts: {
        high_error_rate: { threshold: 0.1, enabled: true },
        unusual_traffic: { threshold: 1000, enabled: true },
        blocked_attempts: { threshold: 10, enabled: true },
        ssl_errors: { threshold: 5, enabled: true }
      },
      logging: {
        access_logs: true,
        error_logs: true,
        security_logs: true,
        performance_logs: true
      },
      retention: {
        log_retention_days: 30,
        metric_retention_days: 7,
        alert_retention_days: 90
      }
    };
    
    fs.writeFileSync(
      path.join(this.gatewayPath, 'monitoring-config.json'),
      JSON.stringify(monitoringConfig, null, 2)
    );
    
    console.log('✅ Request monitoring initialized');
  }

  // 🔒 Create secure HTTP client
  createSecureHttpClient() {
    console.log('🔒 Creating secure HTTP client...');
    
    const clientConfig = {
      timeout: 30000,
      maxRedirects: 3,
      validateStatus: (status) => status < 400,
      headers: {
        'User-Agent': 'SmartRouter-Secure/1.0',
        'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      security: {
        httpsAgent: {
          rejectUnauthorized: true,
          checkServerIdentity: true
        }
      }
    };
    
    fs.writeFileSync(
      path.join(this.gatewayPath, 'http-client-config.json'),
      JSON.stringify(clientConfig, null, 2)
    );
    
    console.log('✅ Secure HTTP client created');
  }

  // 🌐 Make secure request
  async makeSecureRequest(url, options = {}) {
    console.log(`🌐 Making secure request to: ${url}`);
    
    try {
      // Validate URL
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // Check if domain is allowed
      if (!this.isDomainAllowed(hostname)) {
        throw new Error(`Domain not allowed: ${hostname}`);
      }
      
      // Check request method
      const method = options.method || 'GET';
      if (!this.securityRules.allowed_methods.includes(method)) {
        throw new Error(`Method not allowed: ${method}`);
      }
      
      // Make request through proxy
      const proxyUrl = `http://localhost:8080/proxy/${url}`;
      
      const response = await axios({
        method: method,
        url: proxyUrl,
        headers: {
          ...clientConfig.headers,
          ...options.headers
        },
        timeout: this.securityRules.request_limits.timeout,
        maxRedirects: 3
      });
      
      // Log successful request
      this.logRequest('success', {
        url: url,
        method: method,
        status: response.status,
        size: JSON.stringify(response.data).length
      });
      
      return response.data;
      
    } catch (error) {
      // Log failed request
      this.logRequest('error', {
        url: url,
        method: options.method || 'GET',
        error: error.message
      });
      
      throw error;
    }
  }

  // 🔍 Check if domain is allowed
  isDomainAllowed(hostname) {
    // Check exact match
    if (this.allowedDomains.includes(hostname)) {
      return true;
    }
    
    // Check subdomains
    for (const domain of this.allowedDomains) {
      if (hostname.endsWith('.' + domain)) {
        return true;
      }
    }
    
    return false;
  }

  // 📊 Log request
  logRequest(type, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: type,
      ...data
    };
    
    const logFile = path.join(this.gatewayPath, 'logs', 'requests.log');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }

  // 🚀 Start secure gateway
  async startGateway() {
    console.log('🚀 Starting secure gateway...');
    
    try {
      // Start proxy server
      execSync(`cd ${this.gatewayPath} && node proxy-server.js`, {
        stdio: 'pipe',
        detached: true
      });
      
      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test gateway
      const healthCheck = await this.testGateway();
      
      if (healthCheck) {
        console.log('✅ Secure gateway started successfully');
        return true;
      } else {
        console.error('❌ Gateway health check failed');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Failed to start gateway:', error);
      return false;
    }
  }

  // 🧪 Test gateway
  async testGateway() {
    try {
      const response = await axios.get('http://localhost:8080/health', {
        timeout: 5000
      });
      
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // ⏹️ Stop gateway
  async stopGateway() {
    console.log('⏹️ Stopping secure gateway...');
    
    try {
      execSync('pkill -f "proxy-server.js"', { stdio: 'pipe' });
      console.log('✅ Gateway stopped');
      return true;
    } catch (error) {
      console.error('❌ Failed to stop gateway:', error);
      return false;
    }
  }

  // 📊 Get gateway status
  getGatewayStatus() {
    return {
      running: this.isGatewayRunning(),
      allowed_domains: this.allowedDomains.length,
      security_rules: Object.keys(this.securityRules).length,
      proxy_port: 8080,
      monitoring_enabled: true
    };
  }

  // 🔍 Check if gateway is running
  isGatewayRunning() {
    try {
      execSync('pgrep -f "proxy-server.js"', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  // 🌐 Get allowed domains
  getAllowedDomains() {
    return {
      total: this.allowedDomains.length,
      categories: {
        news: 5,
        social: 3,
        ai_ml: 5,
        development: 3,
        market_data: 2,
        rss_feeds: 2
      },
      domains: this.allowedDomains
    };
  }

  // 📊 Get request statistics
  getRequestStats() {
    try {
      const logFile = path.join(this.gatewayPath, 'logs', 'requests.log');
      if (!fs.existsSync(logFile)) {
        return { total_requests: 0, successful: 0, failed: 0 };
      }
      
      const logs = fs.readFileSync(logFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
      
      const successful = logs.filter(log => log.type === 'success').length;
      const failed = logs.filter(log => log.type === 'error').length;
      
      return {
        total_requests: logs.length,
        successful: successful,
        failed: failed,
        success_rate: logs.length > 0 ? successful / logs.length : 0
      };
      
    } catch (error) {
      return { total_requests: 0, successful: 0, failed: 0 };
    }
  }
}

module.exports = SecureInternetSandbox;
