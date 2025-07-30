import { WalletOption } from "@/types";

export const commonWallets: Omit<WalletOption, "installed">[] = [
  {
    id: "polkadot-js",
    name: "Polkadot.js Extension",
    logo: "https://polkadot.js.org/extension/badges/Polkadot_icon.svg",
  },
  {
    id: "talisman",
    name: "Talisman",
    logo: "https://talisman.xyz/logo-icon-svg.svg",
  },
  {
    id: "subwallet-js",
    name: "SubWallet",
    logo: "https://subwallet.app/static/media/logo.548f07470f1a26d71391.svg",
  },
];
