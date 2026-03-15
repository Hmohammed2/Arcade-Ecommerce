"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { getImageUrl } from "@/library/getImageUrl";
import { getColourTextClass } from "../utils/colour-text";
import Breadcrumbs from "@/components/BreadCrumb";
import { gaEvent } from "@/library/ga";

const FREE_SHIPPING_THRESHOLD = 45;

export default function CartPage() {
  const { items, removeItem, clearCart, updateQuantity, getTotalPrice } =
    useCart();

  const subtotal = getTotalPrice();
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  if (items.length === 0) {
    return (
      <div className="min-h-screen max-w-3xl mx-auto py-16 text-center px-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Your cart is empty
        </h1>

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
    <div className="min-h-screen max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-gray-100">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      {/* FREE SHIPPING BANNER */}
      <div className="mb-8 p-4 rounded-xl bg-pink-50 dark:bg-pink-950 border border-pink-200 dark:border-pink-800">
        {subtotal < FREE_SHIPPING_THRESHOLD ? (
          <>
            <p className="font-medium">
              You're £{remaining.toFixed(2)} away from FREE UK shipping 🚚
            </p>

            <div className="mt-3 h-2 bg-white dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <p className="font-medium text-green-600 dark:text-green-400">
            🎉 You’ve unlocked FREE UK shipping!
          </p>
        )}
      </div>

      {/* CART ITEMS */}
      <div className="space-y-8">
        {items.map((item) => {
          const isBundle = item.type === "bundle";

          return (
            <div
              key={`${item.id}-${JSON.stringify(item.option_values)}`}
              className="flex flex-col sm:flex-row justify-between border-b border-gray-200 dark:border-gray-800 pb-6 gap-6"
            >
              {/* IMAGE + TITLE */}
              <div className="flex gap-6">
                {item.image && (
                  <Image
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    width={150}
                    height={150}
                    className="rounded-md object-contain bg-gray-50 dark:bg-gray-900 p-2"
                  />
                )}

                <div>
                  <h3 className="font-semibold text-lg">
                    {isBundle ? "🧰 " : ""} {item.title}
                  </h3>

                  {isBundle && (
                    <p className="text-xs text-gray-400 mt-1">
                      Custom configured bundle
                    </p>
                  )}

                  {/* Bundle configuration */}
                  {isBundle && item.option_values && item.option_meta && (
                    <div className="mt-2 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                      {Object.entries(item.option_values).map(
                        ([optionId, values]) => {
                          const option = item.option_meta?.find(
                            (o) => o.id === Number(optionId),
                          );

                          if (!option) return null;

                          return (
                            <div key={optionId}>
                              <p className="font-medium text-gray-700 dark:text-gray-300">
                                {option.name}
                              </p>

                              <div className="flex flex-wrap gap-2 mt-1">
                                {Object.entries(values).map(
                                  ([valueId, qty]) => {
                                    const value =
                                      option.values[Number(valueId)];

                                    return (
                                      <span
                                        key={valueId}
                                        className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 flex items-center gap-1"
                                      >
                                        <span
                                          className="w-2.5 h-2.5 rounded-full border border-gray-300 dark:border-gray-600"
                                          style={{
                                            backgroundColor: value?.hex,
                                          }}
                                        />
                                        {qty} × {value?.label ?? "Unknown"}
                                      </span>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}

                  {!isBundle && item.colour && (
                    <span
                      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-medium mt-2
               border-gray-300 dark:border-gray-700
               bg-gray-100 dark:bg-gray-800"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: item.colour.toLowerCase() }}
                      />
                      <span className={getColourTextClass(item.colour)}>
                        {item.colour}
                      </span>
                    </span>
                  )}

                  <p className="text-pink-600 dark:text-pink-400 font-bold mt-2">
                    £{item.price}
                  </p>

                  <button
                    onClick={() => removeItem(item.id, item.colour || "")}
                    className="text-red-600 dark:text-red-400 text-sm mt-3 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* QUANTITY CONTROLS */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      item.colour || "",
                      Math.max(item.quantity - 1, 1),
                    )
                  }
                  className="w-8 h-8 border border-gray-300 dark:border-gray-700 rounded flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  −
                </button>

                <span className="w-6 text-center font-medium">
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      item.colour || "",
                      item.quantity + 1,
                    )
                  }
                  className="w-8 h-8 border border-gray-300 dark:border-gray-700 rounded flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUMMARY */}
      <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="text-xl font-semibold">
          Subtotal: £{subtotal.toFixed(2)}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Shipping calculated at checkout • Fast UK delivery
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={clearCart}
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Clear Cart
          </button>

          <button
            onClick={() => {
              gaEvent("begin_checkout", {
                currency: "GBP",
                value: subtotal,
              });

              window.location.href = "/checkout";
            }}
            className="px-6 py-3 rounded bg-pink-600 text-white font-semibold hover:bg-pink-700 transition"
          >
            🔒 Secure Checkout
          </button>
        </div>
      </div>

      {/* MOBILE STICKY CHECKOUT */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center sm:hidden shadow-lg">
        <span className="font-semibold">£{subtotal.toFixed(2)}</span>

        <button
          onClick={() => (window.location.href = "/checkout")}
          className="bg-pink-600 text-white px-4 py-2 rounded font-medium hover:bg-pink-700"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
