import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Auto Memory System - Automatically saves and manages MEMORY.md
 */
export class AutoMemory {
  private memoryFile: string;
  private content: string = '';
  private lastSaved: number = 0;
  private saveInterval: number = 5000; // 5 seconds

  constructor(memoryFile: string = '.manus/MEMORY.md') {
    this.memoryFile = memoryFile;
  }

  /**
   * Initialize auto memory
   */
  async initialize(): Promise<void> {
    try {
      const dir = path.dirname(this.memoryFile);
      await fs.mkdir(dir, { recursive: true });

      // Load existing memory
      try {
        this.content = await fs.readFile(this.memoryFile, 'utf-8');
      } catch {
        // File doesn't exist yet
        this.content = this.getDefaultMemory();
        await this.save();
      }
    } catch (error) {
      console.error(`Failed to initialize auto memory: ${error}`);
    }
  }

  /**
   * Add memory entry
   */
  async addEntry(category: string, entry: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const line = `- [${timestamp}] ${entry}`;

    // Find or create category section
    const categoryHeader = `## ${category}`;
    if (this.content.includes(categoryHeader)) {
      // Add to existing category
      const lines = this.content.split('\n');
      const categoryIndex = lines.findIndex((l) => l === categoryHeader);
      if (categoryIndex !== -1) {
        // Find the next section or end of content
        let nextSectionIndex = lines.length;
        for (let i = categoryIndex + 1; i < lines.length; i++) {
          if (lines[i].startsWith('## ')) {
            nextSectionIndex = i;
            break;
          }
        }
        lines.splice(nextSectionIndex, 0, line);
        this.content = lines.join('\n');
      }
    } else {
      // Add new category
      this.content += `\n${categoryHeader}\n${line}\n`;
    }

    await this.saveIfNeeded();
  }

  /**
   * Update memory section
   */
  async updateSection(section: string, content: string): Promise<void> {
    const sectionHeader = `## ${section}`;
    const lines = this.content.split('\n');
    const sectionIndex = lines.findIndex((l) => l === sectionHeader);

    if (sectionIndex !== -1) {
      // Find next section
      let nextSectionIndex = lines.length;
      for (let i = sectionIndex + 1; i < lines.length; i++) {
        if (lines[i].startsWith('## ')) {
          nextSectionIndex = i;
          break;
        }
      }

      // Replace section content
      lines.splice(sectionIndex + 1, nextSectionIndex - sectionIndex - 1, content);
      this.content = lines.join('\n');
    } else {
      // Add new section
      this.content += `\n${sectionHeader}\n${content}\n`;
    }

    await this.saveIfNeeded();
  }

  /**
   * Get memory section
   */
  getSection(section: string): string {
    const sectionHeader = `## ${section}`;
    const lines = this.content.split('\n');
    const sectionIndex = lines.findIndex((l) => l === sectionHeader);

    if (sectionIndex === -1) {
      return '';
    }

    // Find next section
    let nextSectionIndex = lines.length;
    for (let i = sectionIndex + 1; i < lines.length; i++) {
      if (lines[i].startsWith('## ')) {
        nextSectionIndex = i;
        break;
      }
    }

    return lines.slice(sectionIndex + 1, nextSectionIndex).join('\n');
  }

  /**
   * Get all memory content
   */
  getContent(): string {
    return this.content;
  }

  /**
   * Save memory if needed (debounced)
   */
  private async saveIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastSaved > this.saveInterval) {
      await this.save();
    }
  }

  /**
   * Save memory to file
   */
  async save(): Promise<void> {
    try {
      await fs.writeFile(this.memoryFile, this.content, 'utf-8');
      this.lastSaved = Date.now();
    } catch (error) {
      console.error(`Failed to save memory: ${error}`);
    }
  }

  /**
   * Clear memory
   */
  async clear(): Promise<void> {
    this.content = this.getDefaultMemory();
    await this.save();
  }

  /**
   * Get default memory template
   */
  private getDefaultMemory(): string {
    return `# Manus Agent Memory

## Session Info
- Session started at ${new Date().toISOString()}

## Key Information
- No information yet

## Tasks
- No tasks yet

## Notes
- No notes yet

## Learned Patterns
- No patterns learned yet
`;
  }
}

/**
 * Global auto memory instance
 */
export const globalAutoMemory = new AutoMemory();
