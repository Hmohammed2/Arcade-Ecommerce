"use client";

import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { useCart } from "@/store/useCart";
import { useCheckout } from "@/hooks/useCheckout";
import { useRouter } from "next/navigation";
import { useCheckoutForm } from "@/store/useCheckoutForm"; // 👈 Zustand store
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { getCartItems, clearCart } = useCart();
  const { formData } = useCheckoutForm(); // 👈 read from Zustand
  const checkoutMutation = useCheckout();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    try {
      // 1️⃣ Build the checkout payload
      const items = getCartItems().map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
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

      // 2️⃣ Call backend to create Order + PaymentIntent
      const { clientSecret, order_id } =
        await checkoutMutation.mutateAsync(payload);

      // 3️⃣ Confirm the payment with Stripe
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

      // 4️⃣ Handle Stripe result
      if (result.error) {
        console.error(result.error.message);
        toast.error(result.error.message || "Payment failed ❌");
      } else if (result.paymentIntent?.status === "succeeded") {
        clearCart();
        toast.success("Payment successful! 🎉");
        // ✅ Include email in the redirect
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
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Payment Details
      </h2>

      <form onSubmit={handlePayment} className="space-y-6">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <CardNumberElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#32325d",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  "::placeholder": { color: "#a0aec0" },
                },
                invalid: { color: "#e01d42" },
              },
            }}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3"
          />
        </div>

        {/* Expiry & CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry
            </label>
            <CardExpiryElement className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVC
            </label>
            <CardCvcElement className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3" />
          </div>
        </div>

        {/* Pay Now Button */}
        <button
          type="submit"
          disabled={!stripe || processing || checkoutMutation.isPending}
          className="w-full bg-pink-600 text-white py-2 px-3 rounded-md font-semibold hover:bg-pink-700 disabled:opacity-50"
        >
          {processing ? "Processing..." : "Pay Now"}
        </button>

        {/* Stripe Branding */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-white border rounded-md px-4 py-2 shadow-sm">
            <span className="text-sm text-gray-500">Powered by</span>
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
