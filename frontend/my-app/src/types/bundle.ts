// =====================
// OPTION VALUES (COLOURS)
// =====================

export type BundleOptionValue = {
  id: number;
  label: string; // "Red", "Clear", "Smoke"
  colour_hex: string; // "#ff0033"

  // 👇 NEW — links colour directly to a variant
  variant_id?: number | null;
};

// =====================
// BUNDLE COMPONENT
// (the REAL source of truth for quantities)
// =====================

export type BundleComponent = {
  id: number;

  product: {
    id: number;
    name: string;
    slug: string;
  };

  variant?: {
    id: number;
    colour: string;
  } | null;

  // 👇 CRITICAL: how many of THIS product per ONE kit
  quantity: number;

  // 👇 links this component to a colour option
  option_value?: {
    id: number;
    label: string;
  } | null;
};

// =====================
// OPTIONS
// =====================

export type BundleOption = {
  id: number;
  name: string; // "Button Colour"
  required: boolean;
  values: BundleOptionValue[];
};

// =====================
// INCLUDED ITEMS (UI ONLY)
// =====================

export type BundleItem = {
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    image: string | null;
  };
  quantity: number;
};

// =====================
// META (CART DISPLAY)
// =====================

export interface BundleOptionMetaValue {
  label: string;
  hex: string;
}

export interface BundleOptionMeta {
  id: number;
  name: string;
  values: Record<number, BundleOptionMetaValue>;
}

// =====================
// MAIN BUNDLE TYPE
// =====================

export type Bundle = {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description?: string;
  image: string | null;
  price: string;
  discount_percent: number;
  is_in_stock: boolean;
  max_available: number;

  // Detail endpoint only
  items?: BundleItem[];
  options?: BundleOption[];

  // 👇 NEW — this is the key missing piece
  components?: BundleComponent[];
};
