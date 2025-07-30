"use client";

import { useWalletStore } from "@/store/walletStore";

export default function AppPage() {
  const { selectedAccount } = useWalletStore();
  return (
    <div className="">
      App Page Content. If you are seeing this means wallet is connected and you
      are logged in.
      {selectedAccount && "Connected Account: " + selectedAccount.address}
    </div>
  );
}
