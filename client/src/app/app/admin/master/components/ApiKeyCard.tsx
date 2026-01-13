"use client";

import { Edit, Trash2, ChevronDown, ChevronUp, Key } from "lucide-react";
import { format } from "date-fns";
import { useAdminStore } from "@/store/adminStore";
import { ApiKey } from "@/service/adminService";
import TierBadge from "./TierBadge";
import StatusBadge from "./StatusBadge";
import CopyKeyButton from "./CopyKeyButton";

interface ApiKeyCardProps {
  apiKey: ApiKey;
}

export default function ApiKeyCard({ apiKey }: ApiKeyCardProps) {
  const { expandedKeyId, setExpandedKeyId, openEditModal, openRevokeModal } = useAdminStore();
  const isExpanded = expandedKeyId === apiKey._id;

  const toggleExpanded = () => {
    setExpandedKeyId(isExpanded ? null : apiKey._id);
  };

  return (
    <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/50 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Key className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{apiKey.appName}</h3>
            <p className="text-purple-300 text-sm">{apiKey.contactEmail}</p>
            {apiKey.polkadotAddress && (
              <p className="text-purple-400 text-xs font-mono mt-1">{apiKey.polkadotAddress}</p>
            )}
          </div>
        </div>
      </div>

      {/* Key Preview */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <code className="flex-1 text-purple-300 text-sm bg-slate-900/50 px-3 py-2 rounded">
            {apiKey.keyPrefix}...
          </code>
          <CopyKeyButton text={apiKey.keyPrefix} label="" />
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center space-x-2 mb-4">
        <TierBadge tier={apiKey.tier} />
        <StatusBadge isActive={apiKey.isActive} />
      </div>

      {/* Created Date */}
      <p className="text-purple-200 text-sm mb-4">
        Created: {format(new Date(apiKey.createdAt), 'MMM dd, yyyy')}
      </p>

      {/* Expandable Stats */}
      {isExpanded && (
        <div className="mb-4 pt-4 border-t border-purple-500/30">
          <div className="space-y-3">
            <div>
              <h4 className="text-purple-300 font-semibold mb-2 text-sm">Usage Stats</h4>
              <div className="space-y-1 text-sm">
                <p className="text-purple-200">Total: <span className="text-white font-semibold">{apiKey.usage.totalRequests}</span></p>
                <p className="text-purple-200">Hourly: <span className="text-white font-semibold">{apiKey.usage.currentHourRequests} / {apiKey.rateLimits.requestsPerHour}</span></p>
                <p className="text-purple-200">Daily: <span className="text-white font-semibold">{apiKey.usage.currentDayRequests} / {apiKey.rateLimits.requestsPerDay}</span></p>
                <p className="text-purple-200">Monthly: <span className="text-white font-semibold">{apiKey.usage.currentMonthRequests} / {apiKey.rateLimits.requestsPerMonth}</span></p>
              </div>
            </div>
            {apiKey.allowedOrigins && apiKey.allowedOrigins.length > 0 && (
              <div>
                <h4 className="text-purple-300 font-semibold mb-1 text-sm">Allowed Origins</h4>
                <p className="text-purple-200 text-sm">{apiKey.allowedOrigins.length} configured</p>
              </div>
            )}
            {apiKey.revokedAt && (
              <div>
                <h4 className="text-red-300 font-semibold mb-1 text-sm">Revoked</h4>
                <p className="text-red-200 text-sm">{format(new Date(apiKey.revokedAt), 'MMM dd, yyyy')}</p>
                {apiKey.revokedReason && <p className="text-red-200 text-sm mt-1">{apiKey.revokedReason}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleExpanded}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span className="text-sm">{isExpanded ? 'Less' : 'More'}</span>
        </button>
        {apiKey.isActive && (
          <>
            <button
              onClick={() => openEditModal(apiKey)}
              className="px-4 py-2 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => openRevokeModal(apiKey)}
              className="px-4 py-2 rounded-md bg-red-600/20 hover:bg-red-600/30 text-red-300 transition-colors"
              title="Revoke"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
