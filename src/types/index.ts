// Tool Types
export interface ToolContext {
  session: Session;
  user?: User;
  tools?: Tool[];
  memory?: string;
  tokenBudget?: number;
  hasFileAccess?(path: string): boolean;
  agentPool?: AgentPool;
}

export interface ToolResult {
  success: boolean;
  result?: any;
  error?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  execute(input: unknown, context: ToolContext): Promise<ToolResult>;
  canUse?(context: ToolContext): boolean;
  onBeforeExecute?(input: unknown): void;
  onAfterExecute?(result: ToolResult): void;
}

// Command Types
export interface CommandContext {
  session: Session;
  user?: User;
  queryEngine?: QueryEngine;
  toolRegistry?: ToolRegistry;
  stateStore?: AppStateStore;
}

export interface CommandArg {
  name: string;
  description: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'array';
}

export interface Command {
  name: string;
  description: string;
  aliases?: string[];
  args?: CommandArg[];
  featureGate?: string;
  execute(args: string[], context: CommandContext): Promise<void>;
}

// Message Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ToolCall {
  id: string;
  name: string;
  input: unknown;
  timestamp: number;
}

// Session Types
export interface SessionConfig {
  id?: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface Session {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  messageHistory: Message[];
  metadata: Record<string, any>;
  addMessage(message: Message): void;
  getMessages(limit?: number): Message[];
}

// User Types
export interface User {
  id: string;
  name: string;
  email?: string;
  role: 'user' | 'admin';
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  notifications: boolean;
}

// Agent Types
export interface AgentConfig {
  id?: string;
  role: string;
  capabilities: string[];
  context?: AgentContext;
}

export interface AgentContext {
  systemPrompt?: string;
  tools?: Tool[];
  memory?: string;
  metadata?: Record<string, any>;
}

export interface Agent {
  id: string;
  role: string;
  capabilities: string[];
  state: AgentState;
  context: AgentContext;
  execute(task: string): Promise<any>;
  executeWithSubAgents(goal: string, subAgents: Agent[]): Promise<any>;
}

export type AgentState = 'idle' | 'processing' | 'completed' | 'failed';

// MCP Types
export interface MCPServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MCPServer {
  name: string;
  config: MCPServerConfig;
  connect(): Promise<void>;
  callTool(toolName: string, input: unknown): Promise<any>;
  readResource(resourceUri: string): Promise<string>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

// Query Engine Types
export interface QueryEngineConfig {
  maxTokens?: number;
  model?: string;
  temperature?: number;
}

export interface QueryEngine {
  apiClient: APIClient;
  createSession(config: SessionConfig): Promise<Session>;
  executeQuery(query: string): Promise<string>;
  compactHistory(): Promise<void>;
}

// State Types
export interface AppState {
  currentSessionId: string;
  sessions: Map<string, Session>;
  theme: 'light' | 'dark';
  layout: LayoutConfig;
  user?: User;
  preferences: UserPreferences;
  isProcessing: boolean;
  currentTool?: Tool;
  memoryContent: string;
}

export interface LayoutConfig {
  width?: number;
  height?: number;
  sidebar?: boolean;
  preview?: boolean;
}

// API Types
export interface APIClient {
  chat(options: ChatOptions): Promise<ChatResponse>;
  complete(options: CompleteOptions): Promise<CompleteResponse>;
}

export interface ChatOptions {
  model: string;
  messages: ChatMessage[];
  tools?: Tool[];
  max_tokens?: number;
  temperature?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export interface ChatResponse {
  text: string;
  toolCalls?: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface CompleteOptions {
  model: string;
  prompt: string;
  max_tokens?: number;
}

export interface CompleteResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Plugin Types
export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  tools?: PluginTool[];
  commands?: PluginCommand[];
  skills?: PluginSkill[];
  onLoad?(): Promise<void>;
  onUnload?(): Promise<void>;
  onEnable?(): Promise<void>;
  onDisable?(): Promise<void>;
}

export interface PluginTool extends Tool {
  pluginId: string;
}

export interface PluginCommand extends Command {
  pluginId: string;
}

export interface PluginSkill {
  name: string;
  description: string;
  execute(input: any): Promise<any>;
}

// Skill Types
export interface Skill {
  name: string;
  description: string;
  execute(input: any): Promise<any>;
}

// Permission Types
export interface Permission {
  name: string;
  check(context: ToolContext): boolean;
}

// Utility Types
export interface ToolRegistry {
  register(tool: Tool, permissions?: Permission[]): void;
  execute(toolName: string, input: unknown, context: ToolContext): Promise<ToolResult>;
  getTools(): Tool[];
  searchTools(query: string): Tool[];
}

export interface CommandRegistry {
  register(command: Command): void;
  execute(commandName: string, args: string[], context: CommandContext): Promise<void>;
  getCommands(): Command[];
  searchCommands(query: string): Command[];
}

export interface AppStateStore {
  setState(updates: Partial<AppState>): void;
  getState(): AppState;
  subscribe(listener: (state: AppState) => void): () => void;
}

export interface AgentPool {
  spawn(config: AgentConfig): Promise<Agent>;
  get(agentId: string): Agent | undefined;
  list(): Agent[];
  remove(agentId: string): void;
}

export interface SessionManager {
  createSession(config: SessionConfig): Session;
  saveSession(session: Session): Promise<void>;
  loadSessions(): Promise<void>;
  getSession(id: string): Session | undefined;
  listSessions(): Session[];
}

// LLM Response Types
export interface LLMResponse {
  text: string;
  toolCalls?: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Context Types
export interface Context {
  session: Session;
  user?: User;
  tools: Tool[];
  memory: string;
  systemPrompt: string;
  tokenBudget: number;
}

// Error Types
export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolError';
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

export class SandboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SandboxError';
  }
}

export class MCPError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MCPError';
  }
}

export class AgentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentError';
  }
}
