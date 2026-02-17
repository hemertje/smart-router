import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface ProjectInfo {
  name: string;
  root: string;
  context: string;
  claudeMdPath: string;
  hasClaudeConfig: boolean;
}

export class ProjectDetector {
  private currentProject: ProjectInfo | null = null;

  async detectProject(): Promise<ProjectInfo | null> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return null;
    }

    const projectRoot = workspaceFolder.uri.fsPath;
    const projectName = path.basename(projectRoot);
    const claudeMdPath = path.join(projectRoot, '.claude', 'CLAUDE.md');
    
    // Check if project has .claude/CLAUDE.md
    const hasClaudeConfig = fs.existsSync(claudeMdPath);
    
    // Load project context if available
    let context = '';
    if (hasClaudeConfig) {
      try {
        context = fs.readFileSync(claudeMdPath, 'utf8');
      } catch (error) {
        console.error(`Failed to read CLAUDE.md: ${error}`);
      }
    }

    this.currentProject = {
      name: projectName,
      root: projectRoot,
      context,
      claudeMdPath,
      hasClaudeConfig
    };

    return this.currentProject;
  }

  getCurrentProject(): ProjectInfo | null {
    return this.currentProject;
  }

  async getProjectContext(): Promise<string> {
    const project = await this.detectProject();
    if (!project) {
      return 'No active project detected.';
    }

    if (!project.hasClaudeConfig) {
      return `Project: ${project.name}\nNo .claude/CLAUDE.md found. Using global rules only.`;
    }

    // Extract key sections from CLAUDE.md
    const sections = this.extractKeySections(project.context);
    
    return `Project: ${project.name}\n\n${sections}`;
  }

  private extractKeySections(content: string): string {
    const sections: string[] = [];
    
    // Extract common sections
    const patterns = [
      { name: 'Project Info', regex: /## Project Info\n([\s\S]*?)(?=\n## |\n--- |\n$)/ },
      { name: 'Build Gates', regex: /## Build Gates\n([\s\S]*?)(?=\n## |\n--- |\n$)/ },
      { name: 'Technical Patterns', regex: /## Technical Patterns\n([\s\S]*?)(?=\n## |\n--- |\n$)/ },
      { name: 'Project-Specific Regels', regex: /## Project-Specifieke Regels\n([\s\S]*?)(?=\n## |\n--- |\n$)/ },
    ];

    patterns.forEach(({ name, regex }) => {
      const match = content.match(regex);
      if (match) {
        sections.push(`### ${name}\n${match[1].trim()}`);
      }
    });

    // If no sections found, return first 500 chars
    if (sections.length === 0) {
      sections.push(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
    }

    return sections.join('\n\n');
  }

  async getUsageFilePath(): Promise<string | null> {
    const project = await this.detectProject();
    if (!project) {
      return null;
    }

    const usageDir = path.join(project.root, '.claude');
    const usageFile = path.join(usageDir, 'usage.json');

    // Ensure .claude directory exists
    if (!fs.existsSync(usageDir)) {
      try {
        fs.mkdirSync(usageDir, { recursive: true });
      } catch (error) {
        console.error(`Failed to create .claude directory: ${error}`);
        return null;
      }
    }

    return usageFile;
  }
}
