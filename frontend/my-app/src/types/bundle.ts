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

export type Bundle = {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description?: string;
  image: string | null;
  price: string; // serializer returns Decimal as string
  discount_percent: number;
  is_in_stock: boolean;
  max_available: number;
  items?: BundleItem[]; // only on detail endpoint
};
