#!/usr/bin/env node

// 🚀 ENHANCED SOURCES - AI ECOSYSTEM EXPANSION!
// Nieuwe bronnen voor complete intelligence coverage

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

class EnhancedSources {
  constructor() {
    this.sources = {
      // Business & Venture Intelligence
      venturebeat: {
        url: 'https://venturebeat.com/',
        name: 'VentureBeat',
        category: 'ai-business',
        focus: 'AI funding, enterprise trends, venture capital',
        rateLimit: 3000, // 3 seconds between requests
        lastRequest: 0
      },
      
      // Practical AI & Tutorials
      alexfinn: {
        url: 'https://www.alexfinn.ai/',
        name: 'Alex Finn - Ship/It Weekly',
        category: 'ai-practical',
        focus: 'Beginner-friendly AI guides, practical applications',
        rateLimit: 2000,
        lastRequest: 0
      },
      
      // Product Management & AI Tools
      fullstackpm: {
        url: 'https://fullstackpm.com/',
        name: 'Full Stack PM',
        category: 'ai-product-management',
        focus: 'PMs building with AI tools, Claude Code, Cursor',
        rateLimit: 2000,
        lastRequest: 0
      },
      
      // Deep Learning Research
      cameronwolfe: {
        url: 'https://cameronrwolfe.substack.com/',
        name: 'Deep (Learning) Focus',
        category: 'ai-research',
        focus: 'AI research, deep learning, LLM evaluations',
        rateLimit: 2000,
        lastRequest: 0
      },
      
      // Mathematical AI & Papers
      aiwithmike: {
        url: 'https://aiwithmike.substack.com/',
        name: 'Mathy AI Substack',
        category: 'ai-mathematical',
        focus: 'Deep learning paper reviews, mathematical AI',
        rateLimit: 2000,
        lastRequest: 0
      },
      
      // Advanced AI Techniques
      diamantai: {
        url: 'https://diamantai.substack.com/',
        name: 'DiamantAI',
        category: 'ai-advanced',
        focus: 'Advanced AI techniques, tutorials, breakthroughs',
        rateLimit: 2000,
        lastRequest: 0
      }
    };
    
    this.results = {
      timestamp: new Date().toISOString(),
      sources: {},
      insights: [],
      summary: {
        totalSources: Object.keys(this.sources).length,
        categories: {},
        insights: 0
      }
    };
  }

  // 🚀 Scrape all enhanced sources
  async scrapeAllSources() {
    console.log('🚀 SCRAPING ENHANCED AI ECOSYSTEM SOURCES...');
    console.log('===============================================');

    for (const [sourceId, source] of Object.entries(this.sources)) {
      try {
        console.log(`🔍 Scraping ${source.name}...`);
        
        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - source.lastRequest;
        if (timeSinceLastRequest < source.rateLimit) {
          const waitTime = source.rateLimit - timeSinceLastRequest;
          console.log(`⏱️ Rate limiting ${source.name} - waiting ${waitTime}ms`);
          await this.sleep(waitTime);
        }
        
        const data = await this.scrapeSource(sourceId, source);
        this.results.sources[sourceId] = data;
        
        // Update last request time
        source.lastRequest = Date.now();
        
        console.log(`✅ ${source.name} scraped successfully`);
        
      } catch (error) {
        console.error(`❌ Error scraping ${source.name}:`, error.message);
        this.results.sources[sourceId] = {
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    // Generate insights
    this.generateInsights();
    
    // Save results
    this.saveResults();
    
    console.log('✅ Enhanced sources scraping completed!');
    console.log(`📊 Sources processed: ${Object.keys(this.results.sources).length}`);
    console.log(`🧠 Insights generated: ${this.results.insights.length}`);
    
    return this.results;
  }

  // 🔍 Scrape individual source
  async scrapeSource(sourceId, source) {
    try {
      const response = await axios.get(source.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const articles = this.extractArticles($, source);
      
      return {
        source: source.name,
        category: source.category,
        focus: source.focus,
        url: source.url,
        timestamp: new Date().toISOString(),
        articles: articles,
        metrics: {
          totalArticles: articles.length,
          recentArticles: articles.filter(a => this.isRecent(a.date)).length
        }
      };

    } catch (error) {
      throw new Error(`Failed to scrape ${source.name}: ${error.message}`);
    }
  }

  // 📰 Extract articles from source
  extractArticles($, source) {
    const articles = [];
    
    // Different extraction strategies per source
    switch (source.category) {
      case 'ai-practical':
      case 'ai-product-management':
        // Substack-based sources
        $('.post-preview, .post').each((index, element) => {
          const $article = $(element);
          const title = $article.find('h3, .title, .post-title').text().trim();
          const link = $article.find('a').first().attr('href');
          const date = $article.find('.date, .timestamp, .post-date').text().trim();
          
          if (title && link) {
            articles.push({
              title: title,
              link: link.startsWith('http') ? link : new URL(link, source.url).href,
              date: date || 'Recent',
              source: source.name,
              category: source.category
            });
          }
        });
        break;
        
      case 'ai-research':
      case 'ai-mathematical':
      case 'ai-advanced':
        // Substack research sources
        $('.post-preview, .post, article').each((index, element) => {
          const $article = $(element);
          const title = $article.find('h3, .title, .post-title').text().trim();
          const link = $article.find('a').first().attr('href');
          const date = $article.find('.date, .timestamp, .post-date').text().trim();
          const description = $article.find('p, .description, .excerpt').first().text().trim();
          
          if (title && link) {
            articles.push({
              title: title,
              link: link.startsWith('http') ? link : new URL(link, source.url).href,
              date: date || 'Recent',
              description: description.substring(0, 200),
              source: source.name,
              category: source.category
            });
          }
        });
        break;
        
      case 'ai-business':
        // VentureBeat (if accessible)
        $('article, .post, .story').each((index, element) => {
          const $article = $(element);
          const title = $article.find('h2, h3, .title').text().trim();
          const link = $article.find('a').first().attr('href');
          const date = $article.find('.date, .time, .timestamp').text().trim();
          
          if (title && link) {
            articles.push({
              title: title,
              link: link.startsWith('http') ? link : new URL(link, source.url).href,
              date: date || 'Recent',
              source: source.name,
              category: source.category
            });
          }
        });
        break;
    }
    
    return articles.slice(0, 10); // Limit to 10 most recent
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
      return true; // Assume recent if can't parse
    }
  }

  // 🧠 Generate insights from scraped data
  generateInsights() {
    const insights = [];
    const categories = {};
    
    // Analyze each source
    for (const [sourceId, data] of Object.entries(this.results.sources)) {
      if (data.error) continue;
      
      const category = data.category;
      categories[category] = (categories[category] || 0) + 1;
      
      // Generate category-specific insights
      if (data.articles && data.articles.length > 0) {
        const recentCount = data.articles.filter(a => this.isRecent(a.date)).length;
        
        if (recentCount > 3) {
          insights.push({
            type: 'activity',
            source: data.source,
            category: category,
            insight: `High activity in ${category}: ${recentCount} recent articles`,
            recommendation: `Monitor ${data.source} for latest ${category} trends`,
            evidence: `${recentCount} articles from ${data.source} in last 7 days`
          });
        }
        
        // Look for trending topics
        const titles = data.articles.map(a => a.title).join(' ').toLowerCase();
        const trendingTopics = this.findTrendingTopics(titles);
        
        if (trendingTopics.length > 0) {
          insights.push({
            type: 'trend',
            source: data.source,
            category: category,
            insight: `Trending topics in ${category}: ${trendingTopics.join(', ')}`,
            recommendation: `Focus on ${trendingTopics[0]} for strategic insights`,
            evidence: `Topic analysis of ${data.articles.length} articles from ${data.source}`
          });
        }
      }
    }
    
    // Cross-category insights
    const categoryCount = Object.keys(categories).length;
    if (categoryCount >= 4) {
      insights.push({
        type: 'coverage',
        insight: `Comprehensive AI ecosystem coverage: ${categoryCount} categories`,
        recommendation: 'Maintain diverse source portfolio for complete intelligence',
        evidence: `Sources covering: ${Object.keys(categories).join(', ')}`
      });
    }
    
    this.results.insights = insights;
    this.results.summary.categories = categories;
    this.results.summary.insights = insights.length;
  }

  // 🔍 Find trending topics in text
  findTrendingTopics(text) {
    const topics = ['claude code', 'ai agents', 'llm', 'machine learning', 'deep learning', 'openai', 'anthropic', 'cursor', 'product management', 'tutorials'];
    const found = [];
    
    for (const topic of topics) {
      if (text.includes(topic)) {
        found.push(topic);
      }
    }
    
    return found.slice(0, 3); // Top 3 topics
  }

  // 💾 Save results
  saveResults() {
    const resultsFile = path.join(__dirname, 'enhanced-sources-results.json');
    try {
      fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
      console.log(`💾 Results saved to ${resultsFile}`);
    } catch (error) {
      console.error('❌ Error saving results:', error);
    }
  }

  // ⏱️ Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 🚀 Run enhanced sources scraping
if (require.main === module) {
  const scraper = new EnhancedSources();
  scraper.scrapeAllSources();
}

module.exports = EnhancedSources;
