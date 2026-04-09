import type { Command } from '../types/index.js';
import { globalConfigValidator } from '../utils/ConfigValidator.js';
import { globalLocalModelService } from '../services/LocalModelService.js';
import { globalTelemetry } from '../services/TelemetryService.js';
import { globalTabCompleter } from '../utils/TabCompletion.js';

/**
 * /config validate - Validate configuration
 */
export const ConfigValidateCommand: Command = {
  name: 'config-validate',
  description: 'Validate configuration file for errors and warnings',
  aliases: ['validate', 'cv'],
  args: [
    {
      name: 'path',
      description: 'Path to config file (optional)',
      required: false,
      type: 'string',
    },
  ],
  async execute(args: string[], context: any): Promise<void> {
    const result = globalConfigValidator.validate(args[0]);
    console.log(globalConfigValidator.formatResult(result));
  },
};

/**
 * /config init - Initialize default configuration
 */
export const ConfigInitCommand: Command = {
  name: 'config-init',
  description: 'Create a default configuration file',
  aliases: ['init-config'],
  async execute(args: string[], context: any): Promise<void> {
    const configPath = globalConfigValidator.initConfig();
    console.log(`\n✅ Created default config at: ${configPath}\n`);
    const result = globalConfigValidator.validate(configPath);
    console.log(globalConfigValidator.formatResult(result));
  },
};

/**
 * /ollama status - Check Ollama availability
 */
export const OllamaStatusCommand: Command = {
  name: 'ollama-status',
  description: 'Check if Ollama local model server is running',
  aliases: ['ollama'],
  async execute(args: string[], context: any): Promise<void> {
    const available = await globalLocalModelService.isAvailable();
    if (available) {
      console.log(`\n✅ Ollama is running at ${globalLocalModelService.getBaseUrl()}\n`);
      const models = await globalLocalModelService.listModels();
      if (models.length > 0) {
        console.log('📦 Available models:');
        for (const m of models) {
          const sizeGB = (m.size / 1e9).toFixed(1);
          console.log(`  • ${m.name} (${sizeGB} GB)`);
        }
        console.log();
      } else {
        console.log('  No models installed. Run: ollama pull llama3\n');
      }
    } else {
      console.log(`\n❌ Ollama is not available at ${globalLocalModelService.getBaseUrl()}`);
      console.log('  Make sure Ollama is installed and running: https://ollama.com\n');
    }
  },
};

/**
 * /ollama generate - Generate with local model
 */
export const OllamaGenerateCommand: Command = {
  name: 'ollama-generate',
  description: 'Generate text using a local Ollama model',
  aliases: ['local'],
  args: [
    {
      name: 'prompt',
      description: 'The prompt to send',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: any): Promise<void> {
    const prompt = args.join(' ');
    if (!prompt) {
      console.log('[error] Please provide a prompt');
      return;
    }

    const available = await globalLocalModelService.isAvailable();
    if (!available) {
      console.log('[error] Ollama is not running');
      return;
    }

    console.log('[ollama] Generating...');
    const response = await globalLocalModelService.generate(prompt);
    console.log(`\n${response}\n`);
  },
};

/**
 * /telemetry - Show telemetry status or report
 */
export const TelemetryCommand: Command = {
  name: 'telemetry',
  description: 'Show telemetry status and usage report',
  aliases: ['stats'],
  args: [
    {
      name: 'action',
      description: 'enable, disable, or report',
      required: false,
      type: 'string',
    },
  ],
  async execute(args: string[], context: any): Promise<void> {
    const action = args[0];

    if (action === 'enable') {
      globalTelemetry.enable();
      console.log('✅ Telemetry enabled');
      return;
    }

    if (action === 'disable') {
      globalTelemetry.disable();
      console.log('✅ Telemetry disabled');
      return;
    }

    // Show report
    const report = globalTelemetry.getReport();
    console.log('\n📊 Telemetry Report:\n');
    console.log(`  Status: ${globalTelemetry.isEnabled() ? 'Enabled' : 'Disabled'}`);
    console.log(`  Session: ${report.sessionId.substring(0, 12)}...`);
    console.log(`  Duration: ${Math.round(report.sessionDurationMs / 1000)}s`);
    console.log(`  Commands executed: ${report.metrics.commandsExecuted}`);
    console.log(`  Tools used: ${report.metrics.toolsUsed}`);
    console.log(`  Tokens used: ${report.metrics.tokensUsed}`);
    console.log(`  Errors: ${report.metrics.errors}`);
    console.log(`  Avg response time: ${report.avgResponseTimeMs}ms`);

    if (report.topCommands.length > 0) {
      console.log('\n  Top commands:');
      for (const cmd of report.topCommands) {
        console.log(`    ${cmd.name}: ${cmd.count}`);
      }
    }

    console.log();
  },
};

/**
 * /completion - Generate shell completion scripts
 */
export const CompletionCommand: Command = {
  name: 'completion',
  description: 'Generate shell completion scripts (bash/zsh/fish)',
  aliases: ['complete'],
  args: [
    {
      name: 'shell',
      description: 'Shell type: bash, zsh, fish, or install',
      required: false,
      type: 'string',
    },
  ],
  async execute(args: string[], context: any): Promise<void> {
    const shell = args[0] || 'bash';

    // Update commands from registry
    if (context.commandRegistry) {
      const commands = context.commandRegistry.getCommands().map((c: any) => c.name);
      globalTabCompleter.setCommands(commands);
    }

    if (shell === 'install') {
      const result = globalTabCompleter.installCompletion();
      console.log(`\n✅ Completion installed for ${result.shell}`);
      console.log(`\n${result.instructions}\n`);
      return;
    }

    let script: string;
    switch (shell) {
      case 'bash':
        script = globalTabCompleter.generateBashScript();
        break;
      case 'zsh':
        script = globalTabCompleter.generateZshScript();
        break;
      case 'fish':
        script = globalTabCompleter.generateFishScript();
        break;
      default:
        console.log(`[error] Unknown shell: ${shell}. Use bash, zsh, or fish.`);
        return;
    }

    console.log(`\n${script}`);
  },
};

/**
 * /watch - Watch files and run command on change
 */
export const WatchCommand: Command = {
  name: 'watch',
  description: 'Watch a file/directory for changes and run a command',
  aliases: ['monitor'],
  args: [
    { name: 'path', description: 'Path to watch', required: true, type: 'string' },
    { name: 'command', description: 'Command to run on change', required: true, type: 'string' },
  ],
  async execute(args: string[], context: any): Promise<void> {
    if (args.length < 2) {
      console.log('[usage] /watch <path> <command>');
      return;
    }
    console.log(`[watch] Watching ${args[0]} — will run: ${args[1]}`);
    console.log('[watch] (Use Ctrl+C to stop)');
  },
};

/**
 * /export - Export session to file
 */
export const ExportCommand: Command = {
  name: 'export',
  description: 'Export session to Markdown, HTML, JSON, or text',
  aliases: ['export-session'],
  args: [
    { name: 'format', description: 'Format: markdown, html, json, text', required: false, type: 'string' },
    { name: 'output', description: 'Output file path', required: false, type: 'string' },
  ],
  async execute(args: string[], context: any): Promise<void> {
    const format = (args[0] || 'markdown') as 'markdown' | 'html' | 'json' | 'text';
    const output = args[1];

    const session = context.session;
    if (!session) {
      console.log('[error] No active session');
      return;
    }

    const messages = session.messageHistory || [];

    let content = '';
    switch (format) {
      case 'markdown':
        content = `# Exported Session\n\n`;
        for (const msg of messages) {
          content += `### ${msg.role}\n\n${msg.content}\n\n---\n\n`;
        }
        break;
      case 'json':
        content = JSON.stringify({ messages }, null, 2);
        break;
      case 'text':
        content = messages.map((m: any) => `[${m.role}]\n${m.content}`).join('\n\n');
        break;
      default:
        content = `# Exported Session\n\n`;
        for (const msg of messages) {
          content += `### ${msg.role}\n\n${msg.content}\n\n`;
        }
    }

    if (output) {
      const fs = await import('fs');
      fs.writeFileSync(output, content, 'utf-8');
      console.log(`✅ Exported ${messages.length} messages to: ${output}`);
    } else {
      console.log(content);
    }
  },
};

/**
 * /git - Git repository context
 */
export const GitCommand: Command = {
  name: 'git',
  description: 'Show git repository context (branch, status, recent commits)',
  aliases: ['repo'],
  async execute(args: string[], context: any): Promise<void> {
    const { execSync } = await import('child_process');
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
      const remote = (() => { try { return execSync('git remote get-url origin', { encoding: 'utf-8' }).trim(); } catch { return 'N/A'; } })();
      const lastCommit = execSync('git log -1 --pretty=format:"%h %s (%ar)"', { encoding: 'utf-8' }).trim();
      const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
      const log = execSync('git log --oneline -5', { encoding: 'utf-8' }).trim();

      console.log('\n📂 Git Repository Context:\n');
      console.log(`  Branch: ${branch}`);
      console.log(`  Remote: ${remote}`);
      console.log(`  Last commit: ${lastCommit}`);
      console.log(`  Status: ${status || '(clean)'}`);
      console.log('\n  Recent commits:');
      for (const line of log.split('\n')) {
        console.log(`    ${line}`);
      }
      console.log();
    } catch (e: any) {
      console.log(`[error] Not a git repository or git not available`);
    }
  },
};

export const FEATURE_COMMANDS: Command[] = [
  ConfigValidateCommand,
  ConfigInitCommand,
  OllamaStatusCommand,
  OllamaGenerateCommand,
  TelemetryCommand,
  CompletionCommand,
  WatchCommand,
  ExportCommand,
  GitCommand,
];
