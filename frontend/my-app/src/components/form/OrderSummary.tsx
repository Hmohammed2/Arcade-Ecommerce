"use client";

import { useCart } from "@/store/useCart";
import { useState } from "react";

export default function OrderSummary() {
  const { getCartItems, getTotalItems, getTotalPrice } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const cartItems = getCartItems();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const finalPrice = totalPrice - discount;

  return (
    <div className="bg-gray-50 border rounded-md p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Order Summary
      </h2>

      <ul className="divide-y divide-gray-200">
        {cartItems.map((item) => (
          <li key={item.id} className="flex justify-between py-2 text-sm">
            <span>
              {item.title} × {item.quantity}
            </span>
            <span>£{(item.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      {/* Coupon */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Coupon Code
        </label>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Enter code"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={() =>
              setDiscount(coupon === "SAVE10" ? totalPrice * 0.1 : 0)
            }
            className="shrink-0 px-3 py-2 bg-pink-600 text-white rounded-md text-sm hover:bg-pink-700"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-between font-semibold text-gray-900 pt-4 border-t">
        <span>Subtotal ({totalItems} items)</span>
        <span>£{totalPrice.toFixed(2)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm text-green-700">
          <span>Discount</span>
          <span>-£{discount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2">
        <span>Total</span>
        <span>£{finalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
