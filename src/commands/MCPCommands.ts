import type { Command, CommandContext } from '../types/index.js';

/**
 * /mcp command - Manage MCP servers
 */
export const MCPCommand: Command = {
  name: 'mcp',
  description: 'Manage MCP (Model Context Protocol) servers',
  aliases: ['mcp-server'],
  args: [
    {
      name: 'action',
      description: 'Action (list, add, remove, call)',
      required: true,
      type: 'string',
    },
    {
      name: 'args',
      description: 'Additional arguments',
      required: false,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const [action, ...rest] = args;
    if (!action) {
      console.log('[error] Please provide an action');
      return;
    }

    switch (action) {
      case 'list':
        console.log('[mcp] Registered MCP servers:');
        console.log('[mcp] No servers registered yet');
        break;

      case 'add':
        if (rest.length < 2) {
          console.log('[error] Usage: /mcp add <name> <command> [args...]');
          return;
        }
        const [name, command, ...cmdArgs] = rest;
        console.log(`[mcp] Adding server: ${name}`);
        console.log(`[mcp] Command: ${command} ${cmdArgs.join(' ')}`);
        break;

      case 'remove':
        if (rest.length === 0) {
          console.log('[error] Usage: /mcp remove <name>');
          return;
        }
        console.log(`[mcp] Removing server: ${rest[0]}`);
        break;

      case 'call':
        if (rest.length < 2) {
          console.log('[error] Usage: /mcp call <server> <tool> [input...]');
          return;
        }
        const [server, tool, ...input] = rest;
        console.log(`[mcp] Calling tool: ${server}:${tool}`);
        console.log(`[mcp] Input: ${input.join(' ')}`);
        break;

      default:
        console.log(`[error] Unknown action: ${action}`);
    }
  },
};

/**
 * /plugin command - Manage plugins
 */
export const PluginCommand: Command = {
  name: 'plugin',
  description: 'Manage plugins',
  aliases: ['ext'],
  args: [
    {
      name: 'action',
      description: 'Action (list, install, remove, enable, disable)',
      required: true,
      type: 'string',
    },
    {
      name: 'pluginId',
      description: 'Plugin ID',
      required: false,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const [action, pluginId] = args;
    if (!action) {
      console.log('[error] Please provide an action');
      return;
    }

    switch (action) {
      case 'list':
        console.log('[plugin] Installed plugins:');
        console.log('[plugin] No plugins installed yet');
        break;

      case 'install':
        if (!pluginId) {
          console.log('[error] Usage: /plugin install <plugin-id>');
          return;
        }
        console.log(`[plugin] Installing plugin: ${pluginId}`);
        break;

      case 'remove':
        if (!pluginId) {
          console.log('[error] Usage: /plugin remove <plugin-id>');
          return;
        }
        console.log(`[plugin] Removing plugin: ${pluginId}`);
        break;

      case 'enable':
        if (!pluginId) {
          console.log('[error] Usage: /plugin enable <plugin-id>');
          return;
        }
        console.log(`[plugin] Enabling plugin: ${pluginId}`);
        break;

      case 'disable':
        if (!pluginId) {
          console.log('[error] Usage: /plugin disable <plugin-id>');
          return;
        }
        console.log(`[plugin] Disabling plugin: ${pluginId}`);
        break;

      default:
        console.log(`[error] Unknown action: ${action}`);
    }
  },
};

/**
 * /skill command - Manage skills
 */
export const SkillCommand: Command = {
  name: 'skill',
  description: 'Manage skills',
  aliases: ['sk'],
  args: [
    {
      name: 'action',
      description: 'Action (list, search, use)',
      required: true,
      type: 'string',
    },
    {
      name: 'skillId',
      description: 'Skill ID or search query',
      required: false,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const [action, skillId] = args;
    if (!action) {
      console.log('[error] Please provide an action');
      return;
    }

    switch (action) {
      case 'list':
        console.log('[skill] Available skills:');
        console.log('[skill] No skills available yet');
        break;

      case 'search':
        if (!skillId) {
          console.log('[error] Usage: /skill search <query>');
          return;
        }
        console.log(`[skill] Searching for skills: ${skillId}`);
        break;

      case 'use':
        if (!skillId) {
          console.log('[error] Usage: /skill use <skill-id>');
          return;
        }
        console.log(`[skill] Using skill: ${skillId}`);
        break;

      default:
        console.log(`[error] Unknown action: ${action}`);
    }
  },
};

/**
 * All MCP-related commands
 */
export const MCP_COMMANDS: Command[] = [MCPCommand, PluginCommand, SkillCommand];
