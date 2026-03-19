export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text?: string;
  colour?: string | null;
}

export interface ProductVariant {
  id: number;
  name: string; // 👈 ADD THIS
  colour?: string;
  stock: number;
  sku?: string;
  price?: number;
}

export type ProductFeature = {
  label: string;
  value?: string;
};

export type ProductMarketing = {
  highlights?: string[];
  compatibility?: string[];
  trust_notes?: string[];
  shipping_info?: string;
};

export type ProductMini = {
  id: number;
  name: string;
  slug: string;
  price: number;
  image?: string;
};

export interface Product {
  id: number;
  name: string;
  slug: string;

  category: Category;

  description?: string;
  overview?: string;
  rating?: number;
  review_count?: number;

  price: number;
  stock?: number;

  image?: string;
  images?: ProductImage[];

  variants?: ProductVariant[];

  features?: ProductFeature[];

  marketing?: ProductMarketing;

  frequently_bought_together?: ProductMini[];

  is_featured: boolean;

  created_at: string;
  updated_at: string;
}
