"use client";

import { useCheckoutForm } from "@/store/useCheckoutForm";
import { useEffect } from "react";

export default function ShippingForm() {
  const { formData, updateField, setSameAsBilling } = useCheckoutForm();

  useEffect(() => {
    if (!formData.sameAsBilling) return;

    updateField("shippingAddress1", formData.billingAddress1 || "");
    updateField("shippingAddress2", formData.billingAddress2 || "");
    updateField("shippingCity", formData.billingCity || "");
    updateField("shippingPostcode", formData.billingPostcode || "");
    updateField("shippingCountry", formData.billingCountry || "GB");
  }, [
    formData.sameAsBilling,
    formData.billingAddress1,
    formData.billingAddress2,
    formData.billingCity,
    formData.billingPostcode,
    formData.billingCountry,
    updateField,
  ]);

  // 🔒 Completion Logic
  const isAddressComplete =
    !!formData.shippingAddress1 &&
    !!formData.shippingCity &&
    !!formData.shippingPostcode &&
    !!formData.shippingCountry;

  const isShippingComplete = isAddressComplete && !!formData.shippingMethod;

  return (
    <section
      className={`space-y-6 bg-white dark:bg-gray-900 border rounded-xl p-6 
        text-gray-800 dark:text-gray-100 transition-all duration-300
        ${
          isShippingComplete
            ? "border-green-500"
            : "border-gray-200 dark:border-gray-700"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Shipping Details</h2>

        {isShippingComplete && (
          <span className="text-sm font-medium text-green-600 flex items-center gap-1">
            ✓ Completed
          </span>
        )}

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={formData.sameAsBilling}
            onChange={(e) => setSameAsBilling(e.target.checked)}
            className="accent-pink-600 w-4 h-4"
          />
          <span>Same as billing</span>
        </label>
      </div>

      {/* Hide form if sameAsBilling */}
      {!formData.sameAsBilling && (
        <div className="space-y-6">
          <InputField
            label="Address Line 1"
            value={formData.shippingAddress1}
            onChange={(val) => updateField("shippingAddress1", val)}
          />

          <InputField
            label="Address Line 2 (optional)"
            value={formData.shippingAddress2}
            onChange={(val) => updateField("shippingAddress2", val)}
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="City"
              value={formData.shippingCity}
              onChange={(val) => updateField("shippingCity", val)}
            />

            <InputField
              label="Postcode"
              value={formData.shippingPostcode}
              onChange={(val) => updateField("shippingPostcode", val)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Country / Region
            </label>
            <select
              value={formData.shippingCountry || "GB"}
              onChange={(e) => updateField("shippingCountry", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300
               dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3
               focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
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
      )}
    </section>
  );
}

/* Reusable Input */
function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-gray-300 
          dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3
          focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
      />
    </div>
  );
}
