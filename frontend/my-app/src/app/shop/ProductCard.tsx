import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cartItem } from "@/types/cart";
import { getImageUrl } from "@/library/getImageUrl";
import type { Product, ProductVariant } from "@/types/product";

export function ProductCard({
  product,
  addItem,
  isInCart,
}: {
  product: Product;
  addItem: (item: cartItem) => void;
  isInCart: (id: number, colour?: string) => boolean;
}) {
  // ✅ Use variants from backend instead of product.colours
  const variants: ProductVariant[] = product.variants ?? [];

  // Default to first in-stock variant if any
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  useEffect(() => {
    if (!selectedVariant && variants.length > 0) {
      const available = variants.find((v) => v.stock > 0) || variants[0];
      setSelectedVariant(available);
    }
  }, [variants, selectedVariant]);

  const handleAddToCart = () => {
    if (!product) return;

    // If variant exists and is out of stock, do nothing
    if (selectedVariant && selectedVariant.stock === 0) return;

    const item: cartItem = {
      id: product.id,
      title: product.name,
      price: Number(product.price),
      image: product.image,
      quantity: 1,
      colour: selectedVariant ? selectedVariant.colour : null,
    };

    addItem(item);
  };

  const isOutOfStock =
    selectedVariant?.stock === 0 ||
    (variants.length === 0 && (product.stock ?? 0) === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col"
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col flex-1">
        <div className="relative w-full h-48 flex items-center justify-center">
          <Image
            src={getImageUrl(product.image)}
            alt={product.name}
            width={200}
            height={200}
            className="object-contain mx-auto"
          />
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-[#E01D42] font-bold">£{product.price}</p>

          {/* Stock indicator */}
          <p
            className={`text-sm ${
              isOutOfStock ? "text-red-500" : "text-green-600"
            }`}
          >
            {isOutOfStock
              ? "Out of Stock"
              : selectedVariant
                ? `In Stock — ${selectedVariant.stock}`
                : `In Stock — ${product.stock ?? 0}`}
          </p>

          {/* Colour / Variant Buttons */}
          {variants.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedVariant(variant);
                  }}
                  disabled={variant.stock === 0}
                  className={`px-2 py-1 text-xs rounded-md border transition ${
                    selectedVariant?.id === variant.id
                      ? "bg-[#14485A] text-white border-[#14485A]"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  } ${variant.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {variant.colour}
                </button>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Add to Basket Button */}
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`mt-auto w-full py-2 px-4 rounded-lg font-semibold transition ${
          isOutOfStock
            ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-[#14485A] text-white hover:bg-[#0e2f3d]"
        }`}
      >
        {isInCart(product.id, selectedVariant?.colour)
          ? "Add More"
          : "Add to Basket"}
      </button>
    </motion.div>
  );
}
