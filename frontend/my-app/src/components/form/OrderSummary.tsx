"use client";

import { useAuth } from "@/store/useAuth";
import { useCart } from "@/store/useCart";
import { useCoupon } from "@/store/useCoupon";
import { useCheckoutForm } from "@/store/useCheckoutForm";
import { getColourTextClass } from "@/app/utils/colour-text";
import { toast } from "react-hot-toast";
import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/library/getImageUrl";

export default function OrderSummary() {
  const {
    getCartItems,
    getTotalItems,
    getTotalPrice,
    getDelivery,
    setDelivery,
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { formData } = useCheckoutForm();
  const { code, discountPercent, isValid, setCoupon, clearCoupon } =
    useCoupon();
  const [inputCode, setInputCode] = useState(code || "");
  const [loading, setLoading] = useState(false);

  const delivery = getDelivery();
  const cartItems = getCartItems();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // --- Delivery Fee Logic ---
  const isFreeStandard = totalPrice >= 15;
  const smallOrderFee = totalPrice < 15 ? 2.99 : 0;
  const expressFee = 1.99;

  let deliveryFee = 0;
  if (delivery === "standard") {
    deliveryFee = smallOrderFee;
  } else if (delivery === "express") {
    deliveryFee = expressFee + smallOrderFee;
  }

  const discount = totalPrice * (discountPercent / 100);
  const finalPrice = totalPrice - discount + deliveryFee;

  // --- Apply Coupon Logic ---
  const handleApplyCoupon = async () => {
    if (!inputCode.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }

    setLoading(true);
    try {
      const emailToUse =
        (isAuthenticated && user?.email) ||
        formData.billingEmail ||
        localStorage.getItem("guest_email") ||
        "";

      if (!emailToUse) {
        toast.error("Please enter your billing email first.");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/coupon/validate/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: inputCode, email: emailToUse }),
        }
      );

      const data = await res.json();

      if (res.ok && data.valid) {
        setCoupon(inputCode, data.discount_percent);
        toast.success(data.message || "Coupon applied!");
      } else {
        clearCoupon();
        toast.error(data.message || "Invalid coupon code.");
      }
    } catch (err) {
      console.error("Coupon validation failed:", err);
      toast.error("Could not validate coupon. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- UI ---
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-6 space-y-4 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

      {/* Cart items */}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {cartItems.map((item) => (
          <li
            key={`${item.type}-${item.id}-${item.colour || "default"}`}
            className="flex items-center justify-between py-2 gap-3"
          >
            <div className="flex items-center gap-3">
              {/* Thumbnail */}
              {item.image && (
                <div className="relative w-12 h-12 sm:w-12 sm:h-12 shrink-0 rounded-md border border-gray-200 dark:border-gray-700 bg-white overflow-hidden">
                  <Image
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </div>
              )}

              {/* Title & colour */}
              <div className="leading-tight">
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

            {/* Line total */}
            <span className="text-sm font-semibold">
              £{(item.price * item.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      {/* Coupon Section */}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Coupon Code</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter code"
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm py-2 px-3"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={loading}
            className="shrink-0 px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md text-sm transition disabled:opacity-50"
          >
            {loading ? "Checking..." : "Apply"}
          </button>
        </div>

        {isValid && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            ✅ Coupon "{code}" applied ({discountPercent}% off)
          </p>
        )}
      </div>

      {/* Delivery Options */}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">
          Delivery Method
        </label>
        <div className="flex flex-col gap-2">
          <label
            className={`flex justify-between border rounded-md p-3 cursor-pointer ${
              delivery === "standard"
                ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                : "border-gray-300 dark:border-gray-700"
            }`}
          >
            <div>
              <span className="font-medium">Standard Delivery</span>
              <p className="text-xs text-gray-500">
                Royal Mail (2–4 working days)
              </p>
              <p className="text-xs text-gray-500">
                {isFreeStandard
                  ? "Free on orders over £15"
                  : "£2.99 small order fee under £15"}
              </p>
            </div>
            <input
              type="radio"
              name="delivery"
              value="standard"
              checked={delivery === "standard"}
              onChange={() => setDelivery("standard")}
              className="mt-1 accent-pink-600"
            />
          </label>

          <label
            className={`flex justify-between border rounded-md p-3 cursor-pointer ${
              delivery === "express"
                ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                : "border-gray-300 dark:border-gray-700"
            }`}
          >
            <div>
              <span className="font-medium">Express Delivery</span>
              <p className="text-xs text-gray-500">
                Royal Mail Tracked 24 (1–2 working days)
              </p>
              <p className="text-xs text-gray-500">
                + £1.99 express fee
                {totalPrice < 15 && " + £2.99 small order fee"}
              </p>
            </div>
            <input
              type="radio"
              name="delivery"
              value="express"
              checked={delivery === "express"}
              onChange={() => setDelivery("express")}
              className="mt-1 accent-pink-600"
            />
          </label>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-between font-semibold pt-4 border-t border-gray-200 dark:border-gray-700">
        <span>Subtotal ({totalItems} items)</span>
        <span>£{totalPrice.toFixed(2)}</span>
      </div>

      {discountPercent > 0 && (
        <div className="flex justify-between text-sm text-green-700 dark:text-green-400">
          <span>Discount ({discountPercent}%)</span>
          <span>-£{discount.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between text-sm">
        <span>Delivery</span>
        <span>{deliveryFee > 0 ? `£${deliveryFee.toFixed(2)}` : "Free"}</span>
      </div>

      <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-gray-700 pt-2">
        <span>Total</span>
        <span>£{finalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
