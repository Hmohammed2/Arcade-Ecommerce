"use client";

import { useOrders } from "@/hooks/useOrders";
import type { Order, OrderItem } from "@/types/order";
import { motion } from "framer-motion";

export default function OrderHistoryPageClient() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-600">
        <svg
          className="animate-spin h-5 w-5 mr-2 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
        Loading your orders...
      </div>
    );

  if (!orders?.length)
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[50vh] text-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 mb-3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h18l-1.68 9.39a2 2 0 01-1.98 1.61H6.66a2 2 0 01-1.98-1.61L3 3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 13a4 4 0 11-8 0"
          />
        </svg>
        <p className="text-lg font-semibold">No orders found</p>
        <p className="text-sm text-gray-500">
          When you place an order, it will appear here.
        </p>
      </motion.div>
    );

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-10 text-gray-900 tracking-tight"
      >
        Your Orders
      </motion.h1>

      <div className="space-y-6">
        {orders.map((order: Order, index: number) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-100 px-6 py-4">
              <div>
                <p className="font-semibold text-gray-900">Order #{order.id}</p>
                <p className="text-sm text-gray-500">
                  Placed on{" "}
                  <span className="font-medium text-gray-700">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </p>
              </div>
              <span
                className={`mt-3 sm:mt-0 px-3 py-1 text-sm rounded-full font-medium capitalize ${
                  order.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : order.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* Items */}
            <div className="px-6 py-4">
              <ul className="divide-y divide-gray-100">
                {order.items.map((item: OrderItem) => (
                  <motion.li
                    key={item.id}
                    whileHover={{ scale: 1.01 }}
                    className="py-2 flex justify-between items-center text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {item.product.name}
                      </span>
                      <span className="text-gray-500 text-xs">
                        Quantity: {item.quantity}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">
                      £{item.price}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* Total */}
              <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between items-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-semibold text-gray-900">
                  £{order.total_price}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
