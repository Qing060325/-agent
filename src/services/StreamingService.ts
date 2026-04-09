import type { QueryEngineConfig } from '../types/index.js';
import { EventEmitter } from 'events';

/**
 * Streaming Service - Server-Sent Events based streaming responses
 */
export class StreamingService extends EventEmitter {
  private config: QueryEngineConfig;
  private activeStreams: Map<string, AbortController> = new Map();

  constructor(config: QueryEngineConfig = {}) {
    super();
    this.config = config;
  }

  /**
   * Create a streaming response generator
   */
  async *streamQuery(
    query: string,
    sessionId: string
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const abortController = new AbortController();
    this.activeStreams.set(sessionId, abortController);

    try {
      // Simulate token-by-token streaming
      // In production, this would connect to the actual LLM API with SSE
      const response = `Response to: "${query}"`;
      const words = response.split(' ');

      for (let i = 0; i < words.length; i++) {
        if (abortController.signal.aborted) {
          yield { type: 'abort', content: '', done: true, sessionId };
          return;
        }

        const chunk: StreamChunk = {
          type: 'content',
          content: (i === 0 ? '' : ' ') + words[i],
          done: false,
          sessionId,
          index: i,
          total: words.length,
        };

        this.emit('chunk', chunk);
        yield chunk;

        // Simulate network delay
        await new Promise((r) => setTimeout(r, 30));
      }

      const finalChunk: StreamChunk = {
        type: 'done',
        content: '',
        done: true,
        sessionId,
      };
      this.emit('done', finalChunk);
      yield finalChunk;
    } catch (error: any) {
      const errorChunk: StreamChunk = {
        type: 'error',
        content: error.message,
        done: true,
        sessionId,
      };
      this.emit('error', errorChunk);
      yield errorChunk;
    } finally {
      this.activeStreams.delete(sessionId);
    }
  }

  /**
   * Stop streaming for a session
   */
  stopStream(sessionId: string): boolean {
    const controller = this.activeStreams.get(sessionId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(sessionId);
      return true;
    }
    return false;
  }

  /**
   * Stop all active streams
   */
  stopAllStreams(): void {
    for (const [sessionId, controller] of this.activeStreams) {
      controller.abort();
    }
    this.activeStreams.clear();
  }

  /**
   * Get active stream count
   */
  getActiveStreamCount(): number {
    return this.activeStreams.size;
  }

  /**
   * Create SSE middleware for HTTP server
   */
  createSSEHandler() {
    return (req: any, res: any) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      const query = req.query?.q || '';
      const sessionId = req.query?.session || `sse-${Date.now()}`;

      const sendChunk = (chunk: StreamChunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      };

      this.on('chunk', sendChunk);
      this.on('done', (chunk: StreamChunk) => {
        sendChunk(chunk);
        res.end();
      });
      this.on('error', (chunk: StreamChunk) => {
        sendChunk(chunk);
        res.end();
      });

      req.on('close', () => {
        this.off('chunk', sendChunk);
        this.stopStream(sessionId);
      });

      // Start streaming (fire and forget)
      (async () => {
        for await (const chunk of this.streamQuery(query, sessionId)) {
          // chunks are already emitted via events
        }
      })();
    };
  }
}

export interface StreamChunk {
  type: 'content' | 'done' | 'error' | 'abort';
  content: string;
  done: boolean;
  sessionId: string;
  index?: number;
  total?: number;
}

export const globalStreamingService = new StreamingService();
