// src/store/walletStore.ts

"use client";

import { create } from "zustand";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { stringToHex } from "@polkadot/util";
import { isAxiosError } from "axios";
import {
  requestChallenge,
  loginWithPolkadot,
  logoutUser,
  loginForTest,
} from "@/service/authService";
import type { LoggedInUser } from "@/types/api";
import { getMe } from "@/service/profileService";

// State and Action Interfaces
interface WalletState {
  isConnected: boolean;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;
  status:
    | "idle"
    | "connecting"
    | "connected"
    | "error"
    | "disconnected"
    | "info"
    | "signing"
    | "success";
  statusMessage: string | null;
  connectedWalletSource: string | null;
  isLoading: boolean;
  isSigning: boolean;
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: LoggedInUser | null;
  unsubscribeAccounts: (() => void) | undefined;
}

interface WalletActions {
  initialize: (dAppAppName: string) => Promise<void>;
  connectWallet: (source: string, dAppAppName: string) => Promise<boolean>;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  disconnectWallet: () => void;
  setSelectedAccount: (account: InjectedAccountWithMeta | null) => void;
  loginAsTester: (testAddress: string) => Promise<boolean>;
}

type WalletStore = WalletState & WalletActions;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const LAST_CONNECTED_WALLET_KEY = "last_connected_polkadot_wallet_source";
// Key for storing tester status in localStorage
const IS_TESTER_KEY = "is_tester_mode";

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial State
  isConnected: false,
  accounts: [],
  selectedAccount: null,
  status: "idle",
  statusMessage: null,
  connectedWalletSource: null,
  isLoading: false,
  isSigning: false,
  isAuthenticated: false,
  isInitializing: true,
  user: null,
  unsubscribeAccounts: undefined,

  // --- ACTIONS ---

  initialize: async (dAppAppName) => {
    // Updated initialize logic
    try {
      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      if (accessToken) {
        try {
          const userData = await getMe();
          const isTesterSession =
            localStorage.getItem(IS_TESTER_KEY) === "true";

          if (isTesterSession) {
            // If it's a tester session, reconstruct the mock account
            const mockAccount: InjectedAccountWithMeta = {
              address: userData.wallet, // Use address from the fetched user
              meta: {
                name: "Tester Account",
                source: "test-mode",
                genesisHash: null,
              },
            };
            set({
              user: userData,
              isAuthenticated: true,
              isConnected: true, // A tester is considered connected
              selectedAccount: mockAccount,
            });
          } else {
            // It's a regular user session, check for last connected wallet
            set({ user: userData, isAuthenticated: true });
            const lastConnectedSource =
              typeof window !== "undefined"
                ? localStorage.getItem(LAST_CONNECTED_WALLET_KEY)
                : null;
            if (lastConnectedSource) {
              await get().connectWallet(lastConnectedSource, dAppAppName);
            }
          }
        } catch (error) {
          console.error("Session check failed, logging out:", error);
          get().disconnectWallet();
        }
      }
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      set({ isInitializing: false });
    }
    // END: MODIFIED
  },

  connectWallet: async (source, dAppAppName) => {
    const { web3Enable, web3AccountsSubscribe } = await import(
      "@polkadot/extension-dapp"
    );
    set({
      isLoading: true,
      status: "connecting",
      statusMessage: `Connecting to ${capitalize(source)}...`,
    });

    get().unsubscribeAccounts?.();

    try {
      const extensions = await web3Enable(dAppAppName);
      if (extensions.length === 0)
        throw new Error("No Polkadot extensions found or permission denied.");

      const foundExtension = extensions.find((ext) => ext.name === source);
      if (!foundExtension)
        throw new Error(
          `${capitalize(source)} wallet not found or not enabled.`
        );

      const unsub = await web3AccountsSubscribe((allAccounts) => {
        const accountsFromSource = allAccounts.filter(
          (acc) => acc.meta.source === source
        );

        if (accountsFromSource.length > 0) {
          const currentSelected = get().selectedAccount;
          const newSelected =
            accountsFromSource.find(
              (acc) => acc.address === currentSelected?.address
            ) || accountsFromSource[0];
          set({
            accounts: accountsFromSource,
            selectedAccount: newSelected,
            isConnected: true,
            status: "connected",
            statusMessage: `Connected to ${capitalize(source)}.`,
            isLoading: false,
          });
          localStorage.setItem(LAST_CONNECTED_WALLET_KEY, source);
        } else {
          get().disconnectWallet();
        }
      });

      set({ unsubscribeAccounts: unsub, connectedWalletSource: source });
      return true;
    } catch (error: any) {
      console.error("Connection error:", error);
      set({
        status: "error",
        statusMessage: `Connection failed: ${error.message}`,
        isLoading: false,
      });
      return false;
    }
  },

  login: async () => {
    const { selectedAccount } = get();
    if (!selectedAccount) {
      set({ status: "error", statusMessage: "No account selected." });
      return false;
    }
    set({
      isSigning: true,
      status: "signing",
      statusMessage: "Requesting challenge...",
    });
    try {
      const { message } = await requestChallenge(selectedAccount.address);
      set({ statusMessage: "Please sign the message in your wallet..." });
      const { web3FromSource } = await import("@polkadot/extension-dapp");
      const injector = await web3FromSource(selectedAccount.meta.source);
      if (!injector.signer.signRaw)
        throw new Error("Wallet does not support signing.");
      const { signature } = await injector.signer.signRaw({
        address: selectedAccount.address,
        data: stringToHex(message),
        type: "bytes",
      });
      set({ statusMessage: "Verifying..." });
      const { user, accessToken } = await loginWithPolkadot({
        address: selectedAccount.address,
        message,
        signature,
      });
      if (!user || !accessToken) {
        throw new Error("Login failed, user data not returned.");
      }
      const userData = await getMe();

      set({
        isAuthenticated: true,
        user: userData,
        status: "success",
        statusMessage: "Login successful!",
      });
      return true;
    } catch (err: any) {
      const message = isAxiosError(err)
        ? err.response?.data?.message
        : err.message;
      set({ status: "error", statusMessage: `Login failed: ${message}` });
      return false;
    } finally {
      set({ isSigning: false });
    }
  },

  loginAsTester: async (testAddress: string) => {
    set({
      isLoading: true,
      status: "info",
      statusMessage: "Attempting test login...",
    });
    try {
      const { user, accessToken } = await loginForTest(testAddress);
      if (!user || !accessToken) {
        throw new Error("Test login failed: No user data returned.");
      }
      const mockAccount: InjectedAccountWithMeta = {
        address: user.address,
        meta: {
          name: "Tester Account",
          source: "test-mode",
          genesisHash: null,
        },
      };

      set({
        isAuthenticated: true,
        isConnected: true,
        user: user as any,
        selectedAccount: mockAccount,
        status: "success",
        statusMessage: "Test login successful!",
        isLoading: false,
      });

      // Save the tester status to localStorage
      localStorage.setItem(IS_TESTER_KEY, "true");

      return true;
    } catch (err: any) {
      const message = isAxiosError(err)
        ? err.response?.data?.message
        : err.message;
      set({
        status: "error",
        statusMessage: `Test login failed: ${message}`,
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Backend logout failed.", error);
    } finally {
      get().disconnectWallet();
    }
  },

  disconnectWallet: () => {
    get().unsubscribeAccounts?.();

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem(LAST_CONNECTED_WALLET_KEY);
    // Clear the tester status on logout
    localStorage.removeItem(IS_TESTER_KEY);

    set({
      isAuthenticated: false,
      user: null,
      isConnected: false,
      accounts: [],
      selectedAccount: null,
      status: "disconnected",
      statusMessage: "Wallet disconnected.",
      connectedWalletSource: null,
      unsubscribeAccounts: undefined,
      isLoading: false,
    });
  },

  setSelectedAccount: (account) => set({ selectedAccount: account }),
}));
