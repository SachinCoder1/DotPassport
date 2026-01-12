"use client";

import { Dialog } from "@headlessui/react";
import { X, Loader2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useAdminStore } from "@/store/adminStore";
import { updateApiKey, UpdateApiKeyPayload } from "@/service/adminService";
import { toast } from "sonner";

export default function EditKeyModal() {
  const { isEditModalOpen, closeEditModal, selectedKey, updateApiKeyInStore } = useAdminStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateApiKeyPayload>({
    appName: '',
    tier: 'free',
    allowedOrigins: [],
  });
  const [originsInput, setOriginsInput] = useState('');

  // Initialize form when key is selected
  useEffect(() => {
    if (selectedKey) {
      setFormData({
        appName: selectedKey.appName,
        tier: selectedKey.tier,
        allowedOrigins: selectedKey.allowedOrigins,
        polkadotAddress: selectedKey.polkadotAddress,
      });
      setOriginsInput(selectedKey.allowedOrigins?.join(', ') || '');
    }
  }, [selectedKey]);

  const handleClose = () => {
    closeEditModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey) return;

    setIsLoading(true);

    try {
      // Parse origins
      const origins = originsInput
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);

      const payload: UpdateApiKeyPayload = {
        ...formData,
        allowedOrigins: origins.length > 0 ? origins : undefined,
      };

      const response = await updateApiKey(selectedKey._id, payload);

      updateApiKeyInStore(selectedKey._id, response.apiKey);
      toast.success('API key updated successfully');
      handleClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to update API key';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedKey) return null;

  return (
    <Dialog open={isEditModalOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
            <div className="flex items-center space-x-3">
              <Edit className="w-6 h-6 text-blue-400" />
              <Dialog.Title className="text-xl font-bold text-white">
                Edit API Key
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Key Preview (Read-only) */}
            <div>
              <label className="block text-purple-300 text-sm font-semibold mb-2">
                API Key (Read-only)
              </label>
              <code className="block w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-purple-300">
                {selectedKey.keyPrefix}...
              </code>
            </div>

            {/* Contact Email (Read-only) */}
            <div>
              <label className="block text-purple-300 text-sm font-semibold mb-2">
                Contact Email (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={selectedKey.contactEmail}
                className="w-full px-4 py-2 bg-slate-900/30 border border-purple-500/30 rounded-lg text-purple-400 cursor-not-allowed"
              />
            </div>

            {/* Polkadot Address */}
            <div>
              <label className="block text-purple-300 text-sm font-semibold mb-2">
                Polkadot Address (Optional)
              </label>
              <input
                type="text"
                value={formData.polkadotAddress || selectedKey.polkadotAddress || ''}
                onChange={(e) => setFormData({ ...formData, polkadotAddress: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
              />
              <p className="text-purple-400/60 text-xs mt-1">For sandbox users - their Polkadot wallet address</p>
            </div>

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
              />
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
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? 'Updating...' : 'Update Key'}</span>
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
