"use client";

import { useState, useMemo } from "react";
import { useCart } from "@/store/useCart";
import { useProducts } from "@/hooks/useProduct";
import { useBundles } from "@/hooks/useBundle";
import { ProductCard } from "./ProductCard";
import BundleCard from "./BundleCard";
import { Bundle } from "@/types/bundle";
import type { Product } from "@/types/product";

export default function ShopPage() {
  // ⬇️ grab the extra cart helpers
  const { addItem, isInCart, updateQuantity, getItemCount } = useCart();
  const { data: products = [], isLoading, isError } = useProducts();
  const { data: bundles = [] } = useBundles();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [shopView, setShopView] = useState<"all" | "kits" | "products">("all");

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [availability, setAvailability] = useState<string>("all");

  // ✅ Extract unique categories
  const categories = useMemo(
    () => [
      "all",
      ...Array.from(new Set(products.map((p) => p.category?.name))).filter(
        Boolean
      ),
    ],
    [products]
  );

  // ✅ Compute stock availability per product (variant-aware)
  const getProductStockStatus = (product: Product) => {
    if (product.variants?.length) {
      // Check if any variant is in stock
      return product.variants.some((v) => v.stock > 0);
    }
    return (product.stock ?? 0) > 0;
  };

  // ✅ Filter products dynamically
  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const inCategory =
        selectedCategory === "all" ||
        product.category?.name === selectedCategory;

      const price =
        typeof product.price === "string"
          ? parseFloat(product.price)
          : product.price;

      const inPriceRange = price >= priceRange[0] && price <= priceRange[1];

      const hasStock = getProductStockStatus(product);
      const matchesAvailability =
        availability === "all" ||
        (availability === "available" && hasStock) ||
        (availability === "unavailable" && !hasStock);

      return inCategory && inPriceRange && matchesAvailability;
    });
  }, [products, selectedCategory, priceRange, availability]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Sidebar Filters */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-6 hidden md:block">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Shop View</h3>
          <select
            value={shopView}
            onChange={(e) => setShopView(e.target.value as any)}
            className="w-full p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
          >
            <option value="all">All Items</option>
            <option value="kits">Mod Kits Only</option>
            <option value="products">Products Only</option>
          </select>
        </div>

        {/* Category Filter */}
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

        {/* Price Range */}
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

        {/* Availability Filter */}
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

        <div className="md:hidden flex justify-between items-center mb-4">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-semibold"
          >
            Filter Products
          </button>
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)}>✕</button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Shop View</h3>
                <select
                  value={shopView}
                  onChange={(e) => setShopView(e.target.value as any)}
                  className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                >
                  <option value="all">All Items</option>
                  <option value="kits">Mod Kits Only</option>
                  <option value="products">Products Only</option>
                </select>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowMobileFilters(false);
                      }}
                      className={`px-3 py-2 rounded-full text-sm ${
                        selectedCategory === cat
                          ? "bg-pink-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Max Price</h3>
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
                <p className="mt-2 text-sm">Up to £{priceRange[1]}</p>
              </div>

              {/* Availability */}
              <div>
                <h3 className="font-semibold mb-2">Availability</h3>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                >
                  <option value="all">All</option>
                  <option value="available">In Stock</option>
                  <option value="unavailable">Out of Stock</option>
                </select>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="mt-6 w-full bg-pink-600 text-white py-3 rounded-xl font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {bundles.length > 0 && shopView !== "products" && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">🧰 Mod Kits</h2>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {bundles.map((bundle: Bundle) => (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  addItem={addItem}
                  isInCart={isInCart}
                  getItemCount={getItemCount}
                />
              ))}
            </div>
          </section>
        )}

        {isLoading && <p>Loading products...</p>}
        {isError && (
          <p className="text-red-500">
            Error loading products. Please try again.
          </p>
        )}

        {!isLoading && !isError && shopView !== "kits" && (
          <>
            {filteredProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <section className="mt-12">
                <h2 className="text-xl font-bold mb-4">🧰 Products</h2>

                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => {
                    const inStock = getProductStockStatus(product);
                    return (
                      <div key={product.id} className="relative">
                        {!inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl z-10">
                            <span className="text-white text-sm font-semibold">
                              Out of Stock
                            </span>
                          </div>
                        )}

                        <ProductCard
                          product={product}
                          addItem={addItem}
                          isInCart={isInCart}
                          updateQuantity={updateQuantity}
                          getItemCount={getItemCount}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
