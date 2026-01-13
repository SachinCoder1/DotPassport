/**
 * DotPassport SDK + Talisman Wallet Integration Example
 *
 * This example demonstrates how to:
 * 1. Connect to Talisman wallet
 * 2. Get user accounts
 * 3. Fetch reputation data using DotPassport SDK
 * 4. Display reputation widgets
 * 5. Handle account changes
 *
 * Prerequisites:
 *   npm install @talismn/connect-wallets @dotpassport/sdk
 */

import { getWallets, Wallet, WalletAccount } from '@talismn/connect-wallets';
import { DotPassportClient, createWidget, type UserScores } from '@dotpassport/sdk';

// Configuration
const API_KEY = 'your_api_key_here';

// ============================================
// Wallet Connection Utilities
// ============================================

/**
 * Check if Talisman wallet is installed
 */
export function isTalismanInstalled(): boolean {
  const wallets = getWallets();
  const talisman = wallets.find((w) => w.extensionName === 'talisman');
  return talisman?.installed ?? false;
}

/**
 * Get all installed wallets
 */
export function getInstalledWallets(): Wallet[] {
  return getWallets().filter((w) => w.installed);
}

/**
 * Connect to Talisman wallet
 * @param appName - Your application name (shown in wallet popup)
 */
export async function connectTalisman(appName: string = 'DotPassport App'): Promise<Wallet> {
  const wallets = getWallets();
  const talisman = wallets.find((w) => w.extensionName === 'talisman');

  if (!talisman) {
    throw new Error('Talisman wallet not found in browser');
  }

  if (!talisman.installed) {
    throw new Error('Talisman is not installed. Please install it from https://talisman.xyz');
  }

  // Request permission - this shows the wallet popup
  await talisman.enable(appName);

  return talisman;
}

/**
 * Get accounts from connected wallet
 */
export async function getAccounts(wallet: Wallet): Promise<WalletAccount[]> {
  const accounts = await wallet.getAccounts();

  if (accounts.length === 0) {
    throw new Error('No accounts found. Please create an account in Talisman.');
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
    theme: 'light',
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
export async function initializeDotPassportWithTalisman() {
  // Check installation
  if (!isTalismanInstalled()) {
    console.error('Talisman is not installed');
    console.log('Install from: https://talisman.xyz');
    return;
  }

  try {
    // Connect wallet
    console.log('Connecting to Talisman...');
    const wallet = await connectTalisman('DotPassport Demo');

    // Get accounts
    const accounts = await getAccounts(wallet);
    console.log(`Found ${accounts.length} account(s)`);

    const selectedAccount = accounts[0];
    console.log(`Selected account: ${selectedAccount.name} (${selectedAccount.address})`);

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
 * React hook for Talisman + DotPassport integration
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { connect, disconnect, address, scores, widget } = useTalismanDotPassport();
 *
 *   if (!address) {
 *     return <button onClick={connect}>Connect Wallet</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Address: {address}</p>
 *       <p>Score: {scores?.totalScore}</p>
 *       <div ref={widget.containerRef} />
 *       <button onClick={disconnect}>Disconnect</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTalismanDotPassportHookExample() {
  // This is a pseudo-code example showing the hook structure
  // In a real React app, you would use useState, useEffect, useRef, etc.

  const hookStructure = `
import { useState, useEffect, useRef, useCallback } from 'react';
import { getWallets, Wallet, WalletAccount } from '@talismn/connect-wallets';
import { createWidget, DotPassportClient } from '@dotpassport/sdk';

export function useTalismanDotPassport(apiKey: string) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [scores, setScores] = useState<UserScores | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const widgetRef = useRef<ReturnType<typeof createWidget>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const wallets = getWallets();
      const talisman = wallets.find(w => w.extensionName === 'talisman');

      if (!talisman?.installed) {
        throw new Error('Talisman not installed');
      }

      await talisman.enable('My App');
      const userAccounts = await talisman.getAccounts();

      setWallet(talisman);
      setAccounts(userAccounts);
      setSelectedAddress(userAccounts[0]?.address || null);

    } catch (err) {
      setError(err as Error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    widgetRef.current?.destroy();
    setWallet(null);
    setAccounts([]);
    setSelectedAddress(null);
    setScores(null);
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
        type: 'reputation'
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

// Run if executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).initializeDotPassportWithTalisman = initializeDotPassportWithTalisman;
}
