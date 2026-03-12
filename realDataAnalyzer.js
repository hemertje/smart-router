#!/usr/bin/env node

// 🧠 REAL DATA ANALYZER - ECHTE INTELLIGENCE UIT SCRAPING DATA!
// Transformeert verzamelde data naar bruikbare insights

const fs = require('fs');
const path = require('path');

class RealDataAnalyzer {
  constructor() {
    this.dataDir = __dirname;
    this.realTimeDataFile = path.join(this.dataDir, 'real-time-data.json');
    this.aggregationHistoryFile = path.join(this.dataDir, 'aggregation-history.json');
    this.resultsFile = path.join(this.dataDir, 'real-analysis-results.json');
  }

  // 🧠 Analyze real data
  analyzeRealData() {
    console.log('🧠 ANALYZING REAL DATA FROM SCRAPING...');
    console.log('==========================================');

    try {
      // Load real-time data
      const realTimeData = this.loadRealTimeData();
      
      // Analyze GitHub releases
      const githubAnalysis = this.analyzeGitHubReleases(realTimeData.github || []);
      
      // Analyze alerts
      const alertsAnalysis = this.analyzeAlerts(realTimeData.alerts || []);
      
      // Generate insights
      const insights = this.generateRealInsights(githubAnalysis, alertsAnalysis);
      
      // Save results
      const results = {
        timestamp: new Date().toISOString(),
        analysis: {
          github: githubAnalysis,
          alerts: alertsAnalysis,
          insights: insights,
          summary: this.generateSummary(githubAnalysis, alertsAnalysis, insights)
        }
      };

      this.saveResults(results);
      
      console.log('✅ Real data analysis completed!');
      console.log(`📊 GitHub Releases Analyzed: ${githubAnalysis.totalReleases}`);
      console.log(`🔍 Insights Generated: ${insights.length}`);
      console.log(`🎯 Key Finding: ${insights[0]?.insight || 'No insights'}`);
      
      return results;

    } catch (error) {
      console.error('❌ Error analyzing real data:', error);
      return null;
    }
  }

  // 📊 Load real-time data
  loadRealTimeData() {
    try {
      if (fs.existsSync(this.realTimeDataFile)) {
        return JSON.parse(fs.readFileSync(this.realTimeDataFile, 'utf8'));
      }
      return { github: [], alerts: [] };
    } catch (error) {
      return { github: [], alerts: [] };
    }
  }

  // 🔍 Analyze GitHub releases
  analyzeGitHubReleases(releases) {
    const analysis = {
      totalReleases: releases.length,
      sources: {},
      timeRange: { earliest: null, latest: null },
      urgency: { high: 0, medium: 0, low: 0 },
      patterns: { breaking: 0, security: 0, feature: 0, performance: 0 },
      recentReleases: []
    };

    releases.forEach(release => {
      // Count by source
      const source = release.source || 'Unknown';
      analysis.sources[source] = (analysis.sources[source] || 0) + 1;

      // Time range
      const date = new Date(release.publishedAt);
      if (!analysis.timeRange.earliest || date < analysis.timeRange.earliest) {
        analysis.timeRange.earliest = date;
      }
      if (!analysis.timeRange.latest || date > analysis.timeRange.latest) {
        analysis.timeRange.latest = date;
      }

      // Urgency
      analysis.urgency[release.urgency] = (analysis.urgency[release.urgency] || 0) + 1;

      // Patterns
      if (release.patterns) {
        Object.keys(release.patterns).forEach(pattern => {
          analysis.patterns[pattern] += release.patterns[pattern];
        });
      }

      // Recent releases (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (date > sevenDaysAgo) {
        analysis.recentReleases.push({
          title: release.title,
          source: source,
          publishedAt: release.publishedAt,
          urgency: release.urgency
        });
      }
    });

    return analysis;
  }

  // 🚨 Analyze alerts
  analyzeAlerts(alerts) {
    const analysis = {
      totalAlerts: alerts.length,
      types: {},
      sources: {},
      urgency: { high: 0, medium: 0, low: 0 },
      recentAlerts: []
    };

    alerts.forEach(alert => {
      // Count by type
      const type = alert.type || 'unknown';
      analysis.types[type] = (analysis.types[type] || 0) + 1;

      // Count by source
      const source = alert.source || 'Unknown';
      analysis.sources[source] = (analysis.sources[source] || 0) + 1;

      // Urgency
      analysis.urgency[alert.urgency] = (analysis.urgency[alert.urgency] || 0) + 1;

      // Recent alerts (last 24 hours)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      const alertDate = new Date(alert.publishedAt);
      if (alertDate > twentyFourHoursAgo) {
        analysis.recentAlerts.push({
          title: alert.title,
          source: source,
          type: type,
          publishedAt: alert.publishedAt,
          urgency: alert.urgency
        });
      }
    });

    return analysis;
  }

  // 💡 Generate real insights
  generateRealInsights(githubAnalysis, alertsAnalysis) {
    const insights = [];

    // GitHub release patterns
    if (githubAnalysis.totalReleases > 0) {
      const activeSources = Object.keys(githubAnalysis.sources);
      if (activeSources.length > 1) {
        insights.push({
          type: 'pattern',
          insight: `Multiple AI platforms active: ${activeSources.join(', ')}`,
          recommendation: 'Monitor cross-platform compatibility requirements',
          evidence: `${githubAnalysis.totalReleases} releases from ${activeSources.length} sources`
        });
      }

      // Recent activity
      if (githubAnalysis.recentReleases.length > 0) {
        insights.push({
          type: 'activity',
          insight: `High release activity: ${githubAnalysis.recentReleases.length} releases in last 7 days`,
          recommendation: 'Consider impact on integration stability',
          evidence: githubAnalysis.recentReleases.map(r => `${r.source}: ${r.title}`).join(', ')
        });
      }

      // Urgency patterns
      if (githubAnalysis.urgency.high > 0) {
        insights.push({
          type: 'urgency',
          insight: `${githubAnalysis.urgency.high} high-urgency releases detected`,
          recommendation: 'Prioritize review of high-urgency updates',
          evidence: 'High-urgency releases require immediate attention'
        });
      }
    }

    // Alert patterns
    if (alertsAnalysis.totalAlerts > 0) {
      const dominantType = Object.keys(alertsAnalysis.types).reduce((a, b) => 
        alertsAnalysis.types[a] > alertsAnalysis.types[b] ? a : b
      );

      insights.push({
        type: 'alert',
        insight: `Dominant alert type: ${dominantType} (${alertsAnalysis.types[dominantType]} occurrences)`,
        recommendation: `Focus monitoring on ${dominantType} events`,
        evidence: `Alert analysis shows ${dominantType} as primary concern`
      });
    }

    // Time-based insights
    if (githubAnalysis.timeRange.earliest && githubAnalysis.timeRange.latest) {
      const daysDiff = Math.ceil((githubAnalysis.timeRange.latest - githubAnalysis.timeRange.earliest) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0) {
        insights.push({
          type: 'temporal',
          insight: `Release span: ${daysDiff} days of activity`,
          recommendation: 'Maintain consistent monitoring schedule',
          evidence: `Activity spread over ${daysDiff} days indicates sustained development`
        });
      }
    }

    return insights;
  }

  // 📊 Generate summary
  generateSummary(githubAnalysis, alertsAnalysis, insights) {
    return {
      totalDataPoints: githubAnalysis.totalReleases + alertsAnalysis.totalAlerts,
      insightsGenerated: insights.length,
      keyFindings: insights.map(i => i.insight),
      recommendations: insights.map(i => i.recommendation),
      dataQuality: {
        githubData: githubAnalysis.totalReleases > 0 ? 'good' : 'none',
        alertsData: alertsAnalysis.totalAlerts > 0 ? 'good' : 'none',
        insights: insights.length > 0 ? 'excellent' : 'poor'
      }
    };
  }

  // 💾 Save results
  saveResults(results) {
    try {
      fs.writeFileSync(this.resultsFile, JSON.stringify(results, null, 2));
    } catch (error) {
      console.error('❌ Error saving results:', error);
    }
  }
}

// 🧠 Run real data analysis
if (require.main === module) {
  const analyzer = new RealDataAnalyzer();
  analyzer.analyzeRealData();
}

module.exports = RealDataAnalyzer;
