"use client";

import { Dialog } from "@headlessui/react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { revokeApiKey } from "@/service/adminService";
import { toast } from "sonner";

export default function RevokeConfirmModal() {
  const { isRevokeModalOpen, closeRevokeModal, selectedKey, updateApiKeyInStore } = useAdminStore();
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleClose = () => {
    closeRevokeModal();
    setTimeout(() => setReason(''), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey || !reason.trim()) return;

    setIsLoading(true);

    try {
      const response = await revokeApiKey(selectedKey._id, { reason: reason.trim() });

      updateApiKeyInStore(selectedKey._id, {
        isActive: false,
        revokedAt: new Date(),
        revokedReason: reason.trim(),
      });

      toast.success('API key revoked successfully');
      handleClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to revoke API key';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedKey) return null;

  return (
    <Dialog open={isRevokeModalOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-slate-800 border border-red-500/30 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-red-500/30">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <Dialog.Title className="text-xl font-bold text-white">
                Revoke API Key
              </Dialog.Title>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-red-300" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Warning */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 font-semibold mb-2">⚠️ Warning</p>
              <p className="text-red-200 text-sm">
                This action cannot be undone. Revoking this API key will immediately disable all access.
              </p>
            </div>

            {/* Key Info */}
            <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-4">
              <p className="text-purple-300 text-sm mb-1">Application:</p>
              <p className="text-white font-semibold mb-3">{selectedKey.appName}</p>

              <p className="text-purple-300 text-sm mb-1">API Key:</p>
              <code className="text-purple-200 text-sm">{selectedKey.keyPrefix}...</code>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-red-300 text-sm font-semibold mb-2">
                Reason for Revocation *
              </label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                rows={3}
                placeholder="Security breach, no longer needed, etc."
              />
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
                disabled={isLoading || !reason.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? 'Revoking...' : 'Revoke API Key'}</span>
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
