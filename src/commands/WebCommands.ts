import type { Command, CommandContext } from '../types/index.js';

/**
 * /search command - Search the web
 */
export const SearchWebCommand: Command = {
  name: 'search',
  description: 'Search the web',
  aliases: ['web-search', 'google'],
  args: [
    {
      name: 'query',
      description: 'Search query',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const query = args.join(' ');
    if (!query) {
      console.log('[error] Please provide a search query');
      return;
    }

    const tool = context.toolRegistry?.getTool('web_search');
    if (!tool) {
      console.log('[error] web_search tool not available');
      return;
    }

    const result = await tool.execute({ query }, context);
    if (result.success) {
      console.log(`[search] Results for "${query}":`);
      result.result?.results.forEach((r: any, i: number) => {
        console.log(`  ${i + 1}. ${r.title}`);
        console.log(`     ${r.url}`);
        console.log(`     ${r.snippet}`);
      });
    } else {
      console.log(`[error] ${result.error}`);
    }
  },
};

/**
 * /fetch command - Fetch URL content
 */
export const FetchCommand: Command = {
  name: 'fetch',
  description: 'Fetch content from URL',
  aliases: ['curl', 'get'],
  args: [
    {
      name: 'url',
      description: 'URL to fetch',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const url = args[0];
    if (!url) {
      console.log('[error] Please provide a URL');
      return;
    }

    const tool = context.toolRegistry?.getTool('web_fetch');
    if (!tool) {
      console.log('[error] web_fetch tool not available');
      return;
    }

    const result = await tool.execute({ url }, context);
    if (result.success) {
      console.log(`[fetch] Status: ${result.result?.status}`);
      console.log(`[fetch] Size: ${result.result?.size} bytes`);
      console.log(`[fetch] Content:`);
      console.log(result.result?.data);
    } else {
      console.log(`[error] ${result.error}`);
    }
  },
};

/**
 * /browse command - Browse website
 */
export const BrowseCommand: Command = {
  name: 'browse',
  description: 'Browse a website',
  aliases: ['visit'],
  args: [
    {
      name: 'url',
      description: 'URL to browse',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const url = args[0];
    if (!url) {
      console.log('[error] Please provide a URL');
      return;
    }

    console.log(`[browse] Opening: ${url}`);
    console.log('[browse] Browse command not fully implemented');
  },
};

/**
 * /api command - Call API
 */
export const APICommand: Command = {
  name: 'api',
  description: 'Call an API endpoint',
  aliases: ['call'],
  args: [
    {
      name: 'method',
      description: 'HTTP method (GET, POST, etc)',
      required: true,
      type: 'string',
    },
    {
      name: 'url',
      description: 'API endpoint URL',
      required: true,
      type: 'string',
    },
  ],
  async execute(args: string[], context: CommandContext): Promise<void> {
    const [method, url] = args;
    if (!method || !url) {
      console.log('[error] Please provide method and URL');
      return;
    }

    const tool = context.toolRegistry?.getTool('web_fetch');
    if (!tool) {
      console.log('[error] web_fetch tool not available');
      return;
    }

    const result = await tool.execute({ url, method }, context);
    if (result.success) {
      console.log(`[api] ${method} ${url}`);
      console.log(`[api] Status: ${result.result?.status}`);
      console.log(`[api] Response:`);
      console.log(JSON.stringify(result.result?.data, null, 2));
    } else {
      console.log(`[error] ${result.error}`);
    }
  },
};

/**
 * All web commands
 */
export const WEB_COMMANDS: Command[] = [
  SearchWebCommand,
  FetchCommand,
  BrowseCommand,
  APICommand,
];
