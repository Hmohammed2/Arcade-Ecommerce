import { Bundle } from "./bundle";
import type { Product } from "./product";

export interface OrderItem {
  public_id: string;
  id: number;
  product: Product;
  quantity: number;
  bundle?: Bundle;
  price: number;
  colour: string;
}

export interface Order {
  public_id: string;
  id: number;
  status: string;
  delivery_method?: "standard" | "express";
  shipping_cost?: number;
  delivery_fee?: string;
  created_at: string;
  items: OrderItem[];
  total_price: number;
}
