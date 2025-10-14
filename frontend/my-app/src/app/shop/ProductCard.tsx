import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cartItem } from "@/types/cart";
import { getImageUrl } from "@/library/getImageUrl";
import { useState } from "react";
import type { Product } from "@/types/product";

export function ProductCard({
  product,
  addItem,
  isInCart,
}: {
  product: Product;
  addItem: (item: cartItem) => void;
  isInCart: (id: number, colour?: string) => boolean;
}) {
  const colours =
    Array.isArray(product.colours) && product.colours.length > 0
      ? product.colours.map((c: any) => (typeof c === "string" ? c : c.name))
      : [];

  const [selectedColour, setSelectedColour] = useState<string>(
    colours[0] || ""
  );

  const handleAddToCart = () => {
    const item: cartItem = {
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      colour: selectedColour || null,
    };
    addItem(item);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col"
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col flex-1">
        <div className="relative w-full h-48">
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
          <p
            className={`text-sm ${
              product.stock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </p>

          {colours.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {colours.map((colour) => (
                <button
                  key={colour}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedColour(colour);
                  }}
                  className={`px-2 py-1 text-xs rounded-md border transition ${
                    selectedColour === colour
                      ? "bg-[#14485A] text-white border-[#14485A]"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {colour}
                </button>
              ))}
            </div>
          )}
        </div>
      </Link>

      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className={`mt-auto w-full py-2 px-4 rounded-lg font-semibold transition ${
          product.stock > 0
            ? "bg-[#14485A] text-white hover:bg-[#0e2f3d]"
            : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isInCart(product.id, selectedColour) ? "Add More" : "Add to Basket"}
      </button>
    </motion.div>
  );
}
