"use client";

import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  LayoutDashboard,
  LogOutIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth";
import { useSearchProducts } from "@/hooks/useSearchProducts";
import { getImageUrl } from "@/library/getImageUrl";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const totalItems = useCart((state) => state.getTotalItems());
  const { user, isAuthenticated, logout } = useAuth();
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
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query)}`);
      setQuery("");
      setIsMobileSearchOpen(false);
      setIsMobileOpen(false);
    }
  };

  return (
    <nav
      className="
  sticky top-0 z-50
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border-b border-pink-200
  shadow-sm
  transition-colors
"
    >
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/Logo.webp"
            alt="ArcadeStickLabs"
            width={150}
            height={40}
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/shop"
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
          >
            Shop
          </Link>

          <Link
            href="/resources"
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
          >
            Resources
          </Link>

          <Link
            href="/faqs"
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
          >
            FAQs
          </Link>

          <Link
            href="/contact"
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
          >
            Contact
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className="relative flex items-center border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 w-72 transition-colors"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-grow outline-none text-sm bg-transparent text-gray-800 dark:text-gray-200"
            />

            <button type="submit">
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Live Search Dropdown */}
            {query && (
              <div className="absolute top-full left-0 w-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg max-h-80 overflow-y-auto">
                {isLoading ? (
                  <p className="p-3 text-sm text-gray-500 dark:text-gray-400">
                    Searching...
                  </p>
                ) : results.length > 0 ? (
                  results.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      onClick={() => setQuery("")}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {p.image && (
                        <Image
                          src={getImageUrl(p.image)}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="border border-black dark:border-gray-600"
                        />
                      )}

                      <div>
                        <div>{p.name}</div>
                        <div className="text-sm text-pink-600">
                          £{Number(p.price).toFixed(2)}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="p-3 text-sm text-gray-500 dark:text-gray-400">
                    No results
                  </p>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 bg-pink-600 text-white px-4 py-2 border-2 border-black dark:border-gray-700 font-semibold hover:bg-pink-700 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-black dark:bg-gray-700 text-white text-xs px-1.5 border border-black dark:border-gray-600">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Auth */}
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 border-2 border-black dark:border-gray-700 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="px-4 py-2 bg-black dark:bg-gray-800 text-white border-2 border-black dark:border-gray-700 font-semibold hover:bg-pink-600 transition-colors"
              >
                Register
              </Link>
            </>
          ) : (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 bg-pink-600 text-white flex items-center justify-center font-bold border border-black dark:border-gray-700">
                  {user?.first_name?.[0] ?? "U"}
                </div>

                {user?.first_name}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 shadow-lg">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      router.push("/login");
                    }}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-pink-50 dark:hover:bg-gray-700 w-full text-left transition-colors"
                  >
                    <LogOutIcon size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Right */}
        <div className="md:hidden flex items-center gap-3 relative">
          {/* Cart */}
          {!isMobileSearchOpen && (
            <Link
              href="/cart"
              className="
        relative p-2 rounded-md
        text-gray-700 dark:text-gray-200
        hover:text-pink-600 dark:hover:text-pink-400
        transition-colors
      "
            >
              <ShoppingCart className="w-6 h-6" />

              {totalItems > 0 && (
                <span
                  className="
            absolute -top-1 -right-1
            bg-pink-600 text-white
            text-xs rounded-full px-1.5
          "
                >
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Search */}
          <div className="flex items-center relative">
            {!isMobileSearchOpen ? (
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="
          p-2 rounded-md
          text-gray-700 dark:text-gray-200
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-colors
        "
              >
                <Search className="w-6 h-6" />
              </button>
            ) : (
              <form
                onSubmit={handleSearch}
                className="
          relative flex items-center
          border-2 border-black dark:border-gray-700
          rounded-full px-3 py-1
          w-[70vw]
          bg-white dark:bg-gray-800
          shadow-sm
          transition-all duration-300
        "
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  autoFocus
                  className="
            flex-grow outline-none text-sm
            text-black dark:text-white
            bg-transparent
          "
                />

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setQuery("");
                  }}
                >
                  <X
                    className="
            w-5 h-5
            text-gray-500 dark:text-gray-400
            hover:text-gray-700 dark:hover:text-gray-200
            transition-colors
          "
                  />
                </button>

                {/* Live results */}
                {query && (
                  <div
                    className="
              absolute top-full left-0 mt-1 w-full
              bg-white dark:bg-gray-800
              border-2 border-black dark:border-gray-700
              shadow-lg
              z-50
            "
                  >
                    {isLoading ? (
                      <p className="p-2 text-sm text-gray-500 dark:text-gray-400">
                        Searching...
                      </p>
                    ) : results.length > 0 ? (
                      results.map((p) => (
                        <Link
                          key={p.id}
                          href={`/products/${p.slug}`}
                          className="
                    flex items-center gap-3 px-3 py-2
                    hover:bg-pink-50 dark:hover:bg-gray-700
                    text-sm
                  "
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
                              className="
                        border border-black dark:border-gray-600
                      "
                            />
                          )}

                          <span>{p.name}</span>
                        </Link>
                      ))
                    ) : (
                      <p className="p-2 text-sm text-gray-500 dark:text-gray-400">
                        No results
                      </p>
                    )}
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Menu toggle */}
          {!isMobileSearchOpen && (
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="
        p-2 rounded-md
        text-gray-700 dark:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-800
        transition-colors
      "
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
        <div
          className="
      md:hidden
      bg-white dark:bg-gray-900
      border-t-2 border-black dark:border-gray-700
      py-4 px-6 space-y-4
      transition-colors
    "
        >
          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            <Link
              href="/shop"
              onClick={() => setIsMobileOpen(false)}
              className="
          py-2
          text-gray-700 dark:text-gray-200
          hover:text-pink-600 dark:hover:text-pink-400
          transition-colors
        "
            >
              Shop
            </Link>

            <Link
              href="/resources"
              onClick={() => setIsMobileOpen(false)}
              className="
          py-2
          text-gray-700 dark:text-gray-200
          hover:text-pink-600 dark:hover:text-pink-400
          transition-colors
        "
            >
              Resources
            </Link>

            <Link
              href="/faqs"
              onClick={() => setIsMobileOpen(false)}
              className="
          py-2
          text-gray-700 dark:text-gray-200
          hover:text-pink-600 dark:hover:text-pink-400
          transition-colors
        "
            >
              FAQs
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsMobileOpen(false)}
              className="
          py-2
          text-gray-700 dark:text-gray-200
          hover:text-pink-600 dark:hover:text-pink-400
          transition-colors
        "
            >
              Contact
            </Link>

            {/* Auth Section */}
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="
              mt-2
              py-2
              text-gray-700 dark:text-gray-200
              hover:text-pink-600 dark:hover:text-pink-400
              transition-colors
            "
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setIsMobileOpen(false)}
                  className="
              py-2
              bg-pink-600 text-white
              text-center
              border-2 border-black dark:border-gray-700
              font-semibold
              hover:bg-pink-700
              transition-colors
            "
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileOpen(false)}
                  className="
              mt-2
              py-2 flex items-center gap-2
              text-gray-700 dark:text-gray-200
              hover:text-pink-600 dark:hover:text-pink-400
              transition-colors
            "
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setIsMobileOpen(false);
                    router.push("/login");
                  }}
                  className="
              py-2 flex items-center gap-2
              text-left
              text-gray-700 dark:text-gray-200
              hover:text-pink-600 dark:hover:text-pink-400
              transition-colors
            "
                >
                  <LogOutIcon className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
