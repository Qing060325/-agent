# Manus Agent v1.0 - API 文档

## 概述

Manus Agent v1.0 是一个企业级 AI Agent 平台，提供完整的工具系统、命令系统、状态管理和 MCP 集成。

## 核心模块

### 1. 工具系统 (Tools)

#### 文件操作工具
- `file_read` - 读取文件内容
- `file_write` - 写入文件
- `file_edit` - 编辑文件
- `glob` - 文件模式匹配
- `grep` - 文本搜索

#### 代码执行工具
- `bash` - 执行 shell 命令
- `repl` - 执行 JavaScript 代码

#### Web 工具
- `web_fetch` - 获取 URL 内容
- `web_search` - 网络搜索

### 2. 命令系统 (Commands)

#### 基础命令
- `/ask` - 提问
- `/help` - 帮助
- `/clear` - 清除会话
- `/version` - 版本信息
- `/exit` - 退出
- `/config` - 配置
- `/status` - 状态
- `/list` - 列表
- `/info` - 信息

#### 文件命令
- `/read` - 读取文件
- `/write` - 写入文件
- `/search` - 搜索文本
- `/find` - 查找文件
- `/delete` - 删除文件
- `/copy` - 复制文件

#### 代码命令
- `/code` - 生成代码
- `/debug` - 调试
- `/test` - 测试
- `/refactor` - 重构
- `/analyze` - 分析
- `/execute` - 执行
- `/bash` - Shell 命令

#### Web 命令
- `/search` - 网络搜索
- `/fetch` - 获取 URL
- `/browse` - 浏览网站
- `/api` - 调用 API

#### Agent 命令
- `/spawn` - 创建 Agent
- `/agent` - 管理 Agent
- `/coordinator` - 协调多 Agent

#### MCP 命令
- `/mcp` - MCP 服务器管理
- `/plugin` - 插件管理
- `/skill` - 技能管理

#### 高级命令
- `/memory` - 内存管理
- `/history-search` - 历史搜索
- `/undo` - 撤销
- `/redo` - 重做
- `/backup` - 备份管理
- `/export` - 数据导出
- `/import` - 数据导入
- `/macro` - 宏管理

### 3. 状态管理 (State)

#### SessionManager
```typescript
// 创建会话
const session = sessionManager.createSession({ name: 'My Session' });

// 保存会话
await sessionManager.saveSession(session);

// 加载会话
const loaded = await sessionManager.loadSession(sessionId);

// 列表会话
const sessions = sessionManager.listSessions();
```

#### AutoMemory
```typescript
// 添加内存条目
await autoMemory.addEntry('Key Information', 'Important fact');

// 更新部分
await autoMemory.updateSection('Tasks', 'Task 1\nTask 2');

// 获取部分
const section = autoMemory.getSection('Tasks');
```

### 4. Agent 系统 (Coordinator)

#### Agent
```typescript
// 创建 Agent
const agent = new Agent({
  id: 'agent-1',
  role: 'researcher',
  capabilities: ['search', 'analyze'],
});

// 执行任务
const result = await agent.execute('Find information about X');
```

#### AgentPool
```typescript
// 生成 Agent
const agent = await pool.spawn({
  role: 'coder',
  capabilities: ['code', 'test'],
});

// 获取 Agent
const agent = pool.get(agentId);

// 列表 Agent
const agents = pool.list();
```

#### MultiAgentCoordinator
```typescript
// 顺序执行
const results = await coordinator.runSequential(goal, agentIds);

// 并行执行
const results = await coordinator.runParallel(goal, agentIds);

// 分层执行
const result = await coordinator.runHierarchical(goal, coordinatorId);
```

### 5. MCP 集成 (MCP)

#### MCPClient
```typescript
// 注册服务器
const server = await mcpClient.registerServer({
  name: 'my-server',
  command: 'node server.js',
});

// 调用工具
const result = await mcpClient.callTool('my-server', 'tool-name', input);

// 读取资源
const content = await mcpClient.readResource('my-server', 'resource-uri');
```

### 6. 权限系统 (Permissions)

#### PermissionManager
```typescript
// 检查权限
const allowed = permissionManager.check('file_access', context);

// 检查多个权限
const allAllowed = permissionManager.checkAll(['file_access', 'network_access'], context);
```

### 7. 沙箱隔离 (Sandbox)

#### Sandbox
```typescript
// 执行代码
const result = await sandbox.execute(code);

// 带内存限制执行
const result = await sandbox.executeWithMemoryLimit(code, 100 * 1024 * 1024);

// 带文件限制执行
const result = await sandbox.executeWithFileRestrictions(code, ['/allowed/path']);
```

### 8. 高级功能 (Advanced Features)

#### ContextCompressor
```typescript
// 压缩对话历史
const compressed = compressor.compress(messages, 10);

// 总结消息
const summary = compressor.summarize(messages);
```

#### HistorySearch
```typescript
// 关键词搜索
const results = search.searchByKeyword(messages, 'keyword');

// 正则搜索
const results = search.searchByRegex(messages, 'pattern');

// 模糊搜索
const results = search.fuzzySearch(messages, 'query');
```

#### UndoRedoManager
```typescript
// 推送状态
manager.push(state);

// 撤销
const prevState = manager.undo();

// 重做
const nextState = manager.redo();
```

#### BackupRestoreManager
```typescript
// 创建备份
const backupPath = await backupManager.createBackup(data);

// 恢复备份
const data = await backupManager.restoreBackup(backupPath);

// 列表备份
const backups = await backupManager.listBackups();
```

## 类型定义

### Tool
```typescript
interface Tool {
  name: string;
  description: string;
  inputSchema: ZodSchema;
  execute(input: unknown, context: ToolContext): Promise<ToolResult>;
}
```

### Command
```typescript
interface Command {
  name: string;
  description: string;
  aliases?: string[];
  args?: CommandArg[];
  execute(args: string[], context: CommandContext): Promise<void>;
}
```

### Session
```typescript
interface Session {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  messageHistory: Message[];
  metadata?: Record<string, any>;
}
```

### Agent
```typescript
interface Agent {
  id: string;
  role: string;
  capabilities: string[];
  state: 'idle' | 'processing' | 'completed' | 'failed';
  context: AgentContext;
  execute(task: string): Promise<any>;
}
```

## 使用示例

### 初始化 Manus Agent
```typescript
import ManusAgent from './index.js';

const agent = new ManusAgent();
await agent.initialize();

// 执行命令
await agent.executeCommand('/help');

// 关闭
await agent.shutdown();
```

### 使用工具
```typescript
import { globalToolRegistry } from './index.js';

const tool = globalToolRegistry.getTool('file_read');
const result = await tool.execute({ path: '/path/to/file' }, context);
```

### 创建 Agent
```typescript
import { globalAgentPool } from './index.js';

const agent = await globalAgentPool.spawn({
  role: 'analyst',
  capabilities: ['analyze', 'report'],
});

const result = await agent.execute('Analyze the data');
```

## 配置

### 环境变量
- `MANUS_HOME` - Manus 主目录（默认：`.manus`）
- `MANUS_LOG_LEVEL` - 日志级别（默认：`info`）
- `MANUS_MAX_AGENTS` - 最大 Agent 数量（默认：`10`）
- `MANUS_MAX_MEMORY` - 最大内存（默认：`100MB`）

### 配置文件
在 `.manus/config.json` 中配置：
```json
{
  "logLevel": "info",
  "maxAgents": 10,
  "maxMemory": 104857600,
  "sessionDir": ".manus/sessions",
  "backupDir": ".manus/backups"
}
```

## 错误处理

所有操作都返回 `ToolResult` 或 `CommandResult`，包含 `success` 标志和 `error` 字段：

```typescript
interface ToolResult {
  success: boolean;
  result?: any;
  error?: string;
  timestamp: number;
}
```

## 性能优化

- 消息历史压缩：自动压缩长对话历史
- 上下文管理：自动管理内存使用
- 缓存：工具结果缓存
- 异步处理：所有 I/O 操作都是异步的

## 安全性

- 权限系统：细粒度权限控制
- 沙箱隔离：代码执行隔离
- 数据加密：数据加密存储
- 备份恢复：自动备份和恢复

## 扩展

### 添加自定义工具
```typescript
class MyTool extends BaseTool {
  name = 'my_tool';
  description = 'My custom tool';
  inputSchema = z.object({ /* ... */ });
  
  protected async executeImpl(input, context) {
    // Implementation
  }
}

globalToolRegistry.register(new MyTool());
```

### 添加自定义命令
```typescript
const myCommand: Command = {
  name: 'mycommand',
  description: 'My custom command',
  async execute(args, context) {
    // Implementation
  }
};

globalCommandRegistry.register(myCommand);
```

## 许可证

MIT
