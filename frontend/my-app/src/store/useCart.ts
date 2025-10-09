import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-hot-toast";
import { cartItem } from "@/types/cart";

interface CartState {
  items: cartItem[];

  addItem: (item: cartItem) => void;
  removeItem: (id: number, colour?: string | null) => void;
  updateQuantity: (id: number, colour: string | null, quantity: number) => void;
  clearCart: () => void;

  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemCount: (id: number, colour?: string | null) => number;
  getCartItems: () => cartItem[];
  isInCart: (id: number, colour?: string | null) => boolean;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // ✅ Add or increment item (unique by id + colour)
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(
          (i) => i.id === item.id && i.colour === item.colour
        );

        if (existingItem) {
          const updatedItems = items.map((i) =>
            i.id === item.id && i.colour === item.colour
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );

          set({ items: updatedItems });
          toast.success(
            `Increased quantity of ${item.title}${
              item.colour ? ` (${item.colour})` : ""
            }`
          );
        } else {
          set({ items: [...items, item] });
          toast.success(
            `Added ${item.title}${item.colour ? ` (${item.colour})` : ""} to cart`
          );
        }
      },

      // ✅ Remove specific item (id + colour)
      removeItem: (id, colour = null) => {
        const item = get().items.find(
          (i) => i.id === id && i.colour === colour
        );
        if (item) {
          set({
            items: get().items.filter(
              (i) => !(i.id === id && i.colour === colour)
            ),
          });
          toast.success(
            `Removed ${item.title}${item.colour ? ` (${item.colour})` : ""}`
          );
        }
      },

      // ✅ Update quantity or remove if 0
      updateQuantity: (id, colour = null, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id, colour);
          return;
        }

        const items = get().items.map((i) =>
          i.id === id && i.colour === colour ? { ...i, quantity } : i
        );

        set({ items });
        const item = get().items.find(
          (i) => i.id === id && i.colour === colour
        );
        if (item)
          toast.success(
            `Updated ${item.title}${
              item.colour ? ` (${item.colour})` : ""
            } to ${quantity}`
          );
      },

      // ✅ Clear all items
      clearCart: () => {
        set({ items: [] });
        toast.success("Cart cleared");
      },

      // ✅ Computed values
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),

      getItemCount: (id, colour = null) => {
        const item = get().items.find(
          (i) => i.id === id && i.colour === colour
        );
        return item ? item.quantity : 0;
      },

      getCartItems: () => get().items,

      // ✅ Check if item (with colour) exists
      isInCart: (id, colour = null) =>
        !!get().items.find((i) => i.id === id && i.colour === colour),
    }),
    {
      name: "cart-storage", // ✅ persists in localStorage
      partialize: (state) => ({ items: state.items }), // only persist cart items
    }
  )
);
