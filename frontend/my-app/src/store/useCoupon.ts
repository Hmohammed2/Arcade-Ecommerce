"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CouponState {
  code: string | null;
  discountPercent: number;
  isValid: boolean;

  setCoupon: (code: string, discountPercent: number) => void;
  clearCoupon: () => void;
}

export const useCoupon = create<CouponState>()(
  persist(
    (set) => ({
      code: null,
      discountPercent: 0,
      isValid: false,

      setCoupon: (code, discountPercent) =>
        set({ code, discountPercent, isValid: true }),

      clearCoupon: () =>
        set({ code: null, discountPercent: 0, isValid: false }),
    }),
    {
      name: "coupon-storage", // 🧠 persisted key in localStorage
    }
  )
);
