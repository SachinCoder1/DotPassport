"use client";

import { CheckCircle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  isActive: boolean;
}

export default function StatusBadge({ isActive }: StatusBadgeProps) {
  if (isActive) {
    return (
      <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
        <CheckCircle className="w-3 h-3" />
        <span>ACTIVE</span>
      </span>
    );
  }

  return (
    <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
      <XCircle className="w-3 h-3" />
      <span>REVOKED</span>
    </span>
  );
}
