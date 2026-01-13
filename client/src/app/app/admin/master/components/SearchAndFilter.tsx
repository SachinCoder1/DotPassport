"use client";

import { Search } from "lucide-react";
import { useAdminStore, TierFilter, StatusFilter } from "@/store/adminStore";

export default function SearchAndFilter() {
  const {
    searchQuery,
    tierFilter,
    statusFilter,
    setSearchQuery,
    setTierFilter,
    setStatusFilter,
  } = useAdminStore();

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
        <input
          type="text"
          placeholder="Search by name, email, or key..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 w-80"
        />
      </div>

      {/* Tier Filter */}
      <select
        value={tierFilter}
        onChange={(e) => setTierFilter(e.target.value as TierFilter)}
        className="px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
      >
        <option value="all">All Tiers</option>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Enterprise</option>
      </select>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        className="px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="revoked">Revoked</option>
      </select>
    </div>
  );
}
