"use client";

import { Fragment } from "react";
import { useAdminStore } from "@/store/adminStore";
import { Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import TierBadge from "./TierBadge";
import StatusBadge from "./StatusBadge";
import CopyKeyButton from "./CopyKeyButton";

export default function ApiKeyTable() {
  const { getFilteredKeys, expandedKeyId, setExpandedKeyId, openEditModal, openRevokeModal } = useAdminStore();
  const keys = getFilteredKeys();

  if (keys.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-12 text-center">
        <p className="text-purple-300 text-lg">No API keys found</p>
        <p className="text-purple-400/60 text-sm mt-2">Try adjusting your filters or create a new API key</p>
      </div>
    );
  }

  const toggleExpanded = (keyId: string) => {
    setExpandedKeyId(expandedKeyId === keyId ? null : keyId);
  };

  return (
    <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-purple-500/30">
              <th className="text-left px-6 py-4 text-purple-300 font-semibold text-sm">App Name</th>
              <th className="text-left px-6 py-4 text-purple-300 font-semibold text-sm">API Key</th>
              <th className="text-left px-6 py-4 text-purple-300 font-semibold text-sm">Email</th>
              <th className="text-left px-6 py-4 text-purple-300 font-semibold text-sm">Tier</th>
              <th className="text-left px-6 py-4 text-purple-300 font-semibold text-sm">Status</th>
              <th className="text-left px-6 py-4 text-purple-300 font-semibold text-sm">Created</th>
              <th className="text-left px-6 py-4 text-purple-300 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <Fragment key={key._id}>
                <tr className="border-b border-purple-500/20 hover:bg-purple-900/20 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{key.appName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <code className="text-purple-300 text-sm bg-slate-900/50 px-2 py-1 rounded">
                        {key.keyPrefix}...
                      </code>
                      <CopyKeyButton text={key.keyPrefix} label="" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-purple-200 text-sm">{key.contactEmail}</td>
                  <td className="px-6 py-4">
                    <TierBadge tier={key.tier} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge isActive={key.isActive} />
                  </td>
                  <td className="px-6 py-4 text-purple-200 text-sm">
                    {format(new Date(key.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleExpanded(key._id)}
                        className="p-2 rounded-md bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 transition-colors"
                        title="Toggle details"
                      >
                        {expandedKeyId === key._id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      {key.isActive && (
                        <>
                          <button
                            onClick={() => openEditModal(key)}
                            className="p-2 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openRevokeModal(key)}
                            className="p-2 rounded-md bg-red-600/20 hover:bg-red-600/30 text-red-300 transition-colors"
                            title="Revoke"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedKeyId === key._id && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-slate-900/30">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-purple-300 font-semibold mb-2 text-sm">Usage Stats</h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-purple-200">Total Requests: <span className="text-white font-semibold">{key.usage.totalRequests}</span></p>
                            <p className="text-purple-200">Hourly: <span className="text-white font-semibold">{key.usage.currentHourRequests} / {key.rateLimits.requestsPerHour}</span></p>
                            <p className="text-purple-200">Daily: <span className="text-white font-semibold">{key.usage.currentDayRequests} / {key.rateLimits.requestsPerDay}</span></p>
                            <p className="text-purple-200">Monthly: <span className="text-white font-semibold">{key.usage.currentMonthRequests} / {key.rateLimits.requestsPerMonth}</span></p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-purple-300 font-semibold mb-2 text-sm">Rate Limits</h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-purple-200">Per Hour: <span className="text-white font-semibold">{key.rateLimits.requestsPerHour}</span></p>
                            <p className="text-purple-200">Per Day: <span className="text-white font-semibold">{key.rateLimits.requestsPerDay}</span></p>
                            <p className="text-purple-200">Per Month: <span className="text-white font-semibold">{key.rateLimits.requestsPerMonth}</span></p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-purple-300 font-semibold mb-2 text-sm">Additional Info</h4>
                          <div className="space-y-1 text-sm">
                            {key.allowedOrigins && key.allowedOrigins.length > 0 && (
                              <p className="text-purple-200">Origins: <span className="text-white font-semibold">{key.allowedOrigins.length}</span></p>
                            )}
                            {key.usage.lastRequestAt && (
                              <p className="text-purple-200">Last Request: <span className="text-white font-semibold">{format(new Date(key.usage.lastRequestAt), 'MMM dd, HH:mm')}</span></p>
                            )}
                            {key.revokedAt && (
                              <>
                                <p className="text-red-300">Revoked: <span className="text-white font-semibold">{format(new Date(key.revokedAt), 'MMM dd, yyyy')}</span></p>
                                {key.revokedReason && <p className="text-red-300">Reason: <span className="text-white">{key.revokedReason}</span></p>}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
