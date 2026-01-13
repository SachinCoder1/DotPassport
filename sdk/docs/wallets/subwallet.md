# SubWallet Integration

This guide shows how to integrate DotPassport SDK with [SubWallet](https://subwallet.app/) using the `@subwallet/wallet-connect` library.

## Installation

```bash
# Install SubWallet Connect
npm install @subwallet/wallet-connect

# Install DotPassport SDK
npm install @dotpassport/sdk
```

## Quick Start

```typescript
import { getWalletBySource } from '@subwallet/wallet-connect';
import { DotPassportClient, createWidget } from '@dotpassport/sdk';

// 1. Get SubWallet
const subwallet = await getWalletBySource('subwallet-js');

// 2. Enable and get accounts
await subwallet.enable();
const accounts = await subwallet.getAccounts();
const address = accounts[0].address;

// 3. Use with DotPassport
const client = new DotPassportClient({ apiKey: 'your_api_key' });
const scores = await client.getScores(address);
console.log(`Reputation: ${scores.totalScore}`);
```

---

## Complete Integration Guide

### Step 1: Check for Wallet Installation

```typescript
import { getWalletBySource, isWalletInstalled } from '@subwallet/wallet-connect';

async function checkSubWalletInstalled(): Promise<boolean> {
  return isWalletInstalled('subwallet-js');
}

// Or check by trying to get the wallet
async function getSubWallet() {
  const wallet = await getWalletBySource('subwallet-js');

  if (!wallet) {
    throw new Error('SubWallet is not installed');
  }

  return wallet;
}
```

### Step 2: Connect to Wallet

```typescript
import { getWalletBySource, Wallet } from '@subwallet/wallet-connect';

async function connectSubWallet(): Promise<Wallet> {
  const wallet = await getWalletBySource('subwallet-js');

  if (!wallet) {
    throw new Error('SubWallet not found. Please install SubWallet extension.');
  }

  // Enable the wallet - this prompts user for permission
  await wallet.enable();

  return wallet;
}
```

### Step 3: Get User Accounts

```typescript
import { WalletAccount } from '@subwallet/wallet-connect';

async function getAccounts(wallet: Wallet): Promise<WalletAccount[]> {
  const accounts = await wallet.getAccounts();

  if (accounts.length === 0) {
    throw new Error('No accounts found. Please create an account in SubWallet.');
  }

  return accounts;
}

// Usage
const wallet = await connectSubWallet();
const accounts = await getAccounts(wallet);

console.log('Available accounts:');
accounts.forEach(acc => {
  console.log(`- ${acc.name || 'Account'}: ${acc.address}`);
});
```

### Step 4: Subscribe to Account Changes

```typescript
async function subscribeToAccounts(
  wallet: Wallet,
  callback: (accounts: WalletAccount[]) => void
): Promise<() => void> {
  const unsubscribe = await wallet.subscribeAccounts(callback);
  return unsubscribe;
}

// Usage
const unsubscribe = await subscribeToAccounts(wallet, (accounts) => {
  console.log('Accounts updated:', accounts);
  if (accounts.length > 0) {
    updateDotPassportWidget(accounts[0].address);
  }
});

// Clean up when done
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
    theme: 'dark',
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
import {
  getWalletBySource,
  isWalletInstalled,
  Wallet,
  WalletAccount
} from '@subwallet/wallet-connect';
import { createWidget, DotPassportClient, type UserScores } from '@dotpassport/sdk';

interface SubWalletDotPassportProps {
  apiKey: string;
}

export function SubWalletDotPassport({ apiKey }: SubWalletDotPassportProps) {
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null);
  const [scores, setScores] = useState<UserScores | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const widgetRef = useRef<ReturnType<typeof createWidget>>();
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Check installation on mount
  useEffect(() => {
    isWalletInstalled('subwallet-js').then(setIsInstalled);
  }, []);

  // Connect to SubWallet
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const subwallet = await getWalletBySource('subwallet-js');

      if (!subwallet) {
        throw new Error('SubWallet is not installed');
      }

      await subwallet.enable();
      const userAccounts = await subwallet.getAccounts();

      if (userAccounts.length === 0) {
        throw new Error('No accounts found');
      }

      setWallet(subwallet);
      setAccounts(userAccounts);
      setSelectedAccount(userAccounts[0]);

      // Subscribe to account changes
      unsubscribeRef.current = await subwallet.subscribeAccounts((newAccounts) => {
        setAccounts(newAccounts);
        if (newAccounts.length > 0) {
          const currentAddress = selectedAccount?.address;
          const stillExists = newAccounts.find(a => a.address === currentAddress);
          if (!stillExists) {
            setSelectedAccount(newAccounts[0]);
          }
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
      .catch(err => console.error('Failed to fetch scores:', err));
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
        theme: 'dark',
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
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    widgetRef.current?.destroy();
    widgetRef.current = undefined;
    setWallet(null);
    setAccounts([]);
    setSelectedAccount(null);
    setScores(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
      widgetRef.current?.destroy();
    };
  }, []);

  // Not installed
  if (!isInstalled) {
    return (
      <div className="subwallet-connect">
        <p>SubWallet is not installed.</p>
        <a
          href="https://subwallet.app/download"
          target="_blank"
          rel="noopener noreferrer"
          className="install-link"
        >
          Install SubWallet
        </a>
      </div>
    );
  }

  // Not connected
  if (!wallet) {
    return (
      <div className="subwallet-connect">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="connect-button"
        >
          {isConnecting ? 'Connecting...' : 'Connect SubWallet'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  // Connected
  return (
    <div className="subwallet-dotpassport">
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
              {account.name || 'Account'} ({account.address.slice(0, 8)}...{account.address.slice(-6)})
            </option>
          ))}
        </select>
        <button onClick={disconnect} className="disconnect-button">
          Disconnect
        </button>
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

// Usage:
// <SubWalletDotPassport apiKey="your_api_key" />
```

---

## Complete Vanilla JavaScript Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DotPassport + SubWallet</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 20px;
      background: #1a1a2e;
      color: #eee;
    }
    .container { max-width: 600px; margin: 0 auto; }
    .account-info {
      margin: 20px 0;
      padding: 15px;
      background: #16213e;
      border-radius: 12px;
    }
    .widget-container { margin-top: 20px; }
    button {
      padding: 12px 24px;
      cursor: pointer;
      background: #00d9ff;
      color: #000;
      border: none;
      border-radius: 8px;
      font-weight: 600;
    }
    button:hover { background: #00b8d4; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    select {
      padding: 10px;
      margin: 0 10px;
      border-radius: 6px;
      background: #0f3460;
      color: #fff;
      border: 1px solid #00d9ff;
    }
    .error { color: #ff6b6b; }
    .hidden { display: none; }
    a { color: #00d9ff; }
  </style>
</head>
<body>
  <div class="container">
    <h1>DotPassport + SubWallet</h1>

    <!-- Not Installed State -->
    <div id="install-prompt" class="hidden">
      <p>SubWallet is not installed.</p>
      <a href="https://subwallet.app/download" target="_blank">
        Install SubWallet
      </a>
    </div>

    <!-- Connect Button -->
    <div id="connect-section">
      <button id="connect-btn">Connect SubWallet</button>
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
    import { getWalletBySource, isWalletInstalled } from '@subwallet/wallet-connect';
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
        const name = account.name || 'Account';
        option.textContent = `${name} (${account.address.slice(0, 8)}...)`;
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
          theme: 'dark',
          showCategories: true,
          onLoad: () => console.log('Widget loaded'),
          onError: (err) => showError(err.message)
        });
        widget.mount(widgetContainer);
      }
    }

    // Connect to SubWallet
    async function connect() {
      clearError();
      connectBtn.disabled = true;
      connectBtn.textContent = 'Connecting...';

      try {
        const subwallet = await getWalletBySource('subwallet-js');

        if (!subwallet) {
          throw new Error('SubWallet is not installed');
        }

        await subwallet.enable();
        accounts = await subwallet.getAccounts();

        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }

        wallet = subwallet;

        // Subscribe to account changes
        unsubscribe = await subwallet.subscribeAccounts((newAccounts) => {
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
        connectBtn.textContent = 'Connect SubWallet';
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

    // Initialize - check if installed
    const installed = await isWalletInstalled('subwallet-js');
    if (!installed) {
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
import { getWalletBySource, isWalletInstalled } from '@subwallet/wallet-connect';

async function connectWithErrorHandling() {
  try {
    // Check if installed
    const installed = await isWalletInstalled('subwallet-js');
    if (!installed) {
      throw new Error('WALLET_NOT_INSTALLED');
    }

    // Get wallet
    const wallet = await getWalletBySource('subwallet-js');
    if (!wallet) {
      throw new Error('WALLET_NOT_FOUND');
    }

    // Enable (request permission)
    await wallet.enable();

    // Get accounts
    const accounts = await wallet.getAccounts();
    if (accounts.length === 0) {
      throw new Error('NO_ACCOUNTS');
    }

    return { wallet, accounts };

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    switch (message) {
      case 'WALLET_NOT_INSTALLED':
        console.error('SubWallet is not installed');
        // Redirect to install page
        window.open('https://subwallet.app/download', '_blank');
        break;

      case 'WALLET_NOT_FOUND':
        console.error('Could not find SubWallet');
        break;

      case 'NO_ACCOUNTS':
        console.error('No accounts found. Please create an account in SubWallet.');
        break;

      default:
        if (message.includes('rejected') || message.includes('denied')) {
          console.error('User rejected the connection request');
        } else {
          console.error('Connection failed:', message);
        }
    }

    throw error;
  }
}
```

---

## Working with Multiple Networks

SubWallet supports multiple networks. Here's how to filter accounts by network:

```typescript
async function getPolkadotAccounts(wallet: Wallet) {
  const allAccounts = await wallet.getAccounts();

  // Filter for Polkadot accounts (genesisHash or network type)
  const polkadotAccounts = allAccounts.filter(account => {
    // SubWallet accounts may have network info
    return account.type === 'sr25519' || account.type === 'ed25519';
  });

  return polkadotAccounts;
}
```

---

## Best Practices

### 1. Persist Connection State

```typescript
const STORAGE_KEY = 'dotpassport_subwallet_address';

function saveConnectionState(address: string) {
  localStorage.setItem(STORAGE_KEY, address);
}

async function restoreConnection() {
  const savedAddress = localStorage.getItem(STORAGE_KEY);
  if (!savedAddress) return null;

  try {
    const installed = await isWalletInstalled('subwallet-js');
    if (!installed) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const wallet = await getWalletBySource('subwallet-js');
    await wallet.enable();
    const accounts = await wallet.getAccounts();

    const account = accounts.find(a => a.address === savedAddress);
    return account || accounts[0] || null;

  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
```

### 2. Handle Wallet Disconnection

```typescript
function setupDisconnectionHandling(wallet: Wallet) {
  // Check periodically if wallet is still connected
  const interval = setInterval(async () => {
    try {
      const accounts = await wallet.getAccounts();
      if (accounts.length === 0) {
        handleDisconnection();
      }
    } catch {
      handleDisconnection();
    }
  }, 5000);

  return () => clearInterval(interval);
}

function handleDisconnection() {
  widget?.destroy();
  localStorage.removeItem(STORAGE_KEY);
  // Update UI to show connect button
}
```

### 3. Optimize Widget Updates

```typescript
// Debounce rapid account changes
let updateTimeout: NodeJS.Timeout;

function updateWidgetDebounced(address: string) {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    widget.update({ address });
  }, 300);
}

await wallet.subscribeAccounts((accounts) => {
  if (accounts[0]) {
    updateWidgetDebounced(accounts[0].address);
  }
});
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Wallet not installed" | Install SubWallet from [subwallet.app](https://subwallet.app/download) |
| "No accounts found" | Create an account in SubWallet |
| "User rejected" | User declined connection - provide retry option |
| Widget not updating | Ensure `widget.update()` is called with new address |
| Extension not detected | Refresh the page after installing SubWallet |

---

## Related Resources

- [SubWallet Website](https://subwallet.app/)
- [SubWallet Connect Docs](https://github.com/AstarNetwork/astar-apps)
- [DotPassport API Reference](../api-reference.md)
- [Widget Configuration](../widgets.md)
