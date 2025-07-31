import { WalletOption } from "@/types";

export const commonWallets: Omit<WalletOption, "installed">[] = [
  {
    id: "polkadot-js",
    name: "Polkadot.js Extension",
    logo: "/wallet_logos/polkadot_js.svg",
  },
  {
    id: "talisman",
    name: "Talisman",
    logo: "/wallet_logos/talisman.svg",
  },
  {
    id: "subwallet-js",
    name: "SubWallet",
    logo: "/wallet_logos/subwallet.svg",
  },
];
