"use client";

import { Shield, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center max-w-md px-6">
        {/* Icon */}
        <div className="mb-6">
          <Shield className="w-24 h-24 text-red-500 mx-auto" />
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold text-white mb-4">403</h1>
        <h2 className="text-3xl font-semibold text-purple-300 mb-4">
          Forbidden
        </h2>

        {/* Message */}
        <p className="text-purple-200 mb-8 text-lg">
          You don&apos;t have permission to access this page. Admin access is required.
        </p>

        {/* Action Button */}
        <button
          onClick={() => router.push('/app')}
          className="flex items-center space-x-2 mx-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
