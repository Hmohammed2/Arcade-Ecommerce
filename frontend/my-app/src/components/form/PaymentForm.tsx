"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/store/useCart";
import { useCheckoutForm } from "@/store/useCheckoutForm";
import { useCoupon } from "@/store/useCoupon";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

declare global {
  interface Window {
    paypal: any;
  }
}

export default function PaymentForm({
  method,
  orderPublicId,
}: {
  method: "stripe" | "paypal";
  orderPublicId?: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const { clearCart } = useCart();
  const { formData } = useCheckoutForm();
  const { clearCoupon } = useCoupon();

  const [processing, setProcessing] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const paypalStickyRef = useRef<HTMLDivElement>(null);

  /* ---------------- Stripe submit ---------------- */

  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout-success`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed");
      }

      if (result.paymentIntent?.status === "succeeded") {
        // inline success (no redirect happened)
        clearCart();
        clearCoupon();
        localStorage.setItem("guest_email", formData.billingEmail || "");
        router.push(`/checkout-success/${orderPublicId}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  /* ---------------- PayPal SDK ---------------- */

  useEffect(() => {
    if (method !== "paypal") return;
    if (document.getElementById("paypal-sdk")) return;

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=GBP`;
    script.async = true;
    document.body.appendChild(script);
  }, [method]);

  /* ---------------- PayPal Buttons ---------------- */

  useEffect(() => {
    if (method !== "paypal" || !window.paypal) return;

    const target =
      window.innerWidth < 640 ? paypalStickyRef.current : paypalRef.current;

    if (!target) return;
    target.innerHTML = "";

    window.paypal
      .Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect" },

        createOrder: async () => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/paypal/checkout/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: formData.billingEmail,
              }),
            },
          );

          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "PayPal failed");

          return data.paypal_order_id;
        },

        onApprove: async (data: any) => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/paypal/capture/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order_id: data.orderID }),
            },
          );

          const capture = await res.json();

          if (capture.status === "COMPLETED") {
            clearCart();
            clearCoupon();
            localStorage.setItem("guest_email", formData.billingEmail || "");
            router.push(`/checkout-success/${capture.order_public_id}`);
          } else {
            toast.error("PayPal payment failed");
          }
        },

        onError: () => toast.error("PayPal error"),
      })
      .render(target);

    return () => {
      target.innerHTML = "";
    };
  }, [method]);

  /* ---------------- UI ---------------- */

  if (method === "stripe") {
    return (
      <form onSubmit={handleStripePayment} className="space-y-4">
        <PaymentElement options={{ layout: "tabs" }} />

        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold"
        >
          {processing ? "Processing…" : "Pay now"}
        </button>
      </form>
    );
  }

  return (
    <>
      <div ref={paypalRef} className="hidden sm:block mt-4" />
      <div
        ref={paypalStickyRef}
        className="fixed bottom-0 left-0 right-0 sm:hidden p-3 bg-white dark:bg-gray-900 border-t z-50"
      />
    </>
  );
}
