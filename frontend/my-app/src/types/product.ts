export type FeatureItem = string | { label: string; value?: string };

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  colour?: string | null;
}

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
  images?: ProductImage[];
  variants?: ProductVariant[];
  is_featured: boolean;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
};
