import { z } from 'zod';
import type { Tool, ToolContext, ToolResult, Permission } from '../types/index.js';

/**
 * Abstract base class for all tools
 * All tools must extend this class and implement the required methods
 */
export abstract class BaseTool implements Tool {
  abstract name: string;
  abstract description: string;
  abstract inputSchema: z.ZodSchema;

  protected permissions: Permission[] = [];

  /**
   * Execute the tool with the given input
   */
  async execute(input: unknown, context: ToolContext): Promise<ToolResult> {
    try {
      // Check permissions
      if (!this.canUse(context)) {
        throw new PermissionError(`Tool ${this.name} not allowed`);
      }

      // Validate input
      const validatedInput = this.inputSchema.parse(input);

      // Execute before hook
      this.onBeforeExecute?.(validatedInput);

      // Execute tool
      const result = await this.executeImpl(validatedInput, context);

      // Execute after hook
      this.onAfterExecute?.(result);

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || String(error),
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Implement tool logic in subclass
   */
  protected abstract executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult>;

  /**
   * Check if tool can be used in the given context
   */
  canUse(context: ToolContext): boolean {
    // Check all permissions
    for (const permission of this.permissions) {
      if (!permission.check(context)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Hook called before tool execution
   */
  onBeforeExecute?(input: unknown): void;

  /**
   * Hook called after tool execution
   */
  onAfterExecute?(result: ToolResult): void;

  /**
   * Add permission to this tool
   */
  addPermission(permission: Permission): void {
    this.permissions.push(permission);
  }

  /**
   * Get tool metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: this.description,
      schema: this.inputSchema,
      permissions: this.permissions.length,
    };
  }
}

/**
 * Permission error
 */
export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Execution error
 */
export class ExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExecutionError';
  }
}
