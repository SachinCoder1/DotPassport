import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '~/components/ui';

interface EndpointData {
  endpoint: string;
  count: number;
}

interface EndpointBreakdownTableProps {
  data?: EndpointData[] | null;
}

type SortKey = 'endpoint' | 'count';
type SortDirection = 'asc' | 'desc';

export function EndpointBreakdownTable({ data }: EndpointBreakdownTableProps) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>('count');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Endpoint Performance
        </h3>
        <EmptyState
          icon={Activity}
          title="No endpoint data"
          description="Start making API requests to see endpoint performance metrics"
        />
      </motion.div>
    );
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortDirection === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const getSortIcon = (columnKey: SortKey) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
    ) : (
      <ArrowDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Endpoint Performance
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Monitor performance by endpoint
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th
                className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('endpoint')}
              >
                <div className="flex items-center gap-2">
                  Endpoint
                  {getSortIcon('endpoint')}
                </div>
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleSort('count')}
              >
                <div className="flex items-center justify-end gap-2">
                  Request Count
                  {getSortIcon('count')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <motion.tr
                key={row.endpoint}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() =>
                  navigate(`/logs?endpoint=${encodeURIComponent(row.endpoint)}`)
                }
              >
                <td className="py-3 px-4">
                  <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                    {row.endpoint}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {row.count.toLocaleString()}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
