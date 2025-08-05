"use client";

import Dashboard from "@/components/Dashboard";
import { useWalletStore } from "@/store/walletStore";
import { Shield } from "lucide-react";
import { useIsClient } from "usehooks-ts";

export default function AppPage() {
  const { selectedAccount, user } = useWalletStore();
  const isClient = useIsClient();
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-shimmer">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-3">
                Loading Dashboard
              </h2>
              <p className="text-gray-500">
                Preparing your personalized overview...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="">
      <Dashboard />
    </div>
  );
}
