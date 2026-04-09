import type { Command, CommandContext } from '../types/index.js';

/**
 * /code command - Generate or modify code
 */
export const CodeCommand: Command = {
  name: 'code',
  description: 'Generate or modify code',
  aliases: ['gen', 'generate'],
  args: [
    {
      name: 'prompt',
      description: 'Code generation prompt',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const prompt = args.join(' ');
    if (!prompt) {
      console.log('[error] Please provide a code generation prompt');
      return;
    }

    if (!context.queryEngine) {
      console.log('[error] Query engine not available');
      return;
    }

    console.log(`[code] Generating code for: ${prompt}`);
    const result = await context.queryEngine.executeQuery(
      `Generate code for: ${prompt}`
    );
    console.log(result);
  },
};

/**
 * /debug command - Debug code
 */
export const DebugCommand: Command = {
  name: 'debug',
  description: 'Debug code or error',
  aliases: ['dbg'],
  args: [
    {
      name: 'issue',
      description: 'Code or error to debug',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const issue = args.join(' ');
    if (!issue) {
      console.log('[error] Please provide code or error to debug');
      return;
    }

    console.log(`[debug] Debugging: ${issue}`);
    console.log('[debug] Debug command not fully implemented');
  },
};

/**
 * /test command - Generate tests
 */
export const TestCommand: Command = {
  name: 'test',
  description: 'Generate or run tests',
  aliases: ['t'],
  args: [
    {
      name: 'target',
      description: 'Test target (file or function)',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const target = args[0];
    if (!target) {
      console.log('[error] Please provide a test target');
      return;
    }

    console.log(`[test] Generating tests for: ${target}`);
    console.log('[test] Test command not fully implemented');
  },
};

/**
 * /refactor command - Refactor code
 */
export const RefactorCommand: Command = {
  name: 'refactor',
  description: 'Refactor code',
  aliases: ['ref'],
  args: [
    {
      name: 'file',
      description: 'File to refactor',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const file = args[0];
    if (!file) {
      console.log('[error] Please provide a file to refactor');
      return;
    }

    console.log(`[refactor] Refactoring: ${file}`);
    console.log('[refactor] Refactor command not fully implemented');
  },
};

/**
 * /analyze command - Analyze code
 */
export const AnalyzeCommand: Command = {
  name: 'analyze',
  description: 'Analyze code quality',
  aliases: ['lint'],
  args: [
    {
      name: 'file',
      description: 'File to analyze',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const file = args[0];
    if (!file) {
      console.log('[error] Please provide a file to analyze');
      return;
    }

    console.log(`[analyze] Analyzing: ${file}`);
    console.log('[analyze] Analyze command not fully implemented');
  },
};

/**
 * /execute command - Execute code
 */
export const ExecuteCommand: Command = {
  name: 'execute',
  description: 'Execute code or script',
  aliases: ['exec', 'run'],
  args: [
    {
      name: 'code',
      description: 'Code to execute',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const code = args.join(' ');
    if (!code) {
      console.log('[error] Please provide code to execute');
      return;
    }

    const tool = context.toolRegistry?.getTool('repl');
    if (!tool) {
      console.log('[error] repl tool not available');
      return;
    }

    const result = await tool.execute({ code }, context);
    if (result.success) {
      console.log(`[execute] Result: ${result.result?.output}`);
    } else {
      console.log(`[error] ${result.error}`);
    }
  },
};

/**
 * /bash command - Execute shell command
 */
export const BashCommand: Command = {
  name: 'bash',
  description: 'Execute shell command',
  aliases: ['sh', 'shell'],
  args: [
    {
      name: 'command',
      description: 'Shell command to execute',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const command = args.join(' ');
    if (!command) {
      console.log('[error] Please provide a shell command');
      return;
    }

    const tool = context.toolRegistry?.getTool('bash');
    if (!tool) {
      console.log('[error] bash tool not available');
      return;
    }

    const result = await tool.execute({ command }, context);
    if (result.success) {
      console.log(`[bash] ${result.result?.stdout}`);
      if (result.result?.stderr) {
        console.error(`[bash] stderr: ${result.result.stderr}`);
      }
    } else {
      console.log(`[error] ${result.error}`);
    }
  },
};

/**
 * All code commands
 */
export const CODE_COMMANDS: Command[] = [
  CodeCommand,
  DebugCommand,
  TestCommand,
  RefactorCommand,
  AnalyzeCommand,
  ExecuteCommand,
  BashCommand,
];
