"use client";

import Dashboard from "@/components/Dashboard";
import { useWalletStore } from "@/store/walletStore";

export default function AppPage() {
  const { selectedAccount,user } = useWalletStore();
  return (
    <div className="">
     <Dashboard />
    </div>
  );
}
