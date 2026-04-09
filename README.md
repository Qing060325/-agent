# Manus Agent v1.0

**Enterprise-grade AI Agent Platform** - Complete implementation based on Claude Code v2.1.76 architecture and Manus V1.0 specification.

## 🌟 Features

### Core Capabilities
- **40+ Built-in Tools** - File operations, code execution, web fetching, agent management
- **88+ Slash Commands** - Intuitive command interface for all operations
- **Intelligent Query Engine** - 68K lines of core logic for natural language processing
- **Multi-Agent Coordination** - Spawn and manage sub-agents with different roles
- **MCP Integration** - Seamless integration with Model Context Protocol servers
- **Plugin System** - Extensible architecture for custom tools and commands
- **Session Management** - JSONL-based persistent session storage
- **Token Budget Management** - Automatic token usage tracking and optimization

### Advanced Features
- **Streaming Output** - Real-time token-by-token streaming responses via SSE
- **Session Persistence** - Save, resume, list, and export sessions with JSONL storage
- **Tab Completion** - Bash/Zsh/Fish shell auto-completion support
- **Local Model Support** - Ollama integration for offline local LLM inference
- **Git-Aware Tools** - Auto-detect repo context, diff, log, branches for AI consumption
- **TUI Interface** - Rich terminal UI with React/Ink (chat panel, status bar, split view)
- **Telemetry** - Optional anonymous usage tracking with detailed reports
- **Watch Mode** - Monitor file changes and auto-trigger commands
- **Config Validation** - Schema validation with fix suggestions
- **Multi-Format Export** - Export sessions to Markdown, HTML, JSON, or plain text
- **Context Compression** - Automatic compression of long conversation histories
- **Sandbox Execution** - Secure execution environment for tools
- **Permission System** - Fine-grained access control
- **Auto-Memory System** - Automatic memory management with MEMORY.md
- **Vim Keybindings** - Full Vim mode support
- **Voice Input** - Voice-to-text input support
- **Remote Sessions** - Cloud-based session management
- **IDE Integration** - VS Code and JetBrains integration

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- Bun >= 1.0.0

### From npm
```bash
npm install -g @qing060325/manus-agent
manus --version
```

### From Source
```bash
git clone https://github.com/Qing060325/-agent.git
cd -agent
bun install
bun run build
node dist/cli.js --version
```

## 🚀 Quick Start

### Basic Usage
```bash
# Start interactive session
manus

# Ask a question
manus ask "What is the capital of France?"

# Generate code
manus code "Create a Python function to calculate fibonacci"

# Search the web
manus search "latest AI news"

# Read a file
manus read /path/to/file.txt

# Execute a command
manus bash "ls -la"
```

### Slash Commands
```bash
/ask <question>           # Ask a question
/code <prompt>           # Generate code
/search <query>          # Search the web
/read <path>            # Read file content
/write <path> <content> # Write to file
/bash <command>         # Execute shell command
/spawn <role> <task>    # Spawn a sub-agent
/help                   # Show help
/clear                  # Clear session
/config                 # Show configuration
```

### New Features (v1.1)

#### Session Management
```bash
/session-save           # Save current session
/session-list           # List all saved sessions
/session-resume <id>    # Resume a saved session
/session-delete <id>    # Delete a saved session
/session-export <id>    # Export session to Markdown
```

#### Git Context
```bash
/manus git              # Show git repo context (branch, status, recent commits)
```

#### Local Models (Ollama)
```bash
/manus ollama-status    # Check if Ollama is running, list models
/manus ollama-generate "prompt"  # Generate with local model
```

#### Config & Validation
```bash
/manus config-validate  # Validate config file for errors
/manus config-init      # Create default config file
```

#### Telemetry
```bash
/manus telemetry          # Show usage report
/manus telemetry enable   # Enable telemetry
/manus telemetry disable  # Disable telemetry
```

#### Export
```bash
/manus export markdown output.md  # Export to Markdown
/manus export html output.html    # Export to HTML
/manus export json output.json    # Export to JSON
```

#### Watch Mode
```bash
/manus watch <path> "<command>"  # Watch file changes, run command
```

#### Shell Completion
```bash
/manus completion bash    # Generate bash completion
/manus completion zsh     # Generate zsh completion
/manus completion install # Auto-install for current shell
```

## 🏗️ Architecture

### 7-Layer Architecture

```
Layer 1: User Interaction       → CLI, Web, IDE, Remote Control
Layer 2: Commands & Skills      → 88+ Commands, Skills, Plugins
Layer 3: Tool System            → 40+ Tools, Permissions, Sandbox
Layer 4: Query Engine           → Main Loop, Token Budget, History
Layer 5: State Management       → App State, Sessions, Persistence
Layer 6: Integration & Coordination → MCP, Multi-Agent, Remote
Layer 7: Infrastructure         → API, Analytics, Logging, Runtime
```

### Project Structure

```
src/
├── entrypoints/              # CLI, SDK, MCP entry points
├── tools/                    # 40+ tool implementations
├── query/                    # Query engine core
├── commands/                 # 88+ command implementations
├── state/                    # State management
├── coordinator/              # Multi-agent coordination
├── mcp/                      # MCP integration
├── components/               # React/Ink UI components
├── services/                 # API, analytics, logging
├── plugins/                  # Plugin system
├── skills/                   # Skill definitions
├── schemas/                  # Zod validation schemas
├── types/                    # TypeScript type definitions
├── utils/                    # Utility functions
└── constants/                # Constants and prompts
```

## 🔧 Development

### Setup Development Environment
```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Run tests
bun run test

# Run tests with coverage
bun run test:coverage

# Lint code
bun run lint

# Format code
bun run format

# Type check
bun run type-check
```

### Build for Production
```bash
# Build the project
bun run build

# The output will be in dist/cli.js
node dist/cli.js --version
```

## 📊 Features Matrix

### Tool Categories (40+ tools)

| Category | Count | Examples |
|----------|-------|----------|
| File Operations | 5 | FileRead, FileWrite, FileEdit, Glob, Grep |
| Code Execution | 2 | BashTool, REPLTool |
| Web Tools | 2 | WebFetch, WebSearch |
| Agent Tools | 2 | AgentTool, AgentTrigger |
| Editor Tools | 2 | NotebookEdit, SkillTool |
| Git Tools | 5 | GitStatus, GitDiff, GitLog, GitBranch, GitContext |
| Watch Tools | 3 | Watch, WatchStop, WatchList |
| Export Tools | 1 | Export (Markdown/HTML/JSON/Text) |
| Other | 20+ | LSPTool, TaskTool, CronTool, MCPTool |

### Command Categories (88+ commands)

| Category | Count | Examples |
|----------|-------|----------|
| Basic | 10 | /ask, /help, /clear, /version |
| File | 15 | /read, /write, /search, /find |
| Code | 15 | /code, /debug, /test, /refactor |
| Web | 10 | /search, /fetch, /browse, /api |
| Agent | 10 | /spawn, /list, /stop, /status |
| Config | 10 | /config, /settings, /theme, /key |
| Other | 18 | /skill, /plugin, /macro, /export |

## 🔌 MCP Integration

Manus Agent supports Model Context Protocol (MCP) for seamless integration with external services:

```bash
# Register an MCP server
manus config mcp add <name> <command> [args...]

# List registered MCP servers
manus config mcp list

# Call an MCP tool
manus mcp call <server> <tool> <input>
```

## 🤖 Multi-Agent Coordination

Spawn and coordinate multiple agents:

```bash
# Spawn an agent
manus spawn researcher "Research the topic"

# List active agents
manus agent list

# Delegate a task to an agent
manus agent delegate <agent-id> <task>

# Coordinate multiple agents
manus coordinator run <goal>
```

## 🔐 Security

- **Sandbox Execution** - All tool executions run in isolated sandbox
- **Permission System** - Fine-grained access control for each tool
- **File Access Control** - Restricted file system access
- **Network Isolation** - Controlled network access
- **Process Isolation** - Isolated process execution

## 📈 Performance

| Metric | Target | Optimization |
|--------|--------|-------------|
| Startup Time | < 500ms | Code splitting, lazy loading |
| Memory Usage | < 100MB | GC, object pooling |
| Query Latency | < 100ms | Caching, indexing, parallelization |
| Tool Execution | < 1s | Async, concurrency, timeouts |
| Concurrent Sessions | 1000+ | Connection pooling, load balancing |

## 📚 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Tool Development Guide](./docs/TOOL_DEVELOPMENT.md)
- [Command Reference](./docs/COMMANDS.md)
- [MCP Integration Guide](./docs/MCP.md)
- [Plugin Development Guide](./docs/PLUGIN_DEVELOPMENT.md)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Based on [Claude Code v2.1.76](https://github.com/Qing060325/claude-code) architecture
- Inspired by [Manus V1.0](https://github.com/manus-ai/manus-v1.0) specification
- Built with [React](https://react.dev), [Ink](https://github.com/vadimdemedes/ink), [Bun](https://bun.sh)

## 📞 Support

- GitHub Issues: [Report a bug](https://github.com/Qing060325/-agent/issues)
- GitHub Discussions: [Ask a question](https://github.com/Qing060325/-agent/discussions)
- Documentation: [Read the docs](./docs)

## 🚀 Roadmap

- [x] v1.0 - Core features, 40+ tools, 88+ commands
- [ ] v1.1 - Performance optimization, additional tools
- [ ] v1.2 - Web UI, enhanced MCP support
- [ ] v2.0 - Desktop app, advanced AI features

---

**Version**: 1.0.0  
**Status**: Stable  
**Last Updated**: 2026-04-10  
**Author**: Qing060325
