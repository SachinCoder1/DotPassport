// src/components/PolkadotWalletConnect.tsx

"use client";

import React, { useState, useEffect, Fragment } from "react";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckIcon,
  Wallet,
  Lock,
  X,
  ArrowLeft,
  ExternalLink,
  Copy,
  LogOut,
  ChevronDown,
  User,
  Shield,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useWalletStore } from "../store/walletStore";
import { WalletOption } from "@/types";
import { commonWallets } from "@/common/wallets";
import { toast } from "sonner";

// Types for different modal states
type ModalStep =
  | "select-wallet"
  | "connecting"
  | "select-account"
  | "auth-account-select"
  | "signing"
  | "auth-success"
  | "success";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavbarWalletButtonProps {
  onOpenModal: () => void;
}

// Navbar Wallet Button Component
export const NavbarWalletButton: React.FC<NavbarWalletButtonProps> = ({
  onOpenModal,
}) => {
  const { isConnected, isAuthenticated, selectedAccount, isInitializing } =
    useWalletStore();

  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  useEffect(() => {
    // Only auto-open once when first connected but not authenticated
    if (!isInitializing && isConnected && !isAuthenticated && !hasAutoOpened) {
      onOpenModal();
      setHasAutoOpened(true);
    }
    // Reset flag when authenticated or disconnected
    if (!isConnected || isAuthenticated) {
      setHasAutoOpened(false);
    }
  }, [isInitializing, isConnected, isAuthenticated, onOpenModal, hasAutoOpened]);

  if (!isConnected) {
    return (
      <button
        onClick={onOpenModal}
        className="cursor-pointer flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={onOpenModal}
        className="cursor-pointer flex items-center space-x-3 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium hover:bg-white hover:shadow-md transition-all duration-200 group"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-sm font-semibold">
            {selectedAccount?.meta.name || "Account"}
          </span>
          <span className="text-xs text-gray-500">
            {selectedAccount?.address.slice(0, 6)}...
            {selectedAccount?.address.slice(-4)}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </button>

      {/* {isAuthenticated && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
      )} */}

      {isConnected && !isAuthenticated && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
      )}
    </div>
  );
};

// Account Selection Component (No changes needed)
const AccountSelector: React.FC<{
  accounts: InjectedAccountWithMeta[];
  onSelectAccount: (account: InjectedAccountWithMeta) => void;
  selectedAccount: InjectedAccountWithMeta | null;
  showSignButtons?: boolean;
  isLoading?: boolean;
}> = ({
  accounts,
  onSelectAccount,
  selectedAccount,
  showSignButtons = false,
  isLoading,
}) => {
  return (
    <div className="space-y-3">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {showSignButtons
            ? "Select Account to Authenticate"
            : "Select Account"}
        </h3>
        <p className="text-gray-600">
          {showSignButtons
            ? "Choose which account you want to authenticate and sign in with"
            : "Choose which account to connect with DotPassport"}
        </p>
      </div>

      {accounts.map((account) => (
        <div
          key={account.address}
          onClick={!showSignButtons && !isLoading ? () => onSelectAccount(account) : undefined}
          className={`w-full flex items-center p-4 rounded-xl border transition-all duration-200 ${
            !showSignButtons ? 'cursor-pointer' : ''
          } ${
            selectedAccount?.address === account.address
              ? "bg-gradient-to-r from-pink-50 to-purple-50 border-purple-300 ring-2 ring-purple-200"
              : "bg-gray-50 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 border-gray-200 hover:border-purple-200"
          }`}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <div
              className={`font-semibold transition-colors ${
                selectedAccount?.address === account.address
                  ? "text-purple-700"
                  : "text-gray-900"
              }`}
            >
              {account.meta.name || "Unnamed Account"}
            </div>
            <div className="text-sm text-gray-500 font-mono">
              {account.address.slice(0, 8)}...{account.address.slice(-8)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {showSignButtons ? (
              <button
                onClick={() => onSelectAccount(account)}
                disabled={isLoading}
                className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedAccount?.address === account.address
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                    : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading && selectedAccount?.address === account.address ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Signing...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            ) : (
              <div className="text-purple-600">
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Wallet Options Component (No changes needed)
const WalletSelector: React.FC<{
  wallets: WalletOption[];
  onSelectWallet: (walletId: string) => void;
  isLoading?: boolean;
}> = ({ wallets, onSelectWallet, isLoading }) => (
  <div className="space-y-3">
    <div className="text-center mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Wallet</h3>
      <p className="text-gray-600">
        Connect with one of our available wallet providers
      </p>
    </div>
    {wallets?.map((wallet) => (
      <button
        key={wallet.id}
        onClick={() => onSelectWallet(wallet.id)}
        disabled={!wallet.installed || isLoading}
        className="cursor-pointer w-full flex items-center p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 rounded-xl border border-gray-200 hover:border-purple-200 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="flex items-center space-x-2">
          {!wallet.installed ? (
            <div className="flex items-center space-x-1 text-red-500">
              <span className="text-sm font-medium">Install</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          ) : (
            <div className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </div>
          )}
        </div>
      </button>
    ))}

    {!wallets || wallets.length === 0 ? (
      <div className="text-center text-gray-500">
        No wallets available. Please install subwallet or talisman wallet to
        continue.
      </div>
    ) : null}
  </div>
);

const LoadingState: React.FC<{
  title: string;
  description: string;
  walletName?: string;
  showSpinner?: boolean;
  account?: InjectedAccountWithMeta;
}> = ({ title, description, walletName, showSpinner = true, account }) => (
  <div className="text-center py-8">
    {" "}
    <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
      {" "}
      {showSpinner ? (
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      ) : (
        <Lock className="w-10 h-10 text-white" />
      )}{" "}
    </div>{" "}
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>{" "}
    <p className="text-gray-600 mb-6">{description}</p>{" "}
    {account && (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
        {" "}
        <div className="flex items-center justify-center space-x-3">
          {" "}
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            {" "}
            <User className="w-5 h-5 text-white" />{" "}
          </div>{" "}
          <div className="text-left">
            {" "}
            <div className="font-semibold text-purple-900">
              {account.meta.name || "Account"}
            </div>{" "}
            <div className="text-sm text-purple-700 font-mono">
              {" "}
              {account.address.slice(0, 12)}...{account.address.slice(-12)}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    )}{" "}
    {walletName && (
      <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
        {" "}
        <div className="flex space-x-1">
          {" "}
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>{" "}
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>{" "}
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>{" "}
        </div>{" "}
        <span className="text-sm font-medium ml-2">
          {" "}
          {showSpinner
            ? `Awaiting signature in ${walletName}`
            : `Working with ${walletName}`}{" "}
        </span>{" "}
      </div>
    )}{" "}
  </div>
);
const AuthSuccessState: React.FC<{ account: InjectedAccountWithMeta }> = ({
  account,
}) => (
  <div className="text-center py-8">
    {" "}
    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
      {" "}
      <CheckIcon className="w-10 h-10 text-white" />{" "}
    </div>{" "}
    <h3 className="text-xl font-bold text-gray-900 mb-2">
      Authentication Successful!
    </h3>{" "}
    <p className="text-gray-600 mb-6">
      {" "}
      Welcome to DotPassport! Your identity has been verified and you're ready
      to start building your reputation.{" "}
    </p>{" "}
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
      {" "}
      <div className="flex items-center justify-center space-x-3">
        {" "}
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
          {" "}
          <User className="w-5 h-5 text-white" />{" "}
        </div>{" "}
        <div className="text-left">
          {" "}
          <div className="font-semibold text-green-900">
            {account.meta.name || "Account"}
          </div>{" "}
          <div className="text-sm text-green-700 font-mono">
            {" "}
            {account.address.slice(0, 12)}...{account.address.slice(-12)}{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
          {" "}
          <Shield className="w-3 h-3" />{" "}
          <span className="text-xs font-medium">Verified</span>{" "}
        </div>{" "}
      </div>{" "}
    </div>{" "}
    <div className="mt-4 text-sm text-gray-500">
      {" "}
      Redirecting you to DotPassport...{" "}
    </div>{" "}
  </div>
);
const ConnectedState: React.FC<{
  account: InjectedAccountWithMeta;
  isAuthenticated: boolean;
  onLogout: () => void;
  onCopyAddress: () => void;
}> = ({ account, isAuthenticated, onLogout, onCopyAddress }) => (
  <div className="space-y-6">
    {" "}
    <div className="text-center">
      {" "}
      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
        {" "}
        <CheckIcon className="w-8 h-8 text-white" />{" "}
      </div>{" "}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {" "}
        Wallet Connected{" "}
      </h3>{" "}
      <p className="text-gray-600">
        {" "}
        Manage your connected account and settings{" "}
      </p>{" "}
    </div>{" "}
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
      {" "}
      <div className="flex items-center justify-between mb-4">
        {" "}
        <div className="flex items-center space-x-3">
          {" "}
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            {" "}
            <User className="w-5 h-5 text-white" />{" "}
          </div>{" "}
          <div>
            {" "}
            <div className="font-semibold text-gray-900">
              {account.meta.name || "Account"}
            </div>{" "}
            <div className="text-sm text-gray-600">Connected & Verified</div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
          {" "}
          <Shield className="w-4 h-4" />{" "}
          <span className="text-sm font-medium">Authenticated</span>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bg-white rounded-lg p-3 mb-4 border border-green-200">
        {" "}
        <div className="flex items-center justify-between">
          {" "}
          <code className="text-sm text-gray-600 font-mono">
            {" "}
            {account.address.slice(0, 12)}...{account.address.slice(-12)}{" "}
          </code>{" "}
          <button
            onClick={onCopyAddress}
            className="cursor-pointer flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {" "}
            <Copy className="w-4 h-4" />{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <button
        onClick={onLogout}
        className="cursor-pointer w-full flex items-center justify-center space-x-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors font-medium"
      >
        {" "}
        <LogOut className="w-4 h-4" /> <span>Disconnect Wallet</span>{" "}
      </button>{" "}
    </div>{" "}
  </div>
);

// Main Wallet Connect Modal Component
export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
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
    logout,
    setSelectedAccount,
  } = useWalletStore();

  const [currentStep, setCurrentStep] = useState<ModalStep>("select-wallet");
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);
  const [selectedWalletName, setSelectedWalletName] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).injectedWeb3) {
      const detectedOptions = commonWallets.map((wallet) => ({
        ...wallet,
        installed: !!(window as any).injectedWeb3[wallet.id],
      }));
      setAvailableWallets(detectedOptions);
    }
  }, []);

  // =====================
  // ===   FIXED LOGIC   ===
  // =====================
  useEffect(() => {
    if (!isOpen) return; // Don't run logic if modal is closed

    if (isConnected && accounts.length > 0) {
      if (!selectedAccount) {
        // If connected but no account is selected yet, go to the selection screen.
        setCurrentStep("select-account");
      } else if (!isAuthenticated) {
        // If an account is selected but user is not authenticated...
        if (isSigning) {
          // If a signing process is active, show the signing screen.
          setCurrentStep("signing");
        } else {
          // ALWAYS go to the screen with "Sign In" buttons.
          // This handles both single and multiple account cases uniformly.
          // The user must explicitly click "Sign In" to proceed.
          setCurrentStep("auth-account-select");
        }
      } else if (isAuthenticated) {
        // If we just became authenticated, show success screen.
        // We check against previous steps to ensure this only happens right after a login.
        if (
          currentStep === "signing" ||
          currentStep === "auth-account-select"
        ) {
          setCurrentStep("auth-success");
          setTimeout(() => {
            onClose();
          }, 2000); // Give user time to read the success message
        } else {
          // Otherwise, show the main connected state.
          setCurrentStep("success");
        }
      }
    } else if (isLoading) {
      setCurrentStep("connecting");
    } else {
      // If not connected, reset to the initial wallet selection.
      setCurrentStep("select-wallet");
    }
    // FIX: Refined dependencies to prevent unnecessary re-renders and loops.
  }, [
    isConnected,
    accounts,
    selectedAccount,
    isAuthenticated,
    isLoading,
    isSigning,
    isOpen,
    onClose,
    currentStep,
  ]);

  const handleWalletSelect = async (walletId: string) => {
    const wallet = availableWallets.find((w) => w.id === walletId);
    if (wallet) {
      setSelectedWalletName(wallet.name);
      setCurrentStep("connecting");
      const success = await connectWallet(walletId, "dotpassport-dapp");
      if (!success) {
        setCurrentStep("select-wallet");
      }
    }
  };

  // =====================
  // ===   FIXED LOGIC   ===
  // =====================
  const handleAccountSelect = (account: InjectedAccountWithMeta) => {
    // FIX: This function's ONLY responsibility is to set the selected account.
    // The main useEffect will then react to this state change and determine
    // the next step, which will be 'auth-account-select'.
    setSelectedAccount(account);
  };

  const handleAuthAccountSelect = async (account: InjectedAccountWithMeta) => {
    // This is the ONLY place where login() should be initiated by the user.
    setSelectedAccount(account);
    setCurrentStep("signing");
    const success = await login();
    if (!success) {
      // If signing fails (e.g., user rejects), go back to the selection screen.
      setCurrentStep("auth-account-select");
    }
    // On success, the main useEffect will handle the transition to 'auth-success'.
  };

  const handleLogout = () => {
    logout();
    setCurrentStep("select-wallet");
    onClose();
  };

  const handleCopyAddress = () => {
    if (selectedAccount) {
      navigator.clipboard.writeText(selectedAccount.address);
    }
  };

  const canGoBack =
    (currentStep === "select-account" ||
      currentStep === "auth-account-select") &&
    !isSigning;

  const handleBack = () => {
    if (currentStep === "select-account") {
      logout(); // Disconnect if going back from account selection
      setCurrentStep("select-wallet");
    } else if (currentStep === "auth-account-select") {
      // Going back from auth screen - clear selection to show account picker
      setSelectedAccount(null);
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (isSigning || currentStep === "auth-success") {
      // ...show a warning toast instead of closing the modal.
      toast.warning("Signing is required to continue", {
        description: "Please complete the process in your wallet.",
      });
      return; // Important: Still prevent the modal from closing
    }
    onClose();
  };

  const renderContent = () => {
    switch (currentStep) {
      case "select-wallet":
        return (
          <WalletSelector
            wallets={availableWallets}
            onSelectWallet={handleWalletSelect}
            isLoading={isLoading}
          />
        );

      case "connecting":
        return (
          <LoadingState
            title="Connecting Wallet"
            description="Please confirm the connection request in your wallet extension"
            walletName={selectedWalletName}
            showSpinner={false}
          />
        );

      case "select-account":
        return (
          <AccountSelector
            accounts={accounts}
            onSelectAccount={handleAccountSelect}
            selectedAccount={selectedAccount}
            isLoading={false}
          />
        );

      case "auth-account-select":
        return (
          <AccountSelector
            accounts={accounts}
            onSelectAccount={handleAuthAccountSelect}
            selectedAccount={selectedAccount}
            showSignButtons={true}
            isLoading={isSigning}
          />
        );

      case "signing":
        return (
          <LoadingState
            title="Authentication Required"
            description="Please review and sign the authentication message in your wallet to verify your identity"
            walletName={selectedWalletName || selectedAccount?.meta.source}
            showSpinner={true}
            account={selectedAccount || undefined}
          />
        );

      case "auth-success":
        return selectedAccount ? (
          <AuthSuccessState account={selectedAccount} />
        ) : null;

      case "success":
        return selectedAccount ? (
          <ConnectedState
            account={selectedAccount}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            onCopyAddress={handleCopyAddress}
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl p-6 text-left align-middle shadow-2xl transition-all border border-white/20">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center space-x-3">
                    {canGoBack && (
                      <button
                        onClick={handleBack}
                        className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors relative z-10"
                        disabled={isSigning}
                      >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      DotPassport
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleClose(e)}
                    disabled={isSigning || currentStep === "auth-success"}
                    className={`cursor-pointer p-2 rounded-full transition-colors relative z-10 ${
                      isSigning || currentStep === "auth-success"
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-gray-100"
                    }`}
                    type="button"
                  >
                    <X
                      className={`w-5 h-5 ${
                        isSigning || currentStep === "auth-success"
                          ? "text-gray-300"
                          : "text-gray-500"
                      }`}
                    />
                  </button>
                </div>

                {/* Status Message */}
                {statusMessage && status !== "idle" && (
                  <div
                    className={`p-3 mb-4 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                      status === "success" || status === "connected"
                        ? "bg-green-100 text-green-700"
                        : status === "error"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {status === "error" && <AlertCircle className="w-4 h-4" />}
                    {status === "success" && <CheckIcon className="w-4 h-4" />}
                    <span>{statusMessage}</span>
                  </div>
                )}

                {/* Signing Prevention Notice */}
                {(isSigning || currentStep === "auth-success") && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {currentStep === "auth-success"
                          ? "Authentication successful! Closing automatically..."
                          : "Please complete the signing process in your wallet. Do not close this window."}
                      </span>
                    </div>
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

// Main component that combines everything (No changes needed)
const PolkadotWalletConnect: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected, isAuthenticated } = useWalletStore();

  if (isConnected && isAuthenticated) {
    return (
      <>
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              DotPassport Ready
            </h2>
            <p className="text-gray-600 mb-6">
              Your wallet is connected and verified.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-all duration-200"
            >
              Manage Wallet
            </button>
          </div>
        </div>

        <WalletConnectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="">
        <div className="text-center flex justify-center flex-col items-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Connect Wallet <ArrowRight className="w-4 h-4 inline-block ml-2" />
          </button>
        </div>
      </div>

      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default PolkadotWalletConnect;
