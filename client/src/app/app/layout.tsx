"use client";

import AppLanding from "@/components/landing/AppLanding";
import { useWalletStore } from "@/store/walletStore";
import { useIsClient } from "usehooks-ts";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isClient = useIsClient();
  const {
    status,
    isLoading,
    accounts,
    isSigning,
    statusMessage,
    selectedAccount,
    isConnected,
  } = useWalletStore();

  console.log(
    "status: ",
    status,
    "isConnected",
    isConnected,
    "isLoading",
    isLoading
  );

  if (!isClient) {
    return <div>Loading...</div>;
  }

  if (isConnected === false || !selectedAccount || status !== "success") {
    return <AppLanding />;
  }

  return <div>{children}</div>;
}
