import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

export interface Skill {
  name: string;
  description: string;
  license?: string;
  metadata?: Record<string, string>;
  compatibility?: string;
  allowedTools?: string[];
  content: string;
  directory: string;
}

export interface SkillMetadata {
  name: string;
  description: string;
  license?: string;
  metadata?: Record<string, string>;
  compatibility?: string;
  allowedTools?: string[];
}

export class SkillsManager {
  private skills: Map<string, Skill> = new Map();
  private skillsDirectory: string;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.skillsDirectory = path.join(context.extensionPath, '.agents', 'skills');
    this.loadSkills();
  }

  /**
   * Load all skills from the .agents/skills directory
   */
  private async loadSkills(): Promise<void> {
    try {
      if (!fs.existsSync(this.skillsDirectory)) {
        Logger.getInstance().info('Skills directory not found, creating it...');
        fs.mkdirSync(this.skillsDirectory, { recursive: true });
        return;
      }

      const skillDirs = fs.readdirSync(this.skillsDirectory, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const skillDir of skillDirs) {
        await this.loadSkill(skillDir);
      }

      Logger.getInstance().info(`Loaded ${this.skills.size} skills from ${skillDirs.length} directories`);
    } catch (error: any) {
      Logger.getInstance().error(`Failed to load skills: ${error.message}`);
    }
  }

  /**
   * Load a single skill from its directory
   */
  private async loadSkill(skillDir: string): Promise<void> {
    try {
      const skillPath = path.join(this.skillsDirectory, skillDir);
      const skillMdPath = path.join(skillPath, 'SKILL.md');

      if (!fs.existsSync(skillMdPath)) {
        Logger.getInstance().warn(`SKILL.md not found in ${skillDir}`);
        return;
      }

      const content = fs.readFileSync(skillMdPath, 'utf8');
      const skill = this.parseSkillFile(content, skillDir);

      if (skill) {
        this.skills.set(skill.name, skill);
        Logger.getInstance().info(`Loaded skill: ${skill.name}`);
      }
    } catch (error: any) {
      Logger.getInstance().error(`Failed to load skill ${skillDir}: ${error.message}`);
    }
  }

  /**
   * Parse SKILL.md file and extract metadata and content
   */
  private parseSkillFile(content: string, skillDir: string): Skill | null {
    try {
      // Extract YAML frontmatter
      const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
      if (!frontmatterMatch) {
        Logger.getInstance().warn(`Invalid SKILL.md format in ${skillDir}`);
        return null;
      }

      const [, frontmatter, body] = frontmatterMatch;
      
      // Parse YAML frontmatter (simple implementation)
      const metadata = this.parseYamlFrontmatter(frontmatter);
      
      if (!metadata.name || !metadata.description) {
        Logger.getInstance().warn(`Missing required fields in ${skillDir}`);
        return null;
      }

      return {
        name: metadata.name,
        description: metadata.description,
        license: metadata.license,
        metadata: metadata.metadata,
        compatibility: metadata.compatibility,
        allowedTools: metadata.allowedTools,
        content: body.trim(),
        directory: skillDir
      };
    } catch (error: any) {
      Logger.getInstance().error(`Failed to parse skill file ${skillDir}: ${error.message}`);
      return null;
    }
  }

  /**
   * Simple YAML frontmatter parser
   */
  private parseYamlFrontmatter(frontmatter: string): SkillMetadata {
    const lines = frontmatter.split('\n');
    const metadata: any = {};

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        
        // Handle nested metadata
        if (key === 'metadata') {
          metadata[key] = this.parseNestedMetadata(value);
        } else {
          metadata[key] = value.replace(/^["']|["']$/g, ''); // Remove quotes
        }
      }
    }

    return metadata;
  }

  /**
   * Parse nested metadata field
   */
  private parseNestedMetadata(value: string): Record<string, string> {
    const metadata: Record<string, string> = {};
    // Simple implementation - in production, use a proper YAML parser
    return metadata;
  }

  /**
   * Get all available skills (discovery phase - ~100 tokens)
   */
  public getAvailableSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get skill by name (activation phase - full content)
   */
  public getSkill(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  /**
   * Search skills by description (for task matching)
   */
  public searchSkills(query: string): Skill[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.skills.values()).filter(skill => 
      skill.name.toLowerCase().includes(lowercaseQuery) ||
      skill.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get skills relevant to a specific task
   */
  public getRelevantSkills(task: string): Skill[] {
    const keywords = this.extractKeywords(task);
    const relevantSkills: Skill[] = [];

    for (const skill of this.skills.values()) {
      const relevanceScore = this.calculateRelevanceScore(skill, keywords);
      if (relevanceScore > 0.3) { // Threshold for relevance
        relevantSkills.push(skill);
      }
    }

    return relevantSkills.sort((a, b) => 
      this.calculateRelevanceScore(b, keywords) - this.calculateRelevanceScore(a, keywords)
    );
  }

  /**
   * Extract keywords from task description
   */
  private extractKeywords(task: string): string[] {
    // Simple keyword extraction - in production, use NLP
    const keywords = task.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word));
    
    return [...new Set(keywords)];
  }

  /**
   * Simple stop word filter
   */
  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];
    return stopWords.includes(word);
  }

  /**
   * Calculate relevance score between skill and task keywords
   */
  private calculateRelevanceScore(skill: Skill, keywords: string[]): number {
    const skillText = `${skill.name} ${skill.description}`.toLowerCase();
    let score = 0;
    let matches = 0;

    for (const keyword of keywords) {
      if (skillText.includes(keyword)) {
        matches++;
        // Higher score for name matches
        if (skill.name.toLowerCase().includes(keyword)) {
          score += 2;
        } else {
          score += 1;
        }
      }
    }

    return keywords.length > 0 ? score / keywords.length : 0;
  }

  /**
   * Reload skills from disk
   */
  public async reloadSkills(): Promise<void> {
    this.skills.clear();
    await this.loadSkills();
  }

  /**
   * Get skill statistics
   */
  public getStatistics(): {
    totalSkills: number;
    totalTokens: number;
    averageTokensPerSkill: number;
    categories: Record<string, number>;
  } {
    const skills = Array.from(this.skills.values());
    const totalTokens = skills.reduce((sum, skill) => sum + skill.content.length, 0);
    
    const categories: Record<string, number> = {};
    for (const skill of skills) {
      const category = skill.metadata?.category || 'uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    }

    return {
      totalSkills: skills.length,
      totalTokens,
      averageTokensPerSkill: skills.length > 0 ? Math.round(totalTokens / skills.length) : 0,
      categories
    };
  }

  /**
   * Enable on-demand skill loading for prompt optimization
   */
  public createSkillContext(task: string): string {
    const relevantSkills = this.getRelevantSkills(task);
    
    if (relevantSkills.length === 0) {
      return '';
    }

    // Progressive disclosure: start with discovery, then load full content
    const topSkill = relevantSkills[0];
    const skillContext = `
# Available Skill: ${topSkill.name}

${topSkill.description}

## Instructions
${topSkill.content}
`;

    return skillContext;
  }

  /**
   * Get skill loading statistics for optimization
   */
  public getLoadingStats(): {
    discoveryTokens: number;
    activationTokens: number;
    totalSavings: number;
  } {
    const skills = Array.from(this.skills.values());
    const discoveryTokens = skills.length * 100; // ~100 tokens per skill discovery
    const activationTokens = skills.reduce((sum, skill) => sum + skill.content.length, 0);
    const totalTokens = discoveryTokens + activationTokens;
    const traditionalApproach = skills.length * 5000; // Traditional: all skills loaded
    const totalSavings = traditionalApproach - totalTokens;

    return {
      discoveryTokens,
      activationTokens,
      totalSavings
    };
  }
}
