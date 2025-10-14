"use client";

import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useCart } from "@/store/useCart";
import { useCheckout } from "@/hooks/useCheckout";
import { useRouter } from "next/navigation";
import { useCheckoutForm } from "@/store/useCheckoutForm";
import { useTheme } from "next-themes";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { getCartItems, clearCart } = useCart();
  const { formData } = useCheckoutForm();
  const checkoutMutation = useCheckout();
  const [processing, setProcessing] = useState(false);
  const { resolvedTheme } = useTheme();

  // Theme-aware styling for Stripe Elements
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

  const handlePayment = async (e: React.FormEvent) => {
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
        coupon_code: formData.couponCode || null,
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

  return (
    <section className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

      <form onSubmit={handlePayment} className="space-y-6">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Card Number
          </label>
          <div className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3">
            <CardNumberElement options={{ style: elementStyle }} />
          </div>
        </div>

        {/* Expiry & CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expiry
            </label>
            <div className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3">
              <CardExpiryElement options={{ style: elementStyle }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CVC
            </label>
            <div className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3">
              <CardCvcElement options={{ style: elementStyle }} />
            </div>
          </div>
        </div>

        {/* Pay Now Button */}
        <button
          type="submit"
          disabled={!stripe || processing || checkoutMutation.isPending}
          className="w-full bg-pink-600 hover:bg-pink-700 dark:hover:bg-pink-500 text-white py-2 px-3 rounded-md font-semibold transition-colors disabled:opacity-50"
        >
          {processing ? "Processing..." : "Pay Now"}
        </button>

        {/* Stripe Branding */}
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
    </section>
  );
}
