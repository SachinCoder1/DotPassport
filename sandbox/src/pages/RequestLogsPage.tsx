import { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollText, RefreshCw, Inbox, Download, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRequestLogs } from '~/service/requestLogService';
import { useWalletStore } from '~/store/walletStore';
import { Select } from '~/components/ui';
import type {
  PaginatedRequestLogs,
  RequestLogFilters,
  RequestLog,
} from '~/types/requestLog';
import { getStatusBadgeColor } from '~/service/requestLogService';
import { RequestDetailModal } from '../components/request-logs/RequestDetailModal';
import {
  ExportLogsModal,
  type ExportConfig,
} from '../components/request-logs/ExportLogsModal';
import { PageHeader } from '~/components/shared/PageHeader';

export function RequestLogsPage() {
  const { user } = useWalletStore();
  const [logs, setLogs] = useState<PaginatedRequestLogs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackgroundRefresh, setIsBackgroundRefresh] = useState(false);
  const [filters, setFilters] = useState<RequestLogFilters>({
    page: 1,
    limit: 20,
  });
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const hasLoadedOnce = useRef(false);
  const lastFiltersRef = useRef<string>('');

  const fetchLogs = useCallback(async (background = false) => {
    if (!user?.polkadotAddress) return;

    if (background) {
      setIsBackgroundRefresh(true);
    } else {
      setIsLoading(true);
    }
    try {
      const data = await getRequestLogs(filters);
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      if (background) {
        setIsBackgroundRefresh(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [user?.polkadotAddress, filters]);

  // Initial load or page return
  useEffect(() => {
    if (user?.polkadotAddress) {
      if (hasLoadedOnce.current && logs) {
        // Background refresh on page return
        console.log('[RequestLogsPage] Background refresh on page return');
        fetchLogs(true);
      } else {
        // First load
        fetchLogs(false);
        hasLoadedOnce.current = true;
        lastFiltersRef.current = JSON.stringify(filters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.polkadotAddress]);

  // Refetch when filters change (not on initial load)
  useEffect(() => {
    const currentFilters = JSON.stringify(filters);
    if (hasLoadedOnce.current && lastFiltersRef.current !== currentFilters) {
      lastFiltersRef.current = currentFilters;
      fetchLogs(false);
    }
  }, [filters, fetchLogs]);

  const handleFilterChange = (key: keyof RequestLogFilters, value: RequestLogFilters[typeof key]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleViewLog = (log: RequestLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleExport = async (config: ExportConfig) => {
    const data = logs?.logs || [];
    if (config.format === 'json') {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `request-logs-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      const headers = config.fields.join(',');
      const rows = data.map((log: RequestLog) =>
        config.fields
          .map((field) => {
            const value = log[field as keyof RequestLog];
            if (typeof value === 'object') return JSON.stringify(value);
            return value || '';
          })
          .join(',')
      );
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `request-logs-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={ScrollText}
        title={
          <span className="flex items-center gap-2">
            Request Logs
            {isBackgroundRefresh && (
              <RefreshCw className="w-4 h-4 text-purple-500 animate-spin" />
            )}
          </span>
        }
        description="View detailed logs of all your API requests"
        actions={
          <>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => fetchLogs(false)}
              disabled={isLoading || isBackgroundRefresh}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </>
        }
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Filters
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Endpoint
            </label>
            <input
              type="text"
              placeholder="e.g., /profile"
              value={filters.endpoint || ''}
              onChange={(e) => handleFilterChange('endpoint', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Method
            </label>
            <Select
              options={[
                { value: '', label: 'All Methods' },
                { value: 'GET', label: 'GET' },
                { value: 'POST', label: 'POST' },
                { value: 'PUT', label: 'PUT' },
                { value: 'DELETE', label: 'DELETE' },
              ]}
              value={filters.method || ''}
              onChange={(value) => handleFilterChange('method', value as string)}
              placeholder="All Methods"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status Code
            </label>
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: '200', label: '200 - OK' },
                { value: '400', label: '400 - Bad Request' },
                { value: '401', label: '401 - Unauthorized' },
                { value: '404', label: '404 - Not Found' },
                { value: '500', label: '500 - Server Error' },
              ]}
              value={filters.statusCode ? String(filters.statusCode) : ''}
              onChange={(value) =>
                handleFilterChange(
                  'statusCode',
                  value ? parseInt(value as string) : undefined
                )
              }
              placeholder="All Statuses"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Per Page
            </label>
            <Select
              options={[
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: '50', label: '50' },
                { value: '100', label: '100' },
              ]}
              value={String(filters.limit)}
              onChange={(value) =>
                handleFilterChange('limit', parseInt(value as string))
              }
              placeholder="20"
            />
          </div>
        </div>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Loading logs...</p>
          </div>
        ) : logs && logs.logs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Timestamp
                    </th>
                    <th className="text-left px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Method
                    </th>
                    <th className="text-left px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Endpoint
                    </th>
                    <th className="text-left px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-left px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => handleViewLog(log)}
                    >
                      <td className="px-6 py-5 text-sm text-gray-900 dark:text-gray-100">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          {log.method}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-mono text-gray-900 dark:text-gray-100">
                        {log.endpoint}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            log.statusCode
                          )}`}
                        >
                          {log.statusCode}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewLog(log);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-5 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                {logs?.page && logs?.limit
                  ? (logs.page - 1) * logs.limit + 1
                  : 0}{' '}
                to{' '}
                {logs?.page && logs?.limit && logs?.total
                  ? Math.min(logs.page * logs.limit, logs.total)
                  : 0}{' '}
                of {logs?.total || 0} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(logs.page - 1)}
                  disabled={logs.page === 1}
                  className="btn btn-outline text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from(
                    { length: Math.min(logs.totalPages, 5) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            logs.page === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>
                <button
                  onClick={() => handlePageChange(logs.page + 1)}
                  disabled={logs.page === logs.totalPages}
                  className="btn btn-outline text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">No logs found</p>
            <p className="text-sm">
              Start making API requests to see logs here
            </p>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <RequestDetailModal
        log={selectedLog}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedLog(null);
        }}
      />
      <ExportLogsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}
