"use client";

import BillingForm from "./BillingForm";
import ShippingForm from "./ShippingForm";
import PaymentForm from "./PaymentForm";

export default function CheckoutForm() {
  return (
    <div className="space-y-10">
      <BillingForm />
      <ShippingForm />
      <PaymentForm />
    </div>
  );
}
