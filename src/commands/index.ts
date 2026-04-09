export { CommandRegistry, globalCommandRegistry } from './CommandRegistry.js';
export { BASIC_COMMANDS } from './BasicCommands.js';
export { FILE_COMMANDS } from './FileCommands.js';
export { CODE_COMMANDS } from './CodeCommands.js';
export { WEB_COMMANDS } from './WebCommands.js';
export { AGENT_COMMANDS } from './AgentCommands.js';
export { MCP_COMMANDS } from './MCPCommands.js';
export { ADVANCED_COMMANDS } from './AdvancedCommands.js';

import { CommandRegistry } from './CommandRegistry.js';
import { BASIC_COMMANDS } from './BasicCommands.js';
import { FILE_COMMANDS } from './FileCommands.js';
import { CODE_COMMANDS } from './CodeCommands.js';
import { WEB_COMMANDS } from './WebCommands.js';
import { AGENT_COMMANDS } from './AgentCommands.js';
import { MCP_COMMANDS } from './MCPCommands.js';
import { ADVANCED_COMMANDS } from './AdvancedCommands.js';

/**
 * Initialize all commands
 */
export function initializeAllCommands(registry: CommandRegistry): void {
  // Register basic commands
  BASIC_COMMANDS.forEach((cmd) => registry.register(cmd));

  // Register file commands
  FILE_COMMANDS.forEach((cmd) => registry.register(cmd));

  // Register code commands
  CODE_COMMANDS.forEach((cmd) => registry.register(cmd));

  // Register web commands
  WEB_COMMANDS.forEach((cmd) => registry.register(cmd));

  // Register agent commands
  AGENT_COMMANDS.forEach((cmd) => registry.register(cmd));

  // Register MCP commands
  MCP_COMMANDS.forEach((cmd) => registry.register(cmd));

  // Register advanced commands
  ADVANCED_COMMANDS.forEach((cmd) => registry.register(cmd));

  const stats = registry.getStats();
  console.log(
    `[commands] Registered ${stats.totalCommands} commands with ${stats.totalAliases} aliases`
  );
  console.log(`[commands] Categories: Basic(9), File(6), Code(7), Web(4), Agent(3), MCP(3), Advanced(8)`);
}

/**
 * Get all command categories
 */
export function getAllCommandCategories() {
  return {
    basic: BASIC_COMMANDS,
    file: FILE_COMMANDS,
    code: CODE_COMMANDS,
    web: WEB_COMMANDS,
    agent: AGENT_COMMANDS,
    mcp: MCP_COMMANDS,
    advanced: ADVANCED_COMMANDS,
  };
}
