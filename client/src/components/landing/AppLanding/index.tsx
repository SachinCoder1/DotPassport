"use client";

import AppLandingWrapper from "./AppLandingWrapper";
import { useWalletStore } from "@/store/walletStore";
import { ArrowRight, Wallet } from "lucide-react";

const AppLanding = () => {
  const { openWalletModal } = useWalletStore();

  return (
    <AppLandingWrapper>
      <div className="flex justify-center">
        <button
          onClick={openWalletModal}
          className="flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </AppLandingWrapper>
  );
};

export default AppLanding;
