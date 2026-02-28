"use client";

import { useCheckoutForm } from "@/store/useCheckoutForm";
import { useCart } from "@/store/useCart";

type ShippingOption = {
  id: string;
  label: string;
  description?: string;
  basePrice: number;
};

const UK_SHIPPING: ShippingOption[] = [
  {
    id: "standard",
    label: "Standard Delivery",
    description: "2–3 working days",
    basePrice: 3.95,
  },
  {
    id: "express",
    label: "Express Delivery",
    description: "1–2 working days",
    basePrice: 6.95,
  },
];

const INTERNATIONAL_SURCHARGE = 6.0;

export default function FixedShippingRates() {
  const { formData, updateField } = useCheckoutForm();
  const { getTotalPrice } = useCart();

  const cartSubtotal = getTotalPrice();
  const country = formData.shippingCountry || "GB";
  const isUK = country === "GB";

  const isAddressComplete =
    !!formData.shippingAddress1 &&
    !!formData.shippingCity &&
    !!formData.shippingPostcode &&
    !!formData.shippingCountry;

  const qualifiesForFreeShipping = cartSubtotal >= 45 && isUK;

  const getFinalPrice = (base: number) => {
    if (qualifiesForFreeShipping) return 0;
    if (!isUK) return base + INTERNATIONAL_SURCHARGE;
    return base;
  };

  return (
    <div className="space-y-3">
      {!isAddressComplete && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm p-3 rounded-md">
          Enter delivery address to view shipping options.
        </div>
      )}

      {UK_SHIPPING.map((option) => {
        const selected = formData.shippingMethod === option.id;
        const finalPrice = getFinalPrice(option.basePrice);

        return (
          <label
            key={option.id}
            className={`flex justify-between items-center border rounded-md p-4 transition
              ${
                selected
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-700"
              }
              ${!isAddressComplete ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <div>
              <p className="font-medium">{option.label}</p>

              {option.description && (
                <p className="text-xs text-gray-500">{option.description}</p>
              )}

              {qualifiesForFreeShipping && (
                <p className="text-xs text-green-600 font-medium">
                  Free delivery over £45
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                {qualifiesForFreeShipping ? (
                  <>
                    <span className="line-through text-sm text-gray-400 mr-2">
                      £{option.basePrice.toFixed(2)}
                    </span>
                    <span className="font-semibold text-green-600">Free</span>
                  </>
                ) : (
                  <span className="font-semibold">
                    £{finalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <input
                type="radio"
                checked={selected}
                disabled={!isAddressComplete}
                onChange={() => {
                  if (!isAddressComplete) return;
                  updateField("shippingMethod", option.id);
                  updateField("shippingCost", finalPrice);
                }}
                className="accent-green-600"
              />
            </div>
          </label>
        );
      })}
    </div>
  );
}
