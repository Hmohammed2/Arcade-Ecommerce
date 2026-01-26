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

// Simple international uplift (adjust later if needed)
const INTERNATIONAL_SURCHARGE = 6.0;

export default function FixedShippingRates() {
  const { formData, updateField } = useCheckoutForm();
  const { getTotalPrice } = useCart();

  const cartSubtotal = getTotalPrice();
  const qualifiesForFreeShipping = cartSubtotal >= 45;

  const country = formData.shippingCountry || "GB";
  const isUK = country === "GB";

  const getFinalPrice = (base: number) => {
    if (qualifiesForFreeShipping && isUK) return 0;
    if (!isUK) return base + INTERNATIONAL_SURCHARGE;
    return base;
  };

  return (
    <div className="flex flex-col gap-3">
      {UK_SHIPPING.map((option) => {
        const selected = formData.shippingMethod === option.id;
        const finalPrice = getFinalPrice(option.basePrice);

        return (
          <label
            key={option.id}
            className={`flex justify-between items-center border rounded-md p-4 cursor-pointer transition
              ${
                selected
                  ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                  : "border-gray-300 dark:border-gray-700"
              }`}
          >
            <div>
              <p className="font-medium">{option.label}</p>

              {option.description && (
                <p className="text-xs text-gray-500">{option.description}</p>
              )}

              {!isUK && (
                <p className="text-xs text-amber-600">
                  International delivery surcharge applied
                </p>
              )}

              {qualifiesForFreeShipping && isUK && (
                <p className="text-xs text-green-600 font-medium">
                  Free delivery over £45
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                {qualifiesForFreeShipping && isUK ? (
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
                onChange={() => {
                  updateField("shippingMethod", option.id);
                  updateField("shippingCost", finalPrice);
                }}
                className="accent-pink-600"
              />
            </div>
          </label>
        );
      })}
    </div>
  );
}
