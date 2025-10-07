"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { getImageUrl } from "@/library/getImageUrl";

export default function CartPage() {
  const { items, removeItem, clearCart, updateQuantity, getTotalPrice } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen max-w-3xl mx-auto py-16 text-center px-4">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link
          href="/shop"
          className="text-pink-600 hover:underline font-medium"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* 🟡 Notice Bar */}
      <div className="mb-6 rounded-md bg-yellow-100 border border-yellow-300 p-4 text-sm text-yellow-900 text-center">
        <p>
          <strong>Note:</strong> As of now we are only supplying curated
          products to fellow enthusiasts in the{" "}
          <span className="font-semibold">United Kingdom</span>. This may change
          in the near future once we scale up. If you’d like to discuss orders
          outside the UK, please email{" "}
          <a
            href="mailto:sales@arcadesticklabs.co.uk"
            className="underline font-medium text-yellow-800 hover:text-yellow-900"
          >
            sales@arcadesticklabs.co.uk
          </a>
          .
        </p>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">
        Shopping Cart
      </h1>

      {/* 🛒 Cart Items */}
      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-4 sm:gap-6"
          >
            {/* Product info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              {item.image && (
                <Image
                  src={getImageUrl(item.image)}
                  alt={item.title}
                  width={150}
                  height={100}
                  className="rounded-md border object-contain w-32 h-32 sm:w-40 sm:h-40"
                />
              )}

              <div>
                <p className="font-medium text-base sm:text-lg">{item.title}</p>
                {item.variantId && (
                  <p className="text-sm text-gray-500 mt-1">{item.variantId}</p>
                )}
                <p className="text-gray-700 mt-1 font-semibold">
                  £{item.price}
                </p>
              </div>
            </div>

            {/* Quantity + Remove */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor={`qty-${item.id}`} className="sr-only">
                  Quantity
                </label>
                <input
                  id={`qty-${item.id}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.id, Number(e.target.value) || 1)
                  }
                  className="w-16 border rounded px-2 py-1 text-center text-sm"
                />
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:underline text-sm mt-1 sm:mt-0"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🧾 Cart Summary */}
      <div className="mt-8 flex flex-col items-center sm:items-end gap-4">
        <p className="text-xl font-semibold">
          Subtotal: £{getTotalPrice().toFixed(2)}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={clearCart}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium w-full sm:w-auto"
          >
            Clear Cart
          </button>
          <Link
            href="/checkout"
            className="px-6 py-2 rounded bg-pink-600 text-white hover:bg-pink-700 text-sm font-medium text-center w-full sm:w-auto"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
