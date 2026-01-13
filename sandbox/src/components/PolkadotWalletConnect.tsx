import { useState, useEffect, useRef, Fragment } from 'react';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { Dialog, Transition } from '@headlessui/react';
import { X, ChevronRight, CheckCircle2, AlertTriangle, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useWalletStore } from '~/store/walletStore';
import type { WalletOption } from '~/types';
import { commonWallets } from '~/common/wallets';
import { toast } from 'sonner';
import { requestChallenge } from '~/service/authService';

// Type declaration for injectedWeb3 on window
declare global {
  interface Window {
    injectedWeb3?: Record<string, unknown>;
  }
}

// Types for different modal states
type ModalStep =
  | 'select-wallet'
  | 'connecting'
  | 'select-account'
  | 'checking-registration'
  | 'email-input'
  | 'signing'
  | 'auth-success'
  | 'reconnect-wallet'
  | 'reconnect-success';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  reconnectMode?: boolean; // When true, shows simplified reconnect UI
}

// Account Selection Component
const AccountSelector: React.FC<{
  accounts: InjectedAccountWithMeta[];
  onSelectAccount: (account: InjectedAccountWithMeta) => void;
  selectedAccount: InjectedAccountWithMeta | null;
}> = ({ accounts, onSelectAccount, selectedAccount }) => {
  return (
    <div className="space-y-3">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Select Account
        </h3>
        <p className="text-sm text-gray-600">
          Choose account to connect with DotPassport Sandbox
        </p>
      </div>

      {accounts.map((account) => (
        <div
          key={account.address}
          onClick={() => onSelectAccount(account)}
          className={`cursor-pointer w-full flex items-center p-5 rounded-xl border transition-all duration-200 ${
            selectedAccount?.address === account.address
              ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-purple-300 ring-2 ring-purple-200'
              : 'bg-gray-50 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 border-gray-200 hover:border-purple-200'
          }`}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
            <span className="text-white font-bold text-lg">
              {account.meta.name?.charAt(0) || '?'}
            </span>
          </div>
          <div className="flex-1 text-left">
            <div
              className={`font-semibold transition-colors ${
                selectedAccount?.address === account.address
                  ? 'text-purple-700'
                  : 'text-gray-900'
              }`}
            >
              {account.meta.name || 'Unnamed Account'}
            </div>
            <div className="text-sm text-gray-500 font-mono truncate">
              {account.address.slice(0, 8)}...{account.address.slice(-8)}
            </div>
          </div>
          <div className="text-purple-600">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Email Input Component
const EmailInput: React.FC<{
  onSubmit: (email: string) => void;
  onBack: () => void;
  isLoading: boolean;
  selectedAccount: InjectedAccountWithMeta;
}> = ({ onSubmit, onBack, isLoading, selectedAccount }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    onSubmit(email);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Enter Your Email
        </h3>
        <p className="text-sm text-gray-600">
          We'll send important updates about your API key to this address
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 mb-6 border border-purple-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {selectedAccount.meta.name?.charAt(0) || '?'}
            </span>
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold text-purple-900 text-sm">
              {selectedAccount.meta.name || 'Account'}
            </div>
            <div className="text-xs text-purple-700 font-mono">
              {selectedAccount.address.slice(0, 12)}...{selectedAccount.address.slice(-12)}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          placeholder="your@email.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
          disabled={isLoading}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
};

// Wallet Options Component
const WalletSelector: React.FC<{
  wallets: WalletOption[];
  onSelectWallet: (walletId: string) => void;
  isLoading?: boolean;
  isReconnect?: boolean;
}> = ({ wallets, onSelectWallet, isLoading, isReconnect }) => (
  <div className="space-y-3">
    <div className="text-center mb-6">
      {isReconnect ? (
        <>
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Reconnect Wallet</h3>
          <p className="text-gray-600 text-sm">
            Your session is active. Connect your wallet to continue.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Wallet</h3>
          <p className="text-gray-600">
            Connect with one of our supported wallet providers
          </p>
        </>
      )}
    </div>
    {wallets?.map((wallet) => (
      <button
        key={wallet.id}
        onClick={() => onSelectWallet(wallet.id)}
        disabled={!wallet.installed || isLoading}
        className="w-full flex items-center p-5 bg-gray-50 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 rounded-xl border border-gray-200 hover:border-purple-200 hover:scale-[1.02] transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <img
          src={wallet.logo}
          alt={wallet.name}
          className="w-12 h-12 rounded-full mr-4 border-2 border-white shadow-sm"
        />
        <div className="flex-1 text-left">
          <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
            {wallet.name}
          </div>
          {!wallet.installed && (
            <div className="text-sm text-red-500">Not installed</div>
          )}
        </div>
        {wallet.installed && (
          <div className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5" />
          </div>
        )}
      </button>
    ))}

    {!wallets || wallets.length === 0 ? (
      <div className="text-center text-gray-500 py-4">
        No wallets available. Please install Polkadot.js or Talisman wallet.
      </div>
    ) : null}
  </div>
);

// Loading State
const LoadingState: React.FC<{
  title: string;
  description: string;
  account?: InjectedAccountWithMeta;
}> = ({ title, description, account }) => (
  <div className="text-center py-8">
    <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
      <Loader2 className="w-10 h-10 text-white animate-spin" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    {account && (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200 max-w-sm mx-auto">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">{account.meta.name?.charAt(0) || '?'}</span>
          </div>
          <div className="text-left">
            <div className="font-semibold text-purple-900 text-sm">
              {account.meta.name || 'Account'}
            </div>
            <div className="text-xs text-purple-700 font-mono">
              {account.address.slice(0, 12)}...{account.address.slice(-12)}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

// Success State with API Key
const AuthSuccessState: React.FC<{
  account: InjectedAccountWithMeta;
  apiKey?: string;
  isNew: boolean;
}> = ({ account, apiKey, isNew }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success('API key copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
        <CheckCircle2 className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {isNew ? 'Welcome to DotPassport Sandbox!' : 'Welcome Back!'}
      </h3>
      <p className="text-gray-600 mb-6">
        {isNew
          ? 'Your account has been created and your API key is ready.'
          : "You're all set to start testing."}
      </p>

      {isNew && apiKey && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-green-900 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Your API Key (save this securely!)</span>
          </div>
          <div className="bg-white rounded-lg p-3 mb-3 border border-green-200">
            <code className="text-xs font-mono text-gray-800 break-all block">
              {apiKey}
            </code>
          </div>
          <button
            onClick={handleCopyApiKey}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200 hover:shadow-md"
          >
            {copied ? '✓ Copied!' : 'Copy API Key'}
          </button>
          <div className="flex items-start gap-2 text-xs text-green-700 mt-2">
            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <p>This is the only time you'll see your full API key. Save it now!</p>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">{account.meta.name?.charAt(0) || '?'}</span>
          </div>
          <div className="text-left">
            <div className="font-semibold text-purple-900 text-sm">
              {account.meta.name || 'Account'}
            </div>
            <div className="text-xs text-purple-700 font-mono">
              {account.address.slice(0, 12)}...{account.address.slice(-12)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Redirecting to dashboard...
      </div>
    </div>
  );
};

// Reconnect Success State
const ReconnectSuccessState: React.FC<{
  account: InjectedAccountWithMeta;
}> = ({ account }) => (
  <div className="text-center py-6">
    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
      <CheckCircle2 className="w-10 h-10 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">
      Wallet Reconnected!
    </h3>
    <p className="text-gray-600 mb-6">
      Your wallet is now connected. You're ready to continue.
    </p>

    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
      <div className="flex items-center justify-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">{account.meta.name?.charAt(0) || '?'}</span>
        </div>
        <div className="text-left">
          <div className="font-semibold text-purple-900 text-sm">
            {account.meta.name || 'Account'}
          </div>
          <div className="text-xs text-purple-700 font-mono">
            {account.address.slice(0, 12)}...{account.address.slice(-12)}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main Wallet Connect Modal
export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  reconnectMode = false,
}) => {
  const {
    isConnected,
    isAuthenticated,
    accounts,
    selectedAccount,
    status,
    statusMessage,
    isLoading,
    isSigning,
    connectWallet,
    login,
    setSelectedAccount,
    newApiKey,
    clearNewApiKey,
  } = useWalletStore();

  const [currentStep, setCurrentStep] = useState<ModalStep>('select-wallet');
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);
  const [, setSelectedWalletName] = useState<string>('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [challengeMessage, setChallengeMessage] = useState<string | null>(null);
  // Pending account for displaying during registration check
  const [pendingAccount, setPendingAccount] = useState<InjectedAccountWithMeta | null>(null);
  // Ref to synchronously track when we're handling account selection (prevents useEffect race condition)
  const isHandlingAccountRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.injectedWeb3) {
      const detectedOptions = commonWallets.map((wallet) => ({
        ...wallet,
        installed: !!window.injectedWeb3?.[wallet.id],
      }));
      setAvailableWallets(detectedOptions);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Reconnect mode: simplified flow
    if (reconnectMode && isAuthenticated) {
      if (isConnected && accounts.length > 0 && selectedAccount) {
        // Successfully reconnected
        setCurrentStep('reconnect-success');
        setTimeout(() => {
          onClose();
        }, 1500);
        return;
      } else if (isLoading) {
        setCurrentStep('connecting');
      } else {
        setCurrentStep('reconnect-wallet');
      }
      return;
    }

    // Normal flow
    if (isConnected && accounts.length > 0) {
      // Don't manage steps if we're currently handling account selection (ref check is synchronous)
      if (isHandlingAccountRef.current) {
        return;
      }

      if (!selectedAccount) {
        setCurrentStep('select-account');
      } else if (!isAuthenticated) {
        if (isSigning) {
          setCurrentStep('signing');
        } else if (
          currentStep !== 'email-input' &&
          currentStep !== 'checking-registration' &&
          currentStep !== 'signing'  // Also don't override signing step
        ) {
          // Don't override these steps - they're manually controlled by handleAccountSelect
          setCurrentStep('email-input');
        }
      } else if (isAuthenticated) {
        if (currentStep === 'signing' || currentStep === 'email-input' || currentStep === 'checking-registration') {
          setCurrentStep('auth-success');
          setTimeout(() => {
            clearNewApiKey();
            onClose();
            window.location.href = '/dashboard';
          }, isNewUser && newApiKey ? 6000 : 2000);
        }
      }
    } else if (isLoading) {
      setCurrentStep('connecting');
    } else {
      setCurrentStep('select-wallet');
    }
  }, [
    isConnected,
    accounts,
    selectedAccount,
    isAuthenticated,
    isLoading,
    isSigning,
    isOpen,
    currentStep,
    newApiKey,
    isNewUser,
    reconnectMode,
  ]);

  const handleWalletSelect = async (walletId: string) => {
    const wallet = availableWallets.find((w) => w.id === walletId);
    if (wallet) {
      setSelectedWalletName(wallet.name);
      setCurrentStep('connecting');
      const success = await connectWallet(walletId, 'DotPassport Sandbox');
      if (!success) {
        setCurrentStep('select-wallet');
      }
    }
  };

  const handleAccountSelect = async (account: InjectedAccountWithMeta) => {
    // Set ref synchronously to prevent useEffect from interfering
    isHandlingAccountRef.current = true;

    // Store account for display during registration check
    setPendingAccount(account);
    setCurrentStep('checking-registration');

    try {
      // Check if user is already registered
      const challenge = await requestChallenge(account.address);
      setChallengeMessage(challenge.message);

      if (challenge.isRegistered) {
        // User is registered - skip email input and go directly to signing
        setSelectedAccount(account);
        setPendingAccount(null);
        setCurrentStep('signing');

        // Login with empty email and pass the pre-fetched challenge
        const success = await login('', challenge.message);
        if (success) {
          setIsNewUser(false);
        } else {
          // If login fails, fall back to email input
          setCurrentStep('email-input');
        }
      } else {
        // New user - show email input
        setSelectedAccount(account);
        setPendingAccount(null);
        setCurrentStep('email-input');
      }
    } catch (error) {
      console.error('Error checking registration:', error);
      // On error, set account and fall back to email input flow
      setSelectedAccount(account);
      setPendingAccount(null);
      setCurrentStep('email-input');
    } finally {
      // Clear the ref after all async operations are complete
      isHandlingAccountRef.current = false;
    }
  };

  const handleEmailSubmit = async (email: string) => {
    if (!selectedAccount) return;
    setCurrentStep('signing');
    // Pass the pre-fetched challenge message if available
    const success = await login(email, challengeMessage || undefined);
    if (success) {
      setIsNewUser(!!newApiKey);
    } else {
      setCurrentStep('email-input');
    }
  };

  const handleClose = () => {
    if (isSigning || currentStep === 'auth-success') {
      toast.warning('Please complete the authentication process');
      return;
    }
    // In reconnect mode, allow closing even if not connected
    if (reconnectMode) {
      onClose();
      return;
    }
    onClose();
  };

  const handleBack = () => {
    if (currentStep === 'email-input') {
      setSelectedAccount(null);
      setCurrentStep('select-account');
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'reconnect-wallet':
        return (
          <WalletSelector
            wallets={availableWallets}
            onSelectWallet={handleWalletSelect}
            isLoading={isLoading}
            isReconnect={true}
          />
        );

      case 'reconnect-success':
        return selectedAccount ? (
          <ReconnectSuccessState account={selectedAccount} />
        ) : null;

      case 'select-wallet':
        return (
          <WalletSelector
            wallets={availableWallets}
            onSelectWallet={handleWalletSelect}
            isLoading={isLoading}
          />
        );

      case 'connecting':
        return (
          <LoadingState
            title="Connecting Wallet"
            description="Please confirm the connection request in your wallet extension"
          />
        );

      case 'select-account':
        return (
          <AccountSelector
            accounts={accounts}
            onSelectAccount={handleAccountSelect}
            selectedAccount={selectedAccount}
          />
        );

      case 'checking-registration':
        return (
          <LoadingState
            title="Checking Account"
            description="Verifying your account status..."
            account={pendingAccount || selectedAccount || undefined}
          />
        );

      case 'email-input':
        return selectedAccount ? (
          <EmailInput
            onSubmit={handleEmailSubmit}
            onBack={handleBack}
            isLoading={isSigning}
            selectedAccount={selectedAccount}
          />
        ) : null;

      case 'signing':
        return (
          <LoadingState
            title="Authentication Required"
            description="Please review and sign the authentication message in your wallet"
            account={selectedAccount || undefined}
          />
        );

      case 'auth-success':
        return selectedAccount ? (
          <AuthSuccessState
            account={selectedAccount}
            apiKey={newApiKey || undefined}
            isNew={isNewUser}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">DP</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      DotPassport Sandbox
                    </span>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isSigning || currentStep === 'auth-success'}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      isSigning || currentStep === 'auth-success'
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Status Message */}
                {statusMessage && status !== 'idle' && (
                  <div
                    className={`p-3 mb-4 rounded-lg text-sm font-medium ${
                      status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : status === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {statusMessage}
                  </div>
                )}

                {/* Main Content */}
                <div className="min-h-[300px]">{renderContent()}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default WalletConnectModal;
