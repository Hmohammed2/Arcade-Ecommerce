"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { getImageUrl } from "@/library/getImageUrl";
import { getColourTextClass } from "../utils/colour-text";
import Breadcrumbs from "@/components/BreadCrumb";
import { gaEvent } from "@/library/ga";

export default function CartPage() {
  const { items, removeItem, clearCart, updateQuantity, getTotalPrice } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen max-w-3xl mx-auto py-16 text-center px-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link
          href="/shop"
          className="text-pink-600 dark:text-pink-400 hover:underline font-medium"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      {/* 🟡 Notice Bar */}
      <div className="mb-6 rounded-md bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 p-4 text-sm text-yellow-900 dark:text-yellow-100 text-center">
        <p>
          <strong>Note:</strong> As of now we are only supplying curated
          products to fellow enthusiasts in the{" "}
          <span className="font-semibold">United Kingdom</span>. This may change
          in the near future once we scale up. If you’d like to discuss orders
          outside the UK, please email{" "}
          <a
            href="mailto:sales@arcadesticklabs.co.uk"
            className="underline font-medium text-yellow-800 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-200"
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
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-700 pb-4 gap-4 sm:gap-6"
          >
            {/* Product info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              {item.image && (
                <Image
                  src={getImageUrl(item.image)}
                  alt={item.title}
                  width={150}
                  height={100}
                  className="rounded-md border border-gray-200 dark:border-gray-700 object-contain w-32 h-32 sm:w-40 sm:h-40"
                />
              )}
              <li key={`${item.id}-${item.colour || "default"}`}>
                <div className="flex flex-col">
                  <span className="text-base font-medium text-gray-800 dark:text-gray-100">
                    {item.title}
                    {item.colour && (
                      <span
                        className={`${getColourTextClass(
                          item.colour
                        )} text-sm ml-1`}
                      >
                        ({item.colour})
                      </span>
                    )}
                  </span>
                  <span className="text-pink-600 dark:text-pink-400 font-semibold mt-1">
                    £{item.price}
                  </span>
                </div>
              </li>
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
                    updateQuantity(
                      item.id,
                      item.colour || "",
                      Number(e.target.value) || 1
                    )
                  }
                  className="w-16 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-center text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-pink-600 dark:focus:outline-pink-500 transition"
                />
              </div>
              <button
                onClick={() => removeItem(item.id, item.colour || "")}
                className="text-red-600 dark:text-red-400 hover:underline text-sm mt-1 sm:mt-0 hover:cursor-pointer"
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
            className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium w-full sm:w-auto border border-gray-200 dark:border-gray-700 transition"
          >
            Clear Cart
          </button>
          <button
            onClick={() => {
              const total = getTotalPrice();

              gaEvent("begin_checkout", {
                currency: "GBP",
                value: total,
                items: items.map((i) => ({
                  item_id: i.id,
                  item_name: i.title,
                  item_variant: i.colour || "default",
                  price: i.price,
                  quantity: i.quantity,
                })),
              });

              window.location.href = "/checkout";
            }}
            className="px-6 py-2 rounded bg-pink-600 text-white hover:bg-pink-700 dark:hover:bg-pink-500 text-sm font-medium text-center w-full sm:w-auto transition"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
