"use client";

import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { Lock } from "lucide-react";
import { useEffect, useState, useRef } from "react";
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

// 🧩 PaymentForm Component
export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const {
    code: couponCode,
    discountPercent,
    isValid,
    clearCoupon,
  } = useCoupon();
  const { getCartItems, clearCart, getDelivery } = useCart();
  const delivery = getDelivery();
  const { formData } = useCheckoutForm();
  const checkoutMutation = useCheckout();
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState<"stripe" | "paypal">("stripe");
  const paypalRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleCardChange = (event: any) => {
    // event.brand => "visa", "mastercard", "amex", etc.
    setCardBrand(event.brand);

    // event.error?.message => validation errors
    setCardError(event.error ? event.error.message : null);
  };

  // 🌈 Stripe Element styling
  const elementStyle = {
    base: {
      fontSize: "16px",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: resolvedTheme === "dark" ? "#f9fafb" : "#32325d",
      iconColor: resolvedTheme === "dark" ? "#f9fafb" : "#32325d",
      "::placeholder": {
        color: resolvedTheme === "dark" ? "#9ca3af" : "#a0aec0",
      },
    },
    invalid: { color: "#e01d42" },
  };

  // ⚙️ Load PayPal SDK
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("paypal-sdk")) return; // avoid double load

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=GBP`;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // 🅿️ Render PayPal Buttons when selected
  useEffect(() => {
    if (method !== "paypal" || !window.paypal || !paypalRef.current) return;

    const items = getCartItems().map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      colour: item.colour,
    }));

    const payload = {
      items,
      email: formData.billingEmail,
      first_name: formData.billingFirstName,
      last_name: formData.billingLastName,
      phone: formData.billingPhone,
      delivery_method: delivery,
      coupon_code: isValid ? couponCode : null,
    };

    // Render PayPal Buttons
    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        },
        // Create PayPal Order via Django backend
        createOrder: async () => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/paypal/checkout/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Failed to create PayPal order");
          return data.paypal_order_id;
        },
        // Capture order after approval
        onApprove: async (data: any) => {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/paypal/capture/`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id: data.orderID }),
              }
            );
            const capture = await res.json();
            if (
              capture.status === "COMPLETED" ||
              capture.status === "captured"
            ) {
              clearCart();
              clearCoupon(); // ✅ Reset coupon after success
              toast.success("PayPal payment successful! 🎉");
              router.push(`/checkout-success/${capture.id}`);
            } else {
              toast.error("PayPal payment failed ❌");
            }
          } catch (err: any) {
            console.error(err);
            toast.error("PayPal capture failed ❌");
          }
        },
        onError: (err: any) => {
          console.error(err);
          toast.error("PayPal error ❌");
        },
      })
      .render(paypalRef.current);

    // Cleanup old buttons on re-render
    return () => {
      if (paypalRef.current) paypalRef.current.innerHTML = "";
    };
  }, [method]);

  // 💳 Stripe Card Payment Handler
  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    try {
      const items = getCartItems().map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        colour: item.colour,
      }));

      const payload = {
        items,
        email: formData.billingEmail,
        first_name: formData.billingFirstName,
        last_name: formData.billingLastName,
        billing_address: `${formData.billingAddress1}, ${formData.billingCity}, ${formData.billingPostcode}`,
        shipping_address: formData.sameAsBilling
          ? `${formData.billingAddress1}, ${formData.billingCity}, ${formData.billingPostcode}`
          : `${formData.shippingAddress1}, ${formData.shippingCity}, ${formData.shippingPostcode}`,
        same_as_billing: formData.sameAsBilling,
        coupon_code: isValid ? couponCode : null,
        delivery_method: delivery,
      };

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
            address: {
              line1: formData.billingAddress1,
              line2: formData.billingAddress2,
              city: formData.billingCity,
              postal_code: formData.billingPostcode,
              country: "GB",
            },
          },
        },
      });

      if (result.error) {
        console.error(result.error.message);
        toast.error(result.error.message || "Payment failed ❌");
      } else if (result.paymentIntent?.status === "succeeded") {
        clearCart();
        clearCoupon(); // ✅ Reset coupon after success
        toast.success("Payment successful! 🎉");
        localStorage.setItem("guest_email", formData.billingEmail ?? "");
        router.push(`/checkout-success/${order_id}`);
      }
    } catch (err: any) {
      console.error(err.message);
      toast.error("Payment failed ❌");
    } finally {
      setProcessing(false);
    }
  };

  // 🧾 Render
  return (
    <section className="relative bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="absolute top-3 right-3 flex items-center text-green-600 dark:text-green-400 animate-pulse">
        <Lock size={18} className="mr-1" />
        <span className="text-xs font-medium">Secure</span>
      </div>

      <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

      {/* Payment Method Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setMethod("stripe")}
          className={`px-3 py-2 rounded-md border ${
            method === "stripe"
              ? "border-pink-600 text-pink-600 font-semibold"
              : "border-gray-300 text-gray-500"
          }`}
        >
          💳 Pay with Card
        </button>
        <button
          type="button"
          onClick={() => setMethod("paypal")}
          className={`px-3 py-2 rounded-md border ${
            method === "paypal"
              ? "border-yellow-500 text-yellow-600 font-semibold"
              : "border-gray-300 text-gray-500"
          }`}
        >
          🅿️ Pay with PayPal
        </button>
      </div>

      {/* Stripe Form */}
      {method === "stripe" && (
        <form onSubmit={handleStripePayment} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Card Number
            </label>
            <div className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 flex items-center justify-between">
              <CardNumberElement
                options={{ style: elementStyle }}
                onChange={handleCardChange}
                className="flex-1"
              />
              {cardBrand && (
                <Image
                  src={`/icons/${cardBrand}.png`}
                  alt={cardBrand}
                  width={36}
                  height={24}
                  className="ml-2"
                />
              )}
            </div>
            {cardError && (
              <p className="text-xs text-red-500 mt-1">{cardError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Expiry</label>
              <div className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3">
                <CardExpiryElement options={{ style: elementStyle }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CVC</label>
              <div className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3">
                <CardCvcElement options={{ style: elementStyle }} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || processing || checkoutMutation.isPending}
            className="w-full bg-pink-600 hover:bg-pink-700 dark:hover:bg-pink-500 text-white py-2 px-3 rounded-md font-semibold transition-colors disabled:opacity-50"
          >
            {processing ? "Processing..." : "Pay Now"}
          </button>

          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Powered by
              </span>
              <Image
                src="/stripe-logo.svg"
                alt="Stripe"
                width={100}
                height={40}
                className="h-6 w-auto"
              />
            </div>
          </div>
        </form>
      )}

      {/* PayPal Buttons */}
      {method === "paypal" && <div ref={paypalRef} className="mt-4" />}
    </section>
  );
}
