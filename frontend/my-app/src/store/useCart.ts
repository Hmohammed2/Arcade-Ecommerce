import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-hot-toast";
import { cartItem } from "@/types/cart";
import { gaEvent } from "@/library/ga";

type DeliveryType = "standard" | "express";

interface CartState {
  items: cartItem[];
  delivery: DeliveryType;
  setDelivery: (type: DeliveryType) => void;
  getDelivery: () => DeliveryType;

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

      delivery: "standard",
      setDelivery: (type) => set({ delivery: type }),
      getDelivery: () => get().delivery,

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
          const article = sessionStorage.getItem("last_article");
          // 🔥 GA Event
          gaEvent("add_to_cart", {
            currency: "GBP",
            value: item.price * item.quantity,
            items: [
              {
                item_id: item.id,
                item_name: item.title,
                item_variant: item.colour || "default",
                item_list_id: article || "direct",
                item_list_name: article || "direct",
                price: item.price,
                quantity: item.quantity,
              },
            ],
          });

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
      // ✅ Normalize colour for comparison
      removeItem: (id, colour = null) => {
        const normalizedColour = colour || ""; // treat null as empty string
        const item = get().items.find(
          (i) => i.id === id && (i.colour || "") === normalizedColour
        );

        if (item) {
          set({
            items: get().items.filter(
              (i) => !(i.id === id && (i.colour || "") === normalizedColour)
            ),
          });
          gaEvent("remove_from_cart", {
            currency: "GBP",
            value: item.price * item.quantity,
            items: [
              {
                item_id: item.id,
                item_name: item.title,
                item_variant: item.colour || "default",
                price: item.price,
                quantity: item.quantity,
              },
            ],
          });
          toast.success(
            `Removed ${item.title}${item.colour ? ` (${item.colour})` : ""}`
          );
        }
      },

      // ✅ Update quantity or remove if 0
      updateQuantity: (id, colour = null, quantity) => {
        const normalizedColour = colour || "";

        if (quantity <= 0) {
          get().removeItem(id, normalizedColour);
          return;
        }

        const updatedItems = get().items.map((i) =>
          i.id === id && (i.colour || "") === normalizedColour
            ? { ...i, quantity }
            : i
        );

        const current = get().items.find(
          (i) => i.id === id && (i.colour || "") === normalizedColour
        );

        if (current) {
          gaEvent("add_to_cart", {
            currency: "GBP",
            value: (quantity - current.quantity) * current.price,
            items: [
              {
                item_id: current.id,
                item_name: current.title,
                item_variant: current.colour || "default",
                price: current.price,
                quantity: quantity - current.quantity,
              },
            ],
          });
        }

        set({ items: updatedItems });

        const item = updatedItems.find(
          (i) => i.id === id && (i.colour || "") === normalizedColour
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
        const normalizedColour = colour || "";
        const item = get().items.find(
          (i) => i.id === id && (i.colour || "") === normalizedColour
        );
        return item ? item.quantity : 0;
      },

      getCartItems: () => get().items,

      // ✅ Check if item (with colour) exists
      isInCart: (id, colour = null) => {
        const normalizedColour = colour || "";
        return !!get().items.find(
          (i) => i.id === id && (i.colour || "") === normalizedColour
        );
      },
    }),

    {
      name: "cart-storage", // ✅ persists in localStorage
      partialize: (state) => ({ items: state.items }), // only persist cart items
    }
  )
);
