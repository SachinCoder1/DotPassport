/**
 * DotPassport SDK + SubWallet Integration Example
 *
 * This example demonstrates how to:
 * 1. Connect to SubWallet
 * 2. Get user accounts
 * 3. Fetch reputation data using DotPassport SDK
 * 4. Display reputation widgets
 * 5. Handle account changes
 *
 * Prerequisites:
 *   npm install @subwallet/wallet-connect @dotpassport/sdk
 */

import {
  getWalletBySource,
  isWalletInstalled,
  Wallet,
  WalletAccount,
} from '@subwallet/wallet-connect';
import { DotPassportClient, createWidget, type UserScores } from '@dotpassport/sdk';

// Configuration
const API_KEY = 'your_api_key_here';
const WALLET_SOURCE = 'subwallet-js';

// ============================================
// Wallet Connection Utilities
// ============================================

/**
 * Check if SubWallet is installed
 */
export async function isSubWalletInstalled(): Promise<boolean> {
  return isWalletInstalled(WALLET_SOURCE);
}

/**
 * Connect to SubWallet
 */
export async function connectSubWallet(): Promise<Wallet> {
  const installed = await isWalletInstalled(WALLET_SOURCE);

  if (!installed) {
    throw new Error('SubWallet is not installed. Please install it from https://subwallet.app');
  }

  const wallet = await getWalletBySource(WALLET_SOURCE);

  if (!wallet) {
    throw new Error('Could not connect to SubWallet');
  }

  // Request permission - this shows the wallet popup
  await wallet.enable();

  return wallet;
}

/**
 * Get accounts from connected wallet
 */
export async function getAccounts(wallet: Wallet): Promise<WalletAccount[]> {
  const accounts = await wallet.getAccounts();

  if (accounts.length === 0) {
    throw new Error('No accounts found. Please create an account in SubWallet.');
  }

  return accounts;
}

/**
 * Subscribe to account changes
 */
export async function subscribeToAccounts(
  wallet: Wallet,
  callback: (accounts: WalletAccount[]) => void
): Promise<() => void> {
  return wallet.subscribeAccounts(callback);
}

// ============================================
// DotPassport Integration
// ============================================

/**
 * Fetch reputation data for an address
 */
export async function fetchReputationData(address: string) {
  const client = new DotPassportClient({ apiKey: API_KEY });

  const [profile, scores, badges] = await Promise.all([
    client.getProfile(address),
    client.getScores(address),
    client.getBadges(address),
  ]);

  return { profile, scores, badges };
}

/**
 * Create and mount a reputation widget
 */
export function createReputationWidget(address: string, containerId: string) {
  const widget = createWidget({
    apiKey: API_KEY,
    address: address,
    type: 'reputation',
    theme: 'dark', // SubWallet has a dark theme, so we match it
    showCategories: true,
    onLoad: () => console.log('Widget loaded successfully'),
    onError: (error) => console.error('Widget error:', error),
  });

  widget.mount(containerId);
  return widget;
}

// ============================================
// Complete Integration Example
// ============================================

/**
 * Full integration example - connects wallet and displays reputation
 */
export async function initializeDotPassportWithSubWallet() {
  // Check installation
  const installed = await isSubWalletInstalled();
  if (!installed) {
    console.error('SubWallet is not installed');
    console.log('Install from: https://subwallet.app');
    return;
  }

  try {
    // Connect wallet
    console.log('Connecting to SubWallet...');
    const wallet = await connectSubWallet();

    // Get accounts
    const accounts = await getAccounts(wallet);
    console.log(`Found ${accounts.length} account(s)`);

    const selectedAccount = accounts[0];
    const accountName = selectedAccount.name || 'Account';
    console.log(`Selected account: ${accountName} (${selectedAccount.address})`);

    // Fetch reputation data
    console.log('Fetching reputation data...');
    const { profile, scores, badges } = await fetchReputationData(selectedAccount.address);

    console.log('=== Reputation Summary ===');
    console.log(`Display Name: ${profile.displayName || 'Not set'}`);
    console.log(`Total Score: ${scores.totalScore}`);
    console.log(`Badges Earned: ${badges.count}`);

    // Display categories
    console.log('\n=== Category Scores ===');
    scores.categories.forEach((cat) => {
      console.log(`${cat.title}: ${cat.score}/${cat.maxScore}`);
    });

    // Create widget (if running in browser)
    if (typeof document !== 'undefined') {
      const container = document.getElementById('reputation-widget');
      if (container) {
        const widget = createReputationWidget(selectedAccount.address, '#reputation-widget');

        // Subscribe to account changes and update widget
        await subscribeToAccounts(wallet, (newAccounts) => {
          if (newAccounts.length > 0) {
            console.log(`Account changed to: ${newAccounts[0].address}`);
            widget.update({ address: newAccounts[0].address });
          }
        });
      }
    }

    return { wallet, accounts, profile, scores, badges };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ============================================
// React Hook Example
// ============================================

/**
 * React hook for SubWallet + DotPassport integration
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { connect, disconnect, address, scores, containerRef } = useSubWalletDotPassport();
 *
 *   if (!address) {
 *     return <button onClick={connect}>Connect SubWallet</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Address: {address}</p>
 *       <p>Score: {scores?.totalScore}</p>
 *       <div ref={containerRef} />
 *       <button onClick={disconnect}>Disconnect</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSubWalletDotPassportHookExample() {
  // This is a pseudo-code example showing the hook structure
  // In a real React app, you would use useState, useEffect, useRef, etc.

  const hookStructure = `
import { useState, useEffect, useRef, useCallback } from 'react';
import { getWalletBySource, isWalletInstalled, Wallet, WalletAccount } from '@subwallet/wallet-connect';
import { createWidget, DotPassportClient } from '@dotpassport/sdk';

export function useSubWalletDotPassport(apiKey: string) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [scores, setScores] = useState<UserScores | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const widgetRef = useRef<ReturnType<typeof createWidget>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const installed = await isWalletInstalled('subwallet-js');
      if (!installed) {
        throw new Error('SubWallet not installed');
      }

      const subwallet = await getWalletBySource('subwallet-js');
      if (!subwallet) {
        throw new Error('Could not connect to SubWallet');
      }

      await subwallet.enable();
      const userAccounts = await subwallet.getAccounts();

      setWallet(subwallet);
      setAccounts(userAccounts);
      setSelectedAddress(userAccounts[0]?.address || null);

      // Subscribe to account changes
      unsubscribeRef.current = await subwallet.subscribeAccounts((newAccounts) => {
        setAccounts(newAccounts);
        if (newAccounts.length > 0) {
          setSelectedAddress(newAccounts[0].address);
        }
      });

    } catch (err) {
      setError(err as Error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    unsubscribeRef.current?.();
    widgetRef.current?.destroy();
    setWallet(null);
    setAccounts([]);
    setSelectedAddress(null);
    setScores(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
      widgetRef.current?.destroy();
    };
  }, []);

  // Fetch scores when address changes
  useEffect(() => {
    if (!selectedAddress) return;

    const client = new DotPassportClient({ apiKey });
    client.getScores(selectedAddress).then(setScores);
  }, [selectedAddress, apiKey]);

  // Mount widget when address changes
  useEffect(() => {
    if (!selectedAddress || !containerRef.current) return;

    if (widgetRef.current) {
      widgetRef.current.update({ address: selectedAddress });
    } else {
      widgetRef.current = createWidget({
        apiKey,
        address: selectedAddress,
        type: 'reputation',
        theme: 'dark'
      });
      widgetRef.current.mount(containerRef.current);
    }

    return () => widgetRef.current?.destroy();
  }, [selectedAddress, apiKey]);

  return {
    connect,
    disconnect,
    wallet,
    accounts,
    address: selectedAddress,
    setAddress: setSelectedAddress,
    scores,
    isConnecting,
    error,
    containerRef
  };
}
  `;

  return hookStructure;
}

// ============================================
// Multi-Wallet Support Example
// ============================================

/**
 * Example showing how to support both Talisman and SubWallet
 */
export async function connectAnyWallet(preferredWallet?: 'talisman' | 'subwallet') {
  // Check which wallets are installed
  const subwalletInstalled = await isWalletInstalled('subwallet-js');

  // For Talisman, we need to check differently since it uses a different library
  // In a real app, you'd import from @talismn/connect-wallets
  const talismanInstalled = typeof window !== 'undefined' && (window as any).talismanExt;

  console.log('Installed wallets:');
  console.log(`  - SubWallet: ${subwalletInstalled ? 'Yes' : 'No'}`);
  console.log(`  - Talisman: ${talismanInstalled ? 'Yes' : 'No'}`);

  // Connect to preferred wallet or first available
  if (preferredWallet === 'subwallet' && subwalletInstalled) {
    return connectSubWallet();
  } else if (preferredWallet === 'talisman' && talismanInstalled) {
    // Would use Talisman connect here
    throw new Error('Use @talismn/connect-wallets for Talisman');
  } else if (subwalletInstalled) {
    return connectSubWallet();
  } else {
    throw new Error('No supported wallet installed');
  }
}

// Run if executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).initializeDotPassportWithSubWallet = initializeDotPassportWithSubWallet;
}
