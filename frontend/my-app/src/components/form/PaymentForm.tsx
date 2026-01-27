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

const buildLineItems = (cartItems: any[]) =>
  cartItems.map((item) =>
    item.type === "bundle"
      ? {
          type: "bundle",
          bundle_id: item.id,
          quantity: item.quantity,
          option_values: item.option_values || {},
        }
      : {
          type: "product",
          product_id: item.id,
          quantity: item.quantity,
          colour: item.colour ?? null,
        },
  );

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

  const { clearCart, getCartItems } = useCart();
  const { formData } = useCheckoutForm();
  const { code: couponCode, isValid, clearCoupon } = useCoupon();

  const [processing, setProcessing] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const paypalRendered = useRef(false);
  const [paypalReady, setPaypalReady] = useState(false);

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

    // Already loaded
    if (window.paypal) {
      setPaypalReady(true);
      return;
    }

    const existing = document.getElementById("paypal-sdk");
    if (existing) return;

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=GBP`;
    script.async = true;

    script.onload = () => {
      setPaypalReady(true);
    };

    script.onerror = () => {
      toast.error("Failed to load PayPal");
    };

    document.body.appendChild(script);
  }, [method]);

  /* ---------------- PayPal Buttons ---------------- */

  useEffect(() => {
    if (method !== "paypal") return;
    if (!paypalReady) return;
    if (!paypalRef.current) return;
    if (paypalRendered.current) return;

    paypalRendered.current = true;

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        },

        createOrder: async () => {
          const payload = {
            first_name: formData.billingFirstName,
            last_name: formData.billingLastName,
            items: buildLineItems(getCartItems()),
            shipping_name: `${formData.billingFirstName} ${formData.billingLastName}`,
            shipping_method_name: formData.shippingMethod,
            shipping_postcode: formData.shippingPostcode,
            shipping_country: formData.shippingCountry || "GB",
            shipping_address1: formData.shippingAddress1,
            shipping_address2: formData.shippingAddress2,
            shipping_city: formData.shippingCity,
            email: formData.billingEmail,
            coupon_code: isValid ? couponCode : null,
          };
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/paypal/checkout/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
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
      .render(paypalRef.current);
  }, [method, paypalReady]);

  /* ---------------- UI ---------------- */

  if (method === "stripe") {
    return (
      <>
        <form
          id="stripe-payment-form"
          onSubmit={handleStripePayment}
          className="space-y-4"
        >
          <PaymentElement options={{ layout: "tabs" }} />

          {/* Desktop button */}
          <button
            type="submit"
            disabled={!stripe || processing}
            className="
            hidden sm:block
            w-full
            bg-pink-600 hover:bg-pink-700
            text-white py-3 rounded-lg
            font-semibold
            disabled:opacity-50
          "
          >
            {processing ? "Processing…" : "Pay now"}
          </button>
        </form>

        {/* Mobile sticky button */}
        <div
          className="
    fixed sm:hidden
    bottom-0 inset-x-0
    bg-white dark:bg-gray-900
    border-t
    z-50
    pb-[env(safe-area-inset-bottom)]
  "
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <button
              form="stripe-payment-form"
              type="submit"
              disabled={!stripe || processing}
              className="
        w-full
        bg-pink-600 hover:bg-pink-700
        text-white py-3 rounded-lg
        font-semibold
        disabled:opacity-50 disabled:cursor-not-allowed
      "
            >
              {processing ? "Processing…" : "Pay securely"}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className="
      fixed sm:static
      bottom-0 inset-x-0
      bg-white dark:bg-gray-900
      border-t sm:border-0
      z-50
      pb-[env(safe-area-inset-bottom)]
    "
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:p-0">
        <div ref={paypalRef} className="w-full" style={{ minHeight: 55 }} />
      </div>
    </div>
  );
}
