import Image from "next/image";
import Link from "next/link";
import { CartItem } from "@/types/cart";
import { getImageUrl } from "@/library/getImageUrl";
import type { Product } from "@/types/product";

export function ProductCard({
  product,
  addItem,
}: {
  product: Product;
  addItem: (item: CartItem) => void;
}) {
  const inStock =
    product.variants?.some((v) => v.stock > 0) || (product.stock ?? 0) > 0;

  const handleAdd = () => {
    addItem({
      type: "product",
      id: product.id,
      title: product.name,
      price: Number(product.price),
      image: product.image ?? "/placeholder.png",
      quantity: 1,
      colour: null,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square bg-gray-50">
          <Image
            src={getImageUrl(product.image)}
            alt={product.name}
            fill
            className="object-contain p-4"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-pink-600 font-bold">£{product.price}</p>

        <p className={`text-sm ${inStock ? "text-green-600" : "text-red-500"}`}>
          {inStock ? "In Stock" : "Out of Stock"}
        </p>

        {inStock && (
          <button
            onClick={handleAdd}
            className="mt-4 bg-[#14485A] text-white py-2 rounded-md hover:bg-[#0e2f3d]"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
