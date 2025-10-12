"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/useAuth"; // ✅ import Zustand auth store

interface Props {
  orderId: string;
}

export default function CheckoutSuccessClient({ orderId }: Props) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, accessToken, user } = useAuth(); // ✅ read Zustand store

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        let endpoint = "";
        let headers: HeadersInit = { "Content-Type": "application/json" };

        // ✅ If logged in, use authenticated endpoint
        if (isAuthenticated && accessToken) {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/orders/${orderId}/`;
          headers["Authorization"] = `Bearer ${accessToken}`;
        } else {
          // ✅ Guest checkout → use stored email
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

        // Optional: clear guest email after fetch for privacy
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

  // ✅ Loading state
  if (loading)
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Loading your order...</p>
      </div>
    );

  // ✅ Error state
  if (error)
    return (
      <div className="min-h-screen max-w-4xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-red-600">Order not found</h1>
        <p className="mt-4 text-gray-600">{error}</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
        >
          Back to Shop
        </Link>
      </div>
    );

  // ✅ Success view
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 py-16 text-center">
      <h1 className="text-3xl font-bold text-green-600">
        Payment Successful ✅
      </h1>
      <p className="mt-4 text-lg">Thank you for your order!</p>

      <div className="mt-8 bg-white shadow rounded-lg p-6 text-left">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Order Summary
        </h2>
        <p>
          <span className="font-medium">Order ID:</span> #{order.id}
        </p>
        <p>
          <span className="font-medium">Status:</span> {order.status}
        </p>
        <p>
          <span className="font-medium">Total:</span> £{order.total_price}
        </p>

        <div className="mt-6">
          <h3 className="font-medium text-gray-800 mb-2">Items:</h3>
          <ul className="space-y-2">
            {order.items?.map((item: any) => (
              <li key={item.id} className="flex justify-between pb-2">
                <span>
                  {item.quantity} × {item.product.name} - {item.colour}
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
          className="mt-8 inline-block bg-pink-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-pink-700"
        >
          Continue Shopping
        </Link>
        <button
          onClick={() => window.print()}
          className="mt-8 inline-block bg-gray-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
}
