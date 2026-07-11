import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Bug, ChevronUp, ChevronDown } from 'lucide-react';

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'log' | 'error' | 'warn' | 'info';
  message: string;
  data?: any;
}

interface Props {
  isVisible: boolean;
  onToggle: () => void;
}

export const DebugLog = ({ isVisible, onToggle }: Props) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [logId, setLogId] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // Override console methods to capture logs
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    const addLog = (level: LogEntry['level'], args: any[]) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      const newLog: LogEntry = {
        id: logId,
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        data: args.length > 1 ? args.slice(1) : undefined
      };

      setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50 logs
      setLogId(prev => prev + 1);
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      addLog('log', args);
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog('warn', args);
    };

    console.info = (...args) => {
      originalConsole.info(...args);
      addLog('info', args);
    };

    // Cleanup function
    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
    };
  }, [isVisible, logId]);

  const clearLogs = () => {
    setLogs([]);
    setLogId(0);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 p-0"
        size="sm"
      >
        <Bug className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-w-sm w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-100 rounded-t-lg border-b">
        <div className="flex items-center space-x-2">
          <Bug className="w-4 h-4" />
          <span className="text-sm font-bold">Debug Log</span>
          <span className="text-xs text-gray-500">({logs.length})</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            onClick={() => setIsMinimized(!isMinimized)}
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
          >
            {isMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
          <Button
            onClick={clearLogs}
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 text-gray-500"
          >
            Clear
          </Button>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 text-gray-500"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Log Content */}
      {!isMinimized && (
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {logs.length === 0 ? (
            <div className="text-center text-gray-400 py-4 text-sm">
              No logs yet...
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded text-xs border ${getLevelColor(log.level)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs opacity-70">{log.timestamp}</span>
                  <span className="uppercase font-bold text-xs">{log.level}</span>
                </div>
                <div className="break-words whitespace-pre-wrap">
                  {log.message}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DebugLog;