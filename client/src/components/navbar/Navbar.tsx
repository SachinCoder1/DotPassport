"use client";

import { useWalletStore } from "@/store/walletStore";
import {
  ArrowRight,
  Shield,
  Wallet,
  User,
  Award,
  TrendingUp,
  Home,
  BookOpen,
  Users,
  Settings,
  TestTube2,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useIsClient } from "usehooks-ts";
import {
  NavbarWalletButton,
  WalletConnectModal,
} from "@/components/PolkadotWalletConnect";
import { useState } from "react";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const client = useIsClient();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const { isAuthenticated, selectedAccount, logout } = useWalletStore();

  const onNavigate = (page: string) => {
    if (page === "home") {
      // If user is authenticated, go to app dashboard, otherwise landing page
      if (isAuthenticated) {
        router.push("/app");
      } else {
        router.push("/");
      }
    } else if (page === "app") {
      router.push("/app");
    } else {
      router.push(page);
    }
  };

  const currentPage = pathname === "/" ? "home" : "app";

  // Navigation items for authenticated users
  const authenticatedNavItems = [
    {
      name: "Dashboard",
      href: "/app",
      icon: Home,
      active: pathname === "/app",
    },
    {
      name: "Badges",
      href: "/app/badges",
      icon: Award,
      active: pathname.startsWith("/app/badges"),
    },
    {
      name: "Reputation",
      href: "/app/reputation",
      icon: TrendingUp,
      active: pathname.startsWith("/app/reputation"),
    },
    // {
    //   name: "Profile",
    //   href: "/app/profile",
    //   icon: User,
    //   active: pathname.startsWith("/app/profile"),
    // },
    // { name: "Community", href: "/app/community", icon: Users, active: pathname.startsWith("/app/community") },
  ];

  // Navigation items for non-authenticated users
  // const publicNavItems = [
  // { name: "Features", href: "#features" },
  // { name: "Developers", href: "#developers" },
  // { name: "Ecosystem", href: "#ecosystem" },
  // { name: "Docs", href: "/docs" },
  // ];

  if (!client) return null;


    const isTester = isAuthenticated && selectedAccount?.meta.source === 'test-mode';

    console.log("Is Tester:", isTester);
  return (
    <>
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div
              onClick={() => onNavigate("home")}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                {isAuthenticated && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">
                  DotPassport
                </span>
                <span className="text-xs text-gray-500 -mt-1">
                  Polkadot Identity
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {
                isAuthenticated && // Authenticated navigation
                  authenticatedNavItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.href)}
                      className={`cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-full border-purple-200 transition-colors duration-200 font-medium ${
                        item.active
                          ? "bg-gradient-to-r from-pink-50 to-purple-50  text-purple-700 border "
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  ))
                // : // Public navigation
                //   publicNavItems?.map((item) => (
                //     <a
                //       key={item.name}
                //       href={item.href}
                //       className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-full hover:bg-gray-50"
                //     >
                //       {item.name}
                //     </a>
                //   ))}
              }
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {/* Wallet button for app pages */}
              {/*  Conditional rendering for tester vs real user */}
              {(currentPage === "app" || isAuthenticated) && (
                isTester ? (
                  // If user is a tester, show this special button
                  <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-300 text-yellow-800 px-3 py-1.5 rounded-full">
                     <TestTube2 className="w-4 h-4" />
                     <div className="flex flex-col text-left">
                        <span className="text-xs font-bold leading-tight">Tester Mode</span>
                        <span className="text-xs font-mono leading-tight">
                            {selectedAccount?.address.slice(0, 6)}...{selectedAccount?.address.slice(-4)}
                        </span>
                     </div>
                     <button
                        onClick={logout}
                        title="End Test Session"
                        className="p-1.5 rounded-full hover:bg-yellow-200 transition-colors"
                     >
                        <LogOut className="w-4 h-4"/>
                     </button>
                  </div>
                ) : (
                  // Otherwise, show the normal wallet button
                  <NavbarWalletButton
                    onOpenModal={() => setIsWalletModalOpen(true)}
                  />
                )
              )}
              {/* END: MODIFIED */}

              {/* Launch App button for home page when not authenticated */}
              {currentPage === "home" && !isAuthenticated && (
                <button
                  onClick={() => onNavigate("app")}
                  className="cursor-pointer flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <span>Launch App</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden border-t border-gray-200/50">
            <div className="px-4 py-2">
              <div className="flex items-center space-x-1 overflow-x-auto">
                {authenticatedNavItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 text-sm font-medium ${
                      item.active
                        ? "bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 border border-purple-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
