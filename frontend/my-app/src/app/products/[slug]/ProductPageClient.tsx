"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/store/useCart";
import { useProductBySlug } from "@/hooks/useProductsBySlug";
import { getImageUrl } from "@/library/getImageUrl";

type Props = { slug: string };

export default function ProductPageClient({ slug }: Props) {
  const { data: product, isLoading, isError } = useProductBySlug(slug);
  const addItem = useCart((s) => s.addItem);

  // Quantity is independent of product fetch state
  const [quantity, setQuantity] = useState<number>(1);

  // ✅ Normalize colours safely after data arrives
  const colours: string[] = useMemo(() => {
    const raw = product?.colours ?? [];
    return Array.isArray(raw)
      ? raw
          .map((c: any) => (typeof c === "string" ? c : c?.name))
          .filter(Boolean)
      : [];
  }, [product]);

  // ✅ Selected colour: start empty, then set first when colours available
  const [selectedColour, setSelectedColour] = useState<string>("");

  useEffect(() => {
    if (!selectedColour && colours.length > 0) {
      setSelectedColour(colours[0]);
    }
  }, [colours, selectedColour]);

  if (isLoading) return <p>Loading product...</p>;
  if (isError || !product) return <p>Product not found.</p>;

  const numericPrice =
    typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.name, // keep raw title; show colour in UI
      price: numericPrice,
      quantity,
      image: product.image,
      colour: selectedColour || null,
    });
  };

  const maxQty = Math.min(Math.max(product.stock ?? 0, 0), 10);

  return (
    <div className="min-h-screen max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Mobile title */}
      <h1 className="text-2xl font-bold text-center md:hidden">
        {product.name}
      </h1>

      {/* Left: Image */}
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

      {/* Middle: Info */}
      <div className="md:col-span-4 space-y-4">
        <h1 className="text-3xl font-bold hidden md:block">{product.name}</h1>
        <p className="text-[#E01D42] text-2xl font-semibold">£{numericPrice}</p>
        {product.description && (
          <p className="text-gray-700">{product.description}</p>
        )}

        {/* Colours */}
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
            (product.stock ?? 0) > 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          {(product.stock ?? 0) > 0
            ? `In Stock — ${product.stock} available`
            : "Out of Stock"}
        </p>
      </div>

      {/* Mobile buy controls */}
      <div className="block md:hidden space-y-4">
        <QuantitySelect
          id="quantity-mobile"
          maxQty={maxQty}
          value={quantity}
          onChange={setQuantity}
        />
        <AddToCartButton
          disabled={(product.stock ?? 0) === 0}
          onClick={handleAddToCart}
        />
      </div>

      {/* Right: Buy box */}
      <div className="hidden md:block md:col-span-3">
        <div className="border rounded-lg shadow-md p-4 space-y-4">
          <p className="text-2xl font-bold text-[#E01D42]">£{numericPrice}</p>
          <QuantitySelect
            id="quantity"
            maxQty={maxQty}
            value={quantity}
            onChange={setQuantity}
          />
          <AddToCartButton
            disabled={(product.stock ?? 0) === 0}
            onClick={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
}

/* ----------------- small subcomponents (no hooks) ----------------- */

function QuantitySelect({
  id,
  maxQty,
  value,
  onChange,
}: {
  id: string;
  maxQty: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Quantity
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border rounded-md p-2"
      >
        {Array.from({ length: Math.max(maxQty, 0) }, (_, i) => i + 1).map(
          (num) => (
            <option key={num} value={num}>
              {num}
            </option>
          )
        )}
      </select>
    </div>
  );
}

function AddToCartButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
        !disabled
          ? "bg-[#14485A] text-white hover:bg-[#0e2f3d]"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
    >
      Add to Basket
    </button>
  );
}
