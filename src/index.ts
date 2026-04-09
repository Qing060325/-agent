import { initializeAllTools } from './tools/index.js';
import { initializeAllCommands } from './commands/index.js';
import { initializeStateManagement } from './state/index.js';
import { initializeDefaultPermissions } from './utils/PermissionSystem.js';
import { globalToolRegistry } from './tools/ToolRegistry.js';
import { globalCommandRegistry } from './commands/CommandRegistry.js';
import { globalSessionManager } from './state/SessionManager.js';
import { globalAutoMemory } from './state/AutoMemory.js';
import { globalMCPClient } from './mcp/MCPClient.js';
import { globalBackupManager } from './utils/BackupRestore.js';

/**
 * Manus Agent v1.0 - Main Application
 */
export class ManusAgent {
  private initialized: boolean = false;

  /**
   * Initialize Manus Agent
   */
  async initialize(): Promise<void> {
    console.log('[manus] Initializing Manus Agent v1.0...');

    try {
      // Initialize state management
      await initializeStateManagement();

      // Initialize tools
      initializeAllTools(globalToolRegistry);

      // Initialize commands
      initializeAllCommands(globalCommandRegistry);

      // Initialize permissions
      initializeDefaultPermissions();

      // Initialize backup manager
      await globalBackupManager.initialize();

      // Initialize session manager
      await globalSessionManager.initialize();

      // Initialize auto memory
      await globalAutoMemory.initialize();

      this.initialized = true;
      console.log('[manus] Manus Agent initialized successfully');
      console.log('[manus] Ready to accept commands');
    } catch (error) {
      console.error(`[manus] Initialization failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      tools: globalToolRegistry.getStats(),
      commands: globalCommandRegistry.getStats(),
      sessions: globalSessionManager.getStats(),
      mcp: globalMCPClient.getStats(),
    };
  }

  /**
   * Execute command
   */
  async executeCommand(input: string): Promise<any> {
    if (!this.initialized) {
      throw new Error('Manus Agent not initialized');
    }

    // Parse command
    const [command, ...args] = input.trim().split(' ');

    if (!command.startsWith('/')) {
      // Regular query
      return { type: 'query', input };
    }

    // Execute command
    const cmd = globalCommandRegistry.getCommand(command.slice(1));
    if (!cmd) {
      return { type: 'error', message: `Unknown command: ${command}` };
    }

    try {
      await cmd.execute(args, {
        toolRegistry: globalToolRegistry,
        commandRegistry: globalCommandRegistry,
      });
      return { type: 'success' };
    } catch (error: any) {
      return { type: 'error', message: error.message };
    }
  }

  /**
   * Shutdown
   */
  async shutdown(): Promise<void> {
    console.log('[manus] Shutting down Manus Agent...');

    // Save auto memory
    await globalAutoMemory.save();

    // Save sessions
    for (const session of globalSessionManager.listSessions()) {
      await globalSessionManager.saveSession(session);
    }

    this.initialized = false;
    console.log('[manus] Manus Agent shutdown complete');
  }
}

/**
 * Export main classes and functions
 */
export { globalToolRegistry, globalCommandRegistry, globalSessionManager };
export { globalAutoMemory, globalMCPClient, globalBackupManager };
export { globalAgentPool, globalCoordinator } from './coordinator/Agent.js';

/**
 * Main entry point
 */
async function main() {
  const agent = new ManusAgent();

  try {
    // Initialize
    await agent.initialize();

    // Show status
    console.log(agent.getStatus());

    // Shutdown
    await agent.shutdown();
  } catch (error) {
    console.error(`Fatal error: ${error}`);
    process.exit(1);
  }
}

// Export for use as module
export default ManusAgent;

// Run main if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
