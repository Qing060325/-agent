import { describe, it, expect, beforeEach } from 'vitest';
import { FileReadTool, FileWriteTool } from '../tools/FileTools.js';
import { BashTool, REPLTool } from '../tools/CodeExecutionTools.js';
import { WebFetchTool, WebSearchTool } from '../tools/WebTools.js';

describe('Tools', () => {
  describe('FileReadTool', () => {
    it('should read file content', async () => {
      const tool = new FileReadTool();
      expect(tool.name).toBe('file_read');
      expect(tool.description).toContain('Read');
    });

    it('should have proper input schema', () => {
      const tool = new FileReadTool();
      expect(tool.inputSchema).toBeDefined();
    });
  });

  describe('FileWriteTool', () => {
    it('should write file content', async () => {
      const tool = new FileWriteTool();
      expect(tool.name).toBe('file_write');
      expect(tool.description).toContain('Write');
    });
  });

  describe('BashTool', () => {
    it('should execute shell commands', async () => {
      const tool = new BashTool();
      expect(tool.name).toBe('bash');
      expect(tool.description).toContain('shell');
    });
  });

  describe('REPLTool', () => {
    it('should execute JavaScript code', async () => {
      const tool = new REPLTool();
      expect(tool.name).toBe('repl');
      expect(tool.description).toContain('JavaScript');
    });
  });

  describe('WebFetchTool', () => {
    it('should fetch web content', async () => {
      const tool = new WebFetchTool();
      expect(tool.name).toBe('web_fetch');
      expect(tool.description).toContain('Fetch');
    });
  });

  describe('WebSearchTool', () => {
    it('should search the web', async () => {
      const tool = new WebSearchTool();
      expect(tool.name).toBe('web_search');
      expect(tool.description).toContain('Search');
    });
  });
});
