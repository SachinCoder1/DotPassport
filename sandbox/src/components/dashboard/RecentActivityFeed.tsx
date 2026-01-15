import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { EmptyState } from '~/components/ui';
import type { RequestLog } from '~/types/requestLog';

interface RecentActivityFeedProps {
  logs?: RequestLog[];
  autoRefresh?: boolean;
}

export function RecentActivityFeed({
  logs,
  autoRefresh = false,
}: RecentActivityFeedProps) {
  const navigate = useNavigate();

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    }
    if (statusCode >= 400 && statusCode < 500) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    }
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  };

  // const getResponseTimeColor = (time: number) => {
  //   if (time < 100) return 'text-green-600 dark:text-green-400';
  //   if (time < 300) return 'text-yellow-600 dark:text-yellow-400';
  //   return 'text-red-600 dark:text-red-400';
  // };

  const getMethodColor = (method: string) => {
    if (method === 'GET') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    if (method === 'POST') return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  // Show empty state if no logs
  if (!logs || logs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <EmptyState
          icon={Activity}
          title="No recent requests"
          description="Your API request activity will appear here"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Latest API requests
            {autoRefresh && (
              <span className="ml-2 inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs">Live</span>
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => navigate('/logs')}
          className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
              onClick={() => navigate('/logs')}
            >
              {/* Method badge */}
              <span
                className={`flex-shrink-0 px-2 py-1 text-xs font-bold rounded ${getMethodColor(
                  log.method
                )}`}
              >
                {log.method}
              </span>

              {/* Endpoint */}
              <span className="flex-1 text-sm font-mono text-gray-900 dark:text-gray-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {log.endpoint}
              </span>

              {/* Status code */}
              <span
                className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                  log.statusCode
                )}`}
              >
                {log.statusCode}
              </span>

              {/* Response time */}
              {/* <span
                className={`flex-shrink-0 text-sm font-medium ${getResponseTimeColor(
                  log.responseTime
                )}`}
              >
                {log.responseTime}ms
              </span> */}

              {/* Timestamp */}
              <div className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                {formatDistance(new Date(log.timestamp), new Date(), {
                  addSuffix: true,
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
