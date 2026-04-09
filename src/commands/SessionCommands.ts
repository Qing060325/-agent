import type { Command } from '../types/index.js';
import { globalSessionManager } from '../services/SessionManager.js';

/**
 * /session save - Save current session
 */
export const SessionSaveCommand: Command = {
  name: 'session-save',
  description: 'Save the current session to disk',
  aliases: ['save'],
  async execute(args: string[], context: any): Promise<void> {
    const session = context.session;
    if (!session) {
      console.log('[error] No active session');
      return;
    }
    globalSessionManager.saveSession(session);
    console.log(`[session] Saved: ${session.id}`);
  },
};

/**
 * /session list - List all saved sessions
 */
export const SessionListCommand: Command = {
  name: 'session-list',
  description: 'List all saved sessions',
  aliases: ['sessions', 'sl'],
  async execute(args: string[], context: any): Promise<void> {
    const sessions = globalSessionManager.listSessions();

    if (sessions.length === 0) {
      console.log('\n📭 No saved sessions found.\n');
      return;
    }

    console.log('\n📋 Saved Sessions:\n');
    for (const s of sessions) {
      const date = new Date(s.updatedAt).toLocaleString();
      console.log(`  ${s.id.substring(0, 12)}... | ${s.name} | ${s.messageCount} msgs | ${date}`);
    }
    console.log();
  },
};

/**
 * /session resume - Resume a saved session
 */
export const SessionResumeCommand: Command = {
  name: 'session-resume',
  description: 'Resume a saved session by ID',
  aliases: ['resume', 'sr'],
  args: [
    {
      name: 'sessionId',
      description: 'Session ID to resume',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: any): Promise<void> {
    const sessionId = args[0];
    if (!sessionId) {
      console.log('[error] Please provide a session ID');
      return;
    }

    // Try partial ID match
    const allSessions = globalSessionManager.listSessions();
    const matched = allSessions.find(
      (s) => s.id.startsWith(sessionId) || s.id === sessionId
    );

    if (!matched) {
      console.log(`[error] Session not found: ${sessionId}`);
      return;
    }

    const session = globalSessionManager.loadSession(matched.id);
    if (!session) {
      console.log('[error] Failed to load session');
      return;
    }

    console.log(`\n✅ Resumed session: ${session.name}`);
    console.log(`   Messages: ${session.messageHistory.length}`);
    console.log(`   Last updated: ${new Date(session.updatedAt).toLocaleString()}\n`);

    // Show last 3 messages
    const recent = session.getMessages(3);
    for (const msg of recent) {
      const role = msg.role === 'user' ? '👤' : '🤖';
      const preview = msg.content.substring(0, 80) + (msg.content.length > 80 ? '...' : '');
      console.log(`  ${role} ${preview}`);
    }
    console.log();
  },
};

/**
 * /session delete - Delete a saved session
 */
export const SessionDeleteCommand: Command = {
  name: 'session-delete',
  description: 'Delete a saved session',
  aliases: ['sd'],
  args: [
    {
      name: 'sessionId',
      description: 'Session ID to delete',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: any): Promise<void> {
    const sessionId = args[0];
    if (!sessionId) {
      console.log('[error] Please provide a session ID');
      return;
    }

    globalSessionManager.deleteSession(sessionId);
    console.log(`[session] Deleted: ${sessionId}`);
  },
};

/**
 * /session export - Export session to markdown
 */
export const SessionExportCommand: Command = {
  name: 'session-export',
  description: 'Export a session to Markdown',
  aliases: ['export-session'],
  args: [
    {
      name: 'sessionId',
      description: 'Session ID to export',
      required: true,
      type: 'string',
    },
    {
      name: 'output',
      description: 'Output file path',
      required: false,
      type: 'string',
    },
  ],
  async execute(args: string[], context: any): Promise<void> {
    const sessionId = args[0];
    const outputPath = args[1];

    const md = globalSessionManager.exportToMarkdown(sessionId);
    if (!md) {
      console.log(`[error] Session not found: ${sessionId}`);
      return;
    }

    if (outputPath) {
      const fs = await import('fs');
      fs.writeFileSync(outputPath, md, 'utf-8');
      console.log(`[export] Saved to: ${outputPath}`);
    } else {
      console.log(md);
    }
  },
};

export const SESSION_COMMANDS: Command[] = [
  SessionSaveCommand,
  SessionListCommand,
  SessionResumeCommand,
  SessionDeleteCommand,
  SessionExportCommand,
];
