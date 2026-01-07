"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { MapPin, Settings, ShoppingBag, FileText } from "lucide-react";

export default function DashboardPageClient() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return (
      <div className="text-center text-gray-600 dark:text-gray-300 mt-10 transition-colors duration-300">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-8 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.first_name || user?.email || "User"} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your account, orders, and preferences.
          </p>
        </div>
      </div>

      {/* Grid of dashboard sections */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Account Settings */}
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/40 dark:bg-gray-800/50 hover:shadow-md transition-colors duration-300">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="w-5 h-5 text-pink-600 dark:text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Account Settings
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Update your profile, password, or email preferences.
          </p>
          <button
            onClick={() => router.push("/dashboard/settings")}
            className="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 font-medium transition-colors"
          >
            Go to Settings →
          </button>
        </div>

        {/* Orders */}
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/40 dark:bg-gray-800/50 hover:shadow-md transition-colors duration-300">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingBag className="w-5 h-5 text-pink-600 dark:text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              My Orders
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            View your recent purchases and order history.
          </p>
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 font-medium transition-colors"
          >
            View Orders →
          </button>
        </div>

        {/* Billing & Shipping Information */}
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/40 dark:bg-gray-800/50 hover:shadow-md transition-colors duration-300">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-pink-600 dark:text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Billing & Shipping Information
            </h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Manage your saved billing and shipping addresses for faster
            checkout.
          </p>

          <button
            onClick={() => router.push("/dashboard/billing")}
            className="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 font-medium transition-colors"
          >
            Manage Addresses →
          </button>
        </div>
        {/* Articles / Blog Manager */}
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/40 dark:bg-gray-800/50 hover:shadow-md transition-colors duration-300">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-pink-600 dark:text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Articles & Blog
            </h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Create, edit and manage your blog articles and SEO content.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard/articles")}
              className="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 font-medium transition-colors"
            >
              Manage Articles →
            </button>

            {user?.is_staff && (
              <button onClick={() => router.push("/dashboard/articles/create")}>
                New Article
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
