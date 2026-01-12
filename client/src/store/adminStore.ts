import { create } from 'zustand';
import { ApiKey } from '@/service/adminService';

export type ViewMode = 'table' | 'card';
export type TierFilter = 'all' | 'free' | 'pro' | 'enterprise';
export type StatusFilter = 'all' | 'active' | 'revoked';

interface AdminState {
  // Data
  apiKeys: ApiKey[];
  isLoading: boolean;
  error: string | null;

  // UI State
  viewMode: ViewMode;
  searchQuery: string;
  tierFilter: TierFilter;
  statusFilter: StatusFilter;
  expandedKeyId: string | null;

  // Modal State
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isRevokeModalOpen: boolean;
  selectedKey: ApiKey | null;

  // Actions
  setApiKeys: (keys: ApiKey[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setTierFilter: (tier: TierFilter) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setExpandedKeyId: (id: string | null) => void;

  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (key: ApiKey) => void;
  closeEditModal: () => void;
  openRevokeModal: (key: ApiKey) => void;
  closeRevokeModal: () => void;

  addApiKey: (key: ApiKey) => void;
  updateApiKeyInStore: (keyId: string, updates: Partial<ApiKey>) => void;
  removeApiKey: (keyId: string) => void;

  // Computed
  getFilteredKeys: () => ApiKey[];
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial state
  apiKeys: [],
  isLoading: false,
  error: null,

  viewMode: 'table',
  searchQuery: '',
  tierFilter: 'all',
  statusFilter: 'active',
  expandedKeyId: null,

  isCreateModalOpen: false,
  isEditModalOpen: false,
  isRevokeModalOpen: false,
  selectedKey: null,

  // Actions
  setApiKeys: (keys) => set({ apiKeys: keys }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTierFilter: (tier) => set({ tierFilter: tier }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setExpandedKeyId: (id) => set({ expandedKeyId: id }),

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openEditModal: (key) => set({ isEditModalOpen: true, selectedKey: key }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedKey: null }),
  openRevokeModal: (key) => set({ isRevokeModalOpen: true, selectedKey: key }),
  closeRevokeModal: () => set({ isRevokeModalOpen: false, selectedKey: null }),

  addApiKey: (key) => set((state) => ({ apiKeys: [key, ...state.apiKeys] })),
  updateApiKeyInStore: (keyId, updates) =>
    set((state) => ({
      apiKeys: state.apiKeys.map((key) =>
        key._id === keyId ? { ...key, ...updates } : key
      ),
    })),
  removeApiKey: (keyId) =>
    set((state) => ({
      apiKeys: state.apiKeys?.filter((key) => key._id !== keyId),
    })),

  // Computed getter
  getFilteredKeys: () => {
    const { apiKeys, searchQuery, tierFilter, statusFilter } = get();

    return apiKeys?.filter((key) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        key.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.polkadotAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.keyPrefix.toLowerCase().includes(searchQuery.toLowerCase());

      // Tier filter
      const matchesTier = tierFilter === 'all' || key.tier === tierFilter;

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && key.isActive) ||
        (statusFilter === 'revoked' && !key.isActive);

      return matchesSearch && matchesTier && matchesStatus;
    });
  },
}));
