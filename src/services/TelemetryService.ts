import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Telemetry Service - Optional anonymous usage tracking
 */
export class TelemetryService {
  private enabled: boolean = false;
  private dataFile: string;
  private sessionData: TelemetrySession;
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: TelemetryConfig = {}) {
    const dataDir = config.dataDir || path.join(os.homedir(), '.manus', 'telemetry');
    this.dataFile = path.join(dataDir, 'telemetry.jsonl');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.sessionData = {
      sessionId: this.generateId(),
      startTime: Date.now(),
      events: [],
      metrics: {
        commandsExecuted: 0,
        toolsUsed: 0,
        errors: 0,
        sessionsStarted: 0,
        tokensUsed: 0,
      },
    };

    this.enabled = config.enabled ?? this.loadConfig();

    if (this.enabled) {
      this.startAutoFlush(config.flushIntervalMs || 60000);
    }
  }

  /**
   * Enable telemetry
   */
  enable(): void {
    this.enabled = true;
    this.saveConfig(true);
    this.startAutoFlush();
  }

  /**
   * Disable telemetry
   */
  disable(): void {
    this.enabled = false;
    this.saveConfig(false);
    this.stopAutoFlush();
  }

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Track a command execution
   */
  trackCommand(commandName: string, duration: number, success: boolean): void {
    if (!this.enabled) return;

    this.sessionData.events.push({
      type: 'command',
      name: commandName,
      timestamp: Date.now(),
      duration,
      success,
    });

    this.sessionData.metrics.commandsExecuted++;
    if (!success) this.sessionData.metrics.errors++;
  }

  /**
   * Track a tool execution
   */
  trackTool(toolName: string, duration: number, success: boolean): void {
    if (!this.enabled) return;

    this.sessionData.events.push({
      type: 'tool',
      name: toolName,
      timestamp: Date.now(),
      duration,
      success,
    });

    this.sessionData.metrics.toolsUsed++;
    if (!success) this.sessionData.metrics.errors++;
  }

  /**
   * Track token usage
   */
  trackTokens(promptTokens: number, completionTokens: number): void {
    if (!this.enabled) return;
    this.sessionData.metrics.tokensUsed += promptTokens + completionTokens;
  }

  /**
   * Track an error
   */
  trackError(error: string, context?: string): void {
    if (!this.enabled) return;

    this.sessionData.events.push({
      type: 'error',
      name: error,
      timestamp: Date.now(),
      context,
    });

    this.sessionData.metrics.errors++;
  }

  /**
   * Track session start
   */
  trackSessionStart(): void {
    if (!this.enabled) return;
    this.sessionData.metrics.sessionsStarted++;
  }

  /**
   * Get usage report
   */
  getReport(): TelemetryReport {
    const now = Date.now();
    const sessionDuration = now - this.sessionData.startTime;

    // Most used commands
    const commandCounts = new Map<string, number>();
    const toolCounts = new Map<string, number>();
    const errorCounts = new Map<string, number>();

    for (const event of this.sessionData.events) {
      if (event.type === 'command') {
        commandCounts.set(event.name, (commandCounts.get(event.name) || 0) + 1);
      } else if (event.type === 'tool') {
        toolCounts.set(event.name, (toolCounts.get(event.name) || 0) + 1);
      } else if (event.type === 'error') {
        errorCounts.set(event.name, (errorCounts.get(event.name) || 0) + 1);
      }
    }

    const topCommands = Array.from(commandCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const topTools = Array.from(toolCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const avgResponseTime =
      this.sessionData.events
        .filter((e) => e.duration !== undefined)
        .reduce((sum, e) => sum + (e.duration || 0), 0) /
      (this.sessionData.events.filter((e) => e.duration !== undefined).length || 1);

    return {
      sessionId: this.sessionData.sessionId,
      sessionDurationMs: sessionDuration,
      metrics: { ...this.sessionData.metrics },
      topCommands,
      topTools,
      avgResponseTimeMs: Math.round(avgResponseTime),
      totalEvents: this.sessionData.events.length,
    };
  }

  /**
   * Flush data to disk
   */
  flush(): void {
    if (!this.enabled || this.sessionData.events.length === 0) return;

    try {
      const lines = this.sessionData.events.map((e) => JSON.stringify(e));
      fs.appendFileSync(this.dataFile, lines.join('\n') + '\n', 'utf-8');
      this.sessionData.events = [];
    } catch {
      // Silently fail - telemetry should never break the app
    }
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(intervalMs?: number): void {
    if (this.flushInterval) return;
    this.flushInterval = setInterval(() => this.flush(), intervalMs || 60000);
  }

  /**
   * Stop auto-flush timer
   */
  private stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Load telemetry config
   */
  private loadConfig(): boolean {
    try {
      const configPath = path.join(
        path.dirname(this.dataFile),
        'config.json'
      );
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return config.enabled ?? false;
      }
    } catch {}
    return false;
  }

  /**
   * Save telemetry config
   */
  private saveConfig(enabled: boolean): void {
    try {
      const configPath = path.join(
        path.dirname(this.dataFile),
        'config.json'
      );
      fs.writeFileSync(configPath, JSON.stringify({ enabled }), 'utf-8');
    } catch {}
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup on exit
   */
  destroy(): void {
    this.flush();
    this.stopAutoFlush();
  }
}

export interface TelemetryConfig {
  dataDir?: string;
  enabled?: boolean;
  flushIntervalMs?: number;
}

export interface TelemetryEvent {
  type: 'command' | 'tool' | 'error' | 'session';
  name: string;
  timestamp: number;
  duration?: number;
  success?: boolean;
  context?: string;
}

export interface TelemetrySession {
  sessionId: string;
  startTime: number;
  events: TelemetryEvent[];
  metrics: {
    commandsExecuted: number;
    toolsUsed: number;
    errors: number;
    sessionsStarted: number;
    tokensUsed: number;
  };
}

export interface TelemetryReport {
  sessionId: string;
  sessionDurationMs: number;
  metrics: TelemetrySession['metrics'];
  topCommands: { name: string; count: number }[];
  topTools: { name: string; count: number }[];
  avgResponseTimeMs: number;
  totalEvents: number;
}

export const globalTelemetry = new TelemetryService();
