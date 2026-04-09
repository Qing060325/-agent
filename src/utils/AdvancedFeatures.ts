import type { Message } from '../types/index.js';

/**
 * Context Compressor - Compresses long conversation histories
 */
export class ContextCompressor {
  private compressionRatio: number = 0.5; // Keep 50% of messages

  /**
   * Compress message history
   */
  compress(messages: Message[], targetSize: number = 10): Message[] {
    if (messages.length <= targetSize) {
      return messages;
    }

    // Keep first and last messages, compress middle
    const first = messages.slice(0, 2);
    const last = messages.slice(-2);
    const middle = messages.slice(2, -2);

    // Sample middle messages
    const sampleSize = Math.max(1, Math.floor(middle.length * this.compressionRatio));
    const step = Math.floor(middle.length / sampleSize);
    const sampled = middle.filter((_, i) => i % step === 0);

    return [...first, ...sampled, ...last];
  }

  /**
   * Summarize messages
   */
  summarize(messages: Message[]): string {
    const summary = messages
      .map((msg) => `${msg.role}: ${msg.content.substring(0, 100)}...`)
      .join('\n');
    return summary;
  }
}

/**
 * Message Compressor - Compresses individual messages
 */
export class MessageCompressor {
  /**
   * Compress message content
   */
  compress(content: string): string {
    // Remove extra whitespace
    return content
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Decompress message content
   */
  decompress(content: string): string {
    // In production, would use actual decompression
    return content;
  }
}

/**
 * History Search - Searches message history
 */
export class HistorySearch {
  /**
   * Search by keyword
   */
  searchByKeyword(messages: Message[], keyword: string): Message[] {
    const lowerKeyword = keyword.toLowerCase();
    return messages.filter((msg) =>
      msg.content.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Search by role
   */
  searchByRole(messages: Message[], role: string): Message[] {
    return messages.filter((msg) => msg.role === role);
  }

  /**
   * Search by date range
   */
  searchByDateRange(
    messages: Message[],
    startTime: number,
    endTime: number
  ): Message[] {
    return messages.filter(
      (msg) => msg.timestamp >= startTime && msg.timestamp <= endTime
    );
  }

  /**
   * Search by regex
   */
  searchByRegex(messages: Message[], pattern: string): Message[] {
    try {
      const regex = new RegExp(pattern);
      return messages.filter((msg) => regex.test(msg.content));
    } catch {
      return [];
    }
  }

  /**
   * Fuzzy search
   */
  fuzzySearch(messages: Message[], query: string): Message[] {
    const lowerQuery = query.toLowerCase();
    return messages.filter((msg) => {
      let queryIndex = 0;
      for (const char of msg.content.toLowerCase()) {
        if (char === lowerQuery[queryIndex]) {
          queryIndex++;
        }
      }
      return queryIndex === lowerQuery.length;
    });
  }
}

/**
 * Undo/Redo Manager
 */
export class UndoRedoManager<T> {
  private history: T[] = [];
  private currentIndex: number = -1;

  /**
   * Push state
   */
  push(state: T): void {
    // Remove any redo history
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(state);
    this.currentIndex++;
  }

  /**
   * Undo
   */
  undo(): T | undefined {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return undefined;
  }

  /**
   * Redo
   */
  redo(): T | undefined {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return undefined;
  }

  /**
   * Get current state
   */
  getCurrent(): T | undefined {
    return this.history[this.currentIndex];
  }

  /**
   * Get history
   */
  getHistory(): T[] {
    return this.history;
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      totalStates: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.currentIndex > 0,
      canRedo: this.currentIndex < this.history.length - 1,
    };
  }
}

/**
 * Command Autocomplete
 */
export class CommandAutocomplete {
  private commands: string[] = [];

  constructor(commands: string[] = []) {
    this.commands = commands;
  }

  /**
   * Get suggestions
   */
  getSuggestions(input: string, limit: number = 5): string[] {
    const lowerInput = input.toLowerCase();
    return this.commands
      .filter((cmd) => cmd.toLowerCase().startsWith(lowerInput))
      .slice(0, limit);
  }

  /**
   * Get fuzzy suggestions
   */
  getFuzzySuggestions(input: string, limit: number = 5): string[] {
    const lowerInput = input.toLowerCase();
    return this.commands
      .filter((cmd) => {
        let inputIndex = 0;
        for (const char of cmd.toLowerCase()) {
          if (char === lowerInput[inputIndex]) {
            inputIndex++;
          }
        }
        return inputIndex === lowerInput.length;
      })
      .slice(0, limit);
  }

  /**
   * Add command
   */
  addCommand(command: string): void {
    if (!this.commands.includes(command)) {
      this.commands.push(command);
    }
  }

  /**
   * Remove command
   */
  removeCommand(command: string): void {
    const index = this.commands.indexOf(command);
    if (index !== -1) {
      this.commands.splice(index, 1);
    }
  }
}

/**
 * Data Encryption (simple XOR for demo, use real encryption in production)
 */
export class DataEncryption {
  /**
   * Encrypt data
   */
  encrypt(data: string, key: string): string {
    // In production, use proper encryption like AES
    return Buffer.from(data).toString('base64');
  }

  /**
   * Decrypt data
   */
  decrypt(encrypted: string, key: string): string {
    // In production, use proper decryption
    return Buffer.from(encrypted, 'base64').toString('utf-8');
  }
}

/**
 * Global instances
 */
export const globalContextCompressor = new ContextCompressor();
export const globalMessageCompressor = new MessageCompressor();
export const globalHistorySearch = new HistorySearch();
export const globalUndoRedoManager = new UndoRedoManager<any>();
export const globalDataEncryption = new DataEncryption();
