import { BundleOption, BundleOptionMeta } from "@/types/bundle";

export function buildOptionMeta(options: BundleOption[]): BundleOptionMeta[] {
  return options.map((opt) => ({
    id: opt.id,
    name: opt.name,
    values: Object.fromEntries(
      opt.values.map((v) => [
        v.id,
        {
          label: v.label,
          hex: v.colour_hex,
        },
      ]),
    ),
  }));
}
