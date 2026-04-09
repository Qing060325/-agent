import { BaseTool } from './Tool.js';
import { z } from 'zod';
import axios from 'axios';
import type { ToolContext, ToolResult } from '../types/index.js';

/**
 * WebFetchTool - Fetch web content
 */
export class WebFetchTool extends BaseTool {
  name = 'web_fetch';
  description = 'Fetch content from a URL';
  inputSchema = z.object({
    url: z.string().url().describe('URL to fetch'),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),
    headers: z.record(z.string()).optional(),
    data: z.any().optional(),
    timeout: z.number().default(10000),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { url, method, headers, data, timeout } = input as any;

    try {
      const response = await axios({
        url,
        method,
        headers,
        data,
        timeout,
      });

      return {
        success: true,
        result: {
          url,
          status: response.status,
          headers: response.headers,
          data: response.data,
          size: JSON.stringify(response.data).length,
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        result: {
          url,
          status: error.response?.status,
          error: error.response?.statusText,
        },
        timestamp: Date.now(),
      };
    }
  }
}

/**
 * WebSearchTool - Search the web
 */
export class WebSearchTool extends BaseTool {
  name = 'web_search';
  description = 'Search the web for information';
  inputSchema = z.object({
    query: z.string().describe('Search query'),
    limit: z.number().default(10).describe('Number of results'),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { query, limit } = input as any;

    try {
      // Mock search results (in production, use a real search API)
      const results = [
        {
          title: `Search result for "${query}" 1`,
          url: `https://example.com/result1`,
          snippet: 'This is a search result snippet...',
        },
        {
          title: `Search result for "${query}" 2`,
          url: `https://example.com/result2`,
          snippet: 'Another search result snippet...',
        },
      ];

      return {
        success: true,
        result: {
          query,
          results: results.slice(0, limit),
          count: results.length,
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }
}

/**
 * All web tools
 */
export const WEB_TOOLS = [new WebFetchTool(), new WebSearchTool()];
