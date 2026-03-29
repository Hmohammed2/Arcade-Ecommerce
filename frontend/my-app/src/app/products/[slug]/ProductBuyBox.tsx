"use client";

import { Product, ProductVariant } from "@/types/product";
import { useEffect, useRef, useState } from "react";

export default function ProductBuyBox({
  product,
  quantity,
  setQuantity,
  selectedVariant,
  handleAddToCart,
}: {
  product: Product;
  quantity: number;
  setQuantity: (n: number) => void;
  selectedVariant: ProductVariant | null;
  handleAddToCart: () => void;
}) {
  const variantRef = useRef<HTMLDivElement | null>(null);
  const atcRef = useRef<HTMLButtonElement | null>(null);

  const [showSticky, setShowSticky] = useState(false);

  const price =
    typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price;

  const hasVariants = product.variants && product.variants.length > 0;

  const variantLabel = selectedVariant?.name || selectedVariant?.colour || null;

  // Sticky logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.2 },
    );

    if (atcRef.current) observer.observe(atcRef.current);

    return () => {
      if (atcRef.current) observer.unobserve(atcRef.current);
    };
  }, []);

  const handleStickyClick = () => {
    if (hasVariants && !selectedVariant) {
      variantRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    handleAddToCart();
  };

  return (
    <>
      {/* ===================== */}
      {/* MAIN BUY BOX */}
      {/* ===================== */}
      <div className="md:col-span-3 border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900 space-y-5 pb-24 md:pb-4">
        {/* PRICE */}
        <div className="space-y-1">
          <p className="text-3xl font-bold text-pink-600">£{price}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Affordable upgrade
          </p>
        </div>

        {/* VARIANTS */}
        {hasVariants && (
          <div ref={variantRef} className="space-y-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Choose your colour
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {variantLabel
                ? `${variantLabel} • ${
                    selectedVariant?.stock ? "In Stock" : "Out of Stock"
                  }`
                : "Select a variant to continue"}
            </p>
          </div>
        )}

        {/* QUANTITY STEPPER */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Quantity
          </p>

          <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden w-full">
            {/* MINUS */}
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 text-lg font-semibold text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              −
            </button>

            {/* VALUE */}
            <div className="flex-1 text-center text-sm font-medium text-gray-900 dark:text-white">
              {quantity}
            </div>

            {/* PLUS */}
            <button
              onClick={() => setQuantity(Math.min(20, quantity + 1))}
              className="px-4 py-2 text-lg font-semibold text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              +
            </button>
          </div>

          {product.marketing?.quantity_hint && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tip: {product.marketing.quantity_hint}
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          ref={atcRef}
          onClick={handleStickyClick}
          disabled={hasVariants && !selectedVariant}
          className={`
            w-full py-4 rounded-lg font-semibold text-base transition
            shadow-sm
            ${
              hasVariants && !selectedVariant
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#14485A] hover:bg-[#0f3a48] text-white active:scale-[0.98]"
            }
          `}
        >
          {hasVariants && !selectedVariant ? "Select Option" : "Add to Basket"}
        </button>

        {/* TRUST */}
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p>✓ In stock — ships next working day</p>
          <p>✓ Genuine arcade parts • Secure checkout</p>
        </div>
      </div>

      {/* ===================== */}
      {/* MOBILE STICKY BAR */}
      {/* ===================== */}
      {showSticky && (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 md:hidden z-50">
          <div className="flex items-center gap-3">
            {/* PRICE */}
            <div className="flex-1">
              <p className="text-base font-bold text-teal-300">£{price}</p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {hasVariants
                  ? variantLabel
                    ? `${variantLabel} • ${
                        selectedVariant?.stock ? "In Stock" : "Out of Stock"
                      }`
                    : "Select option"
                  : `Qty: ${quantity}`}
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleStickyClick}
              disabled={hasVariants && !selectedVariant}
              className={`
                flex-1 py-3 rounded-lg font-semibold text-sm transition
                ${
                  hasVariants && !selectedVariant
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#14485A] text-white"
                }
              `}
            >
              {hasVariants && !selectedVariant ? "Select" : "Add"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
