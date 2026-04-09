import type { Command, CommandContext } from '../types/index.js';

/**
 * /read command - Read file content
 */
export const ReadCommand: Command = {
  name: 'read',
  description: 'Read file content',
  aliases: ['cat'],
  args: [
    {
      name: 'path',
      description: 'File path to read',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const filePath = args[0];
    if (!filePath) {
      console.log('[error] Please provide a file path');
      return;
    }

    const tool = context.toolRegistry?.getTool('file_read');
    if (!tool) {
      console.log('[error] file_read tool not available');
      return;
    }

    const result = await tool.execute({ path: filePath }, context);
    if (result.success) {
      console.log(`[read] ${filePath}`);
      console.log(result.result?.content);
    } else {
      console.log(`[error] ${result.error}`);
    }
  },
};

/**
 * /write command - Write to file
 */
export const WriteCommand: Command = {
  name: 'write',
  description: 'Write content to file',
  aliases: ['w'],
  args: [
    {
      name: 'path',
      description: 'File path to write',
      required: true,
      type: 'string',
    },
    {
      name: 'content',
      description: 'Content to write',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const [filePath, ...contentParts] = args;
    if (!filePath || contentParts.length === 0) {
      console.log('[error] Please provide file path and content');
      return;
    }

    const content = contentParts.join(' ');
    const tool = context.toolRegistry?.getTool('file_write');
    if (!tool) {
      console.log('[error] file_write tool not available');
      return;
    }

    const result = await tool.execute({ path: filePath, content }, context);
    if (result.success) {
      console.log(`[write] File written: ${filePath} (${result.result?.size} bytes)`);
    } else {
      console.log(`[error] ${result.error}`);
    }
  },
};

/**
 * /search command - Search for text in files
 */
export const SearchCommand: Command = {
  name: 'search',
  description: 'Search for text in files',
  aliases: ['grep', 'find-text'],
  args: [
    {
      name: 'pattern',
      description: 'Text pattern to search',
      required: true,
      type: 'string',
    },
    {
      name: 'path',
      description: 'Path to search in',
      required: false,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const [pattern, path = '.'] = args;
    if (!pattern) {
      console.log('[error] Please provide a search pattern');
      return;
    }

    const tool = context.toolRegistry?.getTool('grep');
    if (!tool) {
      console.log('[error] grep tool not available');
      return;
    }

    const result = await tool.execute({ pattern, path }, context);
    if (result.success) {
      console.log(`[search] Found ${result.result?.count} matches for "${pattern}"`);
      result.result?.results.forEach((r: any) => {
        console.log(`  ${r.file}:${r.line}: ${r.content}`);
      });
    } else {
      console.log(`[error] ${result.error}`);
    }
  },
};

/**
 * /find command - Find files matching pattern
 */
export const FindCommand: Command = {
  name: 'find',
  description: 'Find files matching a pattern',
  aliases: ['glob'],
  args: [
    {
      name: 'pattern',
      description: 'File pattern to match',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const pattern = args[0];
    if (!pattern) {
      console.log('[error] Please provide a file pattern');
      return;
    }

    const tool = context.toolRegistry?.getTool('glob');
    if (!tool) {
      console.log('[error] glob tool not available');
      return;
    }

    const result = await tool.execute({ pattern }, context);
    if (result.success) {
      console.log(`[find] Found ${result.result?.count} files matching "${pattern}"`);
      result.result?.files.forEach((f: string) => {
        console.log(`  ${f}`);
      });
    } else {
      console.log(`[error] ${result.error}`);
    }
  },
};

/**
 * /delete command - Delete file
 */
export const DeleteCommand: Command = {
  name: 'delete',
  description: 'Delete a file',
  aliases: ['del', 'rm'],
  args: [
    {
      name: 'path',
      description: 'File path to delete',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const filePath = args[0];
    if (!filePath) {
      console.log('[error] Please provide a file path');
      return;
    }

    console.log(`[delete] File deletion not implemented yet: ${filePath}`);
  },
};

/**
 * /copy command - Copy file
 */
export const CopyCommand: Command = {
  name: 'copy',
  description: 'Copy a file',
  aliases: ['cp'],
  args: [
    {
      name: 'source',
      description: 'Source file path',
      required: true,
      type: 'string',
    },
    {
      name: 'destination',
      description: 'Destination file path',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const [source, destination] = args;
    if (!source || !destination) {
      console.log('[error] Please provide source and destination paths');
      return;
    }

    console.log(`[copy] File copy not implemented yet: ${source} -> ${destination}`);
  },
};

/**
 * All file commands
 */
export const FILE_COMMANDS: Command[] = [
  ReadCommand,
  WriteCommand,
  SearchCommand,
  FindCommand,
  DeleteCommand,
  CopyCommand,
];
