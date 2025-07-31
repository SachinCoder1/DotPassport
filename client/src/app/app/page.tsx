"use client";

import { useWalletStore } from "@/store/walletStore";

export default function AppPage() {
  const { selectedAccount,user } = useWalletStore();
  return (
    <div className="">
      App Page Content. If you are seeing this means wallet is connected and you
      are logged in.
      {selectedAccount && "Connected Account: " + selectedAccount.address}

      {JSON.stringify(user, null, 2)}
      {/* Add more app content here */}
    </div>
  );
}
