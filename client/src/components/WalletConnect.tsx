// src/components/PolkadotWalletConnect.tsx

"use client";

import React, { useState, useEffect, Fragment } from "react";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { Dialog, Transition, Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { CheckIcon, ChevronsUpDownIcon, Wallet, Lock } from "lucide-react";
import { useWalletStore } from "../store/walletStore";
import { WalletOption } from "@/types";
import { commonWallets } from "@/common/wallets";

export default function PolkadotWalletConnect() {
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

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [availableWalletOptions, setAvailableWalletOptions] = useState<WalletOption[]>([]);

  // Detect available wallet extensions once on mount
  useEffect(() => {
    // This check is to prevent errors during server-side rendering
    if (typeof window !== "undefined" && (window as any).injectedWeb3) {
      const detectedOptions = commonWallets.map((wallet) => ({
        ...wallet,
        installed: !!((window as any).injectedWeb3[wallet.id]),
      }));
      setAvailableWalletOptions(detectedOptions);
    }
  }, []);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full my-3 border border-gray-200">
      {/* Status Message Box */}
      {statusMessage && status !== 'idle' && (
        <div
          className={`p-3 mb-4 rounded-lg text-sm font-medium ${
            status === "success" || status === "connected" ? "bg-green-100 text-green-700"
            : status === "error" ? "bg-red-100 text-red-700"
            : "bg-blue-100 text-blue-700"
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Main UI based on connection state */}
      {!isConnected ? (
        // STATE 1: Not Connected
        <div className="text-center">
          <p className="text-gray-600 mb-4">Connect your wallet to get started.</p>
          <button
            onClick={() => setIsConnectModalOpen(true)}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-wait"
          >
            <span className="flex items-center justify-center space-x-2">
              {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Wallet className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
            </span>
          </button>
        </div>
      ) : (
        // STATE 2: Connected
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Wallet Connected</h2>
            {isAuthenticated && (
              <span className="flex items-center text-sm font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
                <CheckIcon className="h-4 w-4 mr-1" /> Authenticated
              </span>
            )}
          </div>
          
          <Listbox value={selectedAccount} onChange={setSelectedAccount}>
            <div className="relative mt-1">
              <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none sm:text-sm border border-gray-300">
                <span className="block truncate">
                  {selectedAccount ? `${selectedAccount.meta.name || selectedAccount.address.slice(0, 8)}...` : "Select an account"}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronsUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>
              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {accounts.map((account) => (
                    <ListboxOption key={account.address} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900"}`} value={account}>
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{account.meta.name} ({account.address.slice(0, 6)}...)</span>
                          {selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600"><CheckIcon className="h-5 w-5" aria-hidden="true" /></span>}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Transition>
            </div>
          </Listbox>
          
          {!isAuthenticated ? (
            <div className="mt-6">
              <button
                onClick={login}
                disabled={!selectedAccount || isSigning}
                className="w-full px-6 py-3 font-semibold rounded-lg shadow-md transition flex items-center justify-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-wait"
              >
                <Lock className="w-5 h-5" />
                <span>{isSigning ? "Authenticating..." : "Authenticate & Login"}</span>
              </button>
            </div>
          ) : (
             <div className="mt-6 text-center">
              <p className="text-green-700 font-medium">You are securely logged in.</p>
            </div>
          )}

          <div className="mt-6 border-t pt-4">
            <button onClick={logout} className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-sm font-semibold">
              Logout & Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Connection Modal */}
      <Transition appear show={isConnectModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsConnectModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">Select a Wallet</Dialog.Title>
                  <div className="space-y-3">
                    {availableWalletOptions.map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={async () => {
                          const success = await connectWallet(wallet.id, "my-polkadot-dapp");
                          if (success) {
                            setIsConnectModalOpen(false);
                          }
                        }}
                        className="w-full flex items-center p-3 rounded-lg border transition hover:bg-gray-100 disabled:opacity-50"
                        disabled={!wallet.installed}
                      >
                        <img src={wallet.logo} alt={wallet.name} className="h-8 w-8 mr-3 rounded-full" />
                        <span className="font-semibold text-gray-800">{wallet.name}</span>
                        {!wallet.installed && <span className="ml-auto text-red-500 text-xs font-medium">Not Installed</span>}
                      </button>
                    ))}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}