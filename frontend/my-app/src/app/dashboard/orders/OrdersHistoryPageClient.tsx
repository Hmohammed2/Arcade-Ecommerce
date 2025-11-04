"use client";

import { useOrders } from "@/hooks/useOrders";
import type { Order, OrderItem } from "@/types/order";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { getColourTextClass } from "@/app/utils/colour-text";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function OrderHistoryPageClient() {
  const { data: orders, isLoading } = useOrders();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const toggleOrder = (orderId: number) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  // 🌀 Loading state
  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-600 dark:text-gray-300">
        <svg
          className="animate-spin h-5 w-5 mr-2 text-gray-500 dark:text-gray-400"
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
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        Loading your orders...
      </div>
    );

  // 🚫 Empty state
  if (!orders?.length)
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[50vh] text-gray-600 dark:text-gray-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 mb-3 text-gray-400 dark:text-gray-500"
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
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          When you place an order, it will appear here.
        </p>
      </motion.div>
    );

  // ✅ Orders list
  return (
    <div className="max-w-5xl mx-auto py-10 px-3 sm:px-6 bg-white dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      <div className="space-y-5 sm:space-y-6">
        {orders.map((order: Order, index: number) => {
          const isExpanded = expandedOrder === order.id;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-800/40 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Header */}
              <div
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg flex items-center justify-between sm:block">
                    Order #{order.id}
                    <span className="ml-2 sm:hidden text-gray-400">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Placed on{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Delivery:{" "}
                    <span className="font-medium capitalize text-gray-700 dark:text-gray-300">
                      {order.delivery_method}
                    </span>{" "}
                    (
                    {Number(order.delivery_fee) > 0
                      ? `£${order.delivery_fee}`
                      : "Free"}
                    )
                  </p>
                </div>

                <span
                  className={`mt-3 sm:mt-0 px-3 py-1 text-xs sm:text-sm rounded-full font-medium capitalize self-start sm:self-auto ${
                    order.status === "completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items (collapsible on mobile, always shown on desktop) */}
              <AnimatePresence initial={false}>
                {(isExpanded ||
                  (typeof window !== "undefined" &&
                    window.innerWidth >= 640)) && (
                  <motion.div
                    key="order-details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 sm:px-6 py-3 sm:py-4"
                  >
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                      {order.items.map((item: OrderItem) => (
                        <li
                          key={item.id}
                          className="py-2 flex justify-between items-start text-sm sm:text-base"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {item.product.name}
                              {item.colour && (
                                <>
                                  {" "}
                                  -{" "}
                                  <span
                                    className={getColourTextClass(item.colour)}
                                  >
                                    {item.colour}
                                  </span>
                                </>
                              )}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          <span className="text-gray-700 dark:text-gray-200 font-medium ml-2 shrink-0">
                            £{item.price}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Totals */}
                    <div className="mt-4 sm:mt-5 border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 space-y-1 text-sm sm:text-base">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Delivery Fee</span>
                        <span>
                          {Number(order.delivery_fee) > 0
                            ? `£${order.delivery_fee}`
                            : "Free"}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                        <span>Total</span>
                        <span>£{order.total_price}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
