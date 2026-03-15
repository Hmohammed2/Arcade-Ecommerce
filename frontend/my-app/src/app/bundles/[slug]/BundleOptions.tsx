"use client";

import { getUnitsPerKit } from "@/app/utils/bundle-units";

type Props = {
  bundle: any;
  quantity: number;
  optionQuantities: Record<number, Record<number, number>>;
  setOptionQuantities: React.Dispatch<
    React.SetStateAction<Record<number, Record<number, number>>>
  >;
};

export default function BundleOptions({
  bundle,
  quantity,
  optionQuantities,
  setOptionQuantities,
}: Props) {
  const getSelectedTotal = (optionId: number) => {
    const values = optionQuantities[optionId] || {};
    return Object.values(values).reduce((a, b) => a + b, 0);
  };

  const incrementColour = (optionId: number, valueId: number, max: number) => {
    setOptionQuantities((prev) => {
      const option = prev[optionId] || {};
      const current = option[valueId] || 0;

      const total = Object.values(option).reduce((a, b) => a + b, 0);

      if (total >= max) return prev;

      return {
        ...prev,
        [optionId]: {
          ...option,
          [valueId]: current + 1,
        },
      };
    });
  };

  const decrementColour = (optionId: number, valueId: number) => {
    setOptionQuantities((prev) => {
      const option = prev[optionId] || {};
      const current = option[valueId] || 0;

      if (current <= 1) {
        const copy = { ...option };
        delete copy[valueId];

        return { ...prev, [optionId]: copy };
      }

      return {
        ...prev,
        [optionId]: {
          ...option,
          [valueId]: current - 1,
        },
      };
    });
  };

  return (
    <div className="space-y-8">
      {bundle.options?.map((opt: any) => {
        const unitsPerKit = getUnitsPerKit(bundle, opt);
        const units = unitsPerKit * quantity;

        const selected = getSelectedTotal(opt.id);
        const remaining = Math.max(units - selected, 0);

        return (
          <div key={opt.id} className="border-t pt-6">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold text-sm">{opt.name}</h3>

              <span
                className={`text-xs font-medium ${
                  remaining === 0 ? "text-green-600" : "text-[#E01D42]"
                }`}
              >
                {remaining} remaining
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Tap a colour swatch to add it to your kit. Use + / − to adjust
              quantities.
            </p>

            <div className="flex flex-wrap gap-4">
              {opt.values.map((v: any) => {
                const qty = optionQuantities[opt.id]?.[v.id] ?? 0;

                return (
                  <div key={v.id} className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => incrementColour(opt.id, v.id, units)}
                      className={`relative w-12 h-12 md:w-10 md:h-10 rounded-full border-2 ${
                        qty > 0
                          ? "border-[#14485A] ring-2 ring-[#14485A]"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      style={{ backgroundColor: v.colour_hex }}
                    />

                    {qty > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          onClick={() => decrementColour(opt.id, v.id)}
                          className="px-2 border rounded"
                        >
                          -
                        </button>

                        <span>{qty}</span>

                        <button
                          onClick={() => incrementColour(opt.id, v.id, units)}
                          className="px-2 border rounded"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
