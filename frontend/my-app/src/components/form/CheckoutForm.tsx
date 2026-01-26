"use client";

import { useState } from "react";
import BillingForm from "./BillingForm";
import ShippingForm from "./ShippingForm";
import OrderSummary from "./OrderSummary";
import PaymentSelection from "./PaymentSelection";
import { useCheckoutForm } from "@/store/useCheckoutForm";

function FastPaySection() {
  const { formData } = useCheckoutForm();

  const disabled = !formData.shippingRateId;

  return (
    <div className="rounded-lg border p-4 bg-yellow-50">
      <p className="text-sm text-gray-700 mb-2">Fast checkout with PayPal</p>

      {disabled && (
        <p className="text-xs text-red-600 mb-2">
          Select a shipping method to continue
        </p>
      )}

      <div
        className={`relative ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div id="paypal-fast-button" />
      </div>
    </div>
  );
}

export default function CheckoutForm() {
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">(
    "stripe",
  );

  return (
    <div className="mx-auto w-full max-w-[100vw] sm:max-w-3xl lg:max-w-none px-3 sm:px-6 lg:px-0">
      <h1 className="text-3xl font-bold mb-6 text-gray-900  dark:text-gray-100">
        Checkout
      </h1>
      <div className="flex flex-col lg:flex-row gap-8 dark:bg-gray-900 dark:text-gray-100">
        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-8 min-w-0">
          {/* Always visible */}
          <BillingForm />
          <ShippingForm />

          {/* Mobile order summary */}
          <div className="lg:hidden">
            <OrderSummary />
          </div>

          {/* Payment accordion */}
          <PaymentSelection
            paymentMethod={paymentMethod}
            onChange={setPaymentMethod}
          />
        </div>

        {/* RIGHT COLUMN (desktop only) */}
        <div className="hidden lg:block w-full max-w-md sticky top-6 self-start">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
