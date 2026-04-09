import { BaseTool } from './Tool.js';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { ToolContext, ToolResult } from '../types/index.js';

const execAsync = promisify(exec);

/**
 * BashTool - Execute shell commands
 */
export class BashTool extends BaseTool {
  name = 'bash';
  description = 'Execute shell commands';
  inputSchema = z.object({
    command: z.string().describe('Shell command to execute'),
    cwd: z.string().optional().describe('Working directory'),
    timeout: z.number().default(30000).describe('Timeout in milliseconds'),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { command, cwd, timeout } = input as any;

    try {
      const options: any = { timeout };
      if (cwd) {
        options.cwd = cwd;
      }

      const { stdout, stderr } = await execAsync(command, options);

      return {
        success: true,
        result: {
          command,
          stdout,
          stderr,
          exitCode: 0,
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        result: {
          command,
          stdout: error.stdout || '',
          stderr: error.stderr || '',
          exitCode: error.code || 1,
        },
        timestamp: Date.now(),
      };
    }
  }
}

/**
 * REPLTool - Execute JavaScript/Node.js code
 */
export class REPLTool extends BaseTool {
  name = 'repl';
  description = 'Execute JavaScript code in Node.js REPL';
  inputSchema = z.object({
    code: z.string().describe('JavaScript code to execute'),
    timeout: z.number().default(5000).describe('Timeout in milliseconds'),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { code, timeout } = input as any;

    try {
      // Create a safe execution context
      const result = await this.executeCode(code, timeout);

      return {
        success: true,
        result: {
          code,
          output: result,
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        result: {
          code,
          output: null,
        },
        timestamp: Date.now(),
      };
    }
  }

  private async executeCode(code: string, timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Code execution timeout after ${timeout}ms`));
      }, timeout);

      try {
        // Create a function and execute it
        const fn = new Function(code);
        const result = fn();
        clearTimeout(timer);
        resolve(result);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }
}

/**
 * All code execution tools
 */
export const CODE_EXECUTION_TOOLS = [new BashTool(), new REPLTool()];
