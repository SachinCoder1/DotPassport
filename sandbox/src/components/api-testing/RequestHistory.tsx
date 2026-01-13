import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Trash2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

// Session start time to distinguish current session entries
const SESSION_START_TIME = Date.now();

// Format timestamp to show actual date/time
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return `Yesterday ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, h:mm a');
}

interface HistoryEntry {
  id: string;
  methodName: string;
  parameters: Record<string, unknown>;
  timestamp: number;
  responseStatus?: number;
  success?: boolean;
}

interface RequestHistoryProps {
  methodName: string;
  polkadotAddress: string;
  onLoadParameters?: (parameters: Record<string, unknown>) => void;
  onViewResponse?: (entry: HistoryEntry) => void;
  maxEntries?: number;
}

const getStorageKey = (polkadotAddress: string) =>
  `dotpassport-history-${polkadotAddress}`;

export function RequestHistory({
  methodName,
  polkadotAddress,
  onLoadParameters,
  maxEntries = 20,
}: RequestHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const loadHistory = useCallback(() => {
    try {
      const storageKey = getStorageKey(polkadotAddress);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const allHistory: HistoryEntry[] = JSON.parse(stored);
        const methodHistory = allHistory
          .filter((entry) => entry.methodName === methodName)
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, maxEntries);
        setHistory(methodHistory);
      }
    } catch (error) {
      console.error('Failed to load request history:', error);
    }
  }, [polkadotAddress, methodName, maxEntries]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const clearHistory = () => {
    try {
      const storageKey = getStorageKey(polkadotAddress);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const allHistory: HistoryEntry[] = JSON.parse(stored);
        const otherHistory = allHistory.filter(
          (entry) => entry.methodName !== methodName
        );
        localStorage.setItem(storageKey, JSON.stringify(otherHistory));
        setHistory([]);
      }
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const deleteEntry = (id: string) => {
    try {
      const storageKey = getStorageKey(polkadotAddress);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const allHistory: HistoryEntry[] = JSON.parse(stored);
        const filtered = allHistory.filter((entry) => entry.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
        loadHistory();
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleLoadParameters = (entry: HistoryEntry) => {
    setSelectedEntry(entry.id);
    if (onLoadParameters) {
      onLoadParameters(entry.parameters);
    }
    setTimeout(() => setSelectedEntry(null), 500);
  };

  const getStatusIcon = (entry: HistoryEntry) => {
    if (entry.success === undefined) {
      return <Clock className="w-4 h-4 text-gray-400 dark:text-gray-600" />;
    }
    if (entry.success) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (entry: HistoryEntry): string => {
    if (entry.success === undefined)
      return 'border-gray-200 dark:border-gray-700';
    if (entry.success) return 'border-green-200 dark:border-green-700';
    return 'border-red-200 dark:border-red-700';
  };

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full mb-4">
            <Clock className="w-8 h-8 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Request History
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Your request history for this method will appear here. Make your
            first API call to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Request History
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {history.length} recent {history.length === 1 ? 'request' : 'requests'}
          </p>
        </div>
        <button
          onClick={clearHistory}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* History List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {history.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l-4 ${getStatusColor(
                entry
              )} ${
                selectedEntry === entry.id
                  ? 'bg-purple-50 dark:bg-purple-900/20'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="shrink-0 mt-0.5">{getStatusIcon(entry)}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Timestamp */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {/* Current session indicator */}
                    {entry.timestamp >= SESSION_START_TIME && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                        This session
                      </span>
                    )}
                    {/* Relative time */}
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {formatDistanceToNow(entry.timestamp, {
                        addSuffix: true,
                      })}
                    </span>
                    {/* Actual date/time for older entries */}
                    {entry.timestamp < SESSION_START_TIME && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        ({formatTimestamp(entry.timestamp)})
                      </span>
                    )}
                    {entry.responseStatus && (
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          entry.success
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {entry.responseStatus}
                      </span>
                    )}
                  </div>

                  {/* Parameters */}
                  <div className="space-y-1">
                    {Object.entries(entry.parameters).length > 0 ? (
                      Object.entries(entry.parameters).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-baseline gap-2 text-xs"
                        >
                          <span className="font-mono text-purple-600 dark:text-purple-400">
                            {key}:
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 font-mono truncate">
                            {typeof value === 'string'
                              ? `"${value}"`
                              : String(value)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        No parameters
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex gap-2">
                  <button
                    onClick={() => handleLoadParameters(entry)}
                    className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                    title="Load parameters"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Note */}
      {history.length >= maxEntries && (
        <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              Showing the {maxEntries} most recent requests. Older requests are
              automatically archived.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to add entry to history (export for use in ApiTestingPage)
export function addToRequestHistory(
  polkadotAddress: string,
  methodName: string,
  parameters: Record<string, unknown>,
  response?: { status: number; success: boolean }
): void {
  try {
    const storageKey = getStorageKey(polkadotAddress);
    const stored = localStorage.getItem(storageKey);
    const allHistory: HistoryEntry[] = stored ? JSON.parse(stored) : [];

    const newEntry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      methodName,
      parameters,
      timestamp: Date.now(),
      responseStatus: response?.status,
      success: response?.success,
    };

    allHistory.unshift(newEntry);
    const trimmed = allHistory.slice(0, 100);
    localStorage.setItem(storageKey, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to add to request history:', error);
  }
}
