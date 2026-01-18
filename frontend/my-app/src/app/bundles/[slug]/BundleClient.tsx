"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/store/useCart";
import { useBundleBySlug } from "@/hooks/useBundleBySlug";
import { getImageUrl } from "@/library/getImageUrl";
import Breadcrumbs from "@/components/BreadCrumb";

export default function BundlePageClient({ slug }: { slug: string }) {
  const { data: bundle, isLoading, isError } = useBundleBySlug(slug);
  const [optionQuantities, setOptionQuantities] = useState<
    Record<number, Record<number, number>>
  >({});
  const addItem = useCart((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) return <p>Loading bundle...</p>;
  if (isError || !bundle)
    return (
      <p className="text-gray-800 dark:text-gray-200">Bundle not found.</p>
    );

  const maxQty = Math.min(bundle.max_available, 10);

  // ---- How many units per kit for this option ----
  // ✅ Correct: derive units-per-kit from "Includes" list
  const getUnitsPerKit = (optionId: number) => {
    const opt = bundle.options?.find((o: any) => o.id === optionId);
    if (!opt) return 0;

    // Look at the FIRST value to find which product this option relates to
    const sampleValue = opt.values?.[0];

    if (!sampleValue?.variant_id) {
      // This means the option is NOT tied to a variant → match by product name
      const match = bundle.items?.find((i: any) =>
        i.product.name.toLowerCase().includes(opt.name.toLowerCase())
      );
      return match?.quantity ?? 0;
    }

    // Otherwise find the product that owns this variant
    const match = bundle.items?.find(
      (i: any) =>
        i.product.id ===
        bundle.options
          ?.flatMap((o: any) => o.values)
          .find((v: any) => v.variant_id === sampleValue.variant_id)?.variant
          ?.product_id
    );

    return match?.quantity ?? 0;
  };

  // ---- How many user selected for an option ----
  const getSelectedTotalForOption = (optionId: number) => {
    const values = optionQuantities[optionId] || {};
    return Object.values(values).reduce((a: number, b: number) => a + b, 0);
  };

  // ---- Max allowed based on kit quantity ----
  const getMaxForOption = (optionId: number) => {
    return getUnitsPerKit(optionId) * quantity;
  };

  // ---- Update option qty with hard cap ----
  const updateQty = (optionId: number, valueId: number, newQty: number) => {
    const maxAllowed = getMaxForOption(optionId);
    const currentTotal = getSelectedTotalForOption(optionId);

    const remaining =
      maxAllowed - currentTotal + (optionQuantities[optionId]?.[valueId] || 0);

    const safeQty = Math.min(Math.max(newQty, 0), remaining);

    setOptionQuantities((prev) => {
      const copy = { ...prev };

      if (!copy[optionId]) copy[optionId] = {};

      if (safeQty <= 0) {
        delete copy[optionId][valueId];
        if (Object.keys(copy[optionId]).length === 0) {
          delete copy[optionId];
        }
      } else {
        copy[optionId][valueId] = safeQty;
      }

      return copy;
    });
  };

  // ---- Validation: must exactly match kit requirement ----
  const allValid = bundle.options?.every((opt: any) => {
    const total = getSelectedTotalForOption(opt.id);
    const max = getMaxForOption(opt.id);
    return total === max;
  });

  const handleAdd = () => {
    addItem({
      type: "bundle",
      id: bundle.id,
      title: bundle.name,
      price: Number(bundle.price),
      image: bundle.image ?? undefined,
      quantity,
      option_values: optionQuantities,
      option_meta: bundle.options?.map((opt: any) => ({
        option_id: opt.id,
        product_name: opt.product?.name ?? opt.name,
        values: opt.values.reduce((acc: any, v: any) => {
          acc[v.id] = {
            label: v.label,
            hex: v.colour_hex,
          };
          return acc;
        }, {}),
      })),
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

      <h1 className="text-2xl font-bold text-center md:hidden">
        {bundle.name}
      </h1>

      {/* IMAGE */}
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

      {/* MIDDLE INFO */}
      <div className="md:col-span-4 space-y-4">
        <h1 className="text-3xl font-bold hidden md:block">{bundle.name}</h1>

        <p className="text-[#E01D42] text-2xl font-semibold">£{bundle.price}</p>

        <p className={bundle.is_in_stock ? "text-green-600" : "text-red-500"}>
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

        {/* DESKTOP OPTIONS */}
        <div className="hidden md:block">
          {bundle.options?.map((opt) => {
            const selected = getSelectedTotalForOption(opt.id);
            const max = getMaxForOption(opt.id);
            const remaining = max - selected;

            console.log("Remaing for option", opt.id, remaining, selected, max);

            return (
              <div key={opt.id} className="space-y-2 border-t pt-3">
                <p className="text-sm font-semibold">{opt.name}</p>

                <p className="text-xs text-gray-500">
                  Select <b>{max}</b> total •{" "}
                  <span
                    className={
                      remaining === 0
                        ? "text-green-600 font-medium"
                        : "text-[#E01D42] font-medium"
                    }
                  >
                    {remaining} remaining
                  </span>
                </p>

                {opt.values.map((v: any) => {
                  const qty = optionQuantities[opt.id]?.[v.id] || 0;

                  return (
                    <div key={v.id} className="flex items-center gap-3 mb-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{
                          backgroundColor: v.colour_hex,
                        }}
                      />

                      <span className="text-sm flex-1">{v.label}</span>

                      <input
                        type="number"
                        min={0}
                        className="w-16 border rounded p-1 text-center"
                        value={qty}
                        onChange={(e) =>
                          updateQty(opt.id, v.id, Number(e.target.value))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* MOBILE OPTIONS */}
      <div className="md:hidden border-t pt-4 space-y-4">
        <h3 className="text-sm font-semibold">Customise your colours</h3>

        {bundle.options?.map((opt: any) => {
          const selected = getSelectedTotalForOption(opt.id);
          const max = getMaxForOption(opt.id);
          const remaining = max - selected;

          return (
            <div key={opt.id} className="space-y-2">
              <p className="text-sm font-semibold">{opt.name}</p>

              <p className="text-xs text-gray-500">
                Select <b>{max}</b> total •{" "}
                <span
                  className={
                    remaining === 0
                      ? "text-green-600 font-medium"
                      : "text-[#E01D42] font-medium"
                  }
                >
                  {remaining} remaining
                </span>
              </p>

              {opt.values.map((v: any) => {
                const currentQty = optionQuantities[opt.id]?.[v.id] || 0;

                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-md"
                  >
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{
                        backgroundColor: v.colour_hex,
                      }}
                    />

                    <span className="text-sm flex-1">{v.label}</span>

                    <input
                      type="number"
                      min={0}
                      className="w-16 border rounded p-1 text-center"
                      value={currentQty}
                      onChange={(e) =>
                        updateQty(opt.id, v.id, Number(e.target.value))
                      }
                    />
                  </div>
                );
              })}
            </div>
          );
        })}

        <QuantitySelect
          maxQty={maxQty}
          value={quantity}
          onChange={(q: number) => {
            setQuantity(q);
            setOptionQuantities({}); // 🔥 RESET OPTIONS WHEN KIT QTY CHANGES
          }}
        />

        <AddToCartButton
          disabled={!bundle.is_in_stock || !allValid}
          onClick={handleAdd}
        />
      </div>

      {/* DESKTOP BUY BOX */}
      <div className="hidden md:block md:col-span-3">
        <div className="border rounded-lg p-4 space-y-4 bg-white dark:bg-gray-800">
          <p className="text-2xl font-bold text-[#E01D42]">£{bundle.price}</p>

          <QuantitySelect
            maxQty={maxQty}
            value={quantity}
            onChange={(q: number) => {
              setQuantity(q);
              setOptionQuantities({});
            }}
          />

          <AddToCartButton
            disabled={!bundle.is_in_stock || !allValid}
            onClick={handleAdd}
          />
        </div>
      </div>

      {/* DETAILS DROPDOWN */}
      <div className="md:col-span-12 mt-6">
        <details className="group border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
          <summary className="flex items-center justify-between cursor-pointer list-none p-4">
            <span className="text-lg font-semibold">Bundle Details</span>
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
            <p className="whitespace-pre-line">{bundle.description}</p>
          </div>
        </details>
      </div>
    </div>
  );
}

function QuantitySelect({ maxQty, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Quantity</label>
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
