import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { MetricSparkline } from './MetricSparkline';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparklineData?: number[];
  sparklineColor?: string;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  trend,
  sparklineData,
  sparklineColor,
  subtitle,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-7 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          {title}
        </span>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>

      <div className="mb-2">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
          {subtitle && (
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 font-normal">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className="flex items-center gap-1 mb-2">
          {trend.isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
          )}
          <span
            className={`text-sm font-medium ${
              trend.isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            vs yesterday
          </span>
        </div>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3 -mb-2">
          <MetricSparkline data={sparklineData} color={sparklineColor} />
        </div>
      )}
    </motion.div>
  );
}
