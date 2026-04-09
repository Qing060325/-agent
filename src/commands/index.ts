export { CommandRegistry, globalCommandRegistry } from './CommandRegistry.js';
export { BASIC_COMMANDS } from './BasicCommands.js';
export { FILE_COMMANDS } from './FileCommands.js';
export { CODE_COMMANDS } from './CodeCommands.js';
export { WEB_COMMANDS } from './WebCommands.js';
export { AGENT_COMMANDS } from './AgentCommands.js';
export { MCP_COMMANDS } from './MCPCommands.js';
export { ADVANCED_COMMANDS } from './AdvancedCommands.js';
export { DATABASE_COMMANDS } from './DatabaseCommands.js';
export { DATA_ANALYSIS_COMMANDS } from './DataAnalysisCommands.js';
export { MEDIA_COMMANDS } from './MediaCommands.js';
export { DOCUMENT_COMMANDS } from './DocumentCommands.js';
export { CLOUD_COMMANDS } from './CloudCommands.js';
export { ADVANCED_WEB_COMMANDS } from './AdvancedWebCommands.js';

import { CommandRegistry } from './CommandRegistry.js';
import { BASIC_COMMANDS } from './BasicCommands.js';
import { FILE_COMMANDS } from './FileCommands.js';
import { CODE_COMMANDS } from './CodeCommands.js';
import { WEB_COMMANDS } from './WebCommands.js';
import { AGENT_COMMANDS } from './AgentCommands.js';
import { MCP_COMMANDS } from './MCPCommands.js';
import { ADVANCED_COMMANDS } from './AdvancedCommands.js';
import { DATABASE_COMMANDS } from './DatabaseCommands.js';
import { DATA_ANALYSIS_COMMANDS } from './DataAnalysisCommands.js';
import { MEDIA_COMMANDS } from './MediaCommands.js';
import { DOCUMENT_COMMANDS } from './DocumentCommands.js';
import { CLOUD_COMMANDS } from './CloudCommands.js';
import { ADVANCED_WEB_COMMANDS } from './AdvancedWebCommands.js';

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

  // Register database commands
  DATABASE_COMMANDS.forEach((cmd) => registry.register(cmd));

  // Register data analysis commands
  DATA_ANALYSIS_COMMANDS.forEach((cmd) => registry.register(cmd));

  // Register media commands
  MEDIA_COMMANDS.forEach((cmd) => registry.register(cmd));

  // Register document commands
  DOCUMENT_COMMANDS.forEach((cmd) => registry.register(cmd));

  // Register cloud commands
  CLOUD_COMMANDS.forEach((cmd) => registry.register(cmd));

  // Register advanced web commands
  ADVANCED_WEB_COMMANDS.forEach((cmd) => registry.register(cmd));

  const stats = registry.getStats();
  console.log(
    `[commands] Registered ${stats.totalCommands} commands with ${stats.totalAliases} aliases`
  );
  console.log(
    `[commands] Categories: Basic(9), File(6), Code(7), Web(4), Agent(3), MCP(3), Advanced(8), Database(8), Analysis(8), Media(8), Document(8), Cloud(8), AdvancedWeb(8)`
  );
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
    database: DATABASE_COMMANDS,
    dataAnalysis: DATA_ANALYSIS_COMMANDS,
    media: MEDIA_COMMANDS,
    document: DOCUMENT_COMMANDS,
    cloud: CLOUD_COMMANDS,
    advancedWeb: ADVANCED_WEB_COMMANDS,
  };
}

/**
 * Get command count by category
 */
export function getCommandStats() {
  return {
    basic: BASIC_COMMANDS.length,
    file: FILE_COMMANDS.length,
    code: CODE_COMMANDS.length,
    web: WEB_COMMANDS.length,
    agent: AGENT_COMMANDS.length,
    mcp: MCP_COMMANDS.length,
    advanced: ADVANCED_COMMANDS.length,
    database: DATABASE_COMMANDS.length,
    dataAnalysis: DATA_ANALYSIS_COMMANDS.length,
    media: MEDIA_COMMANDS.length,
    document: DOCUMENT_COMMANDS.length,
    cloud: CLOUD_COMMANDS.length,
    advancedWeb: ADVANCED_WEB_COMMANDS.length,
    total: BASIC_COMMANDS.length +
           FILE_COMMANDS.length +
           CODE_COMMANDS.length +
           WEB_COMMANDS.length +
           AGENT_COMMANDS.length +
           MCP_COMMANDS.length +
           ADVANCED_COMMANDS.length +
           DATABASE_COMMANDS.length +
           DATA_ANALYSIS_COMMANDS.length +
           MEDIA_COMMANDS.length +
           DOCUMENT_COMMANDS.length +
           CLOUD_COMMANDS.length +
           ADVANCED_WEB_COMMANDS.length,
  };
}
