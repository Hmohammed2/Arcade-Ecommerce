"use client";

import BillingForm from "./BillingForm";
import ShippingForm from "./ShippingForm";
import PaymentForm from "./PaymentForm";
import OrderSummary from "./OrderSummary";

export default function CheckoutForm() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 dark:bg-gray-900 dark:text-gray-100">
      {/* Left column (desktop): stack Billing + Shipping */}
      <section
        aria-labelledby="checkout-details"
        className="lg:col-span-8 space-y-8"
      >
        <h2 id="checkout-details" className="sr-only">
          Checkout details
        </h2>
        <BillingForm />
        <ShippingForm />
      </section>

      {/* Right column (desktop): Order Summary
          Mobile: appears after Shipping, before Payment */}
      <aside
        aria-labelledby="order-summary"
        className="lg:col-span-4 lg:sticky lg:top-6"
      >
        <h2 id="order-summary" className="sr-only">
          Order summary
        </h2>
        <OrderSummary />
      </aside>

      {/* Bottom (both mobile & desktop): Payment */}
      <div className="lg:col-span-12">
        <PaymentForm />
      </div>
    </div>
  );
}
