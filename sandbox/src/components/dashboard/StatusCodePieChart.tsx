import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PieChart as PieChartIcon } from 'lucide-react';
import { EmptyState } from '~/components/ui';

interface StatusCodePieChartProps {
  data?: {
    success: number; // 2xx
    clientErrors: number; // 4xx
    serverErrors: number; // 5xx
  } | null;
}

export function StatusCodePieChart({ data }: StatusCodePieChartProps) {
  const navigate = useNavigate();

  // Show empty state if no data or all zeros
  if (
    !data ||
    (data.success === 0 && data.clientErrors === 0 && data.serverErrors === 0)
  ) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Status Code Distribution
        </h3>
        <EmptyState
          icon={PieChartIcon}
          title="No requests yet"
          description="Make some API requests to see status code distribution"
        />
      </motion.div>
    );
  }

  const statusData = data;
  const total =
    statusData.success + statusData.clientErrors + statusData.serverErrors;
  const successRate =
    total > 0 ? ((statusData.success / total) * 100).toFixed(1) : '0.0';

  const chartData = [
    { name: 'Success (2xx)', value: statusData.success, color: '#22c55e' },
    { name: 'Client Errors (4xx)', value: statusData.clientErrors, color: '#eab308' },
    { name: 'Server Errors (5xx)', value: statusData.serverErrors, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  const handleClick = (entry: { name: string }) => {
    let statusFilter = '';
    if (entry.name.includes('2xx')) statusFilter = '2xx';
    else if (entry.name.includes('4xx')) statusFilter = '4xx';
    else if (entry.name.includes('5xx')) statusFilter = '5xx';
    navigate(`/logs?status=${statusFilter}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Status Code Distribution
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Click segments to filter logs
        </p>
      </div>

      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              onClick={handleClick}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg, #1f2937)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                color: 'var(--tooltip-text, #fff)',
              }}
              formatter={(value: number) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                'Requests',
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{
                fontSize: '12px',
                paddingTop: '16px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text - success rate */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {successRate}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Success Rate
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {statusData.success}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Success
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {statusData.clientErrors}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Client Errors
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {statusData.serverErrors}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Server Errors
          </div>
        </div>
      </div>
    </motion.div>
  );
}
