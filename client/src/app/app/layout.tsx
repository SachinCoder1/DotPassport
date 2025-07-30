// src/app/layout.tsx

"use client";

import { useEffect } from "react"; // ✅ 1. Add useEffect import
import AppLanding from "@/components/landing/AppLanding";
import { useWalletStore } from "@/store/walletStore";
import { useIsClient } from "usehooks-ts";

// A simple full-screen loader component
const InitialLoader = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
  </div>
);

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isClient = useIsClient();
  
  // ✅ 2. Get the 'initialize' action along with the state
  const { isInitializing, isAuthenticated, initialize } = useWalletStore();

  // ✅ 3. Call initialize from here, the top-level layout component
  useEffect(() => {
    // This effect runs once when the component mounts on the client,
    // triggering our session check.
    initialize("my-polkadot-dapp");
  }, [initialize]); // The dependency array ensures it only runs once

  console.log( "Layout state:", { isClient, isInitializing, isAuthenticated } );

  if (!isClient || isInitializing) {
    return <InitialLoader />;
  }

  if (!isAuthenticated) {
    return <AppLanding />;
  }

  return <div>{children}</div>;
}