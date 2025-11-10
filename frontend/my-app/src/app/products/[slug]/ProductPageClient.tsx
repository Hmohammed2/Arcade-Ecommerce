"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/store/useCart";
import { useProductBySlug } from "@/hooks/useProductsBySlug";
import { getImageUrl } from "@/library/getImageUrl";
import { ZoomModal } from "@/components/ZoomModal";
import { ProductVariant } from "@/types/product";

type Props = { slug: string };

export default function ProductPageClient({ slug }: Props) {
  const { data: product, isLoading, isError } = useProductBySlug(slug);
  const addItem = useCart((s) => s.addItem);
  const [quantity, setQuantity] = useState<number>(1);

  // 🧩 Variants
  const variants: ProductVariant[] = product?.variants ?? [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  useEffect(() => {
    if (!selectedVariant && variants.length > 0) {
      const firstAvailable = variants.find((v) => v.stock > 0) || variants[0];
      setSelectedVariant(firstAvailable);
    }
  }, [variants, selectedVariant]);

  // 🧩 Features
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

  // 🧩 Product images
  const images = [
    product?.image,
    ...(product?.images?.map((img: any) => img.image) || []),
  ].filter(Boolean);

  const [selectedImage, setSelectedImage] = useState(images[0] ?? "");

  // Auto-update main image if variant has its own image field (optional)
  useEffect(() => {
    if (selectedVariant && (selectedVariant as any).image) {
      setSelectedImage((selectedVariant as any).image);
    }
  }, [selectedVariant]);

  if (isLoading)
    return (
      <p className="text-gray-800 dark:text-gray-200 transition-colors duration-300">
        Loading product...
      </p>
    );
  if (isError || !product)
    return (
      <p className="text-gray-800 dark:text-gray-200 transition-colors duration-300">
        Product not found.
      </p>
    );

  const numericPrice =
    typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price;

  // 🧩 Add to cart
  const handleAddToCart = () => {
    if (selectedVariant && selectedVariant.stock === 0) return;

    addItem({
      id: product.id,
      title: product.name,
      price: numericPrice,
      quantity,
      image: product.image,
      colour: selectedVariant ? selectedVariant.colour : null,
    });
  };

  // 🧩 Max quantity per variant
  const maxQty = selectedVariant
    ? Math.min(selectedVariant.stock, 10)
    : Math.min(product.stock ?? 0, 10);

  return (
    <div className="min-h-screen max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Mobile title */}
      <h1 className="text-2xl font-bold text-center md:hidden">
        {product.name}
      </h1>

      {/* Left: Image */}
      <div className="md:col-span-5 flex justify-center items-start">
        <div
          className={`relative w-full max-w-md ${
            images.length > 1 ? "h-[500px]" : "h-[400px]"
          } border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden flex items-start justify-center bg-gray-50 dark:bg-gray-800`}
        >
          <div className="w-full flex flex-col justify-start items-center">
            <div className="relative w-full max-w-md h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden bg-gray-50 dark:bg-gray-800">
              <ZoomModal
                src={getImageUrl(selectedImage)}
                alt={product.name}
                trigger={(open) => (
                  <button
                    type="button"
                    onClick={open}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={getImageUrl(selectedImage)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                      priority
                    />
                    <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
                      Tap to zoom
                    </span>
                  </button>
                )}
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-2 pt-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 border rounded-md overflow-hidden flex-shrink-0 ${
                      selectedImage === img
                        ? "border-[#14485A] ring-2 ring-[#14485A]"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <Image
                      src={getImageUrl(img)}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Info */}
      <div className="md:col-span-4 space-y-4">
        <h1 className="text-3xl font-bold hidden md:block">{product.name}</h1>
        <p className="text-[#E01D42] text-2xl font-semibold">£{numericPrice}</p>

        {product.description && (
          <p className="text-gray-700 dark:text-gray-300">
            {product.description}
          </p>
        )}

        {/* Variant selection */}
        {variants.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Available Colours</h3>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  disabled={variant.stock === 0}
                  className={`px-3 py-1 rounded-md border text-sm transition ${
                    selectedVariant?.id === variant.id
                      ? "bg-[#14485A] text-white border-[#14485A]"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  } ${variant.stock === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                >
                  {variant.colour}{" "}
                  {variant.stock === 0 && (
                    <span className="text-xs text-red-500">(Out of stock)</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock message */}
        <p
          className={`text-sm font-medium ${
            selectedVariant
              ? selectedVariant.stock > 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-500 dark:text-red-400"
              : (product.stock ?? 0) > 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-500 dark:text-red-400"
          }`}
        >
          {selectedVariant
            ? selectedVariant.stock > 0
              ? `In Stock — ${selectedVariant.stock} available`
              : "Out of Stock"
            : (product.stock ?? 0) > 0
              ? `In Stock — ${product.stock} available`
              : "Out of Stock"}
        </p>
      </div>

      {/* Right: Buy Box */}
      <div className="hidden md:block md:col-span-3">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4 space-y-4 bg-white dark:bg-gray-800 transition-colors duration-300">
          <p className="text-2xl font-bold text-[#E01D42]">£{numericPrice}</p>
          <QuantitySelect
            id="quantity"
            maxQty={maxQty}
            value={quantity}
            onChange={setQuantity}
          />
          <AddToCartButton
            disabled={
              (selectedVariant && selectedVariant.stock === 0) ||
              (!selectedVariant && (product.stock ?? 0) === 0)
            }
            onClick={handleAddToCart}
          />
        </div>
      </div>

      {/* Overview & Specs */}
      {(product.overview || featureList.length > 0) && (
        <section className="md:col-span-12 space-y-4">
          {product.overview && (
            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 transition-colors duration-300">
              <summary className="flex items-center justify-between cursor-pointer list-none p-4">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Overview
                </span>
                <svg
                  className="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform group-open:rotate-180"
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
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {product.overview}
                </p>
              </div>
            </details>
          )}

          {featureList.length > 0 && (
            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 transition-colors duration-300">
              <summary className="flex items-center justify-between cursor-pointer list-none p-4">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Specifications
                </span>
                <svg
                  className="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform group-open:rotate-180"
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

              <dl className="px-4 pb-4 divide-y divide-gray-100 dark:divide-gray-700">
                {featureList.map((f, i) => (
                  <div key={i} className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">
                      {f.label}
                    </dt>
                    <dd className="col-span-2 text-sm text-gray-900 dark:text-gray-200">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </section>
      )}
    </div>
  );
}

/* ----------------- small subcomponents ----------------- */

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
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Quantity
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-colors"
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
          : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
      }`}
    >
      Add to Basket
    </button>
  );
}
