# Talisman Wallet Integration

This guide shows how to integrate DotPassport SDK with [Talisman Wallet](https://talisman.xyz/) using the `@talismn/connect-wallets` library.

## Installation

```bash
# Install Talisman Connect
npm install @talismn/connect-wallets

# Install DotPassport SDK
npm install @dotpassport/sdk
```

## Quick Start

```typescript
import { getWallets } from '@talismn/connect-wallets';
import { DotPassportClient, createWidget } from '@dotpassport/sdk';

// 1. Get available wallets
const installedWallets = getWallets().filter(wallet => wallet.installed);

// 2. Find and enable Talisman
const talisman = installedWallets.find(w => w.extensionName === 'talisman');
await talisman.enable('My DApp');

// 3. Get accounts
const accounts = await talisman.getAccounts();
const address = accounts[0].address;

// 4. Use with DotPassport
const client = new DotPassportClient({ apiKey: 'your_api_key' });
const scores = await client.getScores(address);
console.log(`Reputation: ${scores.totalScore}`);
```

---

## Complete Integration Guide

### Step 1: Check for Wallet Installation

```typescript
import { getWallets } from '@talismn/connect-wallets';

function checkWalletInstalled(): boolean {
  const wallets = getWallets();
  const talisman = wallets.find(w => w.extensionName === 'talisman');
  return talisman?.installed ?? false;
}

if (!checkWalletInstalled()) {
  // Show install prompt
  window.open('https://talisman.xyz/download', '_blank');
}
```

### Step 2: Connect to Wallet

```typescript
import { getWallets, Wallet } from '@talismn/connect-wallets';

async function connectTalisman(): Promise<Wallet> {
  const wallets = getWallets();
  const talisman = wallets.find(w => w.extensionName === 'talisman');

  if (!talisman) {
    throw new Error('Talisman wallet not found');
  }

  if (!talisman.installed) {
    throw new Error('Talisman is not installed');
  }

  // Enable the wallet - this prompts user for permission
  await talisman.enable('DotPassport App');

  return talisman;
}
```

### Step 3: Get User Accounts

```typescript
import { WalletAccount } from '@talismn/connect-wallets';

async function getAccounts(wallet: Wallet): Promise<WalletAccount[]> {
  const accounts = await wallet.getAccounts();

  if (accounts.length === 0) {
    throw new Error('No accounts found. Please create an account in Talisman.');
  }

  return accounts;
}

// Usage
const wallet = await connectTalisman();
const accounts = await getAccounts(wallet);

console.log('Available accounts:');
accounts.forEach(acc => {
  console.log(`- ${acc.name}: ${acc.address}`);
});
```

### Step 4: Subscribe to Account Changes

```typescript
async function subscribeToAccounts(
  wallet: Wallet,
  onAccountsChange: (accounts: WalletAccount[]) => void
): Promise<() => void> {
  // Subscribe returns an unsubscribe function
  const unsubscribe = await wallet.subscribeAccounts(onAccountsChange);
  return unsubscribe;
}

// Usage
const unsubscribe = await subscribeToAccounts(wallet, (accounts) => {
  console.log('Accounts changed:', accounts);
  if (accounts.length > 0) {
    updateDotPassportWidget(accounts[0].address);
  }
});

// Later, to unsubscribe:
unsubscribe();
```

### Step 5: Integrate with DotPassport

```typescript
import { DotPassportClient, createWidget } from '@dotpassport/sdk';

// With API Client
async function fetchReputationData(address: string) {
  const client = new DotPassportClient({
    apiKey: 'your_api_key'
  });

  const [profile, scores, badges] = await Promise.all([
    client.getProfile(address),
    client.getScores(address),
    client.getBadges(address)
  ]);

  return { profile, scores, badges };
}

// With Widgets
function mountReputationWidget(address: string) {
  const widget = createWidget({
    apiKey: 'your_api_key',
    address: address,
    type: 'reputation',
    theme: 'light',
    showCategories: true,
    onLoad: () => console.log('Widget loaded'),
    onError: (err) => console.error('Widget error:', err)
  });

  widget.mount('#reputation-widget');
  return widget;
}
```

---

## Complete React Example

```tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getWallets, Wallet, WalletAccount } from '@talismn/connect-wallets';
import { createWidget, DotPassportClient, type UserScores } from '@dotpassport/sdk';

interface TalismanDotPassportProps {
  apiKey: string;
}

export function TalismanDotPassport({ apiKey }: TalismanDotPassportProps) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null);
  const [scores, setScores] = useState<UserScores | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const widgetRef = useRef<ReturnType<typeof createWidget>>();
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  // Check if Talisman is installed
  const isTalismanInstalled = useCallback(() => {
    const wallets = getWallets();
    return wallets.some(w => w.extensionName === 'talisman' && w.installed);
  }, []);

  // Connect to Talisman
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const wallets = getWallets();
      const talisman = wallets.find(w => w.extensionName === 'talisman');

      if (!talisman?.installed) {
        throw new Error('Talisman is not installed');
      }

      await talisman.enable('DotPassport App');
      const userAccounts = await talisman.getAccounts();

      if (userAccounts.length === 0) {
        throw new Error('No accounts found');
      }

      setWallet(talisman);
      setAccounts(userAccounts);
      setSelectedAccount(userAccounts[0]);

      // Subscribe to account changes
      talisman.subscribeAccounts((newAccounts) => {
        setAccounts(newAccounts);
        if (newAccounts.length > 0 && !newAccounts.find(a => a.address === selectedAccount?.address)) {
          setSelectedAccount(newAccounts[0]);
        }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  }, [selectedAccount?.address]);

  // Fetch reputation data
  useEffect(() => {
    if (!selectedAccount) return;

    const client = new DotPassportClient({ apiKey });

    client.getScores(selectedAccount.address)
      .then(setScores)
      .catch(err => setError(err.message));
  }, [selectedAccount, apiKey]);

  // Mount/update widget
  useEffect(() => {
    if (!selectedAccount || !widgetContainerRef.current) return;

    if (widgetRef.current) {
      widgetRef.current.update({ address: selectedAccount.address });
    } else {
      widgetRef.current = createWidget({
        apiKey,
        address: selectedAccount.address,
        type: 'reputation',
        theme: 'light',
        showCategories: true
      });
      widgetRef.current.mount(widgetContainerRef.current);
    }

    return () => {
      widgetRef.current?.destroy();
      widgetRef.current = undefined;
    };
  }, [selectedAccount, apiKey]);

  // Disconnect
  const disconnect = useCallback(() => {
    widgetRef.current?.destroy();
    widgetRef.current = undefined;
    setWallet(null);
    setAccounts([]);
    setSelectedAccount(null);
    setScores(null);
  }, []);

  // Not installed
  if (!isTalismanInstalled()) {
    return (
      <div className="talisman-connect">
        <p>Talisman wallet is not installed.</p>
        <a
          href="https://talisman.xyz/download"
          target="_blank"
          rel="noopener noreferrer"
        >
          Install Talisman
        </a>
      </div>
    );
  }

  // Not connected
  if (!wallet) {
    return (
      <div className="talisman-connect">
        <button onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Talisman'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  // Connected
  return (
    <div className="talisman-dotpassport">
      <div className="account-selector">
        <label>Account:</label>
        <select
          value={selectedAccount?.address}
          onChange={(e) => {
            const account = accounts.find(a => a.address === e.target.value);
            setSelectedAccount(account || null);
          }}
        >
          {accounts.map(account => (
            <option key={account.address} value={account.address}>
              {account.name} ({account.address.slice(0, 8)}...{account.address.slice(-6)})
            </option>
          ))}
        </select>
        <button onClick={disconnect}>Disconnect</button>
      </div>

      {scores && (
        <div className="scores-summary">
          <h3>Reputation Score: {scores.totalScore}</h3>
        </div>
      )}

      <div ref={widgetContainerRef} className="widget-container" />

      {error && <p className="error">{error}</p>}
    </div>
  );
}

// Usage in your app:
// <TalismanDotPassport apiKey="your_api_key" />
```

---

## Complete Vanilla JavaScript Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DotPassport + Talisman</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .account-info { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
    .widget-container { margin-top: 20px; }
    button { padding: 10px 20px; cursor: pointer; }
    select { padding: 8px; margin: 0 10px; }
    .error { color: red; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>DotPassport + Talisman</h1>

    <!-- Not Installed State -->
    <div id="install-prompt" class="hidden">
      <p>Talisman wallet is not installed.</p>
      <a href="https://talisman.xyz/download" target="_blank">Install Talisman</a>
    </div>

    <!-- Connect Button -->
    <div id="connect-section">
      <button id="connect-btn">Connect Talisman</button>
      <p id="error-message" class="error hidden"></p>
    </div>

    <!-- Connected State -->
    <div id="connected-section" class="hidden">
      <div class="account-info">
        <label>Account: </label>
        <select id="account-select"></select>
        <button id="disconnect-btn">Disconnect</button>
      </div>

      <div id="reputation-widget" class="widget-container"></div>
    </div>
  </div>

  <script type="module">
    import { getWallets } from '@talismn/connect-wallets';
    import { createWidget, DotPassportClient } from '@dotpassport/sdk';

    const API_KEY = 'your_api_key';

    // DOM Elements
    const installPrompt = document.getElementById('install-prompt');
    const connectSection = document.getElementById('connect-section');
    const connectedSection = document.getElementById('connected-section');
    const connectBtn = document.getElementById('connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const accountSelect = document.getElementById('account-select');
    const errorMessage = document.getElementById('error-message');
    const widgetContainer = document.getElementById('reputation-widget');

    // State
    let wallet = null;
    let accounts = [];
    let widget = null;
    let unsubscribe = null;

    // Check if Talisman is installed
    function checkInstalled() {
      const wallets = getWallets();
      const talisman = wallets.find(w => w.extensionName === 'talisman');
      return talisman?.installed ?? false;
    }

    // Show error
    function showError(message) {
      errorMessage.textContent = message;
      errorMessage.classList.remove('hidden');
    }

    // Clear error
    function clearError() {
      errorMessage.classList.add('hidden');
    }

    // Update account dropdown
    function updateAccountDropdown() {
      accountSelect.innerHTML = '';
      accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.address;
        option.textContent = `${account.name} (${account.address.slice(0, 8)}...)`;
        accountSelect.appendChild(option);
      });
    }

    // Mount or update widget
    function updateWidget(address) {
      if (widget) {
        widget.update({ address });
      } else {
        widget = createWidget({
          apiKey: API_KEY,
          address: address,
          type: 'reputation',
          theme: 'light',
          showCategories: true,
          onLoad: () => console.log('Widget loaded'),
          onError: (err) => showError(err.message)
        });
        widget.mount(widgetContainer);
      }
    }

    // Connect to Talisman
    async function connect() {
      clearError();
      connectBtn.disabled = true;
      connectBtn.textContent = 'Connecting...';

      try {
        const wallets = getWallets();
        const talisman = wallets.find(w => w.extensionName === 'talisman');

        if (!talisman?.installed) {
          throw new Error('Talisman is not installed');
        }

        await talisman.enable('DotPassport App');
        accounts = await talisman.getAccounts();

        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }

        wallet = talisman;

        // Subscribe to account changes
        unsubscribe = await talisman.subscribeAccounts((newAccounts) => {
          accounts = newAccounts;
          updateAccountDropdown();
          if (newAccounts.length > 0) {
            updateWidget(newAccounts[0].address);
          }
        });

        // Update UI
        connectSection.classList.add('hidden');
        connectedSection.classList.remove('hidden');
        updateAccountDropdown();
        updateWidget(accounts[0].address);

      } catch (err) {
        showError(err.message);
      } finally {
        connectBtn.disabled = false;
        connectBtn.textContent = 'Connect Talisman';
      }
    }

    // Disconnect
    function disconnect() {
      if (widget) {
        widget.destroy();
        widget = null;
      }
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      wallet = null;
      accounts = [];

      connectedSection.classList.add('hidden');
      connectSection.classList.remove('hidden');
    }

    // Event listeners
    connectBtn.addEventListener('click', connect);
    disconnectBtn.addEventListener('click', disconnect);
    accountSelect.addEventListener('change', (e) => {
      updateWidget(e.target.value);
    });

    // Initialize
    if (!checkInstalled()) {
      connectSection.classList.add('hidden');
      installPrompt.classList.remove('hidden');
    }
  </script>
</body>
</html>
```

---

## Error Handling

```typescript
async function connectWithErrorHandling() {
  try {
    const wallets = getWallets();
    const talisman = wallets.find(w => w.extensionName === 'talisman');

    if (!talisman) {
      // Talisman not in wallet list at all
      throw new Error('WALLET_NOT_FOUND');
    }

    if (!talisman.installed) {
      // Extension not installed
      throw new Error('WALLET_NOT_INSTALLED');
    }

    await talisman.enable('My App');
    const accounts = await talisman.getAccounts();

    if (accounts.length === 0) {
      throw new Error('NO_ACCOUNTS');
    }

    return accounts;

  } catch (error) {
    switch (error.message) {
      case 'WALLET_NOT_FOUND':
        console.error('Talisman wallet not detected');
        break;

      case 'WALLET_NOT_INSTALLED':
        console.error('Please install Talisman extension');
        window.open('https://talisman.xyz/download', '_blank');
        break;

      case 'NO_ACCOUNTS':
        console.error('No accounts found. Create an account in Talisman.');
        break;

      default:
        if (error.message?.includes('Rejected')) {
          console.error('User rejected the connection request');
        } else {
          console.error('Connection failed:', error);
        }
    }

    throw error;
  }
}
```

---

## Best Practices

### 1. Persist Connection State

```typescript
// Save connection state
function saveConnectionState(address: string) {
  localStorage.setItem('dotpassport_connected_address', address);
}

// Restore on page load
async function restoreConnection() {
  const savedAddress = localStorage.getItem('dotpassport_connected_address');
  if (!savedAddress) return null;

  try {
    const wallet = await connectTalisman();
    const accounts = await wallet.getAccounts();
    const account = accounts.find(a => a.address === savedAddress);
    return account || accounts[0];
  } catch {
    localStorage.removeItem('dotpassport_connected_address');
    return null;
  }
}
```

### 2. Handle Multiple Wallets

```typescript
import { getWallets } from '@talismn/connect-wallets';

function getInstalledWallets() {
  return getWallets().filter(w => w.installed);
}

// Let user choose wallet
function WalletSelector() {
  const installedWallets = getInstalledWallets();

  return (
    <div>
      <h3>Select Wallet</h3>
      {installedWallets.map(wallet => (
        <button key={wallet.extensionName} onClick={() => connectWallet(wallet)}>
          <img src={wallet.logo.src} alt={wallet.title} width={24} />
          {wallet.title}
        </button>
      ))}
    </div>
  );
}
```

### 3. Optimize Widget Updates

```typescript
// Debounce rapid account changes
import { debounce } from 'lodash';

const updateWidgetDebounced = debounce((address: string) => {
  widget.update({ address });
}, 300);

wallet.subscribeAccounts((accounts) => {
  if (accounts[0]) {
    updateWidgetDebounced(accounts[0].address);
  }
});
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Wallet not found" | Ensure Talisman extension is installed and enabled |
| "No accounts" | Create an account in Talisman wallet |
| "User rejected" | User declined the connection - show retry option |
| Widget not updating | Ensure `widget.update()` is called with new address |
| Scores not loading | Verify API key and address format |

---

## Related Resources

- [Talisman Wallet](https://talisman.xyz/)
- [Talisman Connect Docs](https://github.com/TalismanSociety/talisman-connect)
- [DotPassport API Reference](../api-reference.md)
- [Widget Configuration](../widgets.md)
