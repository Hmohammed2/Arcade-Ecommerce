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
}

interface CheckoutFormState {
  formData: Partial<CheckoutFormData>;
  updateField: (
    field: keyof CheckoutFormData,
    value: string | boolean | undefined
  ) => void;
  setSameAsBilling: (value: boolean) => void;
  resetForm: () => void;
}

export const useCheckoutForm = create<CheckoutFormState>((set, get) => ({
  formData: {
    billingCountry: "GB",
    shippingCountry: "GB",
    sameAsBilling: false,
  },

  updateField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
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

  resetForm: () =>
    set({
      formData: {
        billingCountry: "GB",
        shippingCountry: "GB",
        sameAsBilling: false,
      },
    }),
}));
