import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  Copy,
  Activity,
  Clock,
  CheckCircle2,
  FlaskConical,
  Palette,
  ScrollText,
  RefreshCw,
  AlertTriangle,
  LayoutDashboard,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useWalletStore } from '~/store/walletStore';
import { useSandboxStore } from '~/store/sandboxStore';
import { maskApiKey } from '~/service/apiKeyService';
import { regenerateApiKey } from '~/service/authService';
import { toast } from 'sonner';
import { APP_NAME } from '~/utils/constants';
import { StatCard } from '~/components/dashboard/StatCard';
import { StatusCodePieChart } from '~/components/dashboard/StatusCodePieChart';
import { RecentActivityFeed } from '~/components/dashboard/RecentActivityFeed';
import { Skeleton } from '~/components/ui';
import { PageHeader } from '~/components/shared/PageHeader';

export function DashboardPage() {
  const { user, signMessage, initialize } = useWalletStore();
  const {
    requestStats,
    recentLogs,
    initializeClient,
    refreshStats,
    refreshRequestStats,
    fetchRecentLogs,
  } = useSandboxStore();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isBackgroundRefresh, setIsBackgroundRefresh] = useState(false);
  const hasLoadedOnce = useRef(false);

  // Background refresh function - refreshes data without showing loading state
  const refreshDataInBackground = useCallback(async () => {
    setIsBackgroundRefresh(true);
    try {
      await Promise.all([
        refreshStats(),
        refreshRequestStats(),
        fetchRecentLogs(),
      ]);
    } finally {
      setIsBackgroundRefresh(false);
    }
  }, [refreshStats, refreshRequestStats, fetchRecentLogs]);

  useEffect(() => {
    if (user && user.polkadotAddress) {
      // Initialize SDK client if we have API key
      // Try from user object (new users) or localStorage (existing users)
      const apiKey = user.apiKey || localStorage.getItem('sandbox_api_key');
      console.log('[DashboardPage] User data:', {
        hasUser: !!user,
        hasApiKeyInUser: !!user.apiKey,
        apiKeyFromUser: user.apiKey
          ? user.apiKey.substring(0, 8) + '...'
          : 'null',
        apiKeyFromLocalStorage: localStorage.getItem('sandbox_api_key')
          ? localStorage.getItem('sandbox_api_key')?.substring(0, 8) + '...'
          : 'null',
        finalApiKey: apiKey ? apiKey.substring(0, 8) + '...' : 'null',
      });

      if (apiKey) {
        console.log('[DashboardPage] Calling initializeClient with key');
        initializeClient(apiKey);
      } else {
        console.warn(
          '[DashboardPage] No API key available - SDK will not be initialized'
        );
      }

      // Check if we've loaded data before (returning to page)
      if (hasLoadedOnce.current) {
        // Background refresh - show existing data while fetching new
        console.log('[DashboardPage] Background refresh on page return');
        refreshDataInBackground();
      } else {
        // First load - show loading skeleton
        setIsInitialLoad(true);
        Promise.all([
          refreshStats(),
          refreshRequestStats(),
          fetchRecentLogs(),
        ]).finally(() => {
          setIsInitialLoad(false);
          hasLoadedOnce.current = true;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.polkadotAddress]);

  const handleCopyApiKey = () => {
    const apiKey = user?.apiKey || localStorage.getItem('sandbox_api_key');
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success('API key copied!');
    }
  };

  const handleRegenerateApiKey = async () => {
    if (!user?.polkadotAddress || !signMessage) return;

    try {
      setIsRegenerating(true);

      // Create signature message
      const message = `Regenerate API key for ${user.polkadotAddress} at ${Date.now()}`;

      // Sign message with wallet
      const signature = await signMessage(message);

      if (!signature) {
        toast.error('Signature required to regenerate API key');
        return;
      }

      // Call regenerate endpoint
      const response = await regenerateApiKey({
        polkadotAddress: user.polkadotAddress,
        message,
        signature,
      });

      // Store new API key
      localStorage.setItem('sandbox_api_key', response.apiKey);

      // Initialize SDK with new key
      initializeClient(response.apiKey);

      // Reinitialize user data
      await initialize(APP_NAME);

      toast.success('API key regenerated successfully!');
    } catch (error) {
      console.error('Failed to regenerate API key:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(
        axiosError.response?.data?.message || 'Failed to regenerate API key'
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  // Transform requestStats for components - MUST be before any conditional returns
  // Group 3xx (304 Not Modified) with success since it means cached data was valid
  const statusCodeData = useMemo(() => {
    if (!requestStats?.byStatus) return null;
    return {
      success: (requestStats.byStatus['2xx'] || 0) + (requestStats.byStatus['3xx'] || 0),
      clientErrors: requestStats.byStatus['4xx'] || 0,
      serverErrors: requestStats.byStatus['5xx'] || 0,
    };
  }, [requestStats]);

  // Use recentLogs from requestStats if available, fallback to store recentLogs
  const logsData = useMemo(() => {
    return requestStats?.recentLogs || recentLogs;
  }, [requestStats, recentLogs]);

  if (!user) return null;

  // Show loading skeletons on initial load
  if (isInitialLoad) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton variant="text" width="300px" height="32px" />
        <Skeleton variant="card" height="200px" />
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" height="120px" />
          ))}
        </div>
        <Skeleton variant="card" height="400px" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton variant="card" height="350px" />
          <Skeleton variant="card" height="350px" />
        </div>
        <Skeleton variant="card" height="400px" />
      </div>
    );
  }

  const apiKey = user.apiKey || localStorage.getItem('sandbox_api_key');
  const rateLimitPercentage =
    user.usage && user.rateLimits
      ? (user.usage.hourly / user.rateLimits.hourly) * 100
      : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <PageHeader
        icon={LayoutDashboard}
        title={
          <span className="flex items-center gap-3">
            Welcome to Your Sandbox
            {isBackgroundRefresh && (
              <RefreshCw className="w-5 h-5 text-purple-500 animate-spin" />
            )}
          </span>
        }
        description="Test and explore the DotPassport SDK with your free API key"
      />

      {/* API Key Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-700 shadow-sm"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Your API Key
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Use this key to authenticate SDK requests
            </p>
          </div>
          <span className="inline-block text-xs px-3 py-1.5 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-100 rounded-full uppercase font-semibold">
            {user.tier}
          </span>
        </div>

        {!apiKey ? (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-4 border border-orange-200 dark:border-orange-700">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                  API Key Not Available
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-200">
                  Your API key was created before encryption support. Please
                  regenerate your API key to continue using the SDK.
                </p>
              </div>
            </div>
            <button
              onClick={handleRegenerateApiKey}
              disabled={isRegenerating}
              className="btn btn-primary w-full inline-flex items-center justify-center gap-2"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Regenerating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Regenerate API Key</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between gap-4">
              <code className="text-sm font-mono text-gray-800 dark:text-gray-200 flex-1 truncate">
                {maskApiKey(apiKey)}
              </code>
              <button
                onClick={handleCopyApiKey}
                className="btn btn-outline text-xs py-2 px-3 inline-flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                title="Copy API Key"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Created:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span
              className={`ml-2 font-medium ${
                user.isActive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Section 1: Hero Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Monthly Requests"
          value={user.usage?.monthly || 0}
          icon={Activity}
          iconColor="text-purple-600"
        />
        <StatCard
          title="This Hour"
          value={user.usage?.hourly || 0}
          icon={Clock}
          iconColor="text-blue-600"
          subtitle={`/ ${user.rateLimits?.hourly || 100}`}
        />
        <StatCard
          title="Success Rate"
          value={`${
            requestStats?.total && requestStats?.byStatus
              ? Math.round(
                  ((requestStats.byStatus['2xx'] || 0) / requestStats.total) *
                    100
                )
              : user.usage?.monthly
              ? 100
              : 0
          }%`}
          icon={CheckCircle2}
          iconColor="text-green-600"
        />
      </div>

      {/* Section 2: Request Analytics Chart - Temporarily disabled */}
      {/* <RequestAnalyticsChart polkadotAddress={user.polkadotAddress || ''} /> */}

      {/* Section 3: Status Code Distribution */}
      <StatusCodePieChart data={statusCodeData} />

      {/* Section 4: Recent Activity Feed */}
      <RecentActivityFeed logs={logsData} autoRefresh={false} />

      {/* Section 7: Rate Limit Progress (Enhanced) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Rate Limit Usage
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                Hourly ({user.usage?.hourly || 0} /{' '}
                {user.rateLimits?.hourly || 100})
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(rateLimitPercentage)}%
                </span>
                {rateLimitPercentage > 75 && (
                  <span className="text-xs text-orange-600 dark:text-orange-400">
                    Warning: {Math.round(100 - rateLimitPercentage)}% remaining
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  rateLimitPercentage > 90
                    ? 'bg-red-500'
                    : rateLimitPercentage > 75
                    ? 'bg-orange-500'
                    : rateLimitPercentage > 50
                    ? 'bg-yellow-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
                style={{ width: `${Math.min(rateLimitPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 8: Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.a
          href="/api-testing"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          className="block bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
            Test API Methods
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Try all 7 SDK methods with live examples
          </p>
        </motion.a>

        <motion.a
          href="/widget-testing"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.75 }}
          whileHover={{ scale: 1.02 }}
          className="block bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/40 dark:to-pink-800/40 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
            Widget Playground
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Preview and customize all widget components
          </p>
        </motion.a>

        <motion.a
          href="/logs"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          className="block bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/40 dark:to-pink-800/40 rounded-xl flex items-center justify-center">
              <ScrollText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
            View Request Logs
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Monitor detailed logs and analytics
          </p>
        </motion.a>
      </div>
    </div>
  );
}
