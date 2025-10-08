"use client";

import { useEffect, useState } from "react";
import { useCheckoutForm } from "@/store/useCheckoutForm";
import { useAuth } from "@/store/useAuth";
import { useUserAddresses } from "@/hooks/useUserAddresses";

interface BillingFormProps {
  showUseAccountCheckbox?: boolean;
}

export default function BillingForm({
  showUseAccountCheckbox = true,
}: BillingFormProps) {
  const { formData, updateField } = useCheckoutForm();
  const { isAuthenticated } = useAuth();
  const { addresses, isLoading } = useUserAddresses();
  const [useAccountBilling, setUseAccountBilling] = useState(false);

  // ✅ Apply saved billing data when the toggle is checked
  useEffect(() => {
    if (!useAccountBilling || !addresses) return;

    const mapping: Record<string, string> = {
      billing_first_name: "billingFirstName",
      billing_last_name: "billingLastName",
      billing_email: "billingEmail",
      billing_phone: "billingPhone",
      billing_address1: "billingAddress1",
      billing_address2: "billingAddress2",
      billing_city: "billingCity",
      billing_postcode: "billingPostcode",
    };

    Object.entries(mapping).forEach(([backendKey, localKey]) => {
      const value = addresses[backendKey];
      if (value !== undefined && value !== null) {
        updateField(localKey as keyof typeof formData, value);
      }
    });
  }, [useAccountBilling, addresses]);

  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Billing Information</h2>

      {/* ✅ Checkbox */}
      {isAuthenticated && !showUseAccountCheckbox && (
        <label className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            checked={useAccountBilling}
            onChange={(e) => setUseAccountBilling(e.target.checked)}
            className="accent-pink-600 w-4 h-4"
          />
          <span className="text-sm text-gray-700">
            Use my saved billing information
          </span>
        </label>
      )}

      {isLoading && (
        <p className="text-sm text-gray-500">Loading saved info…</p>
      )}

      {/* ✅ Billing Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            value={formData.billingFirstName || ""}
            onChange={(e) => updateField("billingFirstName", e.target.value)}
            disabled={useAccountBilling}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-600 focus:border-pink-600 py-2 px-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            value={formData.billingLastName || ""}
            onChange={(e) => updateField("billingLastName", e.target.value)}
            disabled={useAccountBilling}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-600 focus:border-pink-600 py-2 px-3"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={formData.billingEmail || ""}
            onChange={(e) => updateField("billingEmail", e.target.value)}
            disabled={useAccountBilling}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-600 focus:border-pink-600 py-2 px-3"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Phone (optional)
          </label>
          <input
            type="tel"
            value={formData.billingPhone || ""}
            onChange={(e) => updateField("billingPhone", e.target.value)}
            disabled={useAccountBilling}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-600 focus:border-pink-600 py-2 px-3"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Address Line 1
          </label>
          <input
            type="text"
            value={formData.billingAddress1 || ""}
            onChange={(e) => updateField("billingAddress1", e.target.value)}
            disabled={useAccountBilling}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-600 focus:border-pink-600 py-2 px-3"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Address Line 2
          </label>
          <input
            type="text"
            value={formData.billingAddress2 || ""}
            onChange={(e) => updateField("billingAddress2", e.target.value)}
            disabled={useAccountBilling}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-600 focus:border-pink-600 py-2 px-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            value={formData.billingCity || ""}
            onChange={(e) => updateField("billingCity", e.target.value)}
            disabled={useAccountBilling}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-600 focus:border-pink-600 py-2 px-3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Postcode
          </label>
          <input
            type="text"
            value={formData.billingPostcode || ""}
            onChange={(e) => updateField("billingPostcode", e.target.value)}
            disabled={useAccountBilling}
            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-600 focus:border-pink-600 py-2 px-3"
          />
        </div>
      </div>
    </div>
  );
}
