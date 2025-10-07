"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/store/useCart";
import { useProductBySlug } from "@/hooks/useProductsBySlug";
import { getImageUrl } from "@/library/getImageUrl";

export default function ProductPageClient({ slug }: { slug: string }) {
  const { data: product, isLoading, isError } = useProductBySlug(slug);
  const addItem = useCart((state) => state.addItem);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedColour, setSelectedColour] = useState<string>("");

  if (isLoading) return <p>Loading product...</p>;
  if (isError || !product) return <p>Product not found.</p>;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: `${product.name}${selectedColour ? ` (${selectedColour})` : ""}`,
      price: product.price, // DRF returns string → ensure number
      quantity,
      image: product.image,
    });
  };

  // Normalise colours (string[] | {id, name}[])
  const colours: string[] = (product.colours || []).map((c: any) =>
    typeof c === "string" ? c : c.name
  );

  return (
    <div className="min-h-screen max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
      <h1 className="text-2xl font-bold text-center md:hidden">
        {product.name}
      </h1>
      {/* Left: Product Image */}
      <div className="md:col-span-5 flex justify-center items-start">
        <div className="relative w-full max-w-md h-[400px] border rounded-lg shadow-sm overflow-hidden flex items-center justify-center">
          <Image
            src={getImageUrl(product.image)}
            alt={product.name}
            width={300}
            height={400}
            className="object-contain"
          />
        </div>
      </div>

      {/* Middle: Product Info */}
      <div className="md:col-span-4 space-y-4">
        <h1 className="text-3xl font-bold hidden md:block">{product.name}</h1>
        <p className="text-[#E01D42] text-2xl font-semibold">
          £{product.price}
        </p>
        <p className="text-gray-700">{product.description}</p>
        {/* Colours Section */}
        {colours.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Available Colours
            </h3>
            <div className="flex gap-2 flex-wrap">
              {colours.map((colour) => (
                <button
                  key={colour}
                  onClick={() => setSelectedColour(colour)}
                  className={`px-3 py-1 rounded-md border text-sm transition ${
                    selectedColour === colour
                      ? "bg-[#14485A] text-white border-[#14485A]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {colour}
                </button>
              ))}
            </div>
          </div>
        )}

        <p
          className={`text-sm font-medium ${
            product.stock >= 1 ? "text-green-600" : "text-red-500"
          }`}
        >
          {product.stock >= 1
            ? `In Stock — ${product.stock} available`
            : "Out of Stock"}
        </p>
      </div>

      {/* Mobile Buy Controls */}
      <div className="block md:hidden space-y-4">
        {/* Quantity Selector */}
        <div>
          <label
            htmlFor="quantity-mobile"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quantity
          </label>
          <select
            id="quantity-mobile"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full border rounded-md p-2"
          >
            {Array.from(
              { length: Math.min(product.stock, 10) },
              (_, i) => i + 1
            ).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
            product.stock >= 1
              ? "bg-[#14485A] text-white hover:bg-[#0e2f3d]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Add to Basket
        </button>
      </div>

      {/* Right: Buy Box */}
      <div className="hidden md:block md:col-span-3">
        <div className="border rounded-lg shadow-md p-4 space-y-4">
          <p className="text-2xl font-bold text-[#E01D42]">£{product.price}</p>

          {/* Quantity Selector */}
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Quantity
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border rounded-md p-2"
            >
              {Array.from(
                { length: Math.min(product.stock, 10) },
                (_, i) => i + 1
              ).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
              product.stock >= 1
                ? "bg-[#14485A] text-white hover:bg-[#0e2f3d]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Add to Basket
          </button>
        </div>
      </div>
    </div>
  );
}
