// Zustand store for sandbox-specific state (SDK client, stats, logs)

import { create } from 'zustand';
import { DotPassportClient } from '@dotpassport/sdk';
import { getApiKeyStats } from '~/service/apiKeyService';
import { getRequestLogs, getRequestStats } from '~/service/requestLogService';
import type { ApiKeyStats } from '~/types/apiKey';
import type { RequestLog, RequestStats, RequestLogFilters } from '~/types/requestLog';

// LocalStorage keys
const STORAGE_KEYS = {
  CUSTOM_ADDRESSES: 'sandbox_custom_addresses',
  DEFAULT_ADDRESS: 'sandbox_default_address',
  LAST_USED_ADDRESS: 'sandbox_last_used_address',
};

// Custom address entry
export interface CustomAddress {
  address: string;
  name: string;
  addedAt: string;
}

// Helper to load custom addresses from localStorage
function loadCustomAddresses(): CustomAddress[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_ADDRESSES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Helper to load default address from localStorage
function loadDefaultAddress(): string | null {
  return localStorage.getItem(STORAGE_KEYS.DEFAULT_ADDRESS);
}

// Helper to load last used address from localStorage
function loadLastUsedAddress(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LAST_USED_ADDRESS);
}

// Validate Polkadot address format (SS58)
export function isValidPolkadotAddress(address: string): boolean {
  // Basic SS58 validation: starts with 1-9 or a-km-zA-HJ-NP-Z, 47-48 chars
  if (!address || typeof address !== 'string') return false;
  if (address.length < 46 || address.length > 48) return false;
  // SS58 uses base58 encoding (no 0, O, I, l)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}

// Widget cache entry - stores fetched data to avoid re-fetching
interface WidgetCacheEntry {
  widgetType: string;
  address: string;
  badgeKey?: string;
  categoryKey?: string;
  timestamp: number;
  // Display config for restoration
  theme: 'light' | 'dark' | 'auto';
  // Reputation widget options
  showCategories?: boolean;
  maxCategories?: number;
  compactMode?: boolean;
  // Badge widget options
  badgeMaxBadges?: number;
  badgeShowProgress?: boolean;
  // Category widget options
  categoryShowTitle?: boolean;
  categoryShowDescription?: boolean;
  categoryShowBreakdown?: boolean;
  categoryShowAdvice?: boolean;
  categoryShowScoreOnly?: boolean;
  categoryCompactMode?: boolean;
}

interface SandboxState {
  sdkClient: DotPassportClient | null;
  stats: ApiKeyStats | null;
  requestStats: RequestStats | null;
  recentLogs: RequestLog[];
  isLoadingStats: boolean;
  isLoadingLogs: boolean;
  // Widget caching for playground
  widgetCache: WidgetCacheEntry | null;
  // Custom address management
  customAddresses: CustomAddress[];
  defaultAddress: string | null;
  lastUsedAddress: string | null;
}

interface SandboxActions {
  initializeClient: (apiKey: string) => void;
  refreshStats: () => Promise<void>;
  refreshRequestStats: () => Promise<void>;
  fetchRecentLogs: (filters?: RequestLogFilters) => Promise<void>;
  clearClient: () => void;
  // Widget cache actions
  setWidgetCache: (cache: WidgetCacheEntry) => void;
  clearWidgetCache: () => void;
  // Custom address actions
  addCustomAddress: (address: string, name: string) => boolean;
  removeCustomAddress: (address: string) => void;
  updateCustomAddress: (address: string, name: string) => void;
  setDefaultAddress: (address: string | null) => void;
  setLastUsedAddress: (address: string) => void;
  clearCustomAddresses: () => void;
}

type SandboxStore = SandboxState & SandboxActions;

export const useSandboxStore = create<SandboxStore>((set, get) => ({
  // Initial State
  sdkClient: null,
  stats: null,
  requestStats: null,
  recentLogs: [],
  isLoadingStats: false,
  isLoadingLogs: false,
  widgetCache: null,
  // Custom address initial state - loaded from localStorage
  customAddresses: loadCustomAddresses(),
  defaultAddress: loadDefaultAddress(),
  lastUsedAddress: loadLastUsedAddress(),

  // --- ACTIONS ---

  initializeClient: (apiKey: string) => {
    if (!apiKey) {
      console.error('Cannot initialize SDK: API key is required');
      set({ sdkClient: null });
      return;
    }

    try {
      console.log('Initializing SDK client with API key:', apiKey.substring(0, 8) + '...');
      // SDK expects base URL without /api/v1 or /api/v2 prefix
      // It will add its own paths like /api/v2/badges, /api/v2/scores, etc.
      const baseUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/v[0-9]+$/, '')
        : 'http://localhost:4000';

      console.log('SDK base URL:', baseUrl);

      const client = new DotPassportClient({
        apiKey,
        baseUrl
      });
      console.log('SDK client initialized successfully:', client);
      set({ sdkClient: client });
    } catch (error) {
      console.error('Failed to initialize SDK client:', error);
      set({ sdkClient: null });
    }
  },

  refreshStats: async () => {
    set({ isLoadingStats: true });
    try {
      const stats = await getApiKeyStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      set({ isLoadingStats: false });
    }
  },

  refreshRequestStats: async () => {
    set({ isLoadingStats: true });
    try {
      const requestStats = await getRequestStats();
      set({ requestStats });
    } catch (error) {
      console.error('Failed to fetch request stats:', error);
    } finally {
      set({ isLoadingStats: false });
    }
  },

  fetchRecentLogs: async (filters: RequestLogFilters = {}) => {
    set({ isLoadingLogs: true });
    try {
      const { logs } = await getRequestLogs({ ...filters, limit: 10, page: 1 });
      set({ recentLogs: logs });
    } catch (error) {
      console.error('Failed to fetch recent logs:', error);
    } finally {
      set({ isLoadingLogs: false });
    }
  },

  clearClient: () => {
    set({
      sdkClient: null,
      stats: null,
      requestStats: null,
      recentLogs: [],
      widgetCache: null,
    });
  },

  setWidgetCache: (cache: WidgetCacheEntry) => {
    set({ widgetCache: cache });
  },

  clearWidgetCache: () => {
    set({ widgetCache: null });
  },

  // --- CUSTOM ADDRESS ACTIONS ---

  addCustomAddress: (address: string, name: string): boolean => {
    // Validate address format
    if (!isValidPolkadotAddress(address)) {
      console.error('Invalid Polkadot address format');
      return false;
    }

    const { customAddresses } = get();

    // Check for duplicates
    if (customAddresses.some((a) => a.address === address)) {
      console.error('Address already exists');
      return false;
    }

    const newAddress: CustomAddress = {
      address,
      name: name || `Custom ${customAddresses.length + 1}`,
      addedAt: new Date().toISOString(),
    };

    const updated = [...customAddresses, newAddress];
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ADDRESSES, JSON.stringify(updated));
    set({ customAddresses: updated });
    return true;
  },

  removeCustomAddress: (address: string) => {
    const { customAddresses, defaultAddress } = get();
    const updated = customAddresses.filter((a) => a.address !== address);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ADDRESSES, JSON.stringify(updated));

    // Clear default if it was the removed address
    if (defaultAddress === address) {
      localStorage.removeItem(STORAGE_KEYS.DEFAULT_ADDRESS);
      set({ customAddresses: updated, defaultAddress: null });
    } else {
      set({ customAddresses: updated });
    }
  },

  updateCustomAddress: (address: string, name: string) => {
    const { customAddresses } = get();
    const updated = customAddresses.map((a) =>
      a.address === address ? { ...a, name } : a
    );
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ADDRESSES, JSON.stringify(updated));
    set({ customAddresses: updated });
  },

  setDefaultAddress: (address: string | null) => {
    if (address) {
      localStorage.setItem(STORAGE_KEYS.DEFAULT_ADDRESS, address);
    } else {
      localStorage.removeItem(STORAGE_KEYS.DEFAULT_ADDRESS);
    }
    set({ defaultAddress: address });
  },

  setLastUsedAddress: (address: string) => {
    localStorage.setItem(STORAGE_KEYS.LAST_USED_ADDRESS, address);
    set({ lastUsedAddress: address });
  },

  clearCustomAddresses: () => {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_ADDRESSES);
    localStorage.removeItem(STORAGE_KEYS.DEFAULT_ADDRESS);
    set({ customAddresses: [], defaultAddress: null });
  },
}));
