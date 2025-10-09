import type { Product } from "./product";

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  colour: string;
}

export interface Order {
  id: number;
  status: string;
  created_at: string;
  items: OrderItem[];
  total_price: number;
}
