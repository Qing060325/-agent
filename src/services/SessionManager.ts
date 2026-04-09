import * as fs from 'fs';
import * as path from 'path';
import type { Session, SessionConfig, Message } from '../types/index.js';
import { SessionImpl } from '../query/QueryEngine.js';

/**
 * Session Manager - Persistent session storage with JSONL format
 */
export class SessionManager {
  private sessionsDir: string;
  private activeSessions: Map<string, Session> = new Map();

  constructor(baseDir?: string) {
    this.sessionsDir = baseDir || path.join(process.cwd(), '.manus', 'sessions');
    this.ensureDirectory();
  }

  /**
   * Ensure sessions directory exists
   */
  private ensureDirectory(): void {
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  /**
   * Save a session to disk (JSONL format)
   */
  saveSession(session: Session): void {
    const filePath = this.getSessionPath(session.id);
    const lines: string[] = [];

    // Header line
    lines.push(
      JSON.stringify({
        type: 'session',
        id: session.id,
        name: session.name,
        createdAt: session.createdAt,
        updatedAt: Date.now(),
        metadata: session.metadata,
      })
    );

    // Message lines
    for (const msg of session.messageHistory) {
      lines.push(
        JSON.stringify({
          type: 'message',
          ...msg,
        })
      );
    }

    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    this.activeSessions.set(session.id, session);
  }

  /**
   * Load a session from disk
   */
  loadSession(sessionId: string): Session | null {
    const filePath = this.getSessionPath(sessionId);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim());

    if (lines.length === 0) return null;

    const header = JSON.parse(lines[0]);
    if (header.type !== 'session') return null;

    const session = new SessionImpl({
      id: header.id,
      name: header.name,
      metadata: header.metadata,
    });

    (session as any).createdAt = header.createdAt;
    (session as any).updatedAt = header.updatedAt;

    // Load messages
    for (let i = 1; i < lines.length; i++) {
      try {
        const msgData = JSON.parse(lines[i]);
        if (msgData.type === 'message') {
          const { type, ...msg } = msgData;
          session.addMessage(msg as Message);
        }
      } catch {
        // Skip malformed lines
      }
    }

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * List all saved sessions
   */
  listSessions(): SessionListItem[] {
    if (!fs.existsSync(this.sessionsDir)) {
      return [];
    }

    const files = fs.readdirSync(this.sessionsDir).filter((f) => f.endsWith('.jsonl'));
    const items: SessionListItem[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(this.sessionsDir, file);
        const firstLine = fs.readFileSync(filePath, 'utf-8').split('\n')[0];
        const header = JSON.parse(firstLine);

        if (header.type === 'session') {
          const stat = fs.statSync(filePath);
          const messageCount = fs.readFileSync(filePath, 'utf-8').split('\n').length - 1;

          items.push({
            id: header.id,
            name: header.name,
            createdAt: header.createdAt,
            updatedAt: header.updatedAt || stat.mtimeMs,
            messageCount,
            filePath,
          });
        }
      } catch {
        // Skip invalid files
      }
    }

    return items.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    const filePath = this.getSessionPath(sessionId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    this.activeSessions.delete(sessionId);
    return true;
  }

  /**
   * Get or create a session
   */
  getOrCreate(config: SessionConfig = {}): Session {
    if (config.id && this.activeSessions.has(config.id)) {
      return this.activeSessions.get(config.id)!;
    }

    if (config.id) {
      const loaded = this.loadSession(config.id);
      if (loaded) return loaded;
    }

    const session = new SessionImpl(config);
    this.activeSessions.set(session.id, session);
    return session;
  }

  /**
   * Get session file path
   */
  private getSessionPath(sessionId: string): string {
    return path.join(this.sessionsDir, `${sessionId}.jsonl`);
  }

  /**
   * Auto-save all active sessions
   */
  saveAll(): void {
    for (const session of this.activeSessions.values()) {
      this.saveSession(session);
    }
  }

  /**
   * Search sessions by content
   */
  searchSessions(query: string): SessionListItem[] {
    const allSessions = this.listSessions();
    const lowerQuery = query.toLowerCase();

    return allSessions.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.id.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Export session to markdown
   */
  exportToMarkdown(sessionId: string): string {
    const session = this.loadSession(sessionId);
    if (!session) return '';

    const lines: string[] = [];
    lines.push(`# Session: ${session.name}`);
    lines.push(`- ID: ${session.id}`);
    lines.push(`- Created: ${new Date(session.createdAt).toLocaleString()}`);
    lines.push(`- Messages: ${session.messageHistory.length}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    for (const msg of session.messageHistory) {
      const roleLabel =
        msg.role === 'user' ? '👤 User' : msg.role === 'assistant' ? '🤖 Assistant' : '⚙️ System';
      lines.push(`### ${roleLabel} (${new Date(msg.timestamp).toLocaleString()})`);
      lines.push('');
      lines.push(msg.content);
      lines.push('');
    }

    return lines.join('\n');
  }
}

export interface SessionListItem {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  filePath: string;
}

export const globalSessionManager = new SessionManager();
