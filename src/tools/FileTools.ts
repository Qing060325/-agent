import { BaseTool } from './Tool.js';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { ToolContext, ToolResult } from '../types/index.js';

/**
 * FileReadTool - Read file content
 */
export class FileReadTool extends BaseTool {
  name = 'file_read';
  description = 'Read the content of a file';
  inputSchema = z.object({
    path: z.string().describe('Path to the file'),
    encoding: z.enum(['utf-8', 'utf8', 'ascii', 'binary']).default('utf-8'),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { path: filePath, encoding } = input as any;

    try {
      // Check file access permission
      if (context.hasFileAccess && !context.hasFileAccess(filePath)) {
        throw new Error(`Access denied: ${filePath}`);
      }

      const content = await fs.readFile(filePath, encoding as any);
      return {
        success: true,
        result: {
          path: filePath,
          content,
          size: content.length,
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
}

/**
 * FileWriteTool - Write to file
 */
export class FileWriteTool extends BaseTool {
  name = 'file_write';
  description = 'Write content to a file';
  inputSchema = z.object({
    path: z.string().describe('Path to the file'),
    content: z.string().describe('Content to write'),
    encoding: z.enum(['utf-8', 'utf8', 'ascii', 'binary']).default('utf-8'),
    createDirs: z.boolean().default(true),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { path: filePath, content, encoding, createDirs } = input as any;

    try {
      // Check file access permission
      if (context.hasFileAccess && !context.hasFileAccess(filePath)) {
        throw new Error(`Access denied: ${filePath}`);
      }

      // Create directories if needed
      if (createDirs) {
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
      }

      await fs.writeFile(filePath, content, encoding as any);

      return {
        success: true,
        result: {
          path: filePath,
          size: content.length,
          message: 'File written successfully',
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
}

/**
 * FileEditTool - Edit file content
 */
export class FileEditTool extends BaseTool {
  name = 'file_edit';
  description = 'Edit file content by replacing text';
  inputSchema = z.object({
    path: z.string().describe('Path to the file'),
    find: z.string().describe('Text to find'),
    replace: z.string().describe('Text to replace with'),
    all: z.boolean().default(false).describe('Replace all occurrences'),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { path: filePath, find, replace, all } = input as any;

    try {
      // Check file access permission
      if (context.hasFileAccess && !context.hasFileAccess(filePath)) {
        throw new Error(`Access denied: ${filePath}`);
      }

      let content = await fs.readFile(filePath, 'utf-8');
      const originalContent = content;

      if (all) {
        content = content.replaceAll(find, replace);
      } else {
        content = content.replace(find, replace);
      }

      if (content === originalContent) {
        return {
          success: false,
          error: 'No matches found',
          timestamp: Date.now(),
        };
      }

      await fs.writeFile(filePath, content, 'utf-8');

      return {
        success: true,
        result: {
          path: filePath,
          message: 'File edited successfully',
          replacements: all ? 'all' : '1',
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
}

/**
 * GlobTool - Find files matching pattern
 */
export class GlobTool extends BaseTool {
  name = 'glob';
  description = 'Find files matching a glob pattern';
  inputSchema = z.object({
    pattern: z.string().describe('Glob pattern'),
    cwd: z.string().default('.').describe('Current working directory'),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { pattern, cwd } = input as any;

    try {
      // Simple glob implementation
      const files: string[] = [];
      const walkDir = async (dir: string, pattern: string) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walkDir(fullPath, pattern);
          } else if (this.matchesPattern(fullPath, pattern)) {
            files.push(fullPath);
          }
        }
      };

      await walkDir(cwd, pattern);

      return {
        success: true,
        result: {
          pattern,
          files,
          count: files.length,
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

  private matchesPattern(filePath: string, pattern: string): boolean {
    // Simple pattern matching
    const regex = new RegExp(
      pattern.replace(/\*/g, '.*').replace(/\?/g, '.')
    );
    return regex.test(filePath);
  }
}

/**
 * GrepTool - Search for text in files
 */
export class GrepTool extends BaseTool {
  name = 'grep';
  description = 'Search for text in files';
  inputSchema = z.object({
    pattern: z.string().describe('Pattern to search for'),
    path: z.string().describe('File or directory to search in'),
    recursive: z.boolean().default(true),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { pattern, path: searchPath, recursive } = input as any;

    try {
      const results: any[] = [];
      const regex = new RegExp(pattern, 'g');

      const searchFile = async (filePath: string) => {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const lines = content.split('\n');
          let lineNum = 0;

          for (const line of lines) {
            lineNum++;
            if (regex.test(line)) {
              results.push({
                file: filePath,
                line: lineNum,
                content: line,
              });
            }
          }
        } catch {
          // Skip files that can't be read
        }
      };

      const walkDir = async (dir: string) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && recursive) {
            await walkDir(fullPath);
          } else if (entry.isFile()) {
            await searchFile(fullPath);
          }
        }
      };

      const stat = await fs.stat(searchPath);
      if (stat.isDirectory()) {
        await walkDir(searchPath);
      } else {
        await searchFile(searchPath);
      }

      return {
        success: true,
        result: {
          pattern,
          results,
          count: results.length,
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
}

/**
 * All file tools
 */
export const FILE_TOOLS = [
  new FileReadTool(),
  new FileWriteTool(),
  new FileEditTool(),
  new GlobTool(),
  new GrepTool(),
];
