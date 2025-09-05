// src/components/landing/AppLandingWrapper.tsx

import { commonWallets } from "@/common/wallets";
import { useWalletStore } from "@/store/walletStore";
import {
  Star,
  Lock,
  TrendingUp,
  Users,
  Wallet,
  TestTube2,
  LogIn,
  Info,
} from "lucide-react";
import { useEffect, useState } from "react";
import { isAddress } from "@polkadot/util-crypto";

// Full list of suggested addresses
const fullSuggestedAddresses = [
  {
    name: "The White Rabbit",
    address: "13pgGkebYEYGLhA7eR6sBM1boEvq86V9adonjswtYe1iDK2K",
  },
  {
    name: "Clara",
    address: "12aoZXwbUzsv3z5HF5HCrtEwBJYCeKne6rYsxFEKDZ86Wdv8",
  },
  {
    name: "Serban Iorga",
    address: "14oHMAJ5btnDCusHrTWraw1wTsLJwZeqPDLxusm1R1Zh3Vxa",
  },
  {
    name: "Shawn Tabrizi",
    address: "12hAtDZJGt4of3m2GqZcUCVAjZPALfvPwvtUTFZPQUbdX1Ud",
  },
  {
    name: "Bastian Köcher",
    address: "13fvj4bNfrTo8oW6U8525soRp6vhjAFLum6XBdtqq9yP22E7",
  },
  {
    name: "George Pisaltu",
    address: "128pmEUBSGjGeXZXNaAmomAJgVn77L74YT7Zdjd3fP63HWNP",
  },
  {
    name: "Alexander Theißen",
    address: "15db5ksZgmhWE9U8MDq4wLKUdFivLVBybztWV8nmaJvv3NU1",
  },
  {
    name: "Valletech",
    address: "15yhxUC89ULF3WxvH2P6r4ktWRPhF7r7LtXMaGGADoyVxs2B",
  },
];

// App Landing Component
const AppLandingWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testAddress, setTestAddress] = useState("");
  const { loginAsTester, isLoading, status, statusMessage } = useWalletStore();

  const [isAddressValid, setIsAddressValid] = useState(true);

  useEffect(() => {
    if (testAddress === "") {
      setIsAddressValid(true);
      return;
    }
    setIsAddressValid(isAddress(testAddress));
  }, [testAddress]);

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testAddress.trim() || !isAddressValid) {
      alert("Please enter a valid Polkadot address.");
      return;
    }
    await loginAsTester(testAddress);
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div
          className={`text-center transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* App Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to
              <span className="block bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                DotPassport
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Connect your wallet to start building your on-chain identity and
              reputation profile in the Polkadot ecosystem.
            </p>
          </div>

          {/* Connection Card */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200 max-w-2xl mx-auto hover:shadow-2xl transition-shadow duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                {isTestMode ? (
                  <TestTube2 className="w-10 h-10 text-white" />
                ) : (
                  <Wallet className="w-10 h-10 text-white" />
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {isTestMode ? "Tester Login" : "Connect Your Wallet"}
              </h2>
              <p className="text-gray-600 mb-8">
                {isTestMode
                  ? "Enter a Polkadot address to securely access the app without connecting a wallet."
                  : "Connect your Polkadot wallet to access your DotPassport profile."}
              </p>

              {isTestMode ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 text-left text-sm flex items-start space-x-3">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">For Testers & Reviewers</h4>
                      <p className="mt-1">
                        This is a temporary feature for easy testing without a
                        wallet connection.
                        <br />
                        <b>Step 1:</b> Enter any valid Polkadot address below.
                        <br />
                        <b>Step 2:</b> Click "Use this address".
                        <br />
                        The rest of the application flow will remain the same.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleTestLogin} className="space-y-2">
                    <input
                      type="text"
                      value={testAddress}
                      onChange={(e) => setTestAddress(e.target.value)}
                      placeholder="Enter Polkadot address..."
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition ${
                        !isAddressValid && testAddress
                          ? "border-red-500 ring-red-200"
                          : "border-gray-300 focus:ring-purple-400 focus:border-purple-400"
                      }`}
                    />
                    {!isAddressValid && testAddress && (
                      <p className="text-red-600 text-xs text-left">
                        Invalid Polkadot address format.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || !testAddress || !isAddressValid}
                      className="w-full flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Logging in...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Use this address</span>
                        </>
                      )}
                    </button>
                    {status === "error" && statusMessage && (
                      <p className="text-red-500 text-sm mt-2">
                        {statusMessage}
                      </p>
                    )}
                  </form>

                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-2">
                      Or click to use a suggested address:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {fullSuggestedAddresses.map((acc) => (
                        <button
                          key={acc.name}
                          onClick={() => setTestAddress(acc.address)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-purple-100 hover:text-purple-700 transition"
                        >
                          {acc.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                children
              )}

              <div className="pt-8"></div>
              <div className="border-t border-gray-200 pt-8">
                <div className="flex justify-center items-center mb-6">
                  <button
                    onClick={() => setIsTestMode(!isTestMode)}
                    className="flex items-center gap-2 cursor-pointer text-base text-gray-500 hover:text-purple-600 transition-colors"
                  >
                    <TestTube2 className="w-4 h-4" />
                    <span>
                      {isTestMode
                        ? "Switch to Wallet Login"
                        : "Are you a tester?"}
                    </span>
                  </button>
                </div>

                {/* Supported Wallets Section */}
                <p className="text-sm text-gray-500 mb-6 uppercase tracking-wider font-medium">
                  Supported Wallets
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {commonWallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className="flex items-center justify-center space-x-3 transition-all duration-300 rounded-xl py-4 px-6 border border-gray-200 hover:border-gray-300 hover:shadow-md bg-gray-50 hover:bg-gray-100"
                    >
                      <img
                        src={wallet.logo}
                        alt={wallet.name}
                        className="w-6 h-6"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {wallet.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Earn Badges</h3>
              <p className="text-sm text-gray-600">
                Collect badges for staking, governance participation, and
                ecosystem contributions.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Build Reputation
              </h3>
              <p className="text-sm text-gray-600">
                Increase your trust score through authentic on-chain activity
                and contributions.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Access Benefits
              </h3>
              <p className="text-sm text-gray-600">
                Unlock exclusive opportunities, rewards, and personalized
                experiences across dApps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLandingWrapper;
