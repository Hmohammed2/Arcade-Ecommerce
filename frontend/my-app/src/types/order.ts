import { Bundle } from "./bundle";
import type { Product } from "./product";

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  bundle?: Bundle;
  price: number;
  colour: string;
}

export interface Order {
  id: number;
  status: string;
  delivery_method?: "standard" | "express";
  delivery_fee?: string;
  created_at: string;
  items: OrderItem[];
  total_price: number;
}
