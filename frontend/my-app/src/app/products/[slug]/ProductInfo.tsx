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
    <div className="md:col-span-4 space-y-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2 mt-1">
        <div className="flex text-yellow-500 text-lg leading-none">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star}>{star <= (rating ?? 5) ? "★" : "☆"}</span>
          ))}
        </div>

        <span className="text-sm text-gray-500 dark:text-gray-400">
          {(rating ?? 5).toFixed(1)} ({reviewCount ?? 12})
        </span>
      </div>

      {highlights.length > 0 && (
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {highlights.slice(0, 4).map((h, i) => (
            <li key={i}>✔ {h}</li>
          ))}
        </ul>
      )}

      {compatibility.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 text-sm">
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

      {/* VARIANTS */}
      {variants.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Available Colours
          </h3>

          <div className="space-y-2">
            {/* Variant buttons */}
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  disabled={variant.stock === 0}
                  className={`px-3 py-1 rounded border transition ${
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

            {/* Stock indicator */}
            {selectedVariant && (
              <StockIndicator stock={selectedVariant.stock} />
            )}
          </div>
        </div>
      )}

      {/* Products WITHOUT variants */}
      {variants.length === 0 && <StockIndicator stock={product.stock ?? 0} />}
    </div>
  );
}
