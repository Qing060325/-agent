import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput, useApp, useStdin } from 'ink';

/**
 * Terminal User Interface - Rich interactive TUI for Manus Agent
 */

interface TUIProps {
  version?: string;
}

interface HistoryItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface StatusInfo {
  session: string;
  model: string;
  tokens: number;
  uptime: number;
}

export const ManusTUI: React.FC<TUIProps> = ({ version = '1.0.0' }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState('');
  const [cursor, setCursor] = useState(0);
  const [status, setStatus] = useState<StatusInfo>({
    session: 'default',
    model: 'claude-3-5-sonnet',
    tokens: 0,
    uptime: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'split'>('chat');
  const scrollOffset = useRef(0);
  const { exit } = useApp();

  // Update uptime
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setStatus((prev) => ({
        ...prev,
        uptime: Math.floor((Date.now() - startTime) / 1000),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useInput((inputChar, key) => {
    if (key.ctrl && inputChar === 'c') {
      exit();
      return;
    }

    if (key.ctrl && inputChar === 'l') {
      setHistory([]);
      return;
    }

    if (key.ctrl && inputChar === 'h') {
      setShowHelp(!showHelp);
      return;
    }

    if (key.ctrl && inputChar === 't') {
      setViewMode((m) => (m === 'chat' ? 'split' : 'chat'));
      return;
    }

    if (key.return) {
      if (input.trim()) {
        handleCommand(input.trim());
        setInput('');
        setCursor(0);
      }
      return;
    }

    if (key.backspace || key.delete) {
      if (cursor > 0) {
        setInput((prev) => prev.slice(0, cursor - 1) + prev.slice(cursor));
        setCursor((c) => c - 1);
      }
      return;
    }

    if (key.leftArrow) {
      setCursor((c) => Math.max(0, c - 1));
      return;
    }

    if (key.rightArrow) {
      setCursor((c) => Math.min(input.length, c + 1));
      return;
    }

    if (key.upArrow) {
      scrollOffset.current = Math.max(0, scrollOffset.current - 1);
      return;
    }

    if (key.downArrow) {
      scrollOffset.current = Math.min(history.length, scrollOffset.current + 1);
      return;
    }

    // Normal character input
    if (inputChar && !key.ctrl && !key.meta) {
      setInput((prev) => prev.slice(0, cursor) + inputChar + prev.slice(cursor));
      setCursor((c) => c + 1);
    }
  });

  const handleCommand = (cmd: string) => {
    // Add user message
    setHistory((prev) => [
      ...prev,
      { role: 'user', content: cmd, timestamp: Date.now() },
    ]);

    setIsProcessing(true);

    // Simulate response
    setTimeout(() => {
      let response = '';

      if (cmd.startsWith('/')) {
        response = handleSlashCommand(cmd);
      } else {
        response = `[AI Response] Processing: "${cmd}"`;
      }

      setHistory((prev) => [
        ...prev,
        { role: 'assistant', content: response, timestamp: Date.now() },
      ]);

      setStatus((prev) => ({
        ...prev,
        tokens: prev.tokens + cmd.split(' ').length * 2,
      }));

      setIsProcessing(false);
    }, 500);
  };

  const handleSlashCommand = (cmd: string): string => {
    const parts = cmd.slice(1).split(' ');
    const command = parts[0];

    switch (command) {
      case 'help':
        setShowHelp(true);
        return 'Showing help panel (Ctrl+H to toggle)';
      case 'clear':
        setHistory([]);
        return 'Session cleared';
      case 'version':
        return `Manus Agent v${version}`;
      case 'status':
        return `Session: ${status.session} | Model: ${status.model} | Tokens: ${status.tokens} | Uptime: ${status.uptime}s`;
      default:
        return `Unknown command: /${command}`;
    }
  };

  const formatUptime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}h${m}m${s}s` : m > 0 ? `${m}m${s}s` : `${s}s`;
  };

  return (
    <Box flexDirection="column" height={process.stdout.rows || 24}>
      {/* Header */}
      <Box borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text bold color="cyan">
          🚀 Manus Agent v{version}
        </Text>
        <Box flexGrow={1} justifyContent="center">
          <Text color="gray">
            {status.model} | {status.tokens} tokens | ⏱ {formatUptime(status.uptime)}
          </Text>
        </Box>
        <Text color="gray">Ctrl+H: Help | Ctrl+C: Exit</Text>
      </Box>

      {/* Help Panel */}
      {showHelp && (
        <Box borderStyle="single" borderColor="yellow" paddingX={1} marginBottom={1}>
          <Box flexDirection="column">
            <Text bold color="yellow">
              ⌨️ Keyboard Shortcuts
            </Text>
            <Text> Ctrl+C - Exit | Ctrl+L - Clear | Ctrl+H - Help | Ctrl+T - Toggle split view</Text>
            <Text> Up/Down - Scroll history | Tab - Auto-complete</Text>
            <Text bold color="yellow" marginTop={1}>
              📋 Commands
            </Text>
            <Text> /help /version /status /clear /ask /code /search /read /write /bash</Text>
          </Box>
        </Box>
      )}

      {/* Main content area */}
      <Box flexDirection={viewMode === 'split' ? 'row' : 'column'} flexGrow={1}>
        {/* Chat history */}
        <Box
          flexDirection="column"
          flexGrow={1}
          borderStyle="round"
          borderColor="gray"
          paddingX={1}
          overflow="hidden"
        >
          {history.length === 0 ? (
            <Box justifyContent="center" alignItems="center" flexGrow={1}>
              <Text dimColor>
                Welcome to Manus Agent. Type a message or /help for commands.
              </Text>
            </Box>
          ) : (
            history.slice(-15).map((item, i) => (
              <Box key={i} flexDirection="column" marginBottom={1}>
                <Text
                  bold
                  color={item.role === 'user' ? 'blue' : item.role === 'assistant' ? 'green' : 'yellow'}
                >
                  {item.role === 'user' ? '👤 You' : item.role === 'assistant' ? '🤖 Agent' : '⚙️ System'}
                  <Text dimColor> {new Date(item.timestamp).toLocaleTimeString()}</Text>
                </Text>
                <Text wrap="wrap"> {item.content}</Text>
              </Box>
            ))
          )}
        </Box>

        {/* Side panel (split mode) */}
        {viewMode === 'split' && (
          <Box
            width={30}
            borderStyle="single"
            borderColor="gray"
            paddingX={1}
            flexDirection="column"
          >
            <Text bold color="cyan">
              📊 Status
            </Text>
            <Text> Session: {status.session}</Text>
            <Text> Model: {status.model}</Text>
            <Text> Tokens: {status.tokens}</Text>
            <Text> Uptime: {formatUptime(status.uptime)}</Text>
            <Text> Messages: {history.length}</Text>
          </Box>
        )}
      </Box>

      {/* Input area */}
      <Box borderStyle="round" borderColor={isProcessing ? 'yellow' : 'green'} paddingX={1}>
        <Text color={isProcessing ? 'yellow' : 'green'}>{isProcessing ? '⏳' : '❯'} </Text>
        <Text>{input}</Text>
        <Text color="cyan">█</Text>
        {isProcessing && (
          <Box marginLeft={1}>
            <Text color="yellow">Processing...</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ManusTUI;
