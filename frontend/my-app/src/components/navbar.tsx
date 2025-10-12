"use client";

import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth";
import { useSearchProducts } from "@/hooks/useSearchProducts";
import { getImageUrl } from "@/library/getImageUrl";
import { useRouter } from "next/router";

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");

  const totalItems = useCart((state) => state.getTotalItems());
  const { user, isAuthenticated, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading } = useSearchProducts(query);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) console.log("Searching for:", query);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login"); // 👈 redirect after logout
  };

  return (
    <header className="bg-white shadow-sm w-full top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            width={140}
            height={40}
            src="/Logo.webp"
            alt="ArcadeStickLabs Logo"
          />
        </Link>

        {/* Desktop Center: Shop + Search */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/shop"
            className="px-4 py-2 text-sm text-gray-600 hover:text-pink-600 transition"
          >
            Shop
          </Link>
          <form
            onSubmit={handleSearch}
            className="flex items-center border rounded-lg px-3 py-1.5 w-72 relative"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-grow outline-none text-sm text-gray-700"
            />
            <button type="submit" aria-label="Search">
              <Search className="w-5 h-5 text-gray-500" />
            </button>

            {query && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-80 overflow-y-auto">
                {isLoading ? (
                  <p className="p-3 text-sm text-gray-500">Searching...</p>
                ) : results.length > 0 ? (
                  results.map((p: any) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      onClick={() => setQuery("")}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition text-sm text-gray-700"
                    >
                      {/* Product Image */}
                      {p.image ? (
                        <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden border border-gray-100">
                          <Image
                            src={getImageUrl(p.image)}
                            alt={p.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md" />
                      )}

                      {/* Product Name & Optional Info */}
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800 truncate">
                          {p.name}
                        </span>
                        {p.price && (
                          <span className="text-xs text-gray-500">
                            £{Number(p.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="p-3 text-sm text-gray-500">No results found</p>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Desktop Right: Cart + Auth */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-pink-600 transition" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full px-1.5">
                {totalItems}
              </span>
            )}
          </Link>

          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-md border text-sm text-black hover:text-pink-800 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-md border text-sm text-white bg-pink-600 hover:bg-pink-800 transition"
              >
                Register
              </Link>
            </div>
          ) : (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen((p) => !p)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-600 text-white text-sm font-semibold">
                  {user?.first_name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm text-gray-700 hidden sm:block">
                  Hello, <span className="font-medium">{user?.first_name}</span>{" "}
                  👋
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Right: Hamburger + Cart */}
        <div className="md:hidden flex items-center gap-3 relative">
          {/* Cart Icon */}
          {!isMobileSearchOpen && (
            <Link
              href="/cart"
              className="relative p-2 rounded-md text-gray-700 hover:text-pink-600 transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full px-1.5">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Search Icon / Input */}
          <div className="flex items-center relative">
            {!isMobileSearchOpen ? (
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                <Search className="w-6 h-6" />
              </button>
            ) : (
              <form
                onSubmit={handleSearch}
                className="relative flex items-center border border-gray-300 rounded-full px-3 py-1 w-[70vw] bg-white shadow-sm transition-all duration-300"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  autoFocus
                  className="flex-grow outline-none text-sm text-gray-700 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setQuery("");
                  }}
                >
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-700 transition" />
                </button>

                {/* 🔍 Live Suggestions Dropdown */}
                {query && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {isLoading ? (
                      <p className="p-2 text-sm text-gray-500">Searching...</p>
                    ) : results.length > 0 ? (
                      results.map((p: any) => (
                        <Link
                          key={p.id}
                          href={`/products/${p.slug}`}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                          onClick={() => {
                            setQuery("");
                            setIsMobileSearchOpen(false);
                          }}
                        >
                          {p.image && (
                            <Image
                              src={getImageUrl(p.image)}
                              alt={p.name}
                              width={36}
                              height={36}
                              className="rounded-md object-cover"
                            />
                          )}
                          <span>{p.name}</span>
                        </Link>
                      ))
                    ) : (
                      <p className="p-2 text-sm text-gray-500">
                        No results found
                      </p>
                    )}
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Hamburger */}
          {!isMobileSearchOpen && (
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-pink-500 transition"
            >
              {isMobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-6 space-y-4 animate-slide-down">
          {/* Links */}
          <nav className="flex flex-col gap-2">
            <Link
              href="/shop"
              className="py-2 text-gray-700 hover:text-pink-600 transition"
              onClick={() => setIsMobileOpen(false)}
            >
              Shop
            </Link>

            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="py-2 text-gray-700 hover:text-pink-600 transition"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="py-2 text-white bg-pink-600 text-center rounded-md hover:bg-pink-700 transition"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="py-2 flex items-center gap-2 text-gray-700 hover:text-pink-600 transition"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileOpen(false);
                  }}
                  className="py-2 flex items-center gap-2 text-gray-700 hover:text-pink-600 transition"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
