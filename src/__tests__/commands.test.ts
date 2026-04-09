import { describe, it, expect, beforeEach } from 'vitest';
import { CommandRegistry } from '../commands/CommandRegistry.js';
import { BASIC_COMMANDS } from '../commands/BasicCommands.js';
import { FILE_COMMANDS } from '../commands/FileCommands.js';
import { CODE_COMMANDS } from '../commands/CodeCommands.js';

describe('Commands', () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  describe('CommandRegistry', () => {
    it('should register commands', () => {
      BASIC_COMMANDS.forEach((cmd) => registry.register(cmd));
      expect(registry.getStats().totalCommands).toBe(BASIC_COMMANDS.length);
    });

    it('should get command by name', () => {
      registry.register(BASIC_COMMANDS[0]);
      const cmd = registry.getCommand(BASIC_COMMANDS[0].name);
      expect(cmd).toBeDefined();
      expect(cmd?.name).toBe(BASIC_COMMANDS[0].name);
    });

    it('should get command by alias', () => {
      registry.register(BASIC_COMMANDS[0]);
      const alias = BASIC_COMMANDS[0].aliases?.[0];
      if (alias) {
        const cmd = registry.getCommand(alias);
        expect(cmd).toBeDefined();
      }
    });

    it('should search commands', () => {
      BASIC_COMMANDS.forEach((cmd) => registry.register(cmd));
      const results = registry.searchCommands('help');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('BasicCommands', () => {
    it('should have ask command', () => {
      const cmd = BASIC_COMMANDS.find((c) => c.name === 'ask');
      expect(cmd).toBeDefined();
      expect(cmd?.description).toContain('ask');
    });

    it('should have help command', () => {
      const cmd = BASIC_COMMANDS.find((c) => c.name === 'help');
      expect(cmd).toBeDefined();
    });

    it('should have version command', () => {
      const cmd = BASIC_COMMANDS.find((c) => c.name === 'version');
      expect(cmd).toBeDefined();
    });
  });

  describe('FileCommands', () => {
    it('should have read command', () => {
      const cmd = FILE_COMMANDS.find((c) => c.name === 'read');
      expect(cmd).toBeDefined();
    });

    it('should have write command', () => {
      const cmd = FILE_COMMANDS.find((c) => c.name === 'write');
      expect(cmd).toBeDefined();
    });

    it('should have search command', () => {
      const cmd = FILE_COMMANDS.find((c) => c.name === 'search');
      expect(cmd).toBeDefined();
    });
  });

  describe('CodeCommands', () => {
    it('should have code command', () => {
      const cmd = CODE_COMMANDS.find((c) => c.name === 'code');
      expect(cmd).toBeDefined();
    });

    it('should have execute command', () => {
      const cmd = CODE_COMMANDS.find((c) => c.name === 'execute');
      expect(cmd).toBeDefined();
    });

    it('should have bash command', () => {
      const cmd = CODE_COMMANDS.find((c) => c.name === 'bash');
      expect(cmd).toBeDefined();
    });
  });
});
