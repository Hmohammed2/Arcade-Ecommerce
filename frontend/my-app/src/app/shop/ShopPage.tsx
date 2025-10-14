"use client";

import { useState } from "react";
import { useCart } from "@/store/useCart";
import { useProducts } from "@/hooks/useProduct";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

export default function ShopPage() {
  const { addItem, isInCart } = useCart();
  const { data: products = [], isLoading, isError } = useProducts();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [availability, setAvailability] = useState<string>("all");

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category?.name))).filter(
      Boolean
    ),
  ];

  const filteredProducts = products.filter((product: Product) => {
    const inCategory =
      selectedCategory === "all" || product.category?.name === selectedCategory;
    const inPriceRange =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesAvailability =
      availability === "all" ||
      (availability === "available" && product.stock > 0) ||
      (availability === "unavailable" && product.stock === 0);
    return inCategory && inPriceRange && matchesAvailability;
  });

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Sidebar Filters */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-6 hidden md:block">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Category</h3>
          <ul className="space-y-2">
            {categories.map((cat: string) => (
              <li key={cat}>
                <button
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    selectedCategory === cat
                      ? "bg-pink-600 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Price Range</h3>
          <input
            type="range"
            min={0}
            max={100}
            step={10}
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
            className="w-full accent-pink-600"
          />
          <p className="mt-2 text-sm">
            Up to <span className="font-bold">£{priceRange[1]}</span>
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Availability</h3>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full border rounded-md p-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          >
            <option value="all">All</option>
            <option value="available">In Stock</option>
            <option value="unavailable">Out of Stock</option>
          </select>
        </div>
      </aside>

      {/* Products Grid */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Shop</h1>
        {isLoading && <p>Loading products...</p>}
        {isError && <p className="text-red-500">Error loading products</p>}
        {!isLoading && !isError && (
          <>
            {filteredProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addItem={addItem}
                    isInCart={isInCart}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
