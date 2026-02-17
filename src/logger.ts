import * as vscode from 'vscode';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogSize = 1000;
  private outputChannel: vscode.OutputChannel | null = null;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setOutputChannel(channel: vscode.OutputChannel) {
    this.outputChannel = channel;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    };

    this.logs.push(entry);
    
    // Keep only the last maxLogSize entries
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(-this.maxLogSize);
    }

    // Output to VS Code channel if available
    if (this.outputChannel) {
      const levelStr = LogLevel[level];
      const logLine = `[${entry.timestamp}] ${levelStr}: ${message}`;
      
      if (context) {
        this.outputChannel.appendLine(logLine);
        this.outputChannel.appendLine(`Context: ${JSON.stringify(context, null, 2)}`);
      } else {
        this.outputChannel.appendLine(logLine);
      }
      
      if (error) {
        this.outputChannel.appendLine(`Error: ${error.message}`);
        this.outputChannel.appendLine(`Stack: ${error.stack}`);
      }
    }

    // Also log to console for debugging
    const consoleMethod = level >= LogLevel.ERROR ? console.error : 
                         level >= LogLevel.WARN ? console.warn :
                         level >= LogLevel.INFO ? console.info : console.debug;
    
    consoleMethod(`[Smart Router] ${message}`, context || '', error || '');
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level !== undefined) {
      filteredLogs = this.logs.filter(log => log.level >= level);
    }
    
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }
    
    return filteredLogs;
  }

  clearLogs() {
    this.logs = [];
    if (this.outputChannel) {
      this.outputChannel.clear();
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Performance logging
  logPerformance(operation: string, duration: number, context?: Record<string, any>) {
    this.info(`Performance: ${operation} completed in ${duration.toFixed(2)}ms`, {
      operation,
      duration,
      ...context
    });
  }

  // API logging
  logApiCall(model: string, tokens: number, cost: number, duration: number) {
    this.info(`API Call: ${model}`, {
      model,
      tokens,
      cost,
      duration,
      costPerToken: cost / tokens
    });
  }

  // Classification logging
  logClassification(query: string, intent: string, confidence: number, method: string) {
    this.debug(`Classification: ${intent}`, {
      query: query.substring(0, 100),
      intent,
      confidence,
      method
    });
  }
}
