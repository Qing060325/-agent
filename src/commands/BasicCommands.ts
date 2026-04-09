import type { Command, CommandContext } from '../types/index.js';

/**
 * /ask command - Ask a question
 */
export const AskCommand: Command = {
  name: 'ask',
  description: 'Ask a question or give a task',
  aliases: ['?', 'q'],
  args: [
    {
      name: 'question',
      description: 'The question to ask',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const question = args.join(' ');
    if (!question) {
      console.log('[error] Please provide a question');
      return;
    }

    if (!context.queryEngine) {
      console.log('[error] Query engine not available');
      return;
    }

    console.log(`[ask] ${question}`);
    const result = await context.queryEngine.executeQuery(question);
    console.log(`[result] ${result}`);
  },
};

/**
 * /help command - Show help
 */
export const HelpCommand: Command = {
  name: 'help',
  description: 'Show help information',
  aliases: ['h', '?'],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const commands = context.commandRegistry?.getCommands() || [];

    console.log('\n📚 Available Commands:\n');
    for (const cmd of commands) {
      console.log(`  /${cmd.name.padEnd(15)} - ${cmd.description}`);
      if (cmd.aliases && cmd.aliases.length > 0) {
        console.log(`                   Aliases: ${cmd.aliases.join(', ')}`);
      }
    }
    console.log();
  },
};

/**
 * /clear command - Clear session
 */
export const ClearCommand: Command = {
  name: 'clear',
  description: 'Clear the current session',
  aliases: ['cls', 'reset'],
  async execute(args: string[], context: CommandContext): Promise<void> {
    if (!context.session) {
      console.log('[error] No session available');
      return;
    }

    context.session.messageHistory = [];
    console.log('[clear] Session cleared');
  },
};

/**
 * /version command - Show version
 */
export const VersionCommand: Command = {
  name: 'version',
  description: 'Show version information',
  aliases: ['v'],
  async execute(args: string[], context: CommandContext): Promise<void> {
    console.log('Manus Agent v1.0.0');
    console.log('Build: 2026-04-10');
    console.log('Node: ' + process.version);
  },
};

/**
 * /exit command - Exit the application
 */
export const ExitCommand: Command = {
  name: 'exit',
  description: 'Exit the application',
  aliases: ['quit', 'q'],
  async execute(args: string[], context: CommandContext): Promise<void> {
    console.log('[exit] Goodbye!');
    process.exit(0);
  },
};

/**
 * /config command - Show configuration
 */
export const ConfigCommand: Command = {
  name: 'config',
  description: 'Show or modify configuration',
  aliases: ['cfg'],
  async execute(args: string[], context: CommandContext): Promise<void> {
    if (args.length === 0) {
      console.log('\n⚙️ Configuration:\n');
      console.log('  Model: claude-3-5-sonnet');
      console.log('  Temperature: 0.7');
      console.log('  Max Tokens: 100000');
      console.log();
    } else {
      console.log('[config] Configuration command not fully implemented');
    }
  },
};

/**
 * /status command - Show status
 */
export const StatusCommand: Command = {
  name: 'status',
  description: 'Show system status',
  aliases: ['stat'],
  async execute(args: string[], context: CommandContext): Promise<void> {
    console.log('\n📊 System Status:\n');
    console.log('  Status: Running');
    console.log('  Session: ' + (context.session?.id || 'None'));
    console.log('  Messages: ' + (context.session?.messageHistory.length || 0));
    console.log('  Uptime: ' + Math.floor(process.uptime()) + 's');
    console.log();
  },
};

/**
 * /list command - List items
 */
export const ListCommand: Command = {
  name: 'list',
  description: 'List available items (tools, commands, sessions)',
  aliases: ['ls'],
  args: [
    {
      name: 'type',
      description: 'Type to list (tools, commands, sessions)',
      required: false,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const type = args[0] || 'commands';

    switch (type) {
      case 'tools':
        console.log('[list] Available tools:');
        const tools = context.toolRegistry?.getTools() || [];
        tools.forEach((tool) => {
          console.log(`  - ${tool.name}: ${tool.description}`);
        });
        break;

      case 'commands':
        console.log('[list] Available commands:');
        const commands = context.commandRegistry?.getCommands() || [];
        commands.forEach((cmd) => {
          console.log(`  - /${cmd.name}: ${cmd.description}`);
        });
        break;

      case 'sessions':
        console.log('[list] Available sessions:');
        // TODO: List sessions
        break;

      default:
        console.log(`[error] Unknown type: ${type}`);
    }
  },
};

/**
 * /info command - Show information
 */
export const InfoCommand: Command = {
  name: 'info',
  description: 'Show information about Manus Agent',
  aliases: ['about'],
  async execute(args: string[], context: CommandContext): Promise<void> {
    console.log('\n🚀 Manus Agent v1.0\n');
    console.log('Enterprise-grade AI Agent Platform');
    console.log('');
    console.log('Features:');
    console.log('  • 40+ Built-in Tools');
    console.log('  • 88+ Slash Commands');
    console.log('  • Intelligent Query Engine');
    console.log('  • Multi-Agent Coordination');
    console.log('  • MCP Integration');
    console.log('  • Plugin System');
    console.log('  • Session Management');
    console.log('  • Token Budget Management');
    console.log('');
    console.log('GitHub: https://github.com/Qing060325/-agent');
    console.log('');
  },
};

/**
 * All basic commands
 */
export const BASIC_COMMANDS: Command[] = [
  AskCommand,
  HelpCommand,
  ClearCommand,
  VersionCommand,
  ExitCommand,
  ConfigCommand,
  StatusCommand,
  ListCommand,
  InfoCommand,
];
