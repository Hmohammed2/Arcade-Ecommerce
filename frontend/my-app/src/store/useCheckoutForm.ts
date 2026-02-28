import { create } from "zustand";

interface CheckoutFormData {
  billingFirstName: string;
  billingLastName: string;
  billingEmail: string;
  billingPhone: string;
  billingAddress1: string;
  billingAddress2?: string;
  billingCity: string;
  billingPostcode: string;
  billingCountry: string;
  shippingAddress1: string;
  shippingAddress2?: string;
  shippingCity: string;
  shippingPostcode: string;
  shippingCountry: string;
  additionalNotes?: string;
  sameAsBilling: boolean;
  couponCode?: string;
  shippingRateId?: string;
  shippingMethod?: string;
  shippingCost?: number;
  cartWeightKg?: number;
  marketingOptIn?: boolean;
}

interface CheckoutFormState {
  formData: Partial<CheckoutFormData>;
  updateField: (
    field: keyof CheckoutFormData,
    value: string | boolean | number | undefined,
  ) => void;
  setSameAsBilling: (value: boolean) => void;
  marketingOptIn: boolean;
  resetForm: () => void;
  setCartWeight: (weightKg: number) => void;
}

export const useCheckoutForm = create<CheckoutFormState>((set, get) => ({
  formData: {
    billingCountry: "GB",
    shippingCountry: "GB",
    sameAsBilling: true,
    marketingOptIn: false,
  },

  updateField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),
  setCartWeight: (weightKg) =>
    set((state) => ({
      formData: {
        ...state.formData,
        cartWeightKg: Math.max(weightKg, 0.1), // avoid zero-weight shipments
      },
    })),
  setSameAsBilling: (value) => {
    const current = get().formData;

    if (value) {
      // Copy all billing fields → shipping
      set({
        formData: {
          ...current,
          sameAsBilling: true,
          shippingAddress1: current.billingAddress1,
          shippingAddress2: current.billingAddress2,
          shippingCity: current.billingCity,
          shippingPostcode: current.billingPostcode,
          shippingCountry: current.billingCountry || "GB",
        },
      });
    } else {
      // Only toggle off
      set({
        formData: { ...current, sameAsBilling: false },
      });
    }
  },
  marketingOptIn: false,

  resetForm: () =>
    set({
      formData: {
        billingCountry: "GB",
        shippingCountry: "GB",
        sameAsBilling: false,
      },
    }),
}));
