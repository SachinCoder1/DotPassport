"use client";

import { Dialog } from "@headlessui/react";
import { X, Loader2, Key } from "lucide-react";
import { useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { createApiKey, CreateApiKeyPayload } from "@/service/adminService";
import { toast } from "sonner";
import CopyKeyButton from "./CopyKeyButton";

export default function CreateApiKeyModal() {
  const { isCreateModalOpen, closeCreateModal, addApiKey } = useAdminStore();
  const [isLoading, setIsLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateApiKeyPayload>({
    appName: '',
    contactEmail: '',
    tier: 'free',
    allowedOrigins: [],
  });
  const [originsInput, setOriginsInput] = useState('');

  const handleClose = () => {
    closeCreateModal();
    // Reset form after close animation
    setTimeout(() => {
      setFormData({ appName: '', contactEmail: '', tier: 'free', allowedOrigins: [] });
      setOriginsInput('');
      setCreatedKey(null);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Parse origins
      const origins = originsInput
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);

      const payload: CreateApiKeyPayload = {
        ...formData,
        allowedOrigins: origins.length > 0 ? origins : undefined,
      };

      const response = await createApiKey(payload);

      // Show the created key
      if (response.apiKey.key) {
        setCreatedKey(response.apiKey.key);
        addApiKey(response.apiKey);
        toast.success('API key created successfully');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to create API key';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isCreateModalOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
            <div className="flex items-center space-x-3">
              <Key className="w-6 h-6 text-purple-400" />
              <Dialog.Title className="text-xl font-bold text-white">
                {createdKey ? 'API Key Created' : 'Create New API Key'}
              </Dialog.Title>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-purple-900/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-purple-300" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {createdKey ? (
              <div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300 font-semibold mb-2">⚠️ Save this key now!</p>
                  <p className="text-yellow-200 text-sm">
                    This is the only time you'll see the full API key. Make sure to copy it now.
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-4 mb-4">
                  <p className="text-purple-300 text-sm mb-2">Your API Key:</p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-white font-mono text-sm bg-black/50 px-4 py-3 rounded overflow-x-auto">
                      {createdKey}
                    </code>
                    <CopyKeyButton text={createdKey} label="Copy" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* App Name */}
                <div>
                  <label className="block text-purple-300 text-sm font-semibold mb-2">
                    Application Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.appName}
                    onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="My Awesome App"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-purple-300 text-sm font-semibold mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="admin@example.com"
                  />
                </div>

                {/* Polkadot Address */}
                <div>
                  <label className="block text-purple-300 text-sm font-semibold mb-2">
                    Polkadot Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.polkadotAddress || ''}
                    onChange={(e) => setFormData({ ...formData, polkadotAddress: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                  />
                  <p className="text-purple-400/60 text-xs mt-1">For sandbox users - their Polkadot wallet address</p>
                </div>

                {/* Tier */}
                <div>
                  <label className="block text-purple-300 text-sm font-semibold mb-2">
                    Tier *
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="free">Free (100/hr, 1K/day, 10K/month)</option>
                    <option value="pro">Pro (1K/hr, 10K/day, 100K/month)</option>
                    <option value="enterprise">Enterprise (10K/hr, 100K/day, 1M/month)</option>
                  </select>
                </div>

                {/* Allowed Origins */}
                <div>
                  <label className="block text-purple-300 text-sm font-semibold mb-2">
                    Allowed Origins (Optional)
                  </label>
                  <input
                    type="text"
                    value={originsInput}
                    onChange={(e) => setOriginsInput(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://example.com, https://app.example.com"
                  />
                  <p className="text-purple-400/60 text-xs mt-1">Comma-separated list of allowed origins for CORS</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isLoading ? 'Creating...' : 'Create API Key'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
