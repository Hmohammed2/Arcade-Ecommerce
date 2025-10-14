"use client";

import { useCheckoutForm } from "@/store/useCheckoutForm";

export default function ShippingForm() {
  const { formData, updateField, setSameAsBilling } = useCheckoutForm();

  return (
    <section className="space-y-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Shipping Details
        </h2>
        <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={formData.sameAsBilling}
            onChange={(e) => setSameAsBilling(e.target.checked)}
            className="accent-pink-600 dark:accent-pink-500 w-4 h-4"
          />
          <span>Same as billing</span>
        </label>
      </div>

      {/* Hide form when sameAsBilling is true */}
      {!formData.sameAsBilling && (
        <div className="space-y-6">
          {/* Address Lines */}
          <div>
            <label
              htmlFor="shippingAddress1"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Address Line 1
            </label>
            <input
              id="shippingAddress1"
              type="text"
              value={formData.shippingAddress1 || ""}
              onChange={(e) => updateField("shippingAddress1", e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm transition-colors duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="shippingAddress2"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Address Line 2 (optional)
            </label>
            <input
              id="shippingAddress2"
              type="text"
              value={formData.shippingAddress2 || ""}
              onChange={(e) => updateField("shippingAddress2", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm transition-colors duration-300"
            />
          </div>

          {/* City + Postcode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="shippingCity"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                City
              </label>
              <input
                id="shippingCity"
                type="text"
                value={formData.shippingCity || ""}
                onChange={(e) => updateField("shippingCity", e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm transition-colors duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="shippingPostcode"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Postcode
              </label>
              <input
                id="shippingPostcode"
                type="text"
                value={formData.shippingPostcode || ""}
                onChange={(e) =>
                  updateField("shippingPostcode", e.target.value)
                }
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm transition-colors duration-300"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="shippingCountry"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Country / Region
            </label>
            <input
              id="shippingCountry"
              value="United Kingdom"
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm transition-colors duration-300 disabled:opacity-60"
            />
          </div>
        </div>
      )}
    </section>
  );
}
