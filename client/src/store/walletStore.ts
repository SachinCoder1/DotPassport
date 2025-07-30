"use client";

import { create } from "zustand";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
// ✅ All imports from '@polkadot/extension-dapp' have been removed from here.
import { stringToHex } from "@polkadot/util";

// Define the state interface
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
  connectedWalletSource: string | null; // Stores the source of the connected wallet
  isLoading: boolean; // General loading for wallet operations
  isSigning: boolean; // Specific loading for signing operations
  signature: string | null; // Stores the last generated signature
  unsubscribeAccounts: (() => void) | undefined;
}

// Define the actions interface
interface WalletActions {
  // Connect to a specific wallet source (e.g., 'polkadot-js', 'talisman')
  connectWallet: (source: string, dAppAppName: string) => Promise<boolean>;
  disconnectWallet: () => void;
  setSelectedAccount: (account: InjectedAccountWithMeta | null) => void;
  signMessage: (message: string) => Promise<boolean>; // Action to sign a message
  initializeWallet: (dAppAppName: string) => Promise<void>; // For auto-reconnect

  // Internal setters (prefixed with _ for clarity)
  _setStatus: (status: WalletState["status"], message?: string | null) => void;
  _setLoading: (loading: boolean) => void;
  _setAccounts: (accounts: InjectedAccountWithMeta[]) => void;
  _setConnectedWalletSource: (source: string | null) => void;
  _setUnsubscribeAccounts: (unsub: (() => void) | undefined) => void;
  _setIsSigning: (signing: boolean) => void;
  _setSignature: (signature: string | null) => void;
}

// Combine state and actions
type WalletStore = WalletState & WalletActions;

// Helper function (can be moved to a utils file)
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// LocalStorage key for persisting connected wallet source
const LAST_CONNECTED_WALLET_KEY = "last_connected_polkadot_wallet_source";

// Create the Zustand store
export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial state
  isConnected: false,
  accounts: [],
  selectedAccount: null,
  status: "idle",
  statusMessage: null,
  connectedWalletSource: null,
  isLoading: false,
  isSigning: false,
  signature: null,
  unsubscribeAccounts: undefined,

  // Actions
  _setStatus: (status, message = null) =>
    set({ status, statusMessage: message }),
  _setLoading: (loading) => set({ isLoading: loading }),
  _setAccounts: (accounts) => set({ accounts }),
  _setConnectedWalletSource: (source) => set({ connectedWalletSource: source }),
  _setUnsubscribeAccounts: (unsub) => set({ unsubscribeAccounts: unsub }),
  _setIsSigning: (signing) => set({ isSigning: signing }),
  _setSignature: (signature) => set({ signature }),

  // Main connection logic
  connectWallet: async (source: string, dAppAppName: string) => {
    // ✅ MODIFICATION: Dynamically import only when the function is called.
    const { web3Enable, web3AccountsSubscribe } = await import(
      "@polkadot/extension-dapp"
    );

    const {
      _setStatus,
      _setLoading,
      _setAccounts,
      _setConnectedWalletSource,
      _setUnsubscribeAccounts,
      selectedAccount: currentSelectedAccount,
      unsubscribeAccounts: currentUnsubscribe,
    } = get();

    _setLoading(true);
    _setStatus(
      "connecting",
      `Requesting connection to ${capitalize(source)}...`
    );

    // Clean up any existing subscription first
    if (currentUnsubscribe) {
      currentUnsubscribe();
      _setUnsubscribeAccounts(undefined);
    }

    try {
      // Step 1: Enable the extension (this prompts the user)
      const extensions = await web3Enable(dAppAppName);
      if (extensions.length === 0) {
        _setStatus(
          "error",
          "No Polkadot extensions found or permission denied."
        );
        _setLoading(false);
        return false;
      }

      const foundExtension = extensions.find((ext) => ext.name === source);
      if (!foundExtension) {
        _setStatus("error", `${capitalize(source)} not found or not enabled.`);
        _setLoading(false);
        return false;
      }

      // Step 2: Subscribe to accounts
      const unsub = await web3AccountsSubscribe((allAccounts) => {
        const accountsFromSource = allAccounts.filter(
          (acc) => acc.meta.source === source
        );
        _setAccounts(accountsFromSource);

        if (accountsFromSource.length > 0) {
          // If previously selected account for this source is still available, keep it
          const newSelectedAccount =
            accountsFromSource.find(
              (acc) => acc.address === currentSelectedAccount?.address
            ) || accountsFromSource[0];
          set({ selectedAccount: newSelectedAccount, isConnected: true });
          _setStatus("connected", `Connected to ${capitalize(source)}.`);
          // Persist the connected wallet source
          if (typeof window !== "undefined") {
            localStorage.setItem(LAST_CONNECTED_WALLET_KEY, source);
          }
        } else {
          // No accounts found for this source after connection
          set({ selectedAccount: null, isConnected: false });
          _setStatus(
            "error",
            `No accounts found in ${capitalize(source)} wallet.`
          );
          // Clear persisted wallet if no accounts are found
          if (typeof window !== "undefined") {
            localStorage.removeItem(LAST_CONNECTED_WALLET_KEY);
          }
        }
        _setLoading(false); // Ensure loading is set to false after accounts are processed
      });
      _setUnsubscribeAccounts(() => unsub); // Store unsubscribe function

      _setConnectedWalletSource(source);
      return true;
    } catch (error: any) {
      console.error("Connection error:", error);
      _setStatus(
        "error",
        `Failed to connect to ${capitalize(source)}: ${
          error.message || "Unknown error"
        }`
      );
      _setLoading(false);
      set({
        isConnected: false,
        accounts: [],
        selectedAccount: null,
        connectedWalletSource: null,
      });
      // Clear persisted wallet on connection failure
      if (typeof window !== "undefined") {
        localStorage.removeItem(LAST_CONNECTED_WALLET_KEY);
      }
      return false;
    }
  },

  // Disconnect logic
  disconnectWallet: () => {
    const { unsubscribeAccounts } = get();
    if (unsubscribeAccounts) {
      unsubscribeAccounts();
    }
    set({
      isConnected: false,
      accounts: [],
      selectedAccount: null,
      status: "disconnected",
      statusMessage: "Wallet disconnected.",
      connectedWalletSource: null,
      isLoading: false,
      isSigning: false,
      signature: null,
      unsubscribeAccounts: undefined,
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem(LAST_CONNECTED_WALLET_KEY);
    }
  },

  // Set selected account
  setSelectedAccount: (account) => {
    set({ selectedAccount: account });
  },

  // Sign message logic
  signMessage: async (message: string) => {
    const { selectedAccount, _setStatus, _setIsSigning, _setSignature } = get();

    if (!selectedAccount) {
      _setStatus("error", "No account selected for signing.");
      return false;
    }
    if (!message.trim()) {
      _setStatus("error", "Please enter a message to sign.");
      return false;
    }

    _setIsSigning(true);
    _setSignature(null);
    _setStatus("signing", "Requesting signature...");

    try {
      // ✅ MODIFICATION: Dynamically import web3FromSource right before using it.
      const { web3FromSource } = await import("@polkadot/extension-dapp");
      const injector = await web3FromSource(selectedAccount.meta.source);
      const signRaw = injector?.signer?.signRaw;

      if (!!signRaw) {
        const { signature } = await signRaw({
          address: selectedAccount.address,
          data: stringToHex(message),
          type: "bytes",
        });
        _setSignature(signature);
        _setStatus("success", "Message signed successfully!");
        return true;
      } else {
        _setStatus("error", "Signer not available for the selected account.");
        return false;
      }
    } catch (error: any) {
      console.error("Error signing message:", error);
      _setStatus(
        "error",
        `Failed to sign message: ${
          error.message || "User rejected or error occurred"
        }`
      );
      return false;
    } finally {
      _setIsSigning(false);
    }
  },

  // Initialize wallet (for auto-reconnect)
  initializeWallet: async (dAppAppName: string) => {
    const { connectWallet, isConnected, _setStatus, _setLoading } = get();

    if (isConnected) {
      _setStatus("connected", "Wallet already connected.");
      return;
    }

    if (typeof window === "undefined") {
      // Don't run on server
      return;
    }

    const lastConnectedSource = localStorage.getItem(LAST_CONNECTED_WALLET_KEY);

    if (lastConnectedSource) {
      _setLoading(true);
      _setStatus(
        "connecting",
        `Attempting to reconnect to ${capitalize(lastConnectedSource)}...`
      );
      // This will now use the connectWallet function with the dynamic import
      const success = await connectWallet(lastConnectedSource, dAppAppName);
      if (!success) {
        _setStatus(
          "disconnected",
          "Failed to auto-reconnect. Please connect manually."
        );
        localStorage.removeItem(LAST_CONNECTED_WALLET_KEY); // Clear if auto-reconnect fails
      }
      _setLoading(false); // Ensure loading is reset
    } else {
      _setStatus("idle", "Ready to connect wallet.");
    }
  },
}));
