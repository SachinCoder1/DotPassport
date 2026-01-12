import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Lock, FlaskConical, Palette, BarChart3, Check } from 'lucide-react';
import { WalletConnectModal } from '~/components/PolkadotWalletConnect';
import { useWalletStore } from '~/store/walletStore';
import { LoadingScreen } from '~/components/shared/LoadingScreen';

export function LandingPage() {
  const { isAuthenticated, isInitializing } = useWalletStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Auto-open modal if not authenticated
    if (!isInitializing && !isAuthenticated) {
      setIsModalOpen(true);
    }
  }, [isInitializing, isAuthenticated]);

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">DP</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4">
            DotPassport <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Sandbox</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Test and integrate the DotPassport SDK with ease. Connect your Polkadot wallet to get started with your free API key.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Lock className="w-6 h-6" />
            Connect Wallet to Start
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
              <FlaskConical className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Test All SDK Methods</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Explore and test all 7 SDK methods with your API key in a safe environment
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Widget Playground</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Preview and customize all 4 widgets with different themes and configurations
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-200 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Request Tracking</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Monitor detailed logs, stats, and rate limits for all your API requests
            </p>
          </div>
        </div>

        {/* What You Get */}
        <div className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            What You Get with Free Tier
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Auto-Generated API Key</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Get your key instantly upon signup</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">100 Requests/Hour</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Perfect for testing and development</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">All SDK Features</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Access to all methods and widgets</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Detailed Analytics</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Track every request with full logs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>
            Need help?{' '}
            <a
              href="https://docs.dotpassport.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
            >
              Check our documentation
            </a>
          </p>
        </div>
      </div>

      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isAuthenticated) {
            setIsModalOpen(false);
          }
        }}
      />
    </div>
  );
}
