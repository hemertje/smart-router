import * as vscode from 'vscode';
import { Logger } from './logger';
import { OpenRouterClient } from './openrouter';

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  creator: string;
  model: string;
  prompt: string;
  capabilities: string[];
  usage: number;
  rating: number;
  price: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum AgentCategory {
  CODE = 'code',
  DEBUG = 'debug',
  DESIGN = 'design',
  ANALYSIS = 'analysis',
  WRITING = 'writing',
  RESEARCH = 'research',
  AUTOMATION = 'automation',
  CREATIVE = 'creative'
}

export interface AgentTemplate {
  name: string;
  description: string;
  category: AgentCategory;
  prompt: string;
  model: string;
  capabilities: string[];
}

export class AgentMarketplace {
  private logger = Logger.getInstance();
  private agents: Map<string, AIAgent> = new Map();
  private templates: AgentTemplate[] = [];
  private openRouter: OpenRouterClient;

  constructor(openRouter: OpenRouterClient) {
    this.openRouter = openRouter;
    this.initializeTemplates();
    this.loadCommunityAgents();
  }

  private initializeTemplates(): void {
    this.templates = [
      {
        name: 'Code Reviewer',
        description: 'Expert code reviewer with focus on security and performance',
        category: AgentCategory.CODE,
        prompt: `You are an expert code reviewer. Analyze the provided code for:
1. Security vulnerabilities
2. Performance issues
3. Code quality and maintainability
4. Best practices adherence
5. Potential bugs

Provide detailed feedback with specific line references and improvement suggestions.`,
        model: 'anthropic/claude-3.5-sonnet',
        capabilities: ['code-review', 'security-analysis', 'performance-optimization']
      },
      {
        name: 'Debug Assistant',
        description: 'Systematic debugging expert for complex issues',
        category: AgentCategory.DEBUG,
        prompt: `You are a debugging expert. Help debug code by:
1. Analyzing error messages and stack traces
2. Identifying root causes
3. Suggesting systematic debugging approaches
4. Providing step-by-step troubleshooting
5. Recommending preventive measures

Be methodical and thorough in your analysis.`,
        model: 'swe-1.5',
        capabilities: ['error-analysis', 'root-cause-detection', 'troubleshooting']
      },
      {
        name: 'API Designer',
        description: 'RESTful API design and documentation specialist',
        category: AgentCategory.DESIGN,
        prompt: `You are an API design expert. Help design APIs by:
1. Creating RESTful endpoint structures
2. Defining request/response schemas
3. Ensuring proper HTTP methods and status codes
4. Designing authentication and authorization
5. Writing comprehensive API documentation

Follow industry best practices and standards.`,
        model: 'anthropic/claude-3.5-sonnet',
        capabilities: ['api-design', 'schema-definition', 'documentation']
      },
      {
        name: 'Performance Analyzer',
        description: 'Code performance optimization specialist',
        category: AgentCategory.ANALYSIS,
        prompt: `You are a performance optimization expert. Analyze code for:
1. Time complexity issues
2. Memory usage optimization
3. Database query optimization
4. Caching opportunities
5. Parallel processing possibilities

Provide specific optimization recommendations with code examples.`,
        model: 'anthropic/claude-3.5-sonnet',
        capabilities: ['performance-analysis', 'optimization', 'profiling']
      },
      {
        name: 'Technical Writer',
        description: 'Technical documentation and writing specialist',
        category: AgentCategory.WRITING,
        prompt: `You are a technical writing expert. Create documentation that is:
1. Clear and concise
2. Well-structured with proper headings
3. Comprehensive yet accessible
4. Include code examples where relevant
5. Follow technical writing best practices

Focus on clarity and user understanding.`,
        model: 'z-ai/glm-5',
        capabilities: ['documentation', 'technical-writing', 'user-guides']
      }
    ];
  }

  private async loadCommunityAgents(): Promise<void> {
    // Simulate loading community agents
    // In production, this would fetch from a real API
    const communityAgents: AIAgent[] = [
      {
        id: 'community-1',
        name: 'React Component Generator',
        description: 'Generates React components with TypeScript and Tailwind CSS',
        category: AgentCategory.CODE,
        creator: 'community-dev-123',
        model: 'anthropic/claude-3.5-sonnet',
        prompt: `Generate React components with:
- TypeScript interfaces
- Tailwind CSS styling
- Proper accessibility
- Responsive design
- Component documentation`,
        capabilities: ['react', 'typescript', 'tailwind', 'component-generation'],
        usage: 1250,
        rating: 4.7,
        price: 0.005,
        tags: ['react', 'typescript', 'frontend'],
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-02-10')
      },
      {
        id: 'community-2',
        name: 'Database Schema Designer',
        description: 'Designs optimal database schemas with normalization',
        category: AgentCategory.DESIGN,
        creator: 'db-expert-456',
        model: 'anthropic/claude-3.5-sonnet',
        prompt: `Design database schemas that are:
- Properly normalized (3NF)
- Optimized for performance
- Scalable architecture
- Include proper indexes
- Document relationships clearly`,
        capabilities: ['database-design', 'sql', 'normalization', 'optimization'],
        usage: 890,
        rating: 4.5,
        price: 0.008,
        tags: ['database', 'sql', 'schema'],
        createdAt: new Date('2026-01-20'),
        updatedAt: new Date('2026-02-08')
      }
    ];

    for (const agent of communityAgents) {
      this.agents.set(agent.id, agent);
    }

    this.logger.info(`[AgentMarketplace] Loaded ${communityAgents.length} community agents`);
  }

  async createAgent(agent: Omit<AIAgent, 'id' | 'usage' | 'rating' | 'createdAt' | 'updatedAt'>): Promise<AIAgent> {
    const newAgent: AIAgent = {
      ...agent,
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      usage: 0,
      rating: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.agents.set(newAgent.id, newAgent);
    this.logger.info(`[AgentMarketplace] Created new agent: ${newAgent.name}`);

    return newAgent;
  }

  async executeAgent(agentId: string, input: string): Promise<string> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    try {
      const startTime = Date.now();
      
      const response = await this.openRouter.complete(agent.model, [
        { role: 'system', content: agent.prompt },
        { role: 'user', content: input }
      ], {
        max_tokens: 2000,
        temperature: 0.7
      });

      const responseTime = Date.now() - startTime;
      
      // Update usage statistics
      agent.usage++;
      agent.updatedAt = new Date();

      this.logger.info(`[AgentMarketplace] Executed agent ${agent.name} in ${responseTime}ms`);

      return response.choices[0].message.content;

    } catch (error: any) {
      this.logger.error(`[AgentMarketplace] Agent execution failed: ${error.message}`);
      throw error;
    }
  }

  async searchAgents(query: string, category?: AgentCategory): Promise<AIAgent[]> {
    const allAgents = Array.from(this.agents.values());
    
    return allAgents.filter(agent => {
      const matchesQuery = !query || 
        agent.name.toLowerCase().includes(query.toLowerCase()) ||
        agent.description.toLowerCase().includes(query.toLowerCase()) ||
        agent.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      const matchesCategory = !category || agent.category === category;
      
      return matchesQuery && matchesCategory;
    }).sort((a, b) => {
      // Sort by rating, then usage
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.usage - a.usage;
    });
  }

  async getAgentTemplates(): Promise<AgentTemplate[]> {
    return [...this.templates];
  }

  async createAgentFromTemplate(templateId: number, customizations: Partial<AIAgent>): Promise<AIAgent> {
    const template = this.templates[templateId];
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const agent = await this.createAgent({
      name: template.name,
      description: template.description,
      category: template.category,
      creator: 'user',
      model: template.model,
      prompt: template.prompt,
      capabilities: template.capabilities,
      tags: [],
      price: 0.01,
      ...customizations
    });

    return agent;
  }

  async rateAgent(agentId: string, rating: number): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Update rating (simple average for now)
    agent.rating = (agent.rating * agent.usage + rating) / (agent.usage + 1);
    agent.updatedAt = new Date();

    this.logger.info(`[AgentMarketplace] Rated agent ${agent.name}: ${rating}/5`);
  }

  async getPopularAgents(limit: number = 10): Promise<AIAgent[]> {
    return Array.from(this.agents.values())
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit);
  }

  async getTopRatedAgents(limit: number = 10): Promise<AIAgent[]> {
    return Array.from(this.agents.values())
      .filter(agent => agent.rating > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  async getAgentsByCategory(category: AgentCategory): Promise<AIAgent[]> {
    return Array.from(this.agents.values())
      .filter(agent => agent.category === category)
      .sort((a, b) => b.rating - a.rating);
  }

  async showAgentMarketplace(): Promise<void> {
    const popularAgents = await this.getPopularAgents(5);
    const topRated = await this.getTopRatedAgents(5);
    const categories = Object.values(AgentCategory);

    // Get category counts
    const categoryCounts: string[] = [];
    for (const category of categories) {
      const count = (await this.getAgentsByCategory(category)).length;
      categoryCounts.push(`- **${category}**: ${count} agents`);
    }

    const dashboard = `
# 🤖 Smart Router Agent Marketplace

## 🔥 Popular Agents
${popularAgents.map((agent, index) => 
  `${index + 1}. **${agent.name}** (${agent.category})
     - Creator: ${agent.creator}
     - Usage: ${agent.usage}
     - Rating: ${agent.rating.toFixed(1)}/5 ⭐
     - Price: $${agent.price.toFixed(3)}/request
     - Capabilities: ${agent.capabilities.join(', ')}`
).join('\n\n')}

## ⭐ Top Rated Agents
${topRated.map((agent, index) => 
  `${index + 1}. **${agent.name}** (${agent.category})
     - Rating: ${agent.rating.toFixed(1)}/5 ⭐ (${agent.usage} uses)
     - Description: ${agent.description}
     - Model: ${agent.model}`
).join('\n\n')}

## 📂 Categories
${categoryCounts.join('\n')}

## 🎯 Available Templates
${this.templates.map((template, index) => 
  `${index + 1}. **${template.name}**
     - Category: ${template.category}
     - Description: ${template.description}
     - Model: ${template.model}`
).join('\n')}

## 💡 Quick Actions
- Create agent from template: \`smart.createAgentFromTemplate <template_id>\`
- Search agents: \`smart.searchAgents <query>\`
- Execute agent: \`smart.executeAgent <agent_id> <input>\`

---
*Agent Marketplace v2.8.0 - Community-driven AI agents*
    `;

    const doc = await vscode.workspace.openTextDocument({
      content: dashboard,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc);
  }
}
