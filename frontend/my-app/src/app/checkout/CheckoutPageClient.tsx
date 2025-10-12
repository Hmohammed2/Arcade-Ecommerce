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
      <CheckoutForm /> {/* this contains PaymentForm inside */}
    </Elements>
  );
}
