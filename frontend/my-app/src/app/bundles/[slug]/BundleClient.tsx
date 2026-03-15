"use client";

import { useState } from "react";
import { useCart } from "@/store/useCart";
import { useBundleBySlug } from "@/hooks/useBundleBySlug";
import Breadcrumbs from "@/components/BreadCrumb";

import BundleGallery from "./BundleGallery";
import BundleInfo from "./BundleInfo";
import BundleOptions from "./BundleOptions";
import BundleBuyBox from "./BundleBuyBox";
import { getUnitsPerKit } from "@/app/utils/bundle-units";
import { buildOptionMeta } from "@/app/utils/buildOptionMeta";

export default function BundlePageClient({ slug }: { slug: string }) {
  const { data: bundle, isLoading, isError } = useBundleBySlug(slug);

  const addItem = useCart((s) => s.addItem);

  const [quantity, setQuantity] = useState(1);
  const [optionQuantities, setOptionQuantities] = useState<
    Record<number, Record<number, number>>
  >({});

  if (isLoading) return <p>Loading bundle...</p>;
  if (isError || !bundle) return <p>Bundle not found.</p>;

  const maxQty = Math.min(bundle.max_available, 10);

  const handleAdd = () => {
    const formattedOptions: Record<
      string,
      { label: string; quantity: number }[]
    > = {};

    (bundle.options ?? []).forEach((opt: any) => {
      const values = optionQuantities[opt.id] || {};

      formattedOptions[opt.name] = Object.entries(values).map(
        ([valueId, qty]) => {
          const optionValue = opt.values.find(
            (v: any) => v.id === Number(valueId),
          );

          return {
            label: optionValue?.label || "Unknown",
            quantity: qty as number,
          };
        },
      );
    });

    addItem({
      type: "bundle",
      id: bundle.id,
      title: bundle.name,
      price: Number(bundle.price),
      image: bundle.image ?? undefined,
      quantity,
      option_values: optionQuantities,
      option_meta: bundle.options ? buildOptionMeta(bundle.options) : undefined,
    });
  };

  const selectionsComplete =
    bundle.options?.every((opt: any) => {
      const units = getUnitsPerKit(bundle, opt) * quantity;

      const selected = Object.values(optionQuantities[opt.id] || {}).reduce(
        (a: number, b: number) => a + b,
        0,
      );

      return selected === units;
    }) ?? true;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: bundle.name },
        ]}
      />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-6">
        {/* LEFT: Gallery */}
        <div className="md:col-span-6">
          <BundleGallery bundle={bundle} />
        </div>

        {/* RIGHT: Info + Buy Box */}
        <div className="md:col-span-6 space-y-6">
          <BundleInfo bundle={bundle} />

          <BundleBuyBox
            bundle={bundle}
            quantity={quantity}
            setQuantity={setQuantity}
            maxQty={maxQty}
            onAdd={handleAdd}
            selectionsComplete={selectionsComplete}
          />
        </div>
      </div>

      {/* OPTIONS SECTION BELOW */}
      <div className="mt-10">
        <BundleOptions
          bundle={bundle}
          quantity={quantity}
          optionQuantities={optionQuantities}
          setOptionQuantities={setOptionQuantities}
        />
      </div>
    </div>
  );
}
