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

  // ✅ Apply saved billing data when toggle is checked
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
  }, [useAccountBilling, addresses, updateField]);

  // 🔒 Validation Logic
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    formData.billingEmail || "",
  );

  const isBillingComplete =
    !!formData.billingFirstName &&
    !!formData.billingLastName &&
    isValidEmail &&
    !!formData.billingAddress1 &&
    !!formData.billingCity &&
    !!formData.billingPostcode &&
    !!formData.billingCountry;

  return (
    <div
      className={`bg-white dark:bg-gray-900 border shadow-md rounded-xl p-6 
        transition-all duration-300
        ${
          isBillingComplete
            ? "border-green-500"
            : "border-gray-200 dark:border-gray-700"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Billing Information
        </h2>

        {isBillingComplete && (
          <span className="text-sm font-medium text-green-600 flex items-center gap-1">
            ✓ Completed
          </span>
        )}
      </div>

      {/* Use Account Checkbox */}
      {isAuthenticated && showUseAccountCheckbox && (
        <label className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            checked={useAccountBilling}
            onChange={(e) => setUseAccountBilling(e.target.checked)}
            className="accent-pink-600 dark:accent-pink-500 w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Use my saved billing information
          </span>
        </label>
      )}

      {isLoading && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Loading saved info…
        </p>
      )}

      {/* Billing Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <InputField
          label="First Name"
          value={formData.billingFirstName}
          onChange={(val) => updateField("billingFirstName", val)}
          disabled={useAccountBilling}
        />

        {/* Last Name */}
        <InputField
          label="Last Name"
          value={formData.billingLastName}
          onChange={(val) => updateField("billingLastName", val)}
          disabled={useAccountBilling}
        />

        {/* Email */}
        <InputField
          label="Email"
          type="email"
          value={formData.billingEmail}
          onChange={(val) => updateField("billingEmail", val)}
          disabled={useAccountBilling}
          error={
            formData.billingEmail && !isValidEmail
              ? "Enter a valid email address"
              : undefined
          }
          fullWidth
        />

        {/* Phone */}
        <InputField
          label="Phone (optional)"
          type="tel"
          value={formData.billingPhone}
          onChange={(val) => updateField("billingPhone", val)}
          disabled={useAccountBilling}
          fullWidth
        />

        {/* Address 1 */}
        <InputField
          label="Address Line 1"
          value={formData.billingAddress1}
          onChange={(val) => updateField("billingAddress1", val)}
          disabled={useAccountBilling}
          fullWidth
        />

        {/* Address 2 */}
        <InputField
          label="Address Line 2"
          value={formData.billingAddress2}
          onChange={(val) => updateField("billingAddress2", val)}
          disabled={useAccountBilling}
          fullWidth
        />

        {/* City */}
        <InputField
          label="City"
          value={formData.billingCity}
          onChange={(val) => updateField("billingCity", val)}
          disabled={useAccountBilling}
        />

        {/* Postcode */}
        <InputField
          label="Postcode / Zip Code"
          value={formData.billingPostcode}
          onChange={(val) => updateField("billingPostcode", val)}
          disabled={useAccountBilling}
        />

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Country / Region
          </label>

          <select
            value={formData.billingCountry || "GB"}
            onChange={(e) => updateField("billingCountry", e.target.value)}
            disabled={useAccountBilling}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
               py-2 px-3 shadow-sm focus:border-pink-500 focus:ring-pink-500
               sm:text-sm transition-colors duration-300 disabled:opacity-60"
          >
            <option value="GB">United Kingdom</option>
            <option value="FR">France</option>
            <option value="DE">Germany</option>
            <option value="NL">Netherlands</option>
            <option value="BE">Belgium</option>
            <option value="ES">Spain</option>
            <option value="IT">Italy</option>
            <option value="IE">Ireland</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable Input Component ---------- */

function InputField({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  error,
  fullWidth = false,
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  type?: string;
  error?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`mt-1 w-full rounded-md shadow-sm bg-white dark:bg-gray-800 
          text-gray-900 dark:text-gray-100 py-2 px-3 transition-colors duration-300
          ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-pink-600 focus:border-pink-600"
          }
          disabled:opacity-60`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
