import { Product, ProductVariant } from "@/types/product";

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

  return (
    <div className="md:col-span-4 space-y-4">
      <h1 className="text-3xl font-bold">{product.name}</h1>

      {highlights.length > 0 && (
        <ul className="space-y-1 text-sm">
          {highlights.slice(0, 4).map((h, i) => (
            <li key={i}>✔ {h}</li>
          ))}
        </ul>
      )}

      {compatibility.length > 0 && (
        <div className="bg-gray-50 border rounded p-3 text-sm">
          <p className="font-semibold">Compatibility</p>
          <ul className="list-disc list-inside">
            {compatibility.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {variants.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Available Colours</h3>

          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                disabled={variant.stock === 0}
                className={`px-3 py-1 rounded border ${
                  selectedVariant?.id === variant.id
                    ? "bg-black text-white"
                    : "bg-white"
                }`}
              >
                {variant.colour}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
