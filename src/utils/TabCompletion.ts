import * as fs from 'fs';
import * as path from 'path';

/**
 * Tab Completion - Auto-completion for CLI commands
 */
export class TabCompleter {
  private commands: string[] = [];
  private toolNames: string[] = [];

  constructor(commands: string[] = [], toolNames: string[] = []) {
    this.commands = commands;
    this.toolNames = toolNames;
  }

  /**
   * Update available commands
   */
  setCommands(commands: string[]): void {
    this.commands = commands;
  }

  /**
   * Update available tool names
   */
  setToolNames(names: string[]): void {
    this.toolNames = names;
  }

  /**
   * Complete a partial input
   */
  complete(partial: string): string[] {
    const input = partial.trim();

    // Command completion (starts with /)
    if (input.startsWith('/')) {
      const cmdPartial = input.slice(1).toLowerCase();
      return this.commands
        .filter((c) => c.toLowerCase().startsWith(cmdPartial))
        .map((c) => `/${c}`);
    }

    // Subcommand completion for specific commands
    const parts = input.split(/\s+/);
    if (parts.length === 2) {
      const cmd = parts[0].toLowerCase();

      if (cmd === '/session-resume' || cmd === '/resume' || cmd === '/sr') {
        // Complete with session IDs (would need session manager)
        return [];
      }

      if (cmd === '/list' || cmd === '/ls') {
        return ['tools', 'commands', 'sessions', 'agents']
          .filter((t) => t.startsWith(parts[1].toLowerCase()))
          .map((t) => `${cmd} ${t}`);
      }

      if (cmd === '/config') {
        return ['show', 'set', 'get', 'validate', 'reset']
          .filter((c) => c.startsWith(parts[1].toLowerCase()))
          .map((c) => `${cmd} ${c}`);
      }
    }

    // File path completion
    if (input.startsWith('/read ') || input.startsWith('/write ') || input.startsWith('/edit ')) {
      const filePartial = input.split(/\s+/).slice(1).join(' ');
      return this.completeFilePath(filePartial);
    }

    return [];
  }

  /**
   * Complete file paths
   */
  private completeFilePath(partial: string): string[] {
    try {
      const dir = path.dirname(partial) || '.';
      const base = path.basename(partial);

      if (!fs.existsSync(dir)) return [];

      const entries = fs.readdirSync(dir, { withFileTypes: true });
      return entries
        .filter((e) => e.name.startsWith(base))
        .map((e) => {
          const fullPath = path.join(dir, e.name);
          return e.isDirectory() ? `${fullPath}/` : fullPath;
        })
        .slice(0, 20);
    } catch {
      return [];
    }
  }

  /**
   * Generate bash completion script
   */
  generateBashScript(): string {
    return `# Manus Agent bash completion
_manus_completions()
{
  local cur prev commands
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"

  commands="${this.commands.join(' ')}"

  if [[ \${cur} == -* ]] ; then
    COMPREPLY=( $(compgen -W "--help --version --config" -- \${cur}) )
    return 0
  fi

  COMPREPLY=( $(compgen -W "\${commands}" -- \${cur}) )
  return 0
}

complete -F _manus_completions manus
`;
  }

  /**
   * Generate zsh completion script
   */
  generateZshScript(): string {
    const commandsDesc = this.commands.map((c) => `${c}`).join('\n      ');
    return `#compdef manus

_manus() {
  local -a commands
  commands=(
    ${commandsDesc}
  )

  if (( CURRENT == 2 )); then
    _describe -t commands 'manus commands' commands
  fi
}

_manus "$@"
`;
  }

  /**
   * Generate fish completion script
   */
  generateFishScript(): string {
    const lines = this.commands.map(
      (c) => `complete -c manus -n '__fish_use_subcommand' -a '${c}'`
    );
    return `# Manus Agent fish completions\n${lines.join('\n')}\n`;
  }

  /**
   * Install completion for current shell
   */
  installCompletion(): { shell: string; instructions: string } {
    const shell = process.env.SHELL || '';
    const homeDir = process.env.HOME || '/tmp';

    if (shell.includes('bash')) {
      const script = this.generateBashScript();
      const filePath = path.join(homeDir, '.manus-completion.bash');
      fs.writeFileSync(filePath, script, 'utf-8');
      return {
        shell: 'bash',
        instructions: `Add to ~/.bashrc:\n  source ${filePath}`,
      };
    }

    if (shell.includes('zsh')) {
      const script = this.generateZshScript();
      const completionsDir = path.join(homeDir, '.zsh', 'completions');
      if (!fs.existsSync(completionsDir)) {
        fs.mkdirSync(completionsDir, { recursive: true });
      }
      const filePath = path.join(completionsDir, '_manus');
      fs.writeFileSync(filePath, script, 'utf-8');
      return {
        shell: 'zsh',
        instructions: `Add to ~/.zshrc:\n  fpath=(~/.zsh/completions $fpath)\n  autoload -U compinit && compinit`,
      };
    }

    if (shell.includes('fish')) {
      const script = this.generateFishScript();
      const completionsDir = path.join(homeDir, '.config', 'fish', 'completions');
      if (!fs.existsSync(completionsDir)) {
        fs.mkdirSync(completionsDir, { recursive: true });
      }
      const filePath = path.join(completionsDir, 'manus.fish');
      fs.writeFileSync(filePath, script, 'utf-8');
      return {
        shell: 'fish',
        instructions: `Completion installed to ${filePath}. Restart fish to activate.`,
      };
    }

    return {
      shell: 'unknown',
      instructions: 'Run `manus completion --bash|--zsh|--fish` to generate completion script.',
    };
  }
}

export const globalTabCompleter = new TabCompleter();
