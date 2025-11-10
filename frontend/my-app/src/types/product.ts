export type FeatureItem = string | { label: string; value?: string };

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export interface ProductVariant {
  id: number;
  colour: string;
  stock: number;
}

export type Product = {
  id: number;
  name: string; // matches Django's "name"
  slug: string;
  category: Category; // nested object
  description?: string; // can be blank
  overview?: string;
  features?: FeatureItem[];
  price: number;
  stock?: number; // PositiveIntegerField
  image?: string;
  images?: string[]; // URLs of additional images
  variants?: ProductVariant[];
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
};
