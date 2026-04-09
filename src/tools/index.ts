export { BaseTool, PermissionError, ValidationError, ExecutionError } from './Tool.js';
export { ToolRegistry, globalToolRegistry } from './ToolRegistry.js';
export { FILE_TOOLS, FileReadTool, FileWriteTool, FileEditTool, GlobTool, GrepTool } from './FileTools.js';
export { CODE_EXECUTION_TOOLS, BashTool, REPLTool } from './CodeExecutionTools.js';
export { WEB_TOOLS, WebFetchTool, WebSearchTool } from './WebTools.js';
export { DATABASE_TOOLS } from './DatabaseTools.js';
export { DATA_ANALYSIS_TOOLS } from './DataAnalysisTools.js';
export { MEDIA_TOOLS } from './MediaTools.js';
export { DOCUMENT_TOOLS } from './DocumentTools.js';
export { CLOUD_TOOLS } from './CloudTools.js';
export { ADVANCED_WEB_TOOLS } from './AdvancedWebTools.js';

import { ToolRegistry } from './ToolRegistry.js';
import { FILE_TOOLS } from './FileTools.js';
import { CODE_EXECUTION_TOOLS } from './CodeExecutionTools.js';
import { WEB_TOOLS } from './WebTools.js';
import { DATABASE_TOOLS } from './DatabaseTools.js';
import { DATA_ANALYSIS_TOOLS } from './DataAnalysisTools.js';
import { MEDIA_TOOLS } from './MediaTools.js';
import { DOCUMENT_TOOLS } from './DocumentTools.js';
import { CLOUD_TOOLS } from './CloudTools.js';
import { ADVANCED_WEB_TOOLS } from './AdvancedWebTools.js';

export const globalToolRegistry = new ToolRegistry();

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

  // Register database tools
  DATABASE_TOOLS.forEach((tool) => registry.register(tool));

  // Register data analysis tools
  DATA_ANALYSIS_TOOLS.forEach((tool) => registry.register(tool));

  // Register media tools
  MEDIA_TOOLS.forEach((tool) => registry.register(tool));

  // Register document tools
  DOCUMENT_TOOLS.forEach((tool) => registry.register(tool));

  // Register cloud tools
  CLOUD_TOOLS.forEach((tool) => registry.register(tool));

  // Register advanced web tools
  ADVANCED_WEB_TOOLS.forEach((tool) => registry.register(tool));

  const stats = registry.getStats();
  console.log(
    `[tools] Registered ${stats.totalTools} tools with ${stats.totalPermissions} permissions`
  );
  console.log(
    `[tools] Categories: File(5), Code(2), Web(4), Database(5), Analysis(5), Media(10), Document(4), Cloud(3), AdvancedWeb(2)`
  );
}

/**
 * Get all tool categories
 */
export function getAllToolCategories() {
  return {
    file: FILE_TOOLS,
    codeExecution: CODE_EXECUTION_TOOLS,
    web: WEB_TOOLS,
    database: DATABASE_TOOLS,
    dataAnalysis: DATA_ANALYSIS_TOOLS,
    media: MEDIA_TOOLS,
    document: DOCUMENT_TOOLS,
    cloud: CLOUD_TOOLS,
    advancedWeb: ADVANCED_WEB_TOOLS,
  };
}

/**
 * Get tool count by category
 */
export function getToolStats() {
  return {
    file: FILE_TOOLS.length,
    codeExecution: CODE_EXECUTION_TOOLS.length,
    web: WEB_TOOLS.length,
    database: DATABASE_TOOLS.length,
    dataAnalysis: DATA_ANALYSIS_TOOLS.length,
    media: MEDIA_TOOLS.length,
    document: DOCUMENT_TOOLS.length,
    cloud: CLOUD_TOOLS.length,
    advancedWeb: ADVANCED_WEB_TOOLS.length,
    total: FILE_TOOLS.length +
           CODE_EXECUTION_TOOLS.length +
           WEB_TOOLS.length +
           DATABASE_TOOLS.length +
           DATA_ANALYSIS_TOOLS.length +
           MEDIA_TOOLS.length +
           DOCUMENT_TOOLS.length +
           CLOUD_TOOLS.length +
           ADVANCED_WEB_TOOLS.length,
  };
}
