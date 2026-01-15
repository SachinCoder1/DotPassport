import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FlaskConical,
  Palette,
  ScrollText,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useWalletStore } from '~/store/walletStore';

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'API Testing', path: '/api-testing', icon: FlaskConical },
  { name: 'Widget Testing', path: '/widget-testing', icon: Palette },
  { name: 'Request Logs', path: '/logs', icon: ScrollText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const location = useLocation();
  const { user, refreshUsage, isAuthenticated } = useWalletStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-refresh usage every 60 seconds when page is visible
  // Note: Usage also refreshes after API calls via the sandboxStore
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const startRefreshInterval = () => {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Start new interval (60 seconds - reduced from 15s to minimize API calls)
      intervalRef.current = setInterval(() => {
        refreshUsage();
      }, 60000);
    };

    const stopRefreshInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page became visible - refresh immediately and start interval
        refreshUsage();
        startRefreshInterval();
      } else {
        // Page became hidden - stop refreshing
        stopRefreshInterval();
      }
    };

    // Initial setup
    if (document.visibilityState === 'visible') {
      startRefreshInterval();
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopRefreshInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, user?.polkadotAddress, refreshUsage]);

  const MobileSidebar = () => (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 md:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Menu
              </h2>
              <button
                onClick={onMobileClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onMobileClose}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-400 font-semibold shadow-sm border-l-4 border-purple-600 dark:border-purple-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {user && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-400">
                      {user.polkadotAddress?.slice(0, 2).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.polkadotAddress?.slice(0, 6)}...
                      {user.polkadotAddress?.slice(-4)}
                    </p>
                    <span className="inline-block text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full uppercase font-medium">
                      {user.tier}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );

  const DesktopSidebar = () => (
    <aside
      className={`hidden md:flex flex-col fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-18' : 'w-64'
      } z-30`}
    >
      <div className="flex items-center justify-end p-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative flex items-center rounded-lg transition-all duration-200 ${
                isCollapsed ? 'justify-center px-3 py-3.5' : 'gap-3.5 px-4 py-3.5'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-400 font-semibold shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 dark:bg-purple-400 rounded-r"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.name}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="p-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                Documentation
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
              Learn more about the DotPassport SDK
            </p>
            <a
              href="https://docs.dotpassport.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors duration-200"
            >
              View Docs →
            </a>
          </div>
        </div>
      )}

      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center group relative">
                <span className="text-sm font-bold text-purple-700 dark:text-purple-400">
                  {user.polkadotAddress?.slice(0, 2).toUpperCase() || 'U'}
                </span>
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  <div className="font-medium">
                    {user.polkadotAddress?.slice(0, 6)}...
                    {user.polkadotAddress?.slice(-4)}
                  </div>
                  <div className="text-purple-300 uppercase">{user.tier}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-700 dark:text-purple-400">
                    {user.polkadotAddress?.slice(0, 2).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.polkadotAddress?.slice(0, 6)}...
                    {user.polkadotAddress?.slice(-4)}
                  </p>
                  <span className="inline-block text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full uppercase font-medium">
                    {user.tier}
                  </span>
                </div>
              </div>

              {user.usage && user.rateLimits && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Hourly Usage
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {user.usage.hourly} /{' '}
                      {user.rateLimits.hourly}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        (user.usage.hourly /
                          user.rateLimits.hourly) *
                          100 >
                        80
                          ? 'bg-red-500'
                          : (user.usage.hourly /
                              user.rateLimits.hourly) *
                              100 >
                            50
                          ? 'bg-yellow-500'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          (user.usage.hourly /
                            user.rateLimits.hourly) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  );
}
