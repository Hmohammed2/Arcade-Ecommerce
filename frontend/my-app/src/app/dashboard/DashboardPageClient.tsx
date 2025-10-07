"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { LogOut, MapPin, Settings, ShoppingBag } from "lucide-react";

export default function DashboardPageClient() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect unauthenticated users
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return (
      <div className="text-center text-gray-600 mt-10">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {user?.first_name || user?.email || "User"} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account, orders, and preferences.
          </p>
        </div>
      </div>

      {/* Grid of dashboard sections */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Account settings */}
        <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition bg-gray-50/40">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="w-5 h-5 text-pink-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Account Settings
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Update your profile, password, or email preferences.
          </p>
          <button
            onClick={() => router.push("/dashboard/settings")}
            className="text-sm text-pink-600 hover:text-pink-800 font-medium"
          >
            Go to Settings →
          </button>
        </div>

        {/* Orders */}
        <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition bg-gray-50/40">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingBag className="w-5 h-5 text-pink-600" />
            <h2 className="text-lg font-semibold text-gray-800">My Orders</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            View your recent purchases and order history.
          </p>
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="text-sm text-pink-600 hover:text-pink-800 font-medium"
          >
            View Orders →
          </button>
        </div>
        {/* Billing & Shipping Information */}
        <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition bg-gray-50/40">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-pink-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Billing & Shipping Information
            </h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Manage your saved billing and shipping addresses for faster
            checkout.
          </p>

          <button
            onClick={() => router.push("/dashboard/billing")}
            className="text-sm text-pink-600 hover:text-pink-800 font-medium"
          >
            Manage Addresses →
          </button>
        </div>
      </div>
    </div>
  );
}
