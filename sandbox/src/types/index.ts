import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

// Re-export the type
export type { InjectedAccountWithMeta };

export interface WalletOption {
  name: string;
  icon: string;
  extensionName: string;
  description: string;
  id: string;
  logo: string;
  installed?: boolean;
}

export interface SandboxUser {
  polkadotAddress: string;
  contactEmail: string;
  apiKey?: string; // Only returned on creation or regeneration
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  keyPrefix?: string;
  rateLimits: {
    hourly: number;
    daily: number;
    monthly: number;
  };
  usage: {
    hourly: number;
    daily: number;
    monthly: number;
  };
  createdAt: string;
  isActive: boolean;
}

export interface WalletState {
  isConnected: boolean;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;
  status: 'idle' | 'connecting' | 'connected' | 'error' | 'signing' | 'success';
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: SandboxUser | null;
  connectedWalletSource: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type WalletStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'signing' | 'success';
