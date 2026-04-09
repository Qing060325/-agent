export { CommandRegistry, globalCommandRegistry } from './CommandRegistry.js';
export { BASIC_COMMANDS } from './BasicCommands.js';
export { FILE_COMMANDS } from './FileCommands.js';
export { CODE_COMMANDS } from './CodeCommands.js';
export { WEB_COMMANDS } from './WebCommands.js';

import { CommandRegistry } from './CommandRegistry.js';
import { BASIC_COMMANDS } from './BasicCommands.js';
import { FILE_COMMANDS } from './FileCommands.js';
import { CODE_COMMANDS } from './CodeCommands.js';
import { WEB_COMMANDS } from './WebCommands.js';

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

  const stats = registry.getStats();
  console.log(
    `[commands] Registered ${stats.totalCommands} commands with ${stats.totalAliases} aliases`
  );
}
