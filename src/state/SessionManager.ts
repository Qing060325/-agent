import * as fs from 'fs/promises';
import * as path from 'path';
import type { Session, SessionConfig } from '../types/index.js';
import { SessionImpl } from '../query/QueryEngine.js';

/**
 * Session Manager - Manages session persistence and recovery
 */
export class SessionManager {
  private sessionsDir: string;
  private sessions: Map<string, Session> = new Map();

  constructor(sessionsDir: string = '.manus/sessions') {
    this.sessionsDir = sessionsDir;
  }

  /**
   * Initialize session manager
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.sessionsDir, { recursive: true });
    } catch (error) {
      console.error(`Failed to create sessions directory: ${error}`);
    }
  }

  /**
   * Create a new session
   */
  createSession(config: SessionConfig): Session {
    const session = new SessionImpl(config);
    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  /**
   * List all sessions
   */
  listSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Save session to file (JSONL format)
   */
  async saveSession(session: Session): Promise<void> {
    const filePath = path.join(this.sessionsDir, `${session.id}.jsonl`);

    try {
      // Save each message as a separate JSON line
      const lines = session.messageHistory.map((msg) => JSON.stringify(msg));
      const content = lines.join('\n');

      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      console.error(`Failed to save session: ${error}`);
    }
  }

  /**
   * Load session from file
   */
  async loadSession(id: string): Promise<Session | undefined> {
    const filePath = path.join(this.sessionsDir, `${id}.jsonl`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter((line) => line.trim());

      const session = new SessionImpl({ id });
      for (const line of lines) {
        try {
          const message = JSON.parse(line);
          session.addMessage(message);
        } catch {
          // Skip invalid lines
        }
      }

      this.sessions.set(id, session);
      return session;
    } catch (error) {
      console.error(`Failed to load session: ${error}`);
      return undefined;
    }
  }

  /**
   * Load all sessions
   */
  async loadAllSessions(): Promise<void> {
    try {
      const files = await fs.readdir(this.sessionsDir);
      for (const file of files) {
        if (file.endsWith('.jsonl')) {
          const id = file.replace('.jsonl', '');
          await this.loadSession(id);
        }
      }
    } catch (error) {
      console.error(`Failed to load sessions: ${error}`);
    }
  }

  /**
   * Delete session
   */
  async deleteSession(id: string): Promise<void> {
    const filePath = path.join(this.sessionsDir, `${id}.jsonl`);

    try {
      await fs.unlink(filePath);
      this.sessions.delete(id);
    } catch (error) {
      console.error(`Failed to delete session: ${error}`);
    }
  }

  /**
   * Export session to JSON
   */
  async exportSession(id: string, outputPath: string): Promise<void> {
    const session = this.getSession(id);
    if (!session) {
      throw new Error(`Session ${id} not found`);
    }

    const data = {
      id: session.id,
      name: session.name,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: session.messageHistory,
      metadata: session.metadata,
    };

    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Import session from JSON
   */
  async importSession(inputPath: string): Promise<Session> {
    const content = await fs.readFile(inputPath, 'utf-8');
    const data = JSON.parse(content);

    const session = new SessionImpl({
      id: data.id,
      name: data.name,
      metadata: data.metadata,
    });

    for (const message of data.messages) {
      session.addMessage(message);
    }

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get session statistics
   */
  getStats() {
    return {
      totalSessions: this.sessions.size,
      totalMessages: Array.from(this.sessions.values()).reduce(
        (sum, session) => sum + session.messageHistory.length,
        0
      ),
      sessions: Array.from(this.sessions.values()).map((s) => ({
        id: s.id,
        name: s.name,
        messages: s.messageHistory.length,
        createdAt: new Date(s.createdAt).toISOString(),
      })),
    };
  }

  /**
   * Clear all sessions
   */
  async clearAllSessions(): Promise<void> {
    try {
      const files = await fs.readdir(this.sessionsDir);
      for (const file of files) {
        if (file.endsWith('.jsonl')) {
          await fs.unlink(path.join(this.sessionsDir, file));
        }
      }
      this.sessions.clear();
    } catch (error) {
      console.error(`Failed to clear sessions: ${error}`);
    }
  }
}

/**
 * Global session manager instance
 */
export const globalSessionManager = new SessionManager();
