"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";
import BillingForm from "@/components/form/BillingForm";
import ShippingForm from "@/components/form/ShippingForm";
import { useUserAddresses } from "@/hooks/useUserAddresses";
import { useCheckoutForm } from "@/store/useCheckoutForm";

export default function BillingClient() {
  const { addresses, isLoading, updateAddresses, isUpdating } =
    useUserAddresses();
  const { formData, updateField } = useCheckoutForm();

  // Prefill Zustand store when data is loaded
  useEffect(() => {
    if (!addresses) return;
    const mapping: Record<string, string> = {
      billing_first_name: "billingFirstName",
      billing_last_name: "billingLastName",
      billing_email: "billingEmail",
      billing_phone: "billingPhone",
      billing_address1: "billingAddress1",
      billing_address2: "billingAddress2",
      billing_city: "billingCity",
      billing_postcode: "billingPostcode",
      same_as_billing: "sameAsBilling",
      shipping_address1: "shippingAddress1",
      shipping_address2: "shippingAddress2",
      shipping_city: "shippingCity",
      shipping_postcode: "shippingPostcode",
    };

    Object.entries(mapping).forEach(([backendKey, localKey]) => {
      if (
        addresses[backendKey] !== undefined &&
        addresses[backendKey] !== null
      ) {
        updateField(localKey as keyof typeof formData, addresses[backendKey]);
      }
    });
  }, [addresses]);

  const handleSave = async () => {
    try {
      const payload = {
        billing_first_name: formData.billingFirstName ?? "",
        billing_last_name: formData.billingLastName ?? "",
        billing_email: formData.billingEmail ?? "",
        billing_phone: formData.billingPhone ?? "",
        billing_address1: formData.billingAddress1 ?? "",
        billing_address2: formData.billingAddress2 ?? "",
        billing_city: formData.billingCity ?? "",
        billing_postcode: formData.billingPostcode ?? "",
        same_as_billing: formData.sameAsBilling || false,
        shipping_address1: formData.shippingAddress1 ?? "",
        shipping_address2: formData.shippingAddress2 ?? "",
        shipping_city: formData.shippingCity ?? "",
        shipping_postcode: formData.shippingPostcode ?? "",
      };

      await updateAddresses(payload);
      toast.success("Billing & Shipping information updated ✅");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save information");
    }
  };

  if (isLoading) return <p>Loading your saved addresses...</p>;

  return (
    <div className="space-y-10">
      <BillingForm showUseAccountCheckbox={false} />
      <ShippingForm />
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className={`bg-pink-600 text-white px-6 py-2 rounded-md font-medium transition ${
            isUpdating ? "opacity-50 cursor-not-allowed" : "hover:bg-pink-700"
          }`}
        >
          {isUpdating ? "Saving..." : "Save Information"}
        </button>
      </div>
    </div>
  );
}
