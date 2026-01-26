"use client";

import { useShippingRates } from "@/hooks/useShippingRates";
import { useCheckoutForm } from "@/store/useCheckoutForm";
import { useCart } from "@/store/useCart";

export default function ShippingRatesInline() {
  const { formData, updateField } = useCheckoutForm();
  const { getTotalPrice } = useCart();

  const cartSubtotal = getTotalPrice();
  const qualifiesForFreeShipping = cartSubtotal >= 45;

  const postcode = formData.sameAsBilling
    ? formData.billingPostcode
    : formData.shippingPostcode;

  const normalisedPostcode = (postcode ?? "").replace(/\s+/g, "").toUpperCase();
  const isLikelyUKPostcode =
    Boolean(normalisedPostcode) && normalisedPostcode.length >= 5;

  const { data: rates, isLoading } = useShippingRates({
    address: {
      country: formData.shippingCountry || "GB",
      postcode: isLikelyUKPostcode ? normalisedPostcode : "",
    },
    parcel: { weight: formData.cartWeightKg ?? 0.1 },
    enabled: isLikelyUKPostcode,
  });

  if (isLoading) {
    return <p className="text-sm text-gray-500">Calculating delivery…</p>;
  }

  if (!isLikelyUKPostcode) {
    return (
      <p className="text-sm text-gray-500">
        Enter your full postcode to see delivery options
      </p>
    );
  }

  if (!rates || rates.length === 0) {
    return (
      <p className="text-sm text-red-500">
        No delivery options available for this address.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {rates.map((rate) => {
        const selected = formData.shippingRateId === rate.id;

        const effectiveCost = qualifiesForFreeShipping ? 0 : Number(rate.price);

        return (
          <label
            key={rate.id}
            className={`flex justify-between items-center border rounded-md p-3 cursor-pointer transition
              ${
                selected
                  ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                  : "border-gray-300 dark:border-gray-700"
              }`}
          >
            <div>
              <span className="font-medium">{rate.service_name}</span>

              {rate.estimated_days && (
                <p className="text-xs text-gray-500">
                  {rate.estimated_days} working days
                </p>
              )}

              {qualifiesForFreeShipping && (
                <p className="text-xs text-green-600 font-medium">
                  Free delivery over £45
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                {qualifiesForFreeShipping ? (
                  <>
                    <span className="line-through text-sm text-gray-400 mr-2">
                      £{Number(rate.price).toFixed(2)}
                    </span>
                    <span className="font-semibold text-green-600">Free</span>
                  </>
                ) : (
                  <span className="font-semibold">
                    £{Number(rate.price).toFixed(2)}
                  </span>
                )}
              </div>

              <input
                type="radio"
                checked={selected}
                onChange={() => {
                  updateField("shippingRateId", rate.id);
                  updateField("shippingCost", effectiveCost);
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
