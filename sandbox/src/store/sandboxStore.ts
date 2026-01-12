// Zustand store for sandbox-specific state (SDK client, stats, logs)

import { create } from 'zustand';
import { DotPassportClient } from '@dotpassport/sdk';
import { getApiKeyStats } from '~/service/apiKeyService';
import { getRequestLogs, getRequestStats } from '~/service/requestLogService';
import type { ApiKeyStats } from '~/types/apiKey';
import type { RequestLog, RequestStats, RequestLogFilters } from '~/types/requestLog';

// Widget cache entry - stores fetched data to avoid re-fetching
interface WidgetCacheEntry {
  widgetType: string;
  address: string;
  badgeKey?: string;
  categoryKey?: string;
  timestamp: number;
  // Display config for restoration
  theme: 'light' | 'dark' | 'auto';
  showCategories?: boolean;
  maxCategories?: number;
  compactMode?: boolean;
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
}

type SandboxStore = SandboxState & SandboxActions;

export const useSandboxStore = create<SandboxStore>((set) => ({
  // Initial State
  sdkClient: null,
  stats: null,
  requestStats: null,
  recentLogs: [],
  isLoadingStats: false,
  isLoadingLogs: false,
  widgetCache: null,

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
}));
