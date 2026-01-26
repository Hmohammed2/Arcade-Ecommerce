"use client";

import { useAuth } from "@/store/useAuth";
import { useCart } from "@/store/useCart";
import { useCoupon } from "@/store/useCoupon";
import { useCheckoutForm } from "@/store/useCheckoutForm";
import { getColourTextClass } from "@/app/utils/colour-text";
import { toast } from "react-hot-toast";
import { useMemo, useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/library/getImageUrl";
import ShippingRatesInline from "./ShippingRates";

const FREE_SHIPPING_THRESHOLD = 45;

export default function OrderSummary() {
  const { getCartItems, getTotalItems, getTotalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { formData } = useCheckoutForm();
  const { code, discountPercent, isValid, setCoupon, clearCoupon } =
    useCoupon();

  const [inputCode, setInputCode] = useState(code || "");
  const [loading, setLoading] = useState(false);

  const cartItems = getCartItems();
  const totalItems = getTotalItems();

  /**
   * ============================
   * 🔢 PRICING (BACKEND-ALIGNED)
   * ============================
   */
  const pricing = useMemo(() => {
    const subtotal = getTotalPrice();

    const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

    const shippingCost = qualifiesForFreeShipping
      ? 0
      : Number(formData.shippingCost ?? 0);

    const preDiscountTotal = subtotal + shippingCost;

    const discountAmount =
      isValid && discountPercent > 0
        ? (preDiscountTotal * discountPercent) / 100
        : 0;

    const total = preDiscountTotal - discountAmount;

    return {
      subtotal,
      shippingCost,
      preDiscountTotal,
      discountAmount,
      total,
      qualifiesForFreeShipping,
    };
  }, [getTotalPrice, formData.shippingCost, discountPercent, isValid]);

  /**
   * ============================
   * 🎟️ COUPON APPLY
   * ============================
   */
  const handleApplyCoupon = async () => {
    if (!inputCode.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }

    setLoading(true);

    try {
      const email =
        (isAuthenticated && user?.email) ||
        formData.billingEmail ||
        localStorage.getItem("guest_email") ||
        "";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/coupon/validate/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: inputCode, email }),
        },
      );

      const data = await res.json();

      if (res.ok && data.valid) {
        setCoupon(inputCode, data.discount_percent);
        toast.success(data.message || "Coupon applied!");
      } else {
        clearCoupon();
        toast.error(data.message || "Invalid coupon code.");
      }
    } catch {
      toast.error("Could not validate coupon.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================
   * 🧾 UI
   * ============================
   */
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-6 space-y-4">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      {/* Items */}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700 mb-4">
        {cartItems.map((item) => (
          <li
            key={`${item.type}-${item.id}-${item.colour || "default"}`}
            className="flex justify-between py-2 gap-3"
          >
            <div className="flex gap-3">
              {item.image && (
                <div className="relative w-12 h-12 shrink-0 rounded bg-white">
                  <Image
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    fill
                    className="object-contain p-1"
                  />
                </div>
              )}

              <div>
                <p className="text-sm font-medium">
                  {item.title} × {item.quantity}
                </p>

                {item.colour && (
                  <p className={`text-xs ${getColourTextClass(item.colour)}`}>
                    {item.colour}
                  </p>
                )}

                {item.type === "bundle" && (
                  <p className="text-xs text-pink-600 font-semibold">Mod Kit</p>
                )}
              </div>
            </div>

            <span className="text-sm font-semibold">
              £{(item.price * item.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      {/* Coupon */}
      <div>
        <label className="block text-sm font-medium mb-1">Coupon Code</label>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="w-full sm:flex-1 min-w-0 rounded-md border px-3 py-2"
            placeholder="Enter code"
          />
          <button
            onClick={handleApplyCoupon}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 bg-pink-600 text-white rounded-md"
          >
            {loading ? "…" : "Apply"}
          </button>
        </div>

        {isValid && (
          <p className="text-sm text-green-600 mt-2">
            ✅ Coupon applied ({discountPercent}% off)
          </p>
        )}
      </div>

      {/* Shipping */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Delivery Method
        </label>

        {!formData.shippingPostcode && !formData.sameAsBilling && (
          <p className="text-sm text-gray-500">
            Enter your address to see delivery options
          </p>
        )}

        {(formData.shippingPostcode || formData.sameAsBilling) && (
          <ShippingRatesInline />
        )}
      </div>

      {/* Totals */}
      <div className="border-t pt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal ({totalItems} items)</span>
          <span>£{pricing.subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Delivery</span>
          <span>
            {pricing.qualifiesForFreeShipping
              ? "Free"
              : `£${pricing.shippingCost.toFixed(2)}`}
          </span>
        </div>

        {pricing.discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-£{pricing.discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-lg pt-2">
          <span>Total</span>
          <span>£{pricing.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
