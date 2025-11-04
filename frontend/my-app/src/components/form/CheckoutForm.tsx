"use client";

import BillingForm from "./BillingForm";
import ShippingForm from "./ShippingForm";
import PaymentForm from "./PaymentForm";
import OrderSummary from "./OrderSummary";

export default function CheckoutForm() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-8 dark:bg-gray-900 dark:text-gray-100">
      {/* Left side */}
      <div className="flex-1 space-y-8 min-w-0">
        <BillingForm />
        <ShippingForm />
        <div className="lg:hidden">
          {/* Show order summary below shipping on mobile */}
          <OrderSummary />
        </div>
        <PaymentForm />
      </div>

      {/* Right side (desktop sticky order summary) */}
      <div className="hidden lg:block w-full max-w-md sticky top-6 self-start">
        <OrderSummary />
      </div>
    </div>
  );
}
