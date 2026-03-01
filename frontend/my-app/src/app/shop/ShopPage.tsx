"use client";

import { useState, useMemo } from "react";
import { useCart } from "@/store/useCart";
import { useProducts } from "@/hooks/useProduct";
import { useBundles } from "@/hooks/useBundle";
import { ProductCard } from "./ProductCard";
import BundleCard from "./BundleCard";
import type { Product } from "@/types/product";
import { Bundle } from "@/types/bundle";

type SortOption = "popular" | "priceLow" | "priceHigh";

export default function ShopPage() {
  const { addItem, updateQuantity, getItemCount } = useCart();
  const { data: products = [], isLoading, isError } = useProducts();
  const { data: bundles = [] } = useBundles();

  const [shopView, setShopView] = useState<"all" | "kits" | "products">("all");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  const categories = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(products.map((p) => p.category?.name).filter(Boolean)),
      ),
    ],
    [products],
  );

  const hasStock = (product: Product) =>
    product.variants?.length
      ? product.variants.some((v) => v.stock > 0)
      : (product.stock ?? 0) > 0;

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.category?.name === selectedCategory;

      const inStock = hasStock(product);
      const matchesAvailability =
        availability === "all" ||
        (availability === "available" && inStock) ||
        (availability === "unavailable" && !inStock);

      return matchesCategory && matchesAvailability;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "priceLow") return Number(a.price) - Number(b.price);
      if (sortBy === "priceHigh") return Number(b.price) - Number(a.price);

      // "popular" fallback → prioritise in-stock first
      return Number(hasStock(b)) - Number(hasStock(a));
    });

    return result;
  }, [products, selectedCategory, availability, sortBy]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 p-6 bg-white dark:bg-gray-800 sticky top-20 h-fit">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Category</h3>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`block w-full text-left px-3 py-2 rounded-md mb-1 ${
                selectedCategory === cat
                  ? "bg-pink-600 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Availability</h3>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full p-2 rounded-md border"
          >
            <option value="all">All</option>
            <option value="available">In Stock</option>
            <option value="unavailable">Out of Stock</option>
          </select>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Sort By</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full p-2 rounded-md border"
          >
            <option value="popular">Popular</option>
            <option value="priceLow">Price: Low → High</option>
            <option value="priceHigh">Price: High → Low</option>
          </select>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-8">
          Build or Upgrade Your Fightstick
        </h1>

        {shopView !== "products" && bundles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">🧰 Starter Kits</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {bundles.map((bundle: Bundle) => (
                <BundleCard key={bundle.id} bundle={bundle} />
              ))}
            </div>
          </section>
        )}

        {isLoading && <p>Loading...</p>}
        {isError && <p className="text-red-500">Error loading products.</p>}

        {!isLoading && !isError && shopView !== "kits" && (
          <section>
            <h2 className="text-xl font-bold mb-4">🛒 Products</h2>

            {filteredProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addItem={addItem}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
