"use client";

import { useCheckoutForm } from "@/store/useCheckoutForm";

export default function ShippingForm() {
  const { formData, updateField, setSameAsBilling } = useCheckoutForm();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Shipping Details
        </h2>
        <label className="flex items-center space-x-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={formData.sameAsBilling}
            onChange={(e) => setSameAsBilling(e.target.checked)}
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
              className="block text-sm font-medium text-gray-700"
            >
              Address Line 1
            </label>
            <input
              id="shippingAddress1"
              type="text"
              value={formData.shippingAddress1 || ""}
              onChange={(e) => updateField("shippingAddress1", e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="shippingAddress2"
              className="block text-sm font-medium text-gray-700"
            >
              Address Line 2 (optional)
            </label>
            <input
              id="shippingAddress2"
              type="text"
              value={formData.shippingAddress2 || ""}
              onChange={(e) => updateField("shippingAddress2", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
            />
          </div>

          {/* City + Postcode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="shippingCity"
                className="block text-sm font-medium text-gray-700"
              >
                City
              </label>
              <input
                id="shippingCity"
                type="text"
                value={formData.shippingCity || ""}
                onChange={(e) => updateField("shippingCity", e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="shippingPostcode"
                className="block text-sm font-medium text-gray-700"
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
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="shippingCountry"
              className="block text-sm font-medium text-gray-700"
            >
              Country / Region
            </label>
            <input
              id="shippingCountry"
              value="United Kingdom"
              disabled
              className="mt-1 py-2 px-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
            ></input>
          </div>
        </div>
      )}
    </section>
  );
}
