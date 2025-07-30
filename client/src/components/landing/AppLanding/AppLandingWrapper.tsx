import {
  Star,
  Lock,
  TrendingUp,
  Users,
  Wallet,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

// App Landing Component
const AppLandingWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div
          className={`text-center transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* App Header */}
          <div className="mb-12">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Secure • Decentralized • Polkadot Native
              </span>
            </div>

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
                <Wallet className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-8">
                Connect your Polkadot wallet to access your DotPassport profile
                and start earning reputation badges.
              </p>

              {children}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Polkadot.js</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>SubWallet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Talisman</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Nova Wallet</span>
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
