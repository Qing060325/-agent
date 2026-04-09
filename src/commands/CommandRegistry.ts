import type { Command, CommandContext } from '../types/index.js';

/**
 * Registry for managing all available commands
 */
export class CommandRegistry {
  private commands: Map<string, Command> = new Map();
  private aliases: Map<string, string> = new Map();

  /**
   * Register a command
   */
  register(command: Command): void {
    this.commands.set(command.name, command);

    // Register aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias, command.name);
      }
    }
  }

  /**
   * Execute a command
   */
  async execute(
    commandName: string,
    args: string[],
    context: CommandContext
  ): Promise<void> {
    // Resolve alias to actual command name
    const actualName = this.aliases.get(commandName) || commandName;
    const command = this.commands.get(actualName);

    if (!command) {
      throw new Error(`Command ${commandName} not found`);
    }

    // Check feature gate
    if (command.featureGate && !this.isFeatureEnabled(command.featureGate)) {
      throw new Error(`Feature ${command.featureGate} not enabled`);
    }

    // Execute command
    await command.execute(args, context);
  }

  /**
   * Get all commands
   */
  getCommands(): Command[] {
    const seen = new Set<string>();
    return Array.from(this.commands.values()).filter((cmd) => {
      if (seen.has(cmd.name)) return false;
      seen.add(cmd.name);
      return true;
    });
  }

  /**
   * Get a specific command
   */
  getCommand(name: string): Command | undefined {
    const actualName = this.aliases.get(name) || name;
    return this.commands.get(actualName);
  }

  /**
   * Search commands
   */
  searchCommands(query: string): Command[] {
    const lowerQuery = query.toLowerCase();
    return this.getCommands().filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(lowerQuery) ||
        cmd.description.toLowerCase().includes(lowerQuery) ||
        cmd.aliases?.some((a) => a.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Check if feature is enabled
   */
  private isFeatureEnabled(featureName: string): boolean {
    // Check environment variable or build-time feature flag
    return process.env[`FEATURE_${featureName.toUpperCase()}`] === 'true';
  }

  /**
   * Get registry statistics
   */
  getStats() {
    return {
      totalCommands: this.commands.size,
      totalAliases: this.aliases.size,
      commands: Array.from(this.commands.keys()),
    };
  }

  /**
   * Unregister a command
   */
  unregister(commandName: string): boolean {
    const command = this.commands.get(commandName);
    if (!command) return false;

    this.commands.delete(commandName);

    // Remove aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.delete(alias);
      }
    }

    return true;
  }

  /**
   * Clear all commands
   */
  clear(): void {
    this.commands.clear();
    this.aliases.clear();
  }
}

/**
 * Global command registry instance
 */
export const globalCommandRegistry = new CommandRegistry();
