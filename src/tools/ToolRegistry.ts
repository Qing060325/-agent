import type { Tool, ToolContext, ToolResult, Permission } from '../types/index.js';
import { PermissionError } from './Tool.js';

/**
 * Registry for managing all available tools
 */
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private permissions: Map<string, Permission[]> = new Map();
  private executionHistory: Map<string, ToolResult[]> = new Map();

  /**
   * Register a tool with optional permissions
   */
  register(tool: Tool, permissions?: Permission[]): void {
    this.tools.set(tool.name, tool);
    if (permissions && permissions.length > 0) {
      this.permissions.set(tool.name, permissions);
    }
  }

  /**
   * Execute a tool by name
   */
  async execute(
    toolName: string,
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    // Check permissions
    const permissions = this.permissions.get(toolName) || [];
    for (const perm of permissions) {
      if (!perm.check(context)) {
        throw new PermissionError(`Permission denied for ${toolName}`);
      }
    }

    // Execute tool
    const result = await tool.execute(input, context);

    // Record execution
    if (!this.executionHistory.has(toolName)) {
      this.executionHistory.set(toolName, []);
    }
    this.executionHistory.get(toolName)!.push(result);

    return result;
  }

  /**
   * Get all registered tools
   */
  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get a specific tool
   */
  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * Search tools by name or description
   */
  searchTools(query: string): Tool[] {
    const lowerQuery = query.toLowerCase();
    return this.getTools().filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): Tool[] {
    return this.getTools().filter((tool) => {
      const metadata = (tool as any).getMetadata?.();
      return metadata?.category === category;
    });
  }

  /**
   * Get execution history for a tool
   */
  getExecutionHistory(toolName: string, limit?: number): ToolResult[] {
    const history = this.executionHistory.get(toolName) || [];
    if (limit) {
      return history.slice(-limit);
    }
    return history;
  }

  /**
   * Clear execution history
   */
  clearExecutionHistory(toolName?: string): void {
    if (toolName) {
      this.executionHistory.delete(toolName);
    } else {
      this.executionHistory.clear();
    }
  }

  /**
   * Get registry statistics
   */
  getStats() {
    return {
      totalTools: this.tools.size,
      tools: Array.from(this.tools.keys()),
      executionCount: Array.from(this.executionHistory.values()).reduce(
        (sum, history) => sum + history.length,
        0
      ),
    };
  }

  /**
   * Unregister a tool
   */
  unregister(toolName: string): boolean {
    const removed = this.tools.delete(toolName);
    if (removed) {
      this.permissions.delete(toolName);
      this.executionHistory.delete(toolName);
    }
    return removed;
  }

  /**
   * Clear all tools
   */
  clear(): void {
    this.tools.clear();
    this.permissions.clear();
    this.executionHistory.clear();
  }
}

/**
 * Global tool registry instance
 */
export const globalToolRegistry = new ToolRegistry();
