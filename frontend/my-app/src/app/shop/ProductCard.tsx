import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { cartItem } from "@/types/cart";
import { getImageUrl } from "@/library/getImageUrl";
import type { Product, ProductVariant } from "@/types/product";

export function ProductCard({
  product,
  addItem,
  updateQuantity,
  getItemCount,
  isInCart,
}: {
  product: Product;
  addItem: (item: cartItem) => void;
  updateQuantity: (id: number, colour: string | null, quantity: number) => void;
  getItemCount: (id: number, colour?: string | null) => number;
  isInCart: (id: number, colour?: string | null) => boolean;
}) {
  const variants: ProductVariant[] = product.variants ?? [];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  const [qty, setQty] = useState(0);

  useEffect(() => {
    if (!selectedVariant && variants.length > 0) {
      const available = variants.find((v) => v.stock > 0) || variants[0];
      setSelectedVariant(available);
    }
  }, [variants, selectedVariant]);

  const colour = selectedVariant?.colour ?? null;

  // sync local qty with cart whenever variant or cart changes
  useEffect(() => {
    const cartQty = getItemCount(product.id, colour) || 0;
    setQty(cartQty);
  }, [product.id, colour, getItemCount]);

  const isOutOfStock =
    selectedVariant?.stock === 0 ||
    (variants.length === 0 && (product.stock ?? 0) === 0);

  const maxStock =
    selectedVariant?.stock ?? product.stock ?? Number.POSITIVE_INFINITY;

  // Normalise colours for comparison
  const selectedColour = selectedVariant?.colour?.toLowerCase().trim() ?? null;

  const variantImage = useMemo(() => {
    if (!selectedColour || !product.images?.length) return null;

    return (
      product.images.find((img) => {
        if (!img.colour) return false;
        return img.colour.toLowerCase().trim() === selectedColour;
      }) || null
    );
  }, [product.images, selectedColour]);

  const displayImage =
    variantImage?.image ||
    product.image || // main / default image from backend
    product.images?.[0]?.image || // fallback to first gallery image
    "/placeholder.png";

  const handleIncrement = () => {
    if (isOutOfStock) return;
    if (qty >= maxStock) return;

    const newQty = qty + 1;

    if (qty === 0) {
      // first add – use addItem so you keep your "Added X to cart" toast
      const item: cartItem = {
        id: product.id,
        title: product.name,
        price: Number(product.price),
        image: displayImage,
        quantity: 1,
        colour,
      };
      addItem(item);
    } else {
      updateQuantity(product.id, colour, newQty);
    }

    setQty(newQty);
  };

  const handleDecrement = () => {
    if (qty <= 0) return;

    if (qty <= 1) {
      // bin behaviour – go back to 0
      updateQuantity(product.id, colour, 0); // your store removes item & toasts
      setQty(0);
    } else {
      const newQty = qty - 1;
      updateQuantity(product.id, colour, newQty);
      setQty(newQty);
    }
  };

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
            src={getImageUrl(displayImage)}
            alt={product.name}
            fill
            className="object-cover w-full h-[224px]"
            sizes="64px"
          />

          {/* Deliveroo-style controls over image */}
          {!isOutOfStock && (
            <div className="absolute bottom-2 right-2">
              {qty === 0 ? (
                // just plus when nothing in cart
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleIncrement();
                  }}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-[#14485A] text-white text-xl shadow-md hover:bg-[#0e2f3d] transition"
                  aria-label="Add to basket"
                >
                  +
                </button>
              ) : (
                // qty pill when something in cart
                <div className="flex items-center gap-2 bg-white/95 dark:bg-gray-900/95 rounded-full shadow-md px-2 py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDecrement();
                    }}
                    className={`flex items-center justify-center w-7 h-7 rounded-full border text-sm font-bold transition ${
                      qty === 1
                        ? "border-[#E01D42] text-[#E01D42] hover:bg-[#E01D42] hover:text-white"
                        : "border-[#14485A] text-[#14485A] hover:bg-[#14485A] hover:text-white"
                    }`}
                    aria-label={
                      qty === 1 ? "Remove from basket" : "Decrease quantity"
                    }
                  >
                    {qty === 1 ? "🗑" : "−"}
                  </button>

                  <span className="min-w-[1.5rem] text-center text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {qty}
                  </span>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleIncrement();
                    }}
                    className="flex items-center justify-center w-7 h-7 rounded-full border border-[#14485A] text-[#14485A] text-sm font-bold hover:bg-[#14485A] hover:text-white transition disabled:opacity-40"
                    aria-label="Increase quantity"
                    disabled={qty >= maxStock}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          )}
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
                  } ${
                    variant.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {variant.colour}
                </button>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
