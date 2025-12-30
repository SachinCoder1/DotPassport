"use client";

import { Table, LayoutGrid } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";

export default function ViewToggle() {
  const { viewMode, setViewMode } = useAdminStore();

  return (
    <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg p-1">
      <button
        onClick={() => setViewMode('table')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
          viewMode === 'table'
            ? 'bg-purple-600 text-white'
            : 'text-purple-300 hover:text-white'
        }`}
      >
        <Table className="w-4 h-4" />
        <span className="text-sm font-medium">Table</span>
      </button>

      <button
        onClick={() => setViewMode('card')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
          viewMode === 'card'
            ? 'bg-purple-600 text-white'
            : 'text-purple-300 hover:text-white'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="text-sm font-medium">Cards</span>
      </button>
    </div>
  );
}
