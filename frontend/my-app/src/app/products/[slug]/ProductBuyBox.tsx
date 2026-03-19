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

  const shipping = product.marketing?.shipping_info ?? "UK Delivery: 2–3 days";

  const hasVariants = product.variants && product.variants.length > 0;

  const variantLabel = selectedVariant?.name || selectedVariant?.colour || null;

  // 🔥 Sticky visibility logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSticky(!entry.isIntersecting);
      },
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
      <div className="md:col-span-3 border border-gray-200 dark:border-gray-800 rounded p-4 space-y-4 bg-white dark:bg-gray-900 pb-24 md:pb-4">
        {/* PRICE */}
        <p className="text-2xl font-bold text-red-500">£{price}</p>

        {/* VARIANT SELECTOR */}
        {hasVariants && (
          <div ref={variantRef}>
            <p className="text-sm font-medium text-black dark:text-white mb-1">
              Select Option
            </p>

            {/* Desktop only variant display */}
            <div className="hidden md:block text-xs text-gray-500 dark:text-gray-400">
              {variantLabel
                ? `Selected: ${variantLabel} • ${
                    selectedVariant?.stock ? "In Stock" : "Out of Stock"
                  }`
                : "Please select a variant"}
            </div>
          </div>
        )}

        {/* QUANTITY */}
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>

        {/* ADD TO CART */}
        <button
          ref={atcRef}
          onClick={handleStickyClick}
          disabled={hasVariants && !selectedVariant}
          className={`w-full py-3 rounded font-semibold transition ${
            hasVariants && !selectedVariant
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#14485A] hover:bg-[#0f3a48] text-white"
          }`}
        >
          {hasVariants && !selectedVariant ? "Select Option" : "Add to Basket"}
        </button>

        {/* SHIPPING */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          📦 {shipping}
        </p>

        {/* TRUST */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          ✓ Genuine arcade parts ✓ Fast UK dispatch ✓ Secure checkout
        </div>
      </div>

      {/* ===================== */}
      {/* MOBILE STICKY BAR */}
      {/* ===================== */}
      {showSticky && (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 md:hidden z-50">
          <div className="flex items-center gap-3">
            {/* PRICE + STATE */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-black dark:text-white">
                £{price}
              </p>

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
              className={`flex-1 py-3 rounded font-semibold transition ${
                hasVariants && !selectedVariant
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#14485A] hover:bg-[#0f3a48] text-white"
              }`}
            >
              {hasVariants && !selectedVariant ? "Select" : "Add"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
