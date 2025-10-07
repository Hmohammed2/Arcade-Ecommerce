// types/orders.ts

export interface OrderItem {
  id: number;
  product_name: string;
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
