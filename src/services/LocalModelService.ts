import * as http from 'http';
import * as https from 'https';

/**
 * Ollama Local Model Service - Support for local LLM inference
 */
export class LocalModelService {
  private baseUrl: string;
  private defaultModel: string;
  private availableModels: string[] = [];

  constructor(config: LocalModelConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.defaultModel = config.defaultModel || 'llama3';
  }

  /**
   * Check if Ollama is running
   */
  async isAvailable(): Promise<boolean> {
    try {
      const res = await this.httpGet(`${this.baseUrl}/api/tags`);
      return res !== null;
    } catch {
      return false;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<ModelInfo[]> {
    try {
      const res = await this.httpGet(`${this.baseUrl}/api/tags`);
      if (!res) return [];

      const data = JSON.parse(res);
      this.availableModels = (data.models || []).map((m: any) => m.name);
      return (data.models || []).map((m: any) => ({
        name: m.name,
        size: m.size,
        modifiedAt: m.modified_at,
        digest: m.digest,
        details: m.details,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Pull a model
   */
  async pullModel(modelName: string): Promise<boolean> {
    try {
      const data = JSON.stringify({ name: modelName, stream: false });
      await this.httpPost(`${this.baseUrl}/api/pull`, data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a completion
   */
  async generate(prompt: string, options: GenerateOptions = {}): Promise<string> {
    const model = options.model || this.defaultModel;
    const data = JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens ?? 2048,
        top_p: options.topP ?? 0.9,
      },
    });

    try {
      const res = await this.httpPost(`${this.baseUrl}/api/generate`, data);
      if (!res) return '[error] No response from Ollama';

      const parsed = JSON.parse(res);
      return parsed.response || '[error] Empty response';
    } catch (error: any) {
      return `[error] Ollama request failed: ${error.message}`;
    }
  }

  /**
   * Generate a streaming completion
   */
  async *generateStream(
    prompt: string,
    options: GenerateOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const model = options.model || this.defaultModel;

    try {
      const body = JSON.stringify({
        model,
        prompt,
        stream: true,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 2048,
        },
      });

      const res = await this.httpPostStream(`${this.baseUrl}/api/generate`, body);

      for await (const chunk of res) {
        try {
          const parsed = JSON.parse(chunk);
          if (parsed.response) {
            yield parsed.response;
          }
          if (parsed.done) return;
        } catch {
          // Skip malformed chunks
        }
      }
    } catch (error: any) {
      yield `[error] Streaming failed: ${error.message}`;
    }
  }

  /**
   * Chat completion
   */
  async chat(messages: ChatMessage[], options: GenerateOptions = {}): Promise<string> {
    const model = options.model || this.defaultModel;
    const data = JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
      },
    });

    try {
      const res = await this.httpPost(`${this.baseUrl}/api/chat`, data);
      if (!res) return '[error] No response from Ollama';

      const parsed = JSON.parse(res);
      return parsed.message?.content || '[error] Empty response';
    } catch (error: any) {
      return `[error] Ollama chat failed: ${error.message}`;
    }
  }

  /**
   * Get model info
   */
  async getModelInfo(modelName: string): Promise<any> {
    try {
      const data = JSON.stringify({ name: modelName });
      const res = await this.httpPost(`${this.baseUrl}/api/show`, data);
      return res ? JSON.parse(res) : null;
    } catch {
      return null;
    }
  }

  /**
   * Simple HTTP GET
   */
  private httpGet(url: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      client
        .get(url, (res) => {
          let data = '';
          res.on('data', (chunk: Buffer) => (data += chunk));
          res.on('end', () => resolve(data));
        })
        .on('error', reject);
    });
  }

  /**
   * Simple HTTP POST
   */
  private httpPost(url: string, body: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => (data += chunk));
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  /**
   * HTTP POST with streaming response
   */
  private async httpPostStream(
    url: string,
    body: string
  ): Promise<AsyncIterable<string>> {
    return {
      [Symbol.asyncIterator]: async function* () {
        const client = url.startsWith('https') ? https : http;
        const parsedUrl = new URL(url);

        yield* await new Promise<string[]>((resolve, reject) => {
          const chunks: string[] = [];
          const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(body),
            },
          };

          const req = client.request(options, (res) => {
            res.on('data', (chunk: Buffer) => chunks.push(chunk.toString()));
            res.on('end', () => resolve(chunks));
          });
          req.on('error', reject);
          req.write(body);
          req.end();
        });
      },
    };
  }

  /**
   * Get configured base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Set base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Set default model
   */
  setDefaultModel(model: string): void {
    this.defaultModel = model;
  }
}

export interface LocalModelConfig {
  baseUrl?: string;
  defaultModel?: string;
}

export interface ModelInfo {
  name: string;
  size: number;
  modifiedAt: string;
  digest: string;
  details?: any;
}

export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const globalLocalModelService = new LocalModelService();
