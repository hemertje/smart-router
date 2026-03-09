#!/usr/bin/env node

// 🌐 REAL DATA INTEGRATION - GEEN FAKE DATA MEER!
// Haalt echte data van GitHub APIs en websites

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class RealDataIntegration {
  constructor() {
    this.realDataFile = path.join(__dirname, 'real-time-data.json');
    this.sources = {
      github: [
        'https://api.github.com/repos/OpenRouterTeam/openrouter/releases',
        'https://api.github.com/repos/anthropics/anthropic-sdk-python/releases',
        'https://api.github.com/repos/openai/openai-python/releases'
      ],
      websites: [
        'https://openai.com/index/',
        'https://www.anthropic.com/news',
        'https://openrouter.ai/blog'
      ]
    };
  }

  // 🚀 Get real GitHub data
  async getRealGitHubData() {
    console.log('🔍 Fetching REAL GitHub data...');
    
    const realData = {
      timestamp: new Date().toISOString(),
      github: [],
      alerts: [],
      evidence: 'real'
    };

    for (const url of this.sources.github) {
      try {
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Smart Router v2.7.1'
          },
          timeout: 5000
        });

        if (response.data && Array.isArray(response.data)) {
          const releases = response.data.slice(0, 3); // Top 3 releases
          
          releases.forEach(release => {
            const realAlert = this.processRealRelease(release, url);
            if (realAlert) {
              realData.github.push(realAlert);
              realData.alerts.push(realAlert);
            }
          });
        }

        console.log(`✅ Real data from ${url}: ${response.data.length} releases`);
        
      } catch (error) {
        console.log(`⚠️ Real data fetch failed for ${url}:`, error.message);
      }
    }

    return realData;
  }

  // 🎯 Process real GitHub release
  processRealRelease(release, sourceUrl) {
    const body = release.body || '';
    const name = release.name || release.tag_name || 'Unknown';
    
    // Real pattern detection
    const patterns = {
      breaking: ['break:', 'breaking:', 'deprecated:', 'removed:', 'no longer supported'],
      security: ['security', 'vulnerability', 'patch', 'cve'],
      feature: ['feat:', 'feature:', 'new:', 'added', 'enhancement'],
      performance: ['performance', 'optimization', 'faster', 'improved', 'speed']
    };

    let alertType = 'feature';
    let urgency = 'medium';
    
    // Detect real patterns
    const lowerBody = body.toLowerCase();
    const lowerName = name.toLowerCase();

    if (patterns.breaking.some(pattern => lowerBody.includes(pattern) || lowerName.includes(pattern))) {
      alertType = 'critical';
      urgency = 'immediate';
    } else if (patterns.security.some(pattern => lowerBody.includes(pattern) || lowerName.includes(pattern))) {
      alertType = 'security';
      urgency = 'high';
    } else if (patterns.performance.some(pattern => lowerBody.includes(pattern) || lowerName.includes(pattern))) {
      alertType = 'feature';
      urgency = 'medium';
    }

    return {
      type: alertType,
      title: this.generateRealTitle(alertType, name),
      message: this.generateRealMessage(body),
      source: this.extractSourceName(sourceUrl),
      url: release.html_url,
      publishedAt: release.published_at,
      urgency: urgency,
      evidence: 'real',
      patterns: this.detectPatterns(lowerBody),
      metrics: this.extractMetrics(body)
    };
  }

  // 📝 Generate real title
  generateRealTitle(type, releaseName) {
    const titles = {
      critical: `🚨 Breaking Change: ${releaseName}`,
      security: `🔒 Security Update: ${releaseName}`,
      feature: `✨ New Release: ${releaseName}`
    };
    return titles[type] || `📊 Update: ${releaseName}`;
  }

  // 📄 Generate real message
  generateRealMessage(body) {
    // Extract first meaningful line from body
    const lines = body.split('\n').filter(line => line.trim().length > 10);
    if (lines.length > 0) {
      return lines[0].substring(0, 100) + (lines[0].length > 100 ? '...' : '');
    }
    return 'Real GitHub release update';
  }

  // 🏷️ Extract source name
  extractSourceName(url) {
    if (url.includes('OpenRouterTeam')) return 'OpenRouter GitHub';
    if (url.includes('anthropics')) return 'Anthropic GitHub';
    if (url.includes('openai')) return 'OpenAI GitHub';
    return 'GitHub Repository';
  }

  // 🔍 Detect patterns in content
  detectPatterns(content) {
    const patterns = {
      breaking: content.match(/break:|breaking:|deprecated:|removed:/gi) || [],
      security: content.match(/security|vulnerability|patch|cve/gi) || [],
      feature: content.match(/feat:|feature:|new:|added/gi) || [],
      performance: content.match(/performance|optimization|faster|improved/gi) || []
    };
    
    return Object.fromEntries(
      Object.entries(patterns).map(([key, matches]) => [key, matches.length])
    );
  }

  // 📊 Extract metrics from content
  extractMetrics(content) {
    const metrics = {
      versions: content.match(/v\d+\.\d+\.\d+/gi) || [],
      percentages: content.match(/\d+%/gi) || [],
      numbers: content.match(/\d+/gi) || []
    };
    
    return {
      versionCount: metrics.versions.length,
      percentageCount: metrics.percentages.length,
      numberCount: metrics.numbers.length,
      examples: {
        versions: metrics.versions.slice(0, 3),
        percentages: metrics.percentages.slice(0, 3),
        numbers: metrics.numbers.slice(0, 5)
      }
    };
  }

  // 💾 Save real data
  saveRealData(data) {
    try {
      fs.writeFileSync(this.realDataFile, JSON.stringify(data, null, 2));
      console.log('✅ Real data saved to:', this.realDataFile);
    } catch (error) {
      console.error('❌ Failed to save real data:', error);
    }
  }

  // 📊 Load real data
  loadRealData() {
    try {
      if (fs.existsSync(this.realDataFile)) {
        return JSON.parse(fs.readFileSync(this.realDataFile, 'utf8'));
      }
    } catch (error) {
      console.error('❌ Failed to load real data:', error);
    }
    return null;
  }

  // 🚀 Run real data integration
  async runRealDataIntegration() {
    console.log('🌐 REAL DATA INTEGRATION STARTED...');
    console.log('==================================');
    
    const realData = await this.getRealGitHubData();
    
    console.log('📊 REAL DATA SUMMARY:');
    console.log(`🔍 Sources checked: ${this.sources.github.length}`);
    console.log(`📈 Real alerts: ${realData.alerts.length}`);
    console.log(`🚨 Critical: ${realData.alerts.filter(a => a.type === 'critical').length}`);
    console.log(`🔒 Security: ${realData.alerts.filter(a => a.type === 'security').length}`);
    console.log(`✨ Features: ${realData.alerts.filter(a => a.type === 'feature').length}`);
    console.log('');
    
    // Show real alerts
    realData.alerts.forEach((alert, index) => {
      console.log(`${index + 1}. ${alert.title}`);
      console.log(`   📝 ${alert.message}`);
      console.log(`   📍 ${alert.source} (${alert.urgency})`);
      console.log(`   🔗 ${alert.url}`);
      console.log('');
    });
    
    // Save real data
    this.saveRealData(realData);
    
    console.log('✅ REAL DATA INTEGRATION COMPLETED!');
    console.log('🚀 NO MORE FAKE DATA - ONLY REAL INTELLIGENCE!');
    
    return realData;
  }
}

// 🚀 Export voor gebruik
module.exports = RealDataIntegration;

// 🚀 Direct run als script
if (require.main === module) {
  const integration = new RealDataIntegration();
  integration.runRealDataIntegration();
}
