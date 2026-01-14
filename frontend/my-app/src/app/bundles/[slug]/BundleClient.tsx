"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/store/useCart";
import { useBundleBySlug } from "@/hooks/useBundleBySlug";
import { getImageUrl } from "@/library/getImageUrl";
import Breadcrumbs from "@/components/BreadCrumb";

export default function BundlePageClient({ slug }: { slug: string }) {
  const { data: bundle, isLoading, isError } = useBundleBySlug(slug);
  const addItem = useCart((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) return <p>Loading bundle...</p>;
  if (isError || !bundle)
    return (
      <p className="text-gray-800 dark:text-gray-200 transition-colors duration-300">
        Bundle not found.
      </p>
    );

  const maxQty = Math.min(bundle.max_available, 10);

  const handleAdd = () => {
    addItem({
      type: "bundle",
      id: bundle.id,
      title: bundle.name,
      price: Number(bundle.price),
      image: bundle.image ?? undefined,
      quantity,
    });
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: bundle.name },
          ]}
        />
      </div>

      {/* Mobile title */}
      <h1 className="text-2xl font-bold text-center md:hidden">
        {bundle.name}
      </h1>

      {/* LEFT: Image */}
      <div className="md:col-span-5">
        <div className="relative w-full aspect-square border rounded-lg bg-gray-50 dark:bg-gray-800">
          <Image
            src={getImageUrl(bundle.image)}
            alt={bundle.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      </div>

      {/* MIDDLE: Info */}
      <div className="md:col-span-4 space-y-4">
        <h1 className="text-3xl font-bold hidden md:block">{bundle.name}</h1>
        <p className="text-[#E01D42] text-2xl font-semibold">£{bundle.price}</p>
        <p
          className={`text-sm ${
            bundle.is_in_stock ? "text-green-600" : "text-red-500"
          }`}
        >
          {bundle.is_in_stock
            ? `In Stock — ${bundle.max_available} kits available`
            : "Out of Stock"}
        </p>

        <div>
          <h3 className="text-sm font-semibold mb-2">Includes:</h3>
          <ul className="list-disc ml-5 text-sm space-y-1">
            {bundle.items?.map((i) => (
              <li key={i.product.id}>
                {i.quantity} × {i.product.name}
              </li>
            ))}
          </ul>
        </div>
        <p>{bundle.description}</p>
      </div>

      {/* Mobile Add to Cart section */}
      <div className="md:hidden mt-2 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
        <QuantitySelect
          id="quantity-mobile"
          maxQty={maxQty}
          value={quantity}
          onChange={setQuantity}
        />
        <AddToCartButton disabled={!bundle.is_in_stock} onClick={handleAdd} />
      </div>

      {/* BUY BOX */}
      <div className="hidden md:block md:col-span-3">
        <div className="border rounded-lg p-4 space-y-4 bg-white dark:bg-gray-800">
          <p className="text-2xl font-bold text-[#E01D42]">£{bundle.price}</p>
          <QuantitySelect
            maxQty={maxQty}
            value={quantity}
            onChange={setQuantity}
          />
          <AddToCartButton disabled={!bundle.is_in_stock} onClick={handleAdd} />
        </div>
      </div>
    </div>
  );
}

function QuantitySelect({ maxQty, value, onChange }: any) {
  return (
    <div>
      <label
        htmlFor="quantity"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Quantity
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border rounded-md p-2"
      >
        {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}

function AddToCartButton({ disabled, onClick }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded-lg ${
        disabled ? "bg-gray-300" : "bg-[#14485A] text-white hover:bg-[#0e2f3d]"
      }`}
    >
      Add Kit to Basket
    </button>
  );
}
