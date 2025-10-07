"use client";

import { useCheckoutForm } from "@/store/useCheckoutForm";

export default function BillingForm() {
  const { formData, updateField } = useCheckoutForm();

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Billing Details</h2>

      {/* 🧍 First + Last Name (stack on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="billingFirstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            id="billingFirstName"
            type="text"
            value={formData.billingFirstName || ""}
            onChange={(e) => updateField("billingFirstName", e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="billingLastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            id="billingLastName"
            type="text"
            value={formData.billingLastName || ""}
            onChange={(e) => updateField("billingLastName", e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
          />
        </div>
      </div>

      {/* 📧 Email + Phone (stack on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="billingEmail"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            id="billingEmail"
            type="email"
            value={formData.billingEmail || ""}
            onChange={(e) => updateField("billingEmail", e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="billingPhone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number (optional)
          </label>
          <input
            id="billingPhone"
            type="tel"
            value={formData.billingPhone || ""}
            onChange={(e) => updateField("billingPhone", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
          />
        </div>
      </div>

      {/* 🏠 Address Lines */}
      <div>
        <label
          htmlFor="billingAddress1"
          className="block text-sm font-medium text-gray-700"
        >
          Address Line 1
        </label>
        <input
          id="billingAddress1"
          type="text"
          value={formData.billingAddress1 || ""}
          onChange={(e) => updateField("billingAddress1", e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="billingAddress2"
          className="block text-sm font-medium text-gray-700"
        >
          Address Line 2 (optional)
        </label>
        <input
          id="billingAddress2"
          type="text"
          value={formData.billingAddress2 || ""}
          onChange={(e) => updateField("billingAddress2", e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
        />
      </div>

      {/* 🏙 City + Postcode (stack on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="billingCity"
            className="block text-sm font-medium text-gray-700"
          >
            City
          </label>
          <input
            id="billingCity"
            type="text"
            value={formData.billingCity || ""}
            onChange={(e) => updateField("billingCity", e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="billingPostcode"
            className="block text-sm font-medium text-gray-700"
          >
            Postcode
          </label>
          <input
            id="billingPostcode"
            type="text"
            value={formData.billingPostcode || ""}
            onChange={(e) => updateField("billingPostcode", e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
          />
        </div>
      </div>

      {/* 🌍 Country */}
      <div>
        <label
          htmlFor="billingCountry"
          className="block text-sm font-medium text-gray-700"
        >
          Country / Region
        </label>
        <input
          id="billingCountry"
          value="United Kingdom"
          disabled
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm py-2 px-3 bg-gray-50"
        />
      </div>

      {/* 📝 Additional Notes */}
      <div>
        <label
          htmlFor="additionalNotes"
          className="block text-sm font-medium text-gray-700"
        >
          Additional Notes (optional)
        </label>
        <textarea
          id="additionalNotes"
          value={formData.additionalNotes || ""}
          onChange={(e) => updateField("additionalNotes", e.target.value)}
          rows={7}
          placeholder="Any delivery instructions or comments..."
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
        ></textarea>
      </div>
    </section>
  );
}
