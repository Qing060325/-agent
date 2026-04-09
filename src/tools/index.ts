export { BaseTool, PermissionError, ValidationError, ExecutionError } from './Tool.js';
export { ToolRegistry, globalToolRegistry } from './ToolRegistry.js';
export { FILE_TOOLS, FileReadTool, FileWriteTool, FileEditTool, GlobTool, GrepTool } from './FileTools.js';
export { CODE_EXECUTION_TOOLS, BashTool, REPLTool } from './CodeExecutionTools.js';
export { WEB_TOOLS, WebFetchTool, WebSearchTool } from './WebTools.js';

import { ToolRegistry } from './ToolRegistry.js';
import { FILE_TOOLS } from './FileTools.js';
import { CODE_EXECUTION_TOOLS } from './CodeExecutionTools.js';
import { WEB_TOOLS } from './WebTools.js';

/**
 * Initialize all tools
 */
export function initializeAllTools(registry: ToolRegistry): void {
  // Register file tools
  FILE_TOOLS.forEach((tool) => registry.register(tool));

  // Register code execution tools
  CODE_EXECUTION_TOOLS.forEach((tool) => registry.register(tool));

  // Register web tools
  WEB_TOOLS.forEach((tool) => registry.register(tool));

  console.log(`[tools] Registered ${registry.getStats().totalTools} tools`);
}
