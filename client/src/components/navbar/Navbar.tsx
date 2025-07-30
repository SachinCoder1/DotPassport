"use client";

import { useWalletStore } from "@/store/walletStore";
import { ArrowRight, Shield, Wallet } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useIsClient } from "usehooks-ts";

const Navbar = () => {
  // get current page using next router
  const router = useRouter();
  const pathname = usePathname();
  const client = useIsClient();
  console.log("pathnname: ", pathname);

  const onNavigate = (page: string) => {
    if (page === "home") {
      router.push("/");
    } else if (page === "app") {
      router.push("/app");
    }
  };
  const currentPage = pathname === "/" ? "home" : "app";
  const { isConnected } = useWalletStore();

  if (!client) return null;

  return (
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
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">
                DotPassport
              </span>
              <span className="text-xs text-gray-500 -mt-1">
                Identity Protocol
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Developers
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Ecosystem
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Docs
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            {currentPage === "app" && (
              <button className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
                <Wallet className="w-4 h-4" />
                <span>{isConnected ? "Connected" : "Connect Wallet"}</span>
              </button>
            )}
            {currentPage === "home" && (
              <button
                onClick={() => onNavigate("app")}
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <span>Launch App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
