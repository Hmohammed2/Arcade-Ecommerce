import { Product, ProductVariant } from "@/types/product";

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
  const price =
    typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price;

  const shipping = product.marketing?.shipping_info ?? "UK Delivery: 2–3 days";

  return (
    <div className="md:col-span-3 border rounded p-4 space-y-4">
      <p className="text-2xl font-bold text-red-500">£{price}</p>

      <select
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="w-full border p-2"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n}>{n}</option>
        ))}
      </select>

      <button
        onClick={handleAddToCart}
        className="w-full bg-[#14485A] text-white py-3 rounded"
      >
        Add to Basket
      </button>

      <p className="text-sm text-gray-500">📦 {shipping}</p>

      <div className="text-xs text-gray-500">
        ✓ Genuine arcade parts ✓ Fast UK dispatch ✓ Secure checkout
      </div>
    </div>
  );
}
