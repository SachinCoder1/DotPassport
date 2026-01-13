import type { WalletOption } from "~/types";

export const commonWallets: Omit<WalletOption, "installed">[] = [
  {
    id: "polkadot-js",
    name: "Polkadot.js Extension",
    logo: "/wallet_logos/polkadot_js.svg",
    icon: "/wallet_logos/polkadot_js.svg",
    extensionName: "polkadot-js",
    description: "Official Polkadot browser extension wallet",
  },
  {
    id: "talisman",
    name: "Talisman",
    logo: "/wallet_logos/talisman.svg",
    icon: "/wallet_logos/talisman.svg",
    extensionName: "talisman",
    description: "Multi-chain wallet for Polkadot ecosystem",
  },
  {
    id: "subwallet-js",
    name: "SubWallet",
    logo: "/wallet_logos/subwallet.svg",
    icon: "/wallet_logos/subwallet.svg",
    extensionName: "subwallet-js",
    description: "Comprehensive Polkadot & Substrate wallet",
  },
];
