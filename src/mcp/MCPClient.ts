import type { MCPServer, MCPServerConfig, MCPTool } from '../types/index.js';

/**
 * MCP Client - Manages connections to MCP servers
 */
export class MCPClient {
  private servers: Map<string, MCPServer> = new Map();
  private tools: Map<string, MCPTool> = new Map();

  /**
   * Register an MCP server
   */
  async registerServer(config: MCPServerConfig): Promise<MCPServer> {
    const server: MCPServer = {
      name: config.name,
      config,
      connect: async () => {
        console.log(`[mcp] Connecting to server: ${config.name}`);
        // Implementation would establish connection here
      },
      callTool: async (toolName: string, input: unknown) => {
        console.log(`[mcp] Calling tool: ${toolName}`);
        // Implementation would call the tool here
        return { result: 'Tool call result' };
      },
      readResource: async (resourceUri: string) => {
        console.log(`[mcp] Reading resource: ${resourceUri}`);
        // Implementation would read resource here
        return 'Resource content';
      },
    };

    this.servers.set(config.name, server);
    await server.connect();
    return server;
  }

  /**
   * Get server by name
   */
  getServer(name: string): MCPServer | undefined {
    return this.servers.get(name);
  }

  /**
   * List all servers
   */
  listServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  /**
   * Register tool from MCP server
   */
  registerTool(serverName: string, tool: MCPTool): void {
    const toolId = `${serverName}:${tool.name}`;
    this.tools.set(toolId, tool);
  }

  /**
   * Get tool by ID
   */
  getTool(toolId: string): MCPTool | undefined {
    return this.tools.get(toolId);
  }

  /**
   * List all tools
   */
  listTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * List tools from a specific server
   */
  listServerTools(serverName: string): MCPTool[] {
    return Array.from(this.tools.values()).filter((tool) =>
      this.tools
        .entries()
        .some(([key]) => key.startsWith(`${serverName}:`))
    );
  }

  /**
   * Call tool from MCP server
   */
  async callTool(serverName: string, toolName: string, input: unknown): Promise<any> {
    const server = this.getServer(serverName);
    if (!server) {
      throw new Error(`Server ${serverName} not found`);
    }

    return server.callTool(toolName, input);
  }

  /**
   * Read resource from MCP server
   */
  async readResource(serverName: string, resourceUri: string): Promise<string> {
    const server = this.getServer(serverName);
    if (!server) {
      throw new Error(`Server ${serverName} not found`);
    }

    return server.readResource(resourceUri);
  }

  /**
   * Disconnect server
   */
  async disconnectServer(name: string): Promise<void> {
    const server = this.servers.get(name);
    if (server) {
      // Implementation would disconnect here
      this.servers.delete(name);

      // Remove tools from this server
      const toolsToRemove = Array.from(this.tools.keys()).filter((key) =>
        key.startsWith(`${name}:`)
      );
      toolsToRemove.forEach((key) => this.tools.delete(key));
    }
  }

  /**
   * Get MCP statistics
   */
  getStats() {
    return {
      totalServers: this.servers.size,
      totalTools: this.tools.size,
      servers: Array.from(this.servers.keys()),
      tools: Array.from(this.tools.keys()),
    };
  }

  /**
   * Clear all servers and tools
   */
  clear(): void {
    this.servers.clear();
    this.tools.clear();
  }
}

/**
 * Global MCP client instance
 */
export const globalMCPClient = new MCPClient();
