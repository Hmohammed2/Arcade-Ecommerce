export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  status: string;
  created_at: string;
  items: OrderItem[];
  total_price: number;
}
