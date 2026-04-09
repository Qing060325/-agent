import * as fs from 'fs';
import * as path from 'path';
import { BaseTool } from './Tool.js';
import { z } from 'zod';
import type { ToolContext, ToolResult } from '../types/index.js';

const ExportSchema = z.object({
  sessionId: z.string().optional(),
  format: z.enum(['markdown', 'html', 'json', 'text']).default('markdown'),
  output: z.string().optional(),
  title: z.string().optional(),
  includeMetadata: z.boolean().optional().default(true),
  includeTimestamps: z.boolean().optional().default(true),
});

/**
 * Export Tool - Export conversations and data to various formats
 */
export class ExportTool extends BaseTool {
  name = 'export';
  description = 'Export session/conversation to Markdown, HTML, JSON, or plain text';
  inputSchema = ExportSchema;
  permissions = [{ check: () => true }];

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { format, output, title, includeMetadata, includeTimestamps } =
      ExportSchema.parse(input);

    const session = context.session;
    if (!session) {
      return {
        success: false,
        error: 'No active session to export',
        timestamp: Date.now(),
      };
    }

    const messages = session.messageHistory || [];
    const sessionTitle = title || session.name || 'Manus Session';

    let content: string;
    let fileExtension: string;

    switch (format) {
      case 'markdown':
        content = this.toMarkdown(messages, sessionTitle, session, includeMetadata, includeTimestamps);
        fileExtension = 'md';
        break;
      case 'html':
        content = this.toHTML(messages, sessionTitle, session, includeMetadata, includeTimestamps);
        fileExtension = 'html';
        break;
      case 'json':
        content = this.toJSON(messages, sessionTitle, session);
        fileExtension = 'json';
        break;
      case 'text':
        content = this.toText(messages, sessionTitle, includeTimestamps);
        fileExtension = 'txt';
        break;
      default:
        return {
          success: false,
          error: `Unknown format: ${format}`,
          timestamp: Date.now(),
        };
    }

    // Write to file if output specified
    if (output) {
      const outputPath = output.endsWith(`.${fileExtension}`)
        ? output
        : `${output}.${fileExtension}`;
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(outputPath, content, 'utf-8');
      return {
        success: true,
        result: {
          path: path.resolve(outputPath),
          format,
          size: Buffer.byteLength(content, 'utf-8'),
          messages: messages.length,
        },
        timestamp: Date.now(),
      };
    }

    return {
      success: true,
      result: {
        content,
        format,
        size: Buffer.byteLength(content, 'utf-8'),
        messages: messages.length,
      },
      timestamp: Date.now(),
    };
  }

  private toMarkdown(
    messages: any[],
    title: string,
    session: any,
    includeMetadata: boolean,
    includeTimestamps: boolean
  ): string {
    const lines: string[] = [];

    lines.push(`# ${title}`);
    lines.push('');

    if (includeMetadata) {
      lines.push(`- **Session ID**: ${session.id || 'N/A'}`);
      lines.push(`- **Created**: ${session.createdAt ? new Date(session.createdAt).toLocaleString() : 'N/A'}`);
      lines.push(`- **Messages**: ${messages.length}`);
      lines.push(`- **Exported**: ${new Date().toLocaleString()}`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');

    for (const msg of messages) {
      const roleLabel = {
        user: '👤 **User**',
        assistant: '🤖 **Assistant**',
        system: '⚙️ **System**',
        tool: '🔧 **Tool**',
      }[msg.role] || `**${msg.role}**`;

      let header = roleLabel;
      if (includeTimestamps && msg.timestamp) {
        header += ` _${new Date(msg.timestamp).toLocaleString()}_`;
      }

      lines.push(header);
      lines.push('');
      lines.push(msg.content || '');
      lines.push('');

      // Tool calls
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        lines.push('<details><summary>Tool Calls</summary>');
        lines.push('');
        for (const call of msg.toolCalls) {
          lines.push(`- **${call.name}**: \`${JSON.stringify(call.input)}\``);
        }
        lines.push('');
        lines.push('</details>');
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }

  private toHTML(
    messages: any[],
    title: string,
    session: any,
    includeMetadata: boolean,
    includeTimestamps: boolean
  ): string {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #0d1117; color: #c9d1d9; }
    h1 { color: #58a6ff; margin-bottom: 16px; }
    .metadata { background: #161b22; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #8b949e; }
    .message { margin: 16px 0; padding: 16px; border-radius: 12px; }
    .user { background: #1f2937; border-left: 3px solid #3b82f6; }
    .assistant { background: #1a2332; border-left: 3px solid #10b981; }
    .system { background: #2d1b2e; border-left: 3px solid #a855f7; }
    .role { font-weight: bold; margin-bottom: 8px; }
    .role.user { color: #3b82f6; }
    .role.assistant { color: #10b981; }
    .role.system { color: #a855f7; }
    .timestamp { font-size: 12px; color: #484f58; margin-left: 8px; }
    .content { white-space: pre-wrap; line-height: 1.6; }
    .tool-call { background: #161b22; padding: 8px; border-radius: 4px; margin-top: 8px; font-family: monospace; font-size: 13px; }
  </style>
</head>
<body>
  <h1>${this.escapeHtml(title)}</h1>
  ${includeMetadata ? `
  <div class="metadata">
    Session: ${this.escapeHtml(session.id || 'N/A')} | 
    Messages: ${messages.length} | 
    Exported: ${new Date().toLocaleString()}
  </div>` : ''}
  ${messages.map(msg => `
  <div class="message ${msg.role}">
    <div class="role ${msg.role}">${this.getRoleEmoji(msg.role)} ${this.escapeHtml(msg.role)}${includeTimestamps && msg.timestamp ? `<span class="timestamp">${new Date(msg.timestamp).toLocaleString()}</span>` : ''}</div>
    <div class="content">${this.escapeHtml(msg.content || '')}</div>
    ${msg.toolCalls ? msg.toolCalls.map((tc: any) => `<div class="tool-call">🔧 ${this.escapeHtml(tc.name)}: ${this.escapeHtml(JSON.stringify(tc.input))}</div>`).join('') : ''}
  </div>`).join('\n')}
</body>
</html>`;
    return html;
  }

  private toJSON(messages: any[], title: string, session: any): string {
    return JSON.stringify(
      {
        title,
        sessionId: session.id,
        createdAt: session.createdAt,
        exportedAt: Date.now(),
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          toolCalls: m.toolCalls,
        })),
      },
      null,
      2
    );
  }

  private toText(messages: any[], title: string, includeTimestamps: boolean): string {
    const lines: string[] = [];
    lines.push(title);
    lines.push('='.repeat(title.length));
    lines.push('');

    for (const msg of messages) {
      const prefix = {
        user: 'USER',
        assistant: 'ASSISTANT',
        system: 'SYSTEM',
        tool: 'TOOL',
      }[msg.role] || msg.role.toUpperCase();

      let header = `[${prefix}]`;
      if (includeTimestamps && msg.timestamp) {
        header += ` ${new Date(msg.timestamp).toLocaleString()}`;
      }

      lines.push(header);
      lines.push(msg.content || '');
      lines.push('');
    }

    return lines.join('\n');
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private getRoleEmoji(role: string): string {
    return { user: '👤', assistant: '🤖', system: '⚙️', tool: '🔧' }[role] || '•';
  }
}

export const EXPORT_TOOLS = [new ExportTool()];
