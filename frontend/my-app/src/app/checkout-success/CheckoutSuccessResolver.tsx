"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

export default function CheckoutSuccessResolver() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentIntent = searchParams?.get("payment_intent");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveOrder = async () => {
      try {
        if (!paymentIntent) {
          throw new Error("Missing payment reference");
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/orders/by-payment-intent/?pi=${paymentIntent}`,
          {
            cache: "no-store",
          },
        );

        if (!res.ok) {
          throw new Error("Unable to resolve order");
        }

        const data = await res.json();

        if (!data.order_public_id) {
          throw new Error("Order not found");
        }

        // ✅ Redirect to final success page
        router.replace(`/checkout-success/${data.order_public_id}`);
      } catch (err: any) {
        console.error(err);
        setError(
          err.message || "Payment completed but order could not be loaded",
        );
      } finally {
        setLoading(false);
      }
    };

    resolveOrder();
  }, [paymentIntent, router]);

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 dark:text-gray-300">
        <p>Finalising your payment…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-bold text-red-600">Payment completed</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">{error}</p>
        <p className="mt-4 text-sm text-gray-500">
          Please contact support if this persists.
        </p>
        <a
          href="mailto:support@arcadesticklabs.co.uk"
          className="mt-4 text-pink-600 hover:underline"
        >
          support@arcadesticklabs.co.uk
        </a>
      </div>
    );
  }

  return null;
}
