"use client"; // This directive marks the component as a Client Component

import React, { useState, useEffect, Fragment } from "react";
import {
  InjectedAccountWithMeta,
  InjectedExtension,
} from "@polkadot/extension-inject/types";
import { stringToHex } from "@polkadot/util";
import {
  Dialog,
  Transition,
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { CheckIcon, ChevronsUpDownIcon, Wallet } from "lucide-react"; // Corrected import for ChevronsUpDownIcon

// Import the Zustand store
import { useWalletStore } from "../store/walletStore";
import { WalletOption } from "@/types";
import { commonWallets } from "@/common/wallets";

// Define a type for a wallet option including its install status

// Helper function to capitalize first letter (can be moved to a utils file)
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// PolkadotWalletConnect Component
const PolkadotWalletConnect: React.FC = () => {
  // Get state and actions from Zustand store
  const {
    isConnected,
    accounts,
    selectedAccount,
    status,
    statusMessage,
    connectedWalletSource,
    isLoading,
    isSigning, // From store
    signature, // From store
    connectWallet,
    disconnectWallet,
    setSelectedAccount,
    signMessage, // From store
    initializeWallet, // From store
  } = useWalletStore();

  const [localSigningMessage, setLocalSigningMessage] = useState<string>("");
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [availableWalletOptions, setAvailableWalletOptions] = useState<
    WalletOption[]
  >([]);

  // Passive detection of installed extensions (runs once on client mount)
  useEffect(() => {
    const detectExtensions = () => {
      // Only run on client side
      if (typeof window !== "undefined" && (window as any)?.injectedWeb3) {
        const detectedOptions = commonWallets.map((wallet) => {
          // Check if the extension is present in window.injectedWeb3
          const isInstalled = !!(window as any)?.injectedWeb3[wallet.id];
          return {
            ...wallet,
            installed: isInstalled,
          };
        });
        setAvailableWalletOptions(detectedOptions);
      } else {
        setAvailableWalletOptions([]);
      }
    };

    detectExtensions();
  }, []); // Empty dependency array ensures this runs only once on client mount

  // Auto-reconnect on initial load
  useEffect(() => {
    initializeWallet("my-polkadot-dapp");
  }, [initializeWallet]); // Run once on mount

  // Handle message signing (now just calls the store action)
  const handleSignMessage = async () => {
    await signMessage(localSigningMessage);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full my-3 border border-gray-200">
      {/* Status / Message Box */}
      {status !== "idle" && statusMessage && (
        <div
          className={`p-3 mb-4 rounded-lg text-sm font-medium ${
            status === "success" || status === "connected"
              ? "bg-green-100 text-green-700"
              : status === "error"
              ? "bg-red-100 text-red-700"
              : status === "signing"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-blue-100 text-blue-700"
          }`}
          role="alert"
        >
          {statusMessage}
        </div>
      )}

      {/* Global Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-600">{statusMessage || "Loading..."}</p>
        </div>
      )}

      {/* Main Connect Button / Connected State */}
      {!isConnected ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {availableWalletOptions.length === 0
              ? "No Polkadot compatible browser extensions detected. Please install one (Polkadot.js, Talisman, SubWallet)."
              : "Connect your Polkadot wallet to get started."}
          </p>

          <button
            onClick={() => setIsConnectModalOpen(true)}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group mb-6"
          >
            <span className="flex items-center justify-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </span>
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Wallet Connected
          </h2>

          <div className="mb-4">
            <Listbox value={selectedAccount} onChange={setSelectedAccount}>
              {({ open }) => (
                <div className="relative mt-1">
                  <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm border border-gray-300">
                    <span className="block truncate">
                      {selectedAccount
                        ? `${
                            selectedAccount.meta.name || selectedAccount.address
                          } (${selectedAccount.meta.source})`
                        : "Select an account"}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronsUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </ListboxButton>
                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {accounts.map((account) => (
                        <ListboxOption
                          key={account.address}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active
                                ? "bg-blue-100 text-blue-900"
                                : "text-gray-900"
                            }`
                          }
                          value={account}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                {account.meta.name || account.address} (
                                {account.meta.source})
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </Transition>
                </div>
              )}
            </Listbox>
            {selectedAccount && (
              <p className="text-sm text-gray-500 mt-2 break-all">
                Address:{" "}
                <span className="font-mono">{selectedAccount.address}</span>
              </p>
            )}
            <button
              onClick={disconnectWallet}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-semibold transition duration-300 ease-in-out"
            >
              Disconnect
            </button>
          </div>

          <div className="mb-6">
            <label
              htmlFor="message-input"
              className="block text-gray-600 text-sm font-medium mb-2"
            >
              Message to Sign:
            </label>
            <input
              id="message-input"
              type="text"
              value={localSigningMessage}
              onChange={(e) => {
                setLocalSigningMessage(e.target.value);
                // Clear local signature state, as the store will manage the global one
                useWalletStore.getState()._setSignature(null);
              }}
              placeholder="Enter message to sign"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSignMessage}
              disabled={!selectedAccount || isSigning}
              className={`w-full mt-4 px-6 py-3 font-semibold rounded-lg shadow-md transition duration-300 ease-in-out ${
                !selectedAccount || isSigning
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
              }`}
            >
              {isSigning ? "Signing..." : "Sign Message"}
            </button>
          </div>

          {signature && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 break-all">
              <h3 className="text-md font-semibold text-gray-700 mb-2">
                Signature:
              </h3>
              <p className="font-mono text-sm text-gray-800">{signature}</p>
            </div>
          )}
        </div>
      )}

      {/* Connect Wallet Modal */}
      <Transition appear show={isConnectModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsConnectModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Connect Wallet
                  </Dialog.Title>

                  {/* Display message if no extensions are detected */}
                  {availableWalletOptions.length === 0 && (
                    <p className="text-gray-600 text-sm mb-4">
                      No Polkadot compatible browser extensions detected. Please
                      install one to connect.
                    </p>
                  )}
                  {/* List of wallet options */}
                  <div className="space-y-3">
                    {availableWalletOptions.map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={async () => {
                          if (wallet.installed) {
                            // Call connectWallet from Zustand store
                            const success = await connectWallet(
                              wallet.id,
                              "my-polkadot-dapp"
                            );
                            if (success) {
                              setIsConnectModalOpen(false); // Close modal on successful connection
                            }
                          } else {
                            // Use status message from store for feedback
                            useWalletStore
                              .getState()
                              ._setStatus(
                                "info",
                                `${wallet.name} is not installed. Please install it first.`
                              );
                          }
                        }}
                        className={`w-full flex items-center p-3 rounded-lg border transition duration-150 ease-in-out ${
                          wallet.installed
                            ? "bg-blue-50 hover:bg-blue-100 border-blue-200 cursor-pointer"
                            : "bg-gray-50 border-gray-200 cursor-not-allowed opacity-70"
                        }`}
                        disabled={!wallet.installed || isLoading}
                      >
                        <img
                          src={wallet.logo}
                          alt={wallet.name}
                          className="h-8 w-8 mr-3 rounded-full"
                        />
                        <span className="font-semibold text-gray-800">
                          {wallet.name}
                        </span>
                        {wallet.installed ? (
                          <span className="ml-auto text-green-500 text-xs font-medium">
                            Installed
                          </span>
                        ) : (
                          <span className="ml-auto text-red-500 text-xs font-medium">
                            Not Installed
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsConnectModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default PolkadotWalletConnect;
