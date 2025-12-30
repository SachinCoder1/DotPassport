"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/store/walletStore";
import { useAdminStore } from "@/store/adminStore";
import { checkAdminStatus, getApiKeys } from "@/service/adminService";
import { toast } from "sonner";
import { Shield, Plus, Loader2 } from "lucide-react";

// Components
import ViewToggle from "./components/ViewToggle";
import SearchAndFilter from "./components/SearchAndFilter";
import ApiKeyTable from "./components/ApiKeyTable";
import ApiKeyCardGrid from "./components/ApiKeyCardGrid";
import CreateApiKeyModal from "./components/CreateApiKeyModal";
import EditKeyModal from "./components/EditKeyModal";
import RevokeConfirmModal from "./components/RevokeConfirmModal";
import Unauthorized from "./components/Unauthorized";

export default function AdminMasterPage() {
  const router = useRouter();
  const { isAuthenticated } = useWalletStore();
  const {
    viewMode,
    isLoading,
    error,
    setApiKeys,
    setLoading,
    setError,
    openCreateModal,
  } = useAdminStore();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication and admin status
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        // router.push('/app');
        return;
      }

      try {
        const adminStatus = await checkAdminStatus();
        setIsAdmin(adminStatus);

        if (adminStatus) {
          // Load API keys
          await loadApiKeys();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, router]);

  const loadApiKeys = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getApiKeys(1, 100);
      setApiKeys(response.data.apiKeys);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load API keys';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.promise(loadApiKeys(), {
      loading: 'Refreshing API keys...',
      success: 'API keys refreshed',
      error: 'Failed to refresh',
    });
  };

  // Loading auth check
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not admin - show 403
  if (isAdmin === false) {
    return <Unauthorized />;
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-10 h-10 text-purple-400" />
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Admin Master Panel
                </h1>
                <p className="text-purple-300 mt-1">
                  Manage API keys, tiers, and access control
                </p>
              </div>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Create API Key</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <SearchAndFilter />
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-purple-600/30 text-purple-300 rounded-lg hover:bg-purple-600/50 transition-colors"
            >
              Refresh
            </button>
            <ViewToggle />
          </div>
        </div>

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500 text-red-300 px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {viewMode === 'table' ? <ApiKeyTable /> : <ApiKeyCardGrid />}
          </>
        )}

        {/* Modals */}
        <CreateApiKeyModal />
        <EditKeyModal />
        <RevokeConfirmModal />
      </div>
    </div>
  );
}
