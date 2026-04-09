import * as fs from 'fs';
import * as path from 'path';
import { BaseTool } from './Tool.js';
import { z } from 'zod';
import type { ToolContext, ToolResult } from '../types/index.js';

const WatchSchema = z.object({
  path: z.string(),
  pattern: z.string().optional(),
  command: z.string(),
  recursive: z.boolean().optional().default(false),
  debounceMs: z.number().optional().default(500),
});

/**
 * Watch Tool - Monitor file changes and trigger actions
 */
export class WatchTool extends BaseTool {
  name = 'watch';
  description = 'Watch files for changes and execute a command on change';
  inputSchema = WatchSchema;
  permissions = [{ check: () => true }];

  private watchers: Map<string, WatchSession> = new Map();

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { path: watchPath, pattern, command, recursive, debounceMs } =
      WatchSchema.parse(input);

    const resolvedPath = path.resolve(watchPath);

    if (!fs.existsSync(resolvedPath)) {
      return {
        success: false,
        error: `Path does not exist: ${resolvedPath}`,
        timestamp: Date.now(),
      };
    }

    const watchId = `${resolvedPath}-${Date.now()}`;
    let changeCount = 0;
    let lastRun = 0;

    try {
      const { execSync } = await import('child_process');

      const watcher = fs.watch(
        resolvedPath,
        { recursive },
        (eventType, filename) => {
          if (!filename) return;

          // Pattern matching
          if (pattern && !new RegExp(pattern).test(filename)) return;

          // Debounce
          const now = Date.now();
          if (now - lastRun < debounceMs) return;
          lastRun = now;

          changeCount++;

          try {
            const output = execSync(command, {
              cwd: path.dirname(resolvedPath),
              encoding: 'utf-8',
              timeout: 30000,
            }).trim();

            console.log(`\n[watch] Change #${changeCount}: ${filename}`);
            if (output) console.log(`[watch] Output: ${output}`);
          } catch (err: any) {
            console.log(`\n[watch] Command failed: ${err.message}`);
          }
        }
      );

      const session: WatchSession = {
        id: watchId,
        path: resolvedPath,
        pattern,
        command,
        watcher,
        startTime: Date.now(),
        changeCount: 0,
      };

      this.watchers.set(watchId, session);

      return {
        success: true,
        result: {
          watchId,
          path: resolvedPath,
          pattern: pattern || '*',
          command,
          message: `Watching ${resolvedPath} for changes. Use watch-stop to stop.`,
        },
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
   * Stop a watch session
   */
  stopWatch(watchId: string): boolean {
    const session = this.watchers.get(watchId);
    if (session) {
      session.watcher.close();
      this.watchers.delete(watchId);
      return true;
    }
    return false;
  }

  /**
   * List active watch sessions
   */
  listWatchers(): WatchSession[] {
    return Array.from(this.watchers.values()).map((s) => ({
      ...s,
      watcher: undefined as any,
    }));
  }

  /**
   * Stop all watchers
   */
  stopAll(): void {
    for (const session of this.watchers.values()) {
      session.watcher.close();
    }
    this.watchers.clear();
  }
}

/**
 * Watch Stop Tool
 */
export class WatchStopTool extends BaseTool {
  name = 'watch-stop';
  description = 'Stop a file watch session';
  inputSchema = z.object({ watchId: z.string() });
  permissions = [{ check: () => true }];

  private watchTool: WatchTool;

  constructor(watchTool: WatchTool) {
    super();
    this.watchTool = watchTool;
  }

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { watchId } = z.object({ watchId: z.string() }).parse(input);
    const stopped = this.watchTool.stopWatch(watchId);
    return {
      success: stopped,
      result: stopped ? `Stopped watching: ${watchId}` : `Watch not found: ${watchId}`,
      error: stopped ? undefined : `Watch session not found`,
      timestamp: Date.now(),
    };
  }
}

/**
 * Watch List Tool
 */
export class WatchListTool extends BaseTool {
  name = 'watch-list';
  description = 'List all active file watch sessions';
  inputSchema = z.object({});
  permissions = [{ check: () => true }];

  private watchTool: WatchTool;

  constructor(watchTool: WatchTool) {
    super();
    this.watchTool = watchTool;
  }

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const watchers = this.watchTool.listWatchers();
    return {
      success: true,
      result: {
        count: watchers.length,
        watchers: watchers.map((w) => ({
          id: w.id,
          path: w.path,
          pattern: w.pattern || '*',
          command: w.command,
          uptime: Math.floor((Date.now() - w.startTime) / 1000) + 's',
        })),
      },
      timestamp: Date.now(),
    };
  }
}

export interface WatchSession {
  id: string;
  path: string;
  pattern?: string;
  command: string;
  watcher: fs.FSWatcher;
  startTime: number;
  changeCount: number;
}

const watchTool = new WatchTool();
export const WATCH_TOOLS = [
  watchTool,
  new WatchStopTool(watchTool),
  new WatchListTool(watchTool),
];
