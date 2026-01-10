"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/useAuth";
import { getColourTextClass } from "@/app/utils/colour-text";
import { gaEvent } from "@/library/ga";

interface Props {
  orderId: string;
}

export default function CheckoutSuccessClient({ orderId }: Props) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, accessToken } = useAuth();

  useEffect(() => {
    const fetchOrder = async () => {
      useEffect(() => {
        if (!order || !order.items) return;

        gaEvent("purchase", {
          transaction_id: order.id,
          currency: "GBP",
          value: totalPaid,
          shipping: deliveryFee,
          coupon: discountAmount > 0 ? "PROMO" : undefined,
          items: order.items.map((item: any) => ({
            item_id: item.product?.id,
            item_name: item.product?.name,
            item_variant: item.colour || "default",
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
        });
      }, [order, totalPaid, deliveryFee, discountAmount]);

      try {
        let endpoint = "";
        let headers: HeadersInit = { "Content-Type": "application/json" };

        if (isAuthenticated && accessToken) {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/orders/${orderId}/`;
          headers["Authorization"] = `Bearer ${accessToken}`;
        } else {
          const email = localStorage.getItem("guest_email");
          if (!email) throw new Error("No guest email found.");
          endpoint = `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/orders/${orderId}/?email=${email}`;
        }

        const res = await fetch(endpoint, {
          method: "GET",
          headers,
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Order not found");

        const data = await res.json();
        setOrder(data);

        if (!isAuthenticated) localStorage.removeItem("guest_email");
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isAuthenticated, accessToken]);

  // 🔢 Derived amounts
  const { subtotal, deliveryFee, discountAmount, totalPaid } = useMemo(() => {
    if (!order || !order.items) {
      return {
        subtotal: 0,
        deliveryFee: 0,
        discountAmount: 0,
        totalPaid: 0,
      };
    }

    const subtotal = order.items.reduce(
      (sum: number, item: any) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );

    const deliveryFee = Number(order.delivery_fee ?? 0);
    const totalPaid = Number(order.total_price ?? 0);

    // discount = (items + delivery) - total
    const discountRaw = subtotal + deliveryFee - totalPaid;
    const discountAmount = discountRaw > 0 ? discountRaw : 0;

    return { subtotal, deliveryFee, discountAmount, totalPaid };
  }, [order]);

  // ✅ Loading state
  if (loading)
    return (
      <div className="text-center py-20 text-gray-700 dark:text-gray-300 transition-colors duration-300">
        <p>Loading your order...</p>
      </div>
    );

  // ✅ Error state
  if (error)
    return (
      <div className="min-h-screen max-w-4xl mx-auto text-center py-16 text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Order not found
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{error}</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-pink-600 hover:bg-pink-700 dark:hover:bg-pink-500 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    );

  // ✅ Success view
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 py-16 text-center text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">
        Payment Successful ✅
      </h1>
      <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
        Thank you for your order!
      </p>

      <div className="mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow rounded-lg p-6 text-left transition-colors duration-300">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Order Summary
        </h2>
        <p>
          <span className="font-medium">Order ID:</span> #{order.id}
        </p>
        <p>
          <span className="font-medium">Status:</span> {order.status}
        </p>

        {/* 💰 Breakdown showing discount */}
        <div className="mt-4 space-y-1 text-sm">
          <p>
            <span className="font-medium">Items subtotal:</span> £
            {subtotal.toFixed(2)}
          </p>
          <p>
            <span className="font-medium">Delivery:</span> £
            {deliveryFee.toFixed(2)}
          </p>
          {discountAmount > 0 && (
            <p className="text-green-600 dark:text-green-400">
              <span className="font-medium">Discount applied:</span> -£
              {discountAmount.toFixed(2)}
            </p>
          )}
          <p className="mt-1">
            <span className="font-medium">Total paid:</span> £
            {totalPaid.toFixed(2)}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Items:
          </h3>
          <ul className="space-y-2">
            {order.items?.map((item: any) => (
              <li
                key={item.id}
                className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700"
              >
                <span>
                  {item.quantity} × {item.product?.name}
                  {item.colour && (
                    <>
                      {" "}
                      -{" "}
                      <span className={getColourTextClass(item.colour)}>
                        {item.colour}
                      </span>
                    </>
                  )}
                </span>
                <span>£{item.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-4">
        <Link
          href="/"
          className="mt-8 inline-block bg-pink-600 hover:bg-pink-700 dark:hover:bg-pink-500 text-white px-6 py-3 rounded-md font-semibold transition-colors"
        >
          Continue Shopping
        </Link>
        <button
          onClick={() => window.print()}
          className="mt-8 inline-block bg-gray-700 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white px-6 py-3 rounded-md font-semibold transition-colors"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
}
