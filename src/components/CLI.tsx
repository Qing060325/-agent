import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

interface CLIComponentProps {
  onExit?: () => void;
}

export const CLIComponent: React.FC<CLIComponentProps> = ({ onExit }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Setup stdin for input
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    const handleInput = (char: string) => {
      if (char === '\u0003') {
        // Ctrl+C
        onExit?.();
        process.exit(0);
      } else if (char === '\r' || char === '\n') {
        // Enter
        handleCommand(input);
        setInput('');
      } else if (char === '\u007f') {
        // Backspace
        setInput(input.slice(0, -1));
      } else if (char.charCodeAt(0) >= 32) {
        // Printable character
        setInput(input + char);
      }
    };

    process.stdin.on('data', (buffer) => {
      handleInput(buffer.toString());
    });

    return () => {
      process.stdin.off('data', handleInput);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
    };
  }, [input, onExit]);

  const handleCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    setIsProcessing(true);
    setOutput((prev) => [...prev, `> ${cmd}`]);

    try {
      // Simulate command execution
      await new Promise((resolve) => setTimeout(resolve, 100));
      setOutput((prev) => [...prev, `[output] Command executed: ${cmd}`]);
    } catch (error) {
      setOutput((prev) => [...prev, `[error] ${error}`]);
    }

    setIsProcessing(false);
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold cyan>
          🚀 Manus Agent v1.0
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Enterprise-grade AI Agent Platform</Text>
      </Box>

      <Box marginBottom={1} flexDirection="column">
        {output.map((line, i) => (
          <Text key={i}>{line}</Text>
        ))}
      </Box>

      <Box>
        <Text>manus> {input}</Text>
      </Box>

      {isProcessing && (
        <Box marginTop={1}>
          <Text>Processing...</Text>
        </Box>
      )}
    </Box>
  );
};
