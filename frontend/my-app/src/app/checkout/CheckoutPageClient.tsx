"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import OrderSummary from "@/components/form/OrderSummary";
import CheckoutForm from "@/components/form/CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPageClient() {
  return (
    <Elements stripe={stripePromise}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <CheckoutForm /> {/* this contains PaymentForm inside */}
        </div>
        <aside className="lg:col-span-1">
          <OrderSummary />
        </aside>
      </div>
    </Elements>
  );
}
