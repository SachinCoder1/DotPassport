"use client";

import AppLandingWrapper from "./AppLandingWrapper";
import dynamic from "next/dynamic";

const DynamicPolkadotWalletConnect = dynamic(
  () => import("../../PolkadotWalletConnect"),
  { ssr: false }
);

const AppLanding = () => {
  return (
    <AppLandingWrapper>
      <DynamicPolkadotWalletConnect />
    </AppLandingWrapper>
  );
};

export default AppLanding;
