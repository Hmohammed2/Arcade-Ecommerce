"use client";

import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/store/useCart";
import { useCheckout } from "@/hooks/useCheckout";
import { useRouter } from "next/navigation";
import { useCheckoutForm } from "@/store/useCheckoutForm";
import { useCoupon } from "@/store/useCoupon";
import { useTheme } from "next-themes";
import Image from "next/image";
import { toast } from "react-hot-toast";

declare global {
  interface Window {
    paypal: any;
  }
}

/* =========================================================
   🧩 Helpers
========================================================= */

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

const buildCheckoutPayload = ({
  items,
  formData,
  couponCode,
  isValid,
}: {
  items: any[];
  formData: any;
  couponCode?: string | null;
  isValid: boolean;
}) => {
  if (!formData.shippingRateId || formData.shippingCost == null) {
    throw new Error("Please select a shipping method first");
  }

  return {
    items,
    email: formData.billingEmail || undefined,
    first_name: formData.billingFirstName || undefined,
    last_name: formData.billingLastName || undefined,
    phone: formData.billingPhone || undefined,

    // Shipping (raw)
    shipping_name: `${formData.billingFirstName} ${formData.billingLastName}`,
    shipping_address1: formData.shippingAddress1,
    shipping_address2: formData.shippingAddress2 || "",
    shipping_city: formData.shippingCity,
    shipping_postcode: formData.shippingPostcode,
    shipping_country: formData.shippingCountry || "GB",

    // Sendcloud
    shipping_method_id: formData.shippingRateId,
    shipping_cost: Number(formData.shippingCost),

    coupon_code: isValid ? couponCode : null,
  };
};

/* =========================================================
   💳 PaymentForm
========================================================= */

export default function PaymentForm({
  method,
}: {
  method: "stripe" | "paypal";
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const { code: couponCode, isValid, clearCoupon } = useCoupon();
  const { getCartItems, clearCart } = useCart();
  const { formData } = useCheckoutForm();
  const checkoutMutation = useCheckout();

  const { resolvedTheme } = useTheme();

  const [processing, setProcessing] = useState(false);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  const paypalRef = useRef<HTMLDivElement>(null);
  const paypalStickyRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     Stripe styles
  ========================================================= */

  const elementStyle = {
    base: {
      fontSize: "16px",
      lineHeight: "24px",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: resolvedTheme === "dark" ? "#f9fafb" : "#32325d",
      "::placeholder": {
        color: resolvedTheme === "dark" ? "#9ca3af" : "#a0aec0",
      },
    },
    invalid: { color: "#e01d42" },
  };

  const handleCardChange = (event: any) => {
    setCardBrand(event.brand);
    setCardError(event.error ? event.error.message : null);
  };

  /* =========================================================
     Load PayPal SDK once
  ========================================================= */

  useEffect(() => {
    if (document.getElementById("paypal-sdk")) return;

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=GBP`;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* =========================================================
     PayPal buttons (reactive to method)
  ========================================================= */

  useEffect(() => {
    if (method !== "paypal" || !window.paypal) return;

    const target =
      window.innerWidth < 640 ? paypalStickyRef.current : paypalRef.current;

    if (!target) return;
    target.innerHTML = "";

    let payload;
    try {
      payload = buildCheckoutPayload({
        items: buildLineItems(getCartItems()),
        formData,
        couponCode,
        isValid,
      });
    } catch (err: any) {
      toast.error(err.message);
      return;
    }

    window.paypal
      .Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect" },

        createOrder: async () => {
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
      .render(target);

    return () => {
      target.innerHTML = "";
    };
  }, [method, formData, couponCode, isValid, getCartItems]);

  /* =========================================================
     Stripe submit
  ========================================================= */

  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      const payload = buildCheckoutPayload({
        items: buildLineItems(getCartItems()),
        formData,
        couponCode,
        isValid,
      });

      const { clientSecret, order_id } =
        await checkoutMutation.mutateAsync(payload);

      const card = elements.getElement(CardNumberElement);
      if (!card) return;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: `${formData.billingFirstName} ${formData.billingLastName}`,
            email: formData.billingEmail,
            phone: formData.billingPhone,
          },
        },
      });

      if (result.paymentIntent?.status === "succeeded") {
        clearCart();
        clearCoupon();
        localStorage.setItem("guest_email", formData.billingEmail || "");
        router.push(`/checkout-success/${order_id}`);
      } else if (result.error) {
        toast.error(result.error.message || "Payment failed");
      }
    } finally {
      setProcessing(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <section className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
      <div className="hidden sm:flex absolute top-3 right-3 items-center text-green-600">
        <Lock size={18} className="mr-1" />
        <span className="text-xs font-medium">Secure and encrypted</span>
      </div>

      {method === "stripe" && (
        <>
          <form
            id="stripe-payment-form"
            onSubmit={handleStripePayment}
            className="space-y-6"
          >
            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Card Number
              </label>

              <div
                className="
  flex items-center gap-2
  h-11
  rounded-md
  border border-gray-300 dark:border-gray-600
  bg-white dark:bg-gray-800
  px-3
  focus-within:border-pink-500 dark:focus-within:border-pink-400
  transition-colors
"
              >
                <div className="flex-1 min-w-0">
                  <CardNumberElement
                    options={{ style: elementStyle }}
                    onChange={handleCardChange}
                  />
                </div>

                {cardBrand && (
                  <Image
                    src={`/icons/${cardBrand}.png`}
                    alt={cardBrand}
                    width={36}
                    height={24}
                    className="shrink-0"
                  />
                )}
              </div>

              {cardError && (
                <p className="text-xs text-red-500 mt-1">{cardError}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expiry date
                </label>
                <div
                  className="
      h-11
      rounded-md
      border border-gray-300 dark:border-gray-600
      bg-white dark:bg-gray-800
      px-3
      flex items-center
      focus-within:border-pink-500 dark:focus-within:border-pink-400
    "
                >
                  <CardExpiryElement options={{ style: elementStyle }} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">CVC</label>
                <div
                  className="
      h-11
      rounded-md
      border border-gray-300 dark:border-gray-600
      bg-white dark:bg-gray-800
      px-3
      flex items-center
      focus-within:border-pink-500 dark:focus-within:border-pink-400
    "
                >
                  <CardCvcElement options={{ style: elementStyle }} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!stripe || processing}
              className="
    hidden sm:block
    w-full bg-pink-600 hover:bg-pink-800
    text-white py-2 rounded-md font-semibold
    transition-colors
  "
            >
              {processing ? "Processing…" : "Pay Now"}
            </button>
          </form>

          {/* Mobile sticky Stripe */}
          <div
            className="fixed bottom-0 left-0 right-0 sm:hidden p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700
"
          >
            <button
              form="stripe-payment-form"
              disabled={!stripe || processing}
              className="
    w-full py-3 rounded-lg font-semibold text-lg
    bg-pink-600 hover:bg-pink-700
    disabled:opacity-50 disabled:cursor-not-allowed
    text-white
    transition-colors
  "
            >
              {processing ? "Processing…" : "Pay securely"}
            </button>
          </div>
        </>
      )}

      {method === "paypal" && (
        <>
          <div ref={paypalRef} className="hidden sm:block mt-4" />
          <div
            ref={paypalStickyRef}
            className="
    fixed bottom-0 left-0 right-0 sm:hidden
    p-3
    bg-white dark:bg-gray-900
    border-t border-gray-200 dark:border-gray-700
    z-50
  "
          />
        </>
      )}
    </section>
  );
}
