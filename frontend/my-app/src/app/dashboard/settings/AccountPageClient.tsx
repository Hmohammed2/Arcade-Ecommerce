"use client";

import { useState, useEffect } from "react";
import { useAccountSettings } from "@/hooks/useAccountSettings";

export default function AccountPageClient() {
  const {
    user,
    isLoading,
    updateAccount,
    isUpdating,
    changePassword,
    isChangingPassword,
    deleteAccount,
    isDeleting,
  } = useAccountSettings();

  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAccount(formData);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password)
      return alert("Passwords do not match");

    await changePassword({
      old_password: passwordData.old_password,
      new_password: passwordData.new_password,
    });

    setPasswordData({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
  };

  if (isLoading)
    return (
      <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300 text-center mt-10">
        Loading account settings...
      </p>
    );

  const handleDelete = async () => {
    await deleteAccount();
    setShowConfirm(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-3xl space-y-10 text-gray-800 dark:text-gray-100 transition-colors duration-300">
        {/* Profile Info */}
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 text-center">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-pink-500 focus:border-pink-500 transition-colors duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-pink-500 focus:border-pink-500 transition-colors duration-300"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-pink-500 focus:border-pink-500 transition-colors duration-300"
              required
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isUpdating}
              className={`px-5 py-2 rounded-md text-white font-medium w-full transition-colors duration-300 ${
                isUpdating
                  ? "bg-pink-400 cursor-not-allowed"
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Password Change */}
        <form
          onSubmit={handlePasswordSubmit}
          className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 text-center">
            Change Password
          </h2>

          <div className="space-y-4">
            <input
              type="password"
              name="old_password"
              placeholder="Current Password"
              value={passwordData.old_password}
              onChange={handlePasswordChange}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-pink-500 focus:border-pink-500 transition-colors duration-300"
              required
            />
            <input
              type="password"
              name="new_password"
              placeholder="New Password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-pink-500 focus:border-pink-500 transition-colors duration-300"
              required
            />
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm New Password"
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:ring-pink-500 focus:border-pink-500 transition-colors duration-300"
              required
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isChangingPassword}
              className={`w-full px-5 py-2 rounded-md text-white font-medium transition-colors duration-300 ${
                isChangingPassword
                  ? "bg-pink-400 cursor-not-allowed"
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
            >
              {isChangingPassword ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>

        {/* Delete Account Section */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-red-200 dark:border-red-700 transition-colors duration-300 text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            Delete Account
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Deleting your account is permanent and cannot be undone. All your
            orders and data will be erased.
          </p>
          <button
            onClick={() => setShowConfirm(true)}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-5 py-2 rounded-md font-medium transition-colors duration-300 w-full"
          >
            Delete My Account
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-colors duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-96 p-6 text-center border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Confirm Account Deletion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to permanently delete your account? This
              action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-md text-white transition-colors duration-300 ${
                  isDeleting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
