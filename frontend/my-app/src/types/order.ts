import type { Product } from "./product";

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
