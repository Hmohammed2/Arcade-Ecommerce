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
  const hasVariants = product.variants && product.variants.length > 0;

  const inStock =
    product.variants?.some((v) => v.stock > 0) || (product.stock ?? 0) > 0;

  const variantCount = product.variants?.length ?? 0;

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
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg dark:shadow-md transition flex flex-col border border-gray-100 dark:border-gray-800">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square bg-gray-50 dark:bg-gray-800">
          <Image
            src={getImageUrl(product.image)}
            alt={product.name}
            fill
            className="object-contain p-4"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        <p className="text-pink-600 dark:text-pink-400 font-bold">
          £{product.price}
        </p>

        <p
          className={`text-sm ${
            inStock
              ? "text-green-600 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
          }`}
        >
          {inStock ? "In Stock" : "Out of Stock"}
        </p>

        {hasVariants && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {variantCount} colours available
          </p>
        )}

        {inStock &&
          (hasVariants ? (
            <Link
              href={`/products/${product.slug}`}
              className="mt-auto text-center bg-[#14485A] text-white py-2 rounded-md hover:bg-[#0e2f3d] dark:bg-[#1b5f75] dark:hover:bg-[#14485A] transition"
            >
              View Options
            </Link>
          ) : (
            <button
              onClick={handleAdd}
              className="mt-auto text-center bg-[#14485A] text-white py-2 rounded-md hover:bg-[#0e2f3d] dark:bg-[#1b5f75] dark:hover:bg-[#14485A] transition"
            >
              Add to Cart
            </button>
          ))}
      </div>
    </div>
  );
}
