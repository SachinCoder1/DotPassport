import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { RefreshCw, X } from 'lucide-react';
import { useWalletStore } from '~/store/walletStore';
import { LoadingScreen } from './LoadingScreen';
import { Layout } from './Layout';
import { WalletConnectModal } from '~/components/PolkadotWalletConnect';

export function ProtectedLayout() {
  const { isAuthenticated, isInitializing, needsWalletReconnect, isConnected } = useWalletStore();
  const [isReconnectModalOpen, setIsReconnectModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const showReconnectBanner = needsWalletReconnect && !isConnected && !isDismissed;

  return (
    <Layout>
      {/* Wallet Reconnect Banner */}
      {showReconnectBanner && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 mt-14">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                Your wallet is disconnected. Reconnect to use all features.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsReconnectModalOpen(true)}
                className="px-4 py-1.5 bg-white text-purple-600 text-sm font-medium rounded-lg hover:bg-purple-50 transition-colors"
              >
                Reconnect Wallet
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Outlet />

      {/* Reconnect Modal */}
      <WalletConnectModal
        isOpen={isReconnectModalOpen}
        onClose={() => setIsReconnectModalOpen(false)}
        reconnectMode={true}
      />
    </Layout>
  );
}
