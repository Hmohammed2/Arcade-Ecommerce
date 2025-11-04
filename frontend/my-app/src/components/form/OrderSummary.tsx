"use client";

import { getColourTextClass } from "@/app/utils/colour-text";
import { useCart } from "@/store/useCart";
import { useState } from "react";

export default function OrderSummary() {
  const {
    getCartItems,
    getTotalItems,
    getTotalPrice,
    getDelivery,
    setDelivery,
  } = useCart();
  const delivery = getDelivery();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const cartItems = getCartItems();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // --- Delivery fee calculation ---
  const isFreeStandard = totalPrice >= 15;
  const smallOrderFee = totalPrice < 15 ? 2.99 : 0;
  const expressFee = 1.99;

  let deliveryFee = 0;
  if (delivery === "standard") {
    deliveryFee = smallOrderFee;
  } else if (delivery === "express") {
    // Express adds 1.99 on top, plus small order fee if under £15
    deliveryFee = expressFee + smallOrderFee;
  }

  // --- Final total ---
  const finalPrice = totalPrice - discount + deliveryFee;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-6 space-y-4 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Order Summary
      </h2>

      {/* Cart items */}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {cartItems.map((item) => (
          <li
            key={`${item.id}-${item.colour || "default"}`}
            className="flex justify-between py-2 text-sm"
          >
            <span>
              {item.title} × {item.quantity}{" "}
              {item.colour && (
                <>
                  {" "}
                  -{" "}
                  <span className={getColourTextClass(item.colour)}>
                    {item.colour}
                  </span>
                </>
              )}
            </span>
            <span>£{(item.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      {/* Coupon */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Coupon Code
        </label>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Enter code"
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm py-2 px-3 transition-colors"
          />
          <button
            type="button"
            onClick={() =>
              setDiscount(coupon === "SAVE10" ? totalPrice * 0.1 : 0)
            }
            className="shrink-0 px-3 py-2 bg-pink-600 hover:bg-pink-700 dark:hover:bg-pink-500 text-white rounded-md text-sm transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Delivery Options */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Delivery Method
        </label>

        <div className="flex flex-col gap-2">
          {/* Standard Delivery */}
          <label
            className={`flex justify-between items-start border rounded-md p-3 cursor-pointer transition-colors ${
              delivery === "standard"
                ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                : "border-gray-300 dark:border-gray-700"
            }`}
          >
            <div>
              <span className="font-medium">Standard Delivery</span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Royal Mail (2–4 working days)
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
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

          {/* Express Delivery */}
          <label
            className={`flex justify-between items-start border rounded-md p-3 cursor-pointer transition-colors ${
              delivery === "express"
                ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                : "border-gray-300 dark:border-gray-700"
            }`}
          >
            <div>
              <span className="font-medium">Express Delivery</span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Royal Mail Tracked 24 (1–2 working days)
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
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
      <div className="flex justify-between font-semibold text-gray-900 dark:text-gray-100 pt-4 border-t border-gray-200 dark:border-gray-700">
        <span>Subtotal ({totalItems} items)</span>
        <span>£{totalPrice.toFixed(2)}</span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-sm text-green-700 dark:text-green-400">
          <span>Discount</span>
          <span>-£{discount.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
        <span>Delivery</span>
        <span>{deliveryFee > 0 ? `£${deliveryFee.toFixed(2)}` : "Free"}</span>
      </div>

      <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700 pt-2">
        <span>Total</span>
        <span>£{finalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
