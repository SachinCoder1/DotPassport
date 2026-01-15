// Zustand store for wallet connection and authentication

import { create } from 'zustand';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { isAxiosError } from 'axios';
import {
  requestChallenge,
  authenticateWithPolkadot,
  logoutUser,
  getMe,
} from '~/service/authService';
import type { SandboxUser, WalletStatus } from '~/types';
import { useSandboxStore } from './sandboxStore';

// State and Action Interfaces
interface WalletState {
  isConnected: boolean;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;
  status: WalletStatus;
  statusMessage: string | null;
  connectedWalletSource: string | null;
  isLoading: boolean;
  isSigning: boolean;
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: SandboxUser | null;
  unsubscribeAccounts: (() => void) | undefined;
  isWalletModalOpen: boolean;
  newApiKey: string | null; // Store API key temporarily for new users
  needsWalletReconnect: boolean; // True when user has valid session but wallet is disconnected
}

interface WalletActions {
  initialize: (dAppName: string) => Promise<void>;
  connectWallet: (source: string, dAppName: string) => Promise<boolean>;
  login: (contactEmail: string, prefetchedChallenge?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  disconnectWallet: () => void;
  setSelectedAccount: (account: InjectedAccountWithMeta | null) => void;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  clearNewApiKey: () => void;
  signMessage: (message: string) => Promise<string | null>;
  refreshUsage: () => Promise<void>;
}

type WalletStore = WalletState & WalletActions;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const LAST_CONNECTED_WALLET_KEY = 'last_connected_polkadot_wallet_source';

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial State
  isConnected: false,
  accounts: [],
  selectedAccount: null,
  status: 'idle',
  statusMessage: null,
  connectedWalletSource: null,
  isLoading: false,
  isSigning: false,
  isAuthenticated: false,
  isInitializing: true,
  user: null,
  unsubscribeAccounts: undefined,
  isWalletModalOpen: false,
  newApiKey: null,
  needsWalletReconnect: false,

  // --- ACTIONS ---

  initialize: async (dAppName) => {
    try {
      const accessToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;

      if (accessToken) {
        try {
          // Fetch user data to check if session is still valid
          const selectedAddress =
            typeof window !== 'undefined'
              ? localStorage.getItem('selectedAddress')
              : null;

          if (selectedAddress) {
            const userData = await getMe(selectedAddress);

            // Store API key if returned from /me endpoint
            if (userData.apiKey) {
              localStorage.setItem('sandbox_api_key', userData.apiKey);
              // Initialize SDK client with the restored API key
              const { initializeClient } = useSandboxStore.getState();
              initializeClient(userData.apiKey);
            }

            set({
              user: userData,
              isAuthenticated: true,
            });

            // Try to reconnect to last connected wallet
            const lastConnectedSource =
              typeof window !== 'undefined'
                ? localStorage.getItem(LAST_CONNECTED_WALLET_KEY)
                : null;
            if (lastConnectedSource) {
              const reconnected = await get().connectWallet(lastConnectedSource, dAppName);
              if (!reconnected) {
                // User has valid session but wallet reconnection failed
                // They can still browse but need to reconnect for signing operations
                set({ needsWalletReconnect: true });
              }
            } else {
              // No last connected wallet - user needs to connect
              set({ needsWalletReconnect: true });
            }
          }
        } catch (error) {
          console.error('Session check failed, logging out:', error);
          get().disconnectWallet();
        }
      }
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      set({ isInitializing: false });
    }
  },

  connectWallet: async (source, dAppName) => {
    const { web3Enable, web3AccountsSubscribe } = await import(
      '@polkadot/extension-dapp'
    );
    set({
      isLoading: true,
      status: 'connecting',
      statusMessage: `Connecting to ${capitalize(source)}...`,
    });

    get().unsubscribeAccounts?.();

    try {
      const extensions = await web3Enable(dAppName);
      if (extensions.length === 0)
        throw new Error('No Polkadot extensions found or permission denied.');

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
          const { selectedAccount: currentSelected, isAuthenticated } = get();

          // Only auto-select account when RECONNECTING (already authenticated)
          // For fresh logins, leave selectedAccount as null so user goes through
          // account selection which triggers the registration check
          let newSelected: InjectedAccountWithMeta | null = null;

          if (isAuthenticated && currentSelected) {
            // Reconnecting - try to find the same account
            newSelected =
              accountsFromSource.find(
                (acc) => acc.address === currentSelected.address
              ) || null;
          } else if (isAuthenticated) {
            // Authenticated but no current selection - check localStorage
            const savedAddress = localStorage.getItem('selectedAddress');
            if (savedAddress) {
              newSelected =
                accountsFromSource.find(
                  (acc) => acc.address === savedAddress
                ) || null;
            }
          }
          // For fresh logins (not authenticated), newSelected stays null

          set({
            accounts: accountsFromSource,
            selectedAccount: newSelected,
            isConnected: true,
            status: 'connected',
            statusMessage: `Connected to ${capitalize(source)}.`,
            isLoading: false,
            needsWalletReconnect: false,
          });
          localStorage.setItem(LAST_CONNECTED_WALLET_KEY, source);
        } else {
          get().disconnectWallet();
        }
      });

      set({ unsubscribeAccounts: unsub, connectedWalletSource: source });
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({
        status: 'error',
        statusMessage: `Connection failed: ${message}`,
        isLoading: false,
      });
      return false;
    }
  },

  login: async (contactEmail: string, prefetchedChallenge?: string) => {
    const { selectedAccount } = get();
    if (!selectedAccount) {
      set({ status: 'error', statusMessage: 'No account selected.' });
      return false;
    }
    set({
      isSigning: true,
      status: 'signing',
      statusMessage: prefetchedChallenge ? 'Please sign the message in your wallet...' : 'Requesting challenge...',
    });
    try {
      // Use prefetched challenge if available, otherwise request a new one
      let message: string;
      if (prefetchedChallenge) {
        message = prefetchedChallenge;
      } else {
        const challenge = await requestChallenge(selectedAccount.address);
        message = challenge.message;
      }
      set({ statusMessage: 'Please sign the message in your wallet...' });
      const { web3FromSource } = await import('@polkadot/extension-dapp');
      const injector = await web3FromSource(selectedAccount.meta.source);
      if (!injector.signer.signRaw)
        throw new Error('Wallet does not support signing.');
      const { signature } = await injector.signer.signRaw({
        address: selectedAccount.address,
        data: stringToHex(message),
        type: 'bytes',
      });
      set({ statusMessage: 'Verifying signature...' });
      const response = await authenticateWithPolkadot({
        polkadotAddress: selectedAccount.address,
        message,
        signature,
        contactEmail,
      });

      if (!response.user || !response.accessToken) {
        throw new Error('Login failed, user data not returned.');
      }

      // Store selected address for session restoration
      localStorage.setItem('selectedAddress', selectedAccount.address);

      // Store API key in localStorage for SDK initialization
      if (response.user.apiKey) {
        localStorage.setItem('sandbox_api_key', response.user.apiKey);
        // Also store temporarily for one-time display modal
        if (response.isNew) {
          set({ newApiKey: response.user.apiKey });
        }
      }

      set({
        isAuthenticated: true,
        user: response.user,
        status: 'success',
        statusMessage: response.isNew
          ? 'Welcome! Your API key has been created.'
          : 'Welcome back!',
      });
      return true;
    } catch (err) {
      let message = 'Unknown error';
      if (isAxiosError(err)) {
        message = err.response?.data?.message ?? err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ status: 'error', statusMessage: `Login failed: ${message}` });
      return false;
    } finally {
      set({ isSigning: false });
    }
  },

  logout: async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Backend logout failed.', error);
    } finally {
      get().disconnectWallet();
    }
  },

  disconnectWallet: () => {
    get().unsubscribeAccounts?.();

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('selectedAddress');
    localStorage.removeItem('sandbox_api_key');
    localStorage.removeItem(LAST_CONNECTED_WALLET_KEY);

    set({
      isAuthenticated: false,
      user: null,
      isConnected: false,
      accounts: [],
      selectedAccount: null,
      status: 'idle',
      statusMessage: null,
      connectedWalletSource: null,
      unsubscribeAccounts: undefined,
      isLoading: false,
      newApiKey: null,
      needsWalletReconnect: false,
    });
  },

  setSelectedAccount: (account) => set({ selectedAccount: account }),

  openWalletModal: () => set({ isWalletModalOpen: true }),

  closeWalletModal: () => set({ isWalletModalOpen: false }),

  clearNewApiKey: () => set({ newApiKey: null }),

  signMessage: async (message: string): Promise<string | null> => {
    const { selectedAccount } = get();
    if (!selectedAccount) {
      console.error('No account selected for signing');
      return null;
    }

    try {
      const { web3FromSource } = await import('@polkadot/extension-dapp');
      const injector = await web3FromSource(selectedAccount.meta.source);

      if (!injector.signer.signRaw) {
        throw new Error('Wallet does not support signing');
      }

      const { signature } = await injector.signer.signRaw({
        address: selectedAccount.address,
        data: stringToHex(message),
        type: 'bytes',
      });

      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      return null;
    }
  },

  refreshUsage: async () => {
    const { user, isAuthenticated } = get();
    if (!isAuthenticated || !user?.polkadotAddress) {
      return;
    }

    try {
      const userData = await getMe(user.polkadotAddress);
      // Only update usage and rateLimits, preserve other user data
      set({
        user: {
          ...user,
          usage: userData.usage,
          rateLimits: userData.rateLimits,
        },
      });
    } catch (error) {
      // Silently fail - this is a background refresh
      console.debug('Usage refresh failed:', error);
    }
  },
}));
