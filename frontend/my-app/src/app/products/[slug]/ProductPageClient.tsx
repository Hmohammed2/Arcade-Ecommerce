"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/store/useCart";
import { useProductBySlug } from "@/hooks/useProductsBySlug";
import { getImageUrl } from "@/library/getImageUrl";
import { ZoomModal } from "@/components/ZoomModal";

type Props = { slug: string };

export default function ProductPageClient({ slug }: Props) {
  const { data: product, isLoading, isError } = useProductBySlug(slug);
  const addItem = useCart((s) => s.addItem);

  const [quantity, setQuantity] = useState<number>(1);

  const colours: string[] = useMemo(() => {
    const raw = product?.colours ?? [];
    return Array.isArray(raw)
      ? raw
          .map((c: any) => (typeof c === "string" ? c : c?.name))
          .filter(Boolean)
      : [];
  }, [product]);

  const featureList = useMemo(() => {
    const raw = product?.features ?? [];
    if (!Array.isArray(raw)) return [];
    return raw
      .map((f: any) =>
        typeof f === "string"
          ? { label: f }
          : { label: f?.label, value: f?.value }
      )
      .filter((f) => !!f.label);
  }, [product]);

  const [selectedColour, setSelectedColour] = useState<string>("");

  useEffect(() => {
    if (!selectedColour && colours.length > 0) setSelectedColour(colours[0]);
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
      title: product.name,
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
          <ZoomModal
            src={getImageUrl(product.image)}
            alt={product.name}
            trigger={(open) => (
              <button
                type="button"
                onClick={open}
                className="relative w-full max-w-md h-[400px] border rounded-lg shadow-sm overflow-hidden"
              >
                <Image
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
                <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
                  Tap to zoom
                </span>
              </button>
            )}
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

      {/* Full-width Overview & Specs */}
      {(product.overview || featureList.length > 0) && (
        <section className="md:col-span-12 space-y-4">
          {product.overview && (
            <details className="group border rounded-lg shadow-sm bg-white">
              <summary className="flex items-center justify-between cursor-pointer list-none p-4">
                <span className="text-lg font-semibold text-gray-900">
                  Overview
                </span>
                {/* optional icon rotation */}
                <svg
                  className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.207l3.71-3.976a.75.75 0 111.08 1.04l-4.243 4.54a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>
              <div className="px-4 pb-4 pt-0">
                <p className="text-gray-700 whitespace-pre-line">
                  {product.overview}
                </p>
              </div>
            </details>
          )}

          {featureList.length > 0 && (
            <details className="group border rounded-lg shadow-sm bg-white">
              <summary className="flex items-center justify-between cursor-pointer list-none p-4">
                <span className="text-lg font-semibold text-gray-900">
                  Specifications
                </span>
                <svg
                  className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.207l3.71-3.976a.75.75 0 111.08 1.04l-4.243 4.54a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>

              {/* list style #1: definition list (spec sheet) */}
              <dl className="px-4 pb-4 divide-y divide-gray-100">
                {featureList.map((f, i) => (
                  <div key={i} className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm text-gray-500">{f.label}</dt>
                    <dd className="col-span-2 text-sm text-gray-900">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* or list style #2: bullets
        <ul className="px-4 pb-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {featureList.map((f, i) => (
            <li key={i} className="text-sm text-gray-800">{f.label}{f.value ? ` — ${f.value}` : ""}</li>
          ))}
        </ul> */}
            </details>
          )}
        </section>
      )}
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
