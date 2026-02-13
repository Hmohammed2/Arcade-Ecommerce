import { BundleOptionMeta } from "./bundle";

export interface CartItem {
  type: "product" | "bundle";
  id: number;
  title: string;
  price: number;
  image?: string;
  quantity: number; // ignored for bundles
  colour?: string | null; // ignored for bundles
  option_values?: Record<number, Record<number, number>> | null;
  option_meta?: BundleOptionMeta[];
}

// =====================
// OUTPUT TYPES
// =====================

type BundleLineItem = {
  type: "bundle";
  bundle_id: number;
  quantity: number;
  option_values: Record<number, Record<number, number>>;
};

type ProductLineItem = {
  type: "product";
  product_id: number;
  quantity: number;
  colour: string | null;
};

export type LineItem = BundleLineItem | ProductLineItem;
