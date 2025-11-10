export interface cartItem {
  id: number;
  title: string;
  price: number;
  image: string | undefined;
  quantity: number;
  colour?: string | null;
}
