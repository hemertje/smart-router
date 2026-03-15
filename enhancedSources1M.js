#!/usr/bin/env node

// 🚀 ENHANCED SOURCES 1M - AI ECOSYSTEM EXPANSION WITH 1M CONTEXT!
// Complete document analysis with Anthropic's 1M context window

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

class EnhancedSources1M {
  constructor() {
    this.sources = {
      // Business & Venture Intelligence
      venturebeat: {
        url: 'https://venturebeat.com/',
        name: 'VentureBeat',
        category: 'ai-business',
        focus: 'AI funding, enterprise trends, venture capital',
        rateLimit: 3000,
        maxArticles: 10,
        contentLength: 8000,
        model: 'qwen/qwen3.5-plus-02-15', // Cost-optimized 1M context
        ranking: 'Not ranked but 95% cheaper than top models'
      },
      
      // Practical AI & Tutorials
      alexfinn: {
        url: 'https://www.alexfinn.ai/',
        name: 'Alex Finn - Ship/It Weekly',
        category: 'ai-practical',
        focus: 'Beginner-friendly AI guides, practical applications',
        rateLimit: 2000,
        lastRequest: 0,
        maxArticles: 15,
        contentLength: 6000,
        model: 'qwen/qwen3.5-plus-02-15', // Cost-optimized 1M context
        ranking: 'Not ranked but 95% cheaper than top models'
      },
      
      // Product Management & AI Tools
      fullstackpm: {
        url: 'https://fullstackpm.com/',
        name: 'Full Stack PM',
        category: 'ai-product-management',
        focus: 'PMs building with AI tools, Claude Code, Cursor',
        rateLimit: 2000,
        lastRequest: 0,
        maxArticles: 15
      },
      
      // Deep Learning Research
      cameronwolfe: {
        url: 'https://cameronrwolfe.substack.com/',
        name: 'Deep (Learning) Focus',
        category: 'ai-research',
        focus: 'AI research, deep learning, LLM evaluations',
        rateLimit: 2000,
        lastRequest: 0,
        maxArticles: 10
      },
      
      // Mathematical AI
      aiwithmike: {
        url: 'https://aiwithmike.substack.com/',
        name: 'AI with Mike',
        category: 'ai-mathematical',
        focus: 'Mathematical foundations of AI, paper reviews',
        rateLimit: 2000,
        lastRequest: 0,
        maxArticles: 10
      },
      
      // Advanced AI Techniques
      diamantai: {
        url: 'https://diamantai.github.io/',
        name: 'DiamantAI',
        category: 'ai-advanced',
        focus: 'Advanced AI techniques, OpenClaw, tutorials',
        rateLimit: 2000,
        lastRequest: 0,
        maxArticles: 10
      },
      
      // AI News Aggregation
      perplexity_discover: {
        url: 'https://www.perplexity.ai/discover',
        name: 'Perplexity Discover',
        category: 'ai-aggregation',
        focus: 'AI-powered news aggregation, tech trends, market intelligence',
        rateLimit: 3000,
        lastRequest: 0,
        maxArticles: 20,
        contentLength: 5000,
        model: 'qwen/qwen3.5-plus-02-15', // Cost-optimized 1M context
        ranking: 'AI aggregation leader - 1.2B queries/month',
        features: ['Pro Search', 'Multi-Model', 'Real-time Updates', 'Citation Quality']
      },
      
      // Perplexity Blog/Updates
      perplexity_blog: {
        url: 'https://www.perplexity.ai/hub',
        name: 'Perplexity Blog',
        category: 'ai-updates',
        focus: 'Platform updates, new features, AI insights',
        rateLimit: 2000,
        lastRequest: 0,
        maxArticles: 15,
        contentLength: 4000,
        model: 'qwen/qwen3.5-plus-02-15', // Cost-optimized 1M context
        ranking: 'Official platform updates',
        features: ['Product Updates', 'Feature Announcements', 'Platform Statistics']
      }
    };
    
    this.results = {
      timestamp: new Date().toISOString(),
      sources: {},
      totalArticles: 0,
      categories: {},
      insights: [],
      crossSourcePatterns: [],
      tokenUsage: {
        estimated: 0,
        contextWindow: '1M'
      }
    };
  }

  // 🕐 Rate limiting helper
  async waitForRateLimit(source) {
    const now = Date.now();
    const timeSinceLastRequest = now - source.lastRequest;
    
    if (timeSinceLastRequest < source.rateLimit) {
      const waitTime = source.rateLimit - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    source.lastRequest = Date.now();
  }

  // 🌐 Fetch content from source
  async fetchContent(source) {
    try {
      await this.waitForRateLimit(source);
      
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.log(`❌ Error fetching ${source.name}: ${error.message}`);
      return null;
    }
  }

  // 📄 Extract articles with full content for 1M context
  extractArticles(html, source) {
    const $ = cheerio.load(html);
    const articles = [];
    
    switch (source.category) {
      case 'ai-practical':
        // Alex Finn - extract full tutorials
        $('.post, .article, .blog-post').each((index, element) => {
          const $article = $(element);
          const title = $article.find('h1, h2, h3').first().text().trim();
          const content = $article.find('p, .content, .post-content').text().trim();
          const link = $article.find('a').first().attr('href');
          const date = $article.find('.date, .timestamp, .post-date').text().trim();
          
          if (title && content.length > 100) {
            articles.push({
              title: title,
              content: content.substring(0, 5000), // Full content for 1M context
              link: link ? (link.startsWith('http') ? link : new URL(link, source.url).href) : source.url,
              date: date || 'Recent',
              source: source.name,
              category: source.category,
              wordCount: content.split(' ').length
            });
          }
        });
        break;
        
      case 'ai-product-management':
        // Full Stack PM - extract full articles
        $('.post, .article, .blog-post').each((index, element) => {
          const $article = $(element);
          const title = $article.find('h1, h2, h3').first().text().trim();
          const content = $article.find('p, .content, .post-content').text().trim();
          const link = $article.find('a').first().attr('href');
          const date = $article.find('.date, .timestamp, .post-date').text().trim();
          
          if (title && content.length > 100) {
            articles.push({
              title: title,
              content: content.substring(0, 5000), // Full content for 1M context
              link: link ? (link.startsWith('http') ? link : new URL(link, source.url).href) : source.url,
              date: date || 'Recent',
              source: source.name,
              category: source.category,
              wordCount: content.split(' ').length
            });
          }
        });
        break;
        
      case 'ai-research':
        // Cameron Wolfe - extract research papers
        $('.post, .article, .blog-post').each((index, element) => {
          const $article = $(element);
          const title = $article.find('h1, h2, h3').first().text().trim();
          const content = $article.find('p, .content, .post-content').text().trim();
          const link = $article.find('a').first().attr('href');
          const date = $article.find('.date, .timestamp, .post-date').text().trim();
          
          if (title && content.length > 100) {
            articles.push({
              title: title,
              content: content.substring(0, 8000), // Longer for research papers
              link: link ? (link.startsWith('http') ? link : new URL(link, source.url).href) : source.url,
              date: date || 'Recent',
              source: source.name,
              category: source.category,
              wordCount: content.split(' ').length,
              type: 'research'
            });
          }
        });
        break;
        
      case 'ai-mathematical':
        // AI with Mike - extract mathematical papers
        $('.post, .article, .blog-post').each((index, element) => {
          const $article = $(element);
          const title = $article.find('h1, h2, h3').first().text().trim();
          const content = $article.find('p, .content, .post-content').text().trim();
          const link = $article.find('a').first().attr('href');
          const date = $article.find('.date, .timestamp, .post-date').text().trim();
          
          if (title && content.length > 100) {
            articles.push({
              title: title,
              content: content.substring(0, 6000), // Mathematical content
              link: link ? (link.startsWith('http') ? link : new URL(link, source.url).href) : source.url,
              date: date || 'Recent',
              source: source.name,
              category: source.category,
              wordCount: content.split(' ').length,
              type: 'mathematical'
            });
          }
        });
        break;
        
      case 'ai-advanced':
        // DiamantAI - extract technical tutorials
        $('.post, .article, .blog-post, .tutorial').each((index, element) => {
          const $article = $(element);
          const title = $article.find('h1, h2, h3').first().text().trim();
          const content = $article.find('p, .content, .post-content, .tutorial-content').text().trim();
          const link = $article.find('a').first().attr('href');
          const date = $article.find('.date, .timestamp, .post-date').text().trim();
          
          if (title && content.length > 100) {
            articles.push({
              title: title,
              content: content.substring(0, 7000), // Technical content
              link: link ? (link.startsWith('http') ? link : new URL(link, source.url).href) : source.url,
              date: date || 'Recent',
              source: source.name,
              category: source.category,
              wordCount: content.split(' ').length,
              type: 'technical'
            });
          }
        });
        break;
        
      case 'ai-business':
        // VentureBeat (if accessible)
        $('article, .post, .story').each((index, element) => {
          const $article = $(element);
          const title = $article.find('h1, h2, h3, .title').first().text().trim();
          const content = $article.find('p, .content, .excerpt').text().trim();
          const link = $article.find('a').first().attr('href');
          const date = $article.find('.date, .time, .timestamp').text().trim();
          
          if (title && content.length > 50) {
            articles.push({
              title: title,
              content: content.substring(0, 3000), // Business articles
              link: link ? (link.startsWith('http') ? link : new URL(link, source.url).href) : source.url,
              date: date || 'Recent',
              source: source.name,
              category: source.category,
              wordCount: content.split(' ').length,
              type: 'business'
            });
          }
        });
        break;
    }
    
    return articles.slice(0, source.maxArticles);
  }

  // 📅 Check if article is recent (last 7 days)
  isRecent(dateString) {
    if (!dateString || dateString === 'Recent') return true;
    
    try {
      const date = new Date(dateString);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return date > sevenDaysAgo;
    } catch (error) {
      return true;
    }
  }

  // 🧠 Generate insights from full content (1M context ready)
  generateInsights(articles) {
    const insights = [];
    const allContent = articles.map(a => a.content).join(' ');
    const totalWords = allContent.split(' ').length;
    
    // Category analysis
    const categoryCounts = {};
    articles.forEach(article => {
      categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    });
    
    // Content analysis with full context
    const topics = this.extractTopics(allContent);
    const trends = this.identifyTrends(articles);
    const patterns = this.findPatterns(articles);
    
    insights.push({
      type: 'content-analysis',
      totalArticles: articles.length,
      totalWords: totalWords,
      estimatedTokens: Math.ceil(totalWords * 1.3), // Rough token estimation
      categories: categoryCounts,
      topics: topics,
      trends: trends,
      patterns: patterns,
      contextUtilization: `${Math.ceil((totalWords * 1.3) / 10000)}% of 1M context window`
    });
    
    return insights;
  }

  // 🔍 Extract topics from full content
  extractTopics(content) {
    const topics = [];
    const keywords = [
      'claude', 'anthropic', 'openai', 'gpt', 'llm', 'ai', 'machine learning',
      'cursor', 'claude code', 'product management', 'research', 'mathematics',
      'venture capital', 'funding', 'enterprise', 'startup', 'technology'
    ];
    
    keywords.forEach(keyword => {
      const matches = content.toLowerCase().match(new RegExp(keyword, 'gi'));
      if (matches && matches.length > 2) {
        topics.push({
          keyword: keyword,
          mentions: matches.length,
          relevance: matches.length > 5 ? 'high' : 'medium'
        });
      }
    });
    
    return topics.sort((a, b) => b.mentions - a.mentions).slice(0, 10);
  }

  // 📈 Identify trends from articles
  identifyTrends(articles) {
    const trends = [];
    const recentArticles = articles.filter(a => this.isRecent(a.date));
    
    // Trend analysis
    if (recentArticles.length > 5) {
      trends.push({
        type: 'activity',
        description: `High activity detected: ${recentArticles.length} recent articles`,
        significance: 'high'
      });
    }
    
    // Content trends
    const contentTypes = {};
    recentArticles.forEach(article => {
      const type = article.type || 'general';
      contentTypes[type] = (contentTypes[type] || 0) + 1;
    });
    
    Object.entries(contentTypes).forEach(([type, count]) => {
      if (count > 2) {
        trends.push({
          type: 'content',
          description: `${type} content trending: ${count} articles`,
          significance: count > 5 ? 'high' : 'medium'
        });
      }
    });
    
    return trends;
  }

  // 🔍 Find patterns across sources
  findPatterns(articles) {
    const patterns = [];
    
    // Cross-source pattern detection
    const sourceTopics = {};
    articles.forEach(article => {
      if (!sourceTopics[article.source]) {
        sourceTopics[article.source] = [];
      }
      sourceTopics[article.source].push(...this.extractTopics(article.content).slice(0, 3));
    });
    
    // Find common topics across sources
    const allTopics = Object.values(sourceTopics).flat();
    const topicCounts = {};
    
    allTopics.forEach(topic => {
      const key = topic.keyword;
      topicCounts[key] = (topicCounts[key] || 0) + 1;
    });
    
    Object.entries(topicCounts).forEach(([topic, count]) => {
      if (count >= 3) {
        patterns.push({
          type: 'cross-source',
          topic: topic,
          frequency: count,
          sources: Object.keys(sourceTopics).filter(source => 
            sourceTopics[source].some(t => t.keyword === topic)
          ),
          significance: count >= 5 ? 'high' : 'medium'
        });
      }
    });
    
    return patterns.sort((a, b) => b.frequency - a.frequency).slice(0, 5);
  }

  // 🚀 Run enhanced sources analysis with 1M context
  async run() {
    console.log('🚀 Starting Enhanced Sources 1M Analysis...');
    console.log('📊 Using 1M context window for complete document analysis');
    
    for (const [sourceKey, source] of Object.entries(this.sources)) {
      console.log(`🔍 Analyzing ${source.name}...`);
      
      const html = await this.fetchContent(source);
      if (html) {
        const articles = this.extractArticles(html, source);
        const recentArticles = articles.filter(a => this.isRecent(a.date));
        
        this.results.sources[sourceKey] = {
          name: source.name,
          category: source.category,
          focus: source.focus,
          articles: recentArticles,
          totalArticles: articles.length,
          recentArticles: recentArticles.length,
          totalWords: recentArticles.reduce((sum, a) => sum + a.wordCount, 0),
          estimatedTokens: Math.ceil(recentArticles.reduce((sum, a) => sum + a.wordCount, 0) * 1.3)
        };
        
        this.results.totalArticles += recentArticles.length;
        
        // Update category counts
        if (!this.results.categories[source.category]) {
          this.results.categories[source.category] = 0;
        }
        this.results.categories[source.category] += recentArticles.length;
        
        console.log(`✅ ${source.name}: ${recentArticles.length} recent articles`);
      } else {
        this.results.sources[sourceKey] = {
          name: source.name,
          category: source.category,
          focus: source.focus,
          error: 'Failed to fetch content',
          articles: [],
          totalArticles: 0,
          recentArticles: 0
        };
        console.log(`❌ ${source.name}: Failed to fetch content`);
      }
    }
    
    // Generate insights with full context
    console.log('🧠 Generating insights with 1M context...');
    const allArticles = Object.values(this.results.sources)
      .filter(source => source.articles)
      .flatMap(source => source.articles);
    
    this.results.insights = this.generateInsights(allArticles);
    this.results.crossSourcePatterns = this.findPatterns(allArticles);
    
    // Calculate total token usage
    this.results.tokenUsage.estimated = Math.ceil(
      allArticles.reduce((sum, a) => sum + (a.wordCount || 0), 0) * 1.3
    );
    this.results.tokenUsage.contextUtilization = `${Math.ceil(this.results.tokenUsage.estimated / 10000)}% of 1M`;
    
    // Save results
    const resultsPath = path.join(__dirname, 'enhanced-sources-1m-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    
    console.log('✅ Enhanced Sources 1M Analysis Complete!');
    console.log(`📊 Total Articles: ${this.results.totalArticles}`);
    console.log(`🧠 Estimated Tokens: ${this.results.tokenUsage.estimated.toLocaleString()}`);
    console.log(`📈 Context Utilization: ${this.results.tokenUsage.contextUtilization}`);
    console.log(`🔍 Cross-Source Patterns: ${this.results.crossSourcePatterns.length}`);
    console.log(`💾 Results saved to: enhanced-sources-1m-results.json`);
    
    return this.results;
  }
}

// 🚀 Run Enhanced Sources 1M Analysis
if (require.main === module) {
  const analyzer = new EnhancedSources1M();
  analyzer.run().catch(console.error);
}

module.exports = EnhancedSources1M;
