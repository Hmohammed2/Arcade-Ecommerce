import { Product, ProductVariant } from "@/types/product";
import { StockIndicator } from "./StockIndicator";

export default function ProductInfo({
  product,
  variants,
  selectedVariant,
  setSelectedVariant,
}: {
  product: Product;
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  setSelectedVariant: (v: ProductVariant) => void;
}) {
  const marketing = product.marketing ?? {};
  const highlights = marketing.highlights ?? [];
  const compatibility = marketing.compatibility ?? [];
  const rating = Number(product.rating ?? 5);
  const reviewCount = Number(product.review_count ?? 12);

  return (
    <div className="md:col-span-4 space-y-3 md:space-y-4">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex text-yellow-500 text-base md:text-lg">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star}>{star <= rating ? "★" : "☆"}</span>
          ))}
        </div>

        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          {rating.toFixed(1)} ({reviewCount})
        </span>
      </div>

      {/* 🔥 MOBILE: small highlights (keep persuasion, reduce height) */}
      {highlights.length > 0 && (
        <ul className="md:hidden text-xs text-gray-600 dark:text-gray-400 space-y-1">
          {highlights.slice(0, 4).map((h, i) => (
            <li key={i}>✔ {h}</li>
          ))}
        </ul>
      )}

      {/* DESKTOP highlights */}
      {highlights.length > 0 && (
        <ul className="hidden md:block space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {highlights.slice(0, 4).map((h, i) => (
            <li key={i}>✔ {h}</li>
          ))}
        </ul>
      )}

      {/* VARIANTS */}
      {variants.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Available Colours
          </h3>

          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                disabled={variant.stock === 0}
                className={`px-3 py-1 rounded border text-sm transition ${
                  variant.stock === 0 ? "opacity-40 cursor-not-allowed" : ""
                } ${
                  selectedVariant?.id === variant.id
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                }`}
              >
                {variant.colour}
              </button>
            ))}
          </div>

          {selectedVariant && (
            <div className="mt-1">
              <StockIndicator stock={selectedVariant.stock} />
            </div>
          )}
        </div>
      )}

      {/* NO VARIANTS */}
      {variants.length === 0 && <StockIndicator stock={product.stock ?? 0} />}

      {/* ❌ Hide compatibility on mobile */}
      {compatibility.length > 0 && (
        <div className="hidden md:block bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 text-sm">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            Compatibility
          </p>

          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
            {compatibility.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
