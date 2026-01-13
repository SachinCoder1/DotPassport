"use client";

import { useAdminStore } from "@/store/adminStore";
import ApiKeyCard from "./ApiKeyCard";

export default function ApiKeyCardGrid() {
  const { getFilteredKeys } = useAdminStore();
  const keys = getFilteredKeys();

  if (keys.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-12 text-center">
        <p className="text-purple-300 text-lg">No API keys found</p>
        <p className="text-purple-400/60 text-sm mt-2">Try adjusting your filters or create a new API key</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {keys.map((key) => (
        <ApiKeyCard key={key._id} apiKey={key} />
      ))}
    </div>
  );
}
