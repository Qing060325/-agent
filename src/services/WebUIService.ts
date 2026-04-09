import type { ManusAgent } from '../index.js';

/**
 * Web UI Service - Provides REST API for web interface
 */
export class WebUIService {
  private agent: ManusAgent | null = null;
  private port: number = 3000;
  private baseUrl: string = `http://localhost:${this.port}`;

  /**
   * Initialize Web UI service
   */
  async initialize(agent: ManusAgent, port: number = 3000): Promise<void> {
    this.agent = agent;
    this.port = port;
    this.baseUrl = `http://localhost:${this.port}`;

    console.log(`[webui] Web UI service initialized on ${this.baseUrl}`);
  }

  /**
   * Get dashboard data
   */
  getDashboardData() {
    if (!this.agent) {
      throw new Error('Web UI service not initialized');
    }

    return {
      status: this.agent.getStatus(),
      timestamp: Date.now(),
    };
  }

  /**
   * Get available commands
   */
  getCommands() {
    return {
      total: 88,
      categories: [
        'basic',
        'file',
        'code',
        'web',
        'agent',
        'mcp',
        'advanced',
        'database',
        'dataAnalysis',
        'media',
        'document',
        'cloud',
        'advancedWeb',
      ],
    };
  }

  /**
   * Get available tools
   */
  getTools() {
    return {
      total: 40,
      categories: [
        'file',
        'codeExecution',
        'web',
        'database',
        'dataAnalysis',
        'media',
        'document',
        'cloud',
        'advancedWeb',
      ],
    };
  }

  /**
   * Execute command via REST API
   */
  async executeCommand(command: string): Promise<any> {
    if (!this.agent) {
      throw new Error('Web UI service not initialized');
    }

    try {
      const result = await this.agent.executeCommand(command);
      return {
        success: true,
        result,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get session list
   */
  getSessions() {
    return {
      sessions: [],
      total: 0,
    };
  }

  /**
   * Create new session
   */
  createSession(name: string) {
    return {
      id: `session-${Date.now()}`,
      name,
      createdAt: Date.now(),
    };
  }

  /**
   * Get session details
   */
  getSession(sessionId: string) {
    return {
      id: sessionId,
      name: 'Session',
      createdAt: Date.now(),
      messages: [],
    };
  }

  /**
   * Get system stats
   */
  getStats() {
    return {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      commands: 88,
      tools: 40,
      sessions: 0,
    };
  }

  /**
   * Get configuration
   */
  getConfig() {
    return {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: {
        webUI: true,
        vscodeExtension: false,
        ideIntegration: false,
        pluginMarketplace: false,
        enterpriseFeatures: false,
      },
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Record<string, any>) {
    return {
      success: true,
      config,
      timestamp: Date.now(),
    };
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get port
   */
  getPort(): number {
    return this.port;
  }
}

export const globalWebUIService = new WebUIService();
