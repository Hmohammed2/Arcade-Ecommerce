export interface CartItem {
  type: "product" | "bundle";
  id: number;
  title: string;
  price: number;
  image?: string;
  quantity: number;
  colour?: string | null; // ignored for bundles
}
