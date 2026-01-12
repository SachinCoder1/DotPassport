import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu as MenuIcon, LogOut, Settings, FileText, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useWalletStore } from '~/store/walletStore';

interface NavbarProps {
  onMobileMenuClick: () => void;
}

export function Navbar({ onMobileMenuClick }: NavbarProps) {
  const { user, selectedAccount, logout } = useWalletStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-50 shadow-sm backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-full mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left: Mobile hamburger + Logo */}
          <div className="flex items-center gap-4">
            {/* Mobile hamburger menu */}
            <button
              onClick={onMobileMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open menu"
            >
              <MenuIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Logo */}
            <Link
              to="/dashboard"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-base">DP</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  DotPassport Sandbox
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  Developer Testing Environment
                </p>
              </div>
            </Link>
          </div>

          {/* Right: User menu */}
          {user && (
            <div className="flex items-center gap-2">
              {/* User dropdown menu */}
              <Menu as="div" className="relative">
                {({ open }) => (
                  <>
                    <Menu.Button className="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                      {/* Avatar */}
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-semibold text-sm">
                          {(selectedAccount?.meta.name || 'A').charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Account info - hidden on mobile */}
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                          {selectedAccount?.meta.name || 'Account'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {user.polkadotAddress?.substring(0, 6)}...{user.polkadotAddress?.slice(-4)}
                        </p>
                      </div>

                      {/* Tier badge */}
                      <span className="hidden sm:inline-block text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full uppercase font-medium">
                        {user.tier}
                      </span>

                      {/* Chevron */}
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                      />
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-150"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none overflow-hidden">
                        {/* User info header */}
                        <div className="px-4 py-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
                              <span className="text-white font-bold">
                                {(selectedAccount?.meta.name || 'A').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {selectedAccount?.meta.name || 'Account'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                                {user.polkadotAddress}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-2">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/settings"
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                  active
                                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <Settings className="w-4 h-4" />
                                Settings
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="https://docs.dotpassport.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                  active
                                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <FileText className="w-4 h-4" />
                                Documentation
                              </a>
                            )}
                          </Menu.Item>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleLogout}
                                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                                  active
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}
                              >
                                <LogOut className="w-4 h-4" />
                                Logout
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </>
                )}
              </Menu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
