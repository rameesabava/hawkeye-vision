"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const { user, cartCount, logout } = useAuth();

  // Close menus whenever route changes
  useEffect(() => {
    setOpen(false);
    setUserDropdown(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleCartClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast.error("Please sign in to view your cart.", {
        description: "Log in with your account to view your cart and place orders.",
        action: {
          label: "Sign In",
          onClick: () => router.push("/login?redirect=/cart"),
        },
      });
      router.push("/login?redirect=/cart");
    }
  };

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:px-4">
      <div className="mx-auto max-w-6xl rounded-xl bg-white shadow-[0_4px_20px_rgba(8,31,77,0.08)] border border-blue-100">
        <div className="flex items-center">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Hawkeye Vision home"
            className="flex shrink-0 items-center px-3 py-2 sm:px-4 sm:py-2.5 md:border-r md:border-blue-100 md:px-5 lg:px-6"
          >
            <span className="relative block aspect-[850/160] h-7 sm:h-8 md:h-11 lg:h-12 xl:h-14 overflow-hidden">
              <Image
                src="/logo.png"
                alt="Hawkeye Vision – The Ultimate Destination for Surveillance Systems"
                fill
                priority
                sizes="(min-width: 1280px) 300px, (min-width: 1024px) 260px, (min-width: 768px) 240px, 160px"
                className="object-cover object-[50%_57%]"
              />
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label="Main"
            className="ml-auto hidden items-center gap-4 px-4 lg:gap-6 lg:px-6 md:flex"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`relative whitespace-nowrap shrink-0 py-1 text-xs font-semibold uppercase tracking-wider lg:text-[13px] transition-colors
                  after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-[#081F4D] after:transition-transform
                  focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#081F4D]
                  ${
                    isActive(href)
                      ? "text-[#081F4D] after:scale-x-100"
                      : "text-slate-600 after:scale-x-0 hover:text-[#081F4D] hover:after:scale-x-100"
                  }`}
              >
                {label}
              </Link>
            ))}

            {/* Cart Icon Link */}
            <Link
              href="/cart"
              onClick={handleCartClick}
              aria-label="Cart"
              className="relative shrink-0 flex items-center p-1.5 md:p-2 text-slate-700 transition hover:text-[#081F4D]"
            >
              <svg
                className="h-5 w-5 md:h-6 md:w-6 transition-transform hover:scale-105"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] md:h-5 md:min-w-[20px] items-center justify-center rounded-full bg-[#081F4D] px-1 text-[10px] md:text-xs font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth section */}
            {user ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setUserDropdown((prev) => !prev)}
                  className="flex items-center gap-1.5 md:gap-2 rounded-full border border-blue-200 bg-blue-50/60 px-2.5 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-semibold text-[#081F4D] transition hover:bg-blue-100/60"
                >
                  <span className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-[#081F4D] text-[10px] md:text-xs text-white">
                    {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span className="max-w-[70px] lg:max-w-[110px] truncate whitespace-nowrap">
                    {user.username}
                  </span>
                  {user.role === "admin" && (
                    <span className="rounded bg-sky-200/80 px-1.5 py-0.5 text-[9px] md:text-[10px] font-bold text-sky-900 uppercase">
                      Admin
                    </span>
                  )}
                  <svg
                    className={`h-3 w-3 md:h-3.5 md:w-3.5 transition-transform duration-200 ${userDropdown ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-blue-100 bg-white p-1.5 shadow-xl">
                    {user.role === "admin" ? (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#081F4D] transition hover:bg-blue-50"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="7" height="9" />
                          <rect x="14" y="3" width="7" height="5" />
                          <rect x="14" y="12" width="7" height="9" />
                          <rect x="3" y="16" width="7" height="5" />
                        </svg>
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/orders"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-blue-50 hover:text-[#081F4D]"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        My Orders
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-blue-50 hover:text-[#081F4D]"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Profile Settings
                    </Link>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserDropdown(false);
                        toast.info("Logged out successfully.");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex shrink-0 items-center gap-2 md:gap-2.5">
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-slate-700 transition hover:bg-slate-100/70 hover:text-[#081F4D]"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="whitespace-nowrap rounded-full bg-[#081F4D] px-3.5 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-semibold text-white shadow-sm transition hover:bg-[#0A2660] hover:shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Right Bar: Cart + Toggle */}
          <div className="ml-auto flex items-center md:hidden">
            <Link
              href="/cart"
              onClick={handleCartClick}
              aria-label="Cart"
              className="relative flex items-center px-2.5 py-2 text-slate-700"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#081F4D] px-1 text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex items-center border-l border-blue-100 px-3 py-2.5 text-slate-700"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav
            id="mobile-menu"
            aria-label="Mobile"
            className="flex flex-col border-t border-blue-100 px-4 py-3 md:hidden space-y-1"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wider ${
                  isActive(href)
                    ? "bg-blue-50 text-[#081F4D]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#081F4D]"
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="border-t border-slate-100 my-2 pt-2" />

            {user ? (
              <>
                <div className="px-3 py-1 text-xs text-slate-400 font-medium">
                  Signed in as <span className="font-semibold text-[#081F4D]">{user.username}</span>
                </div>
                {user.role === "admin" ? (
                  <Link
                    href="/admin"
                    className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/orders"
                    className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    My Orders
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Profile Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    toast.info("Logged out successfully.");
                  }}
                  className="w-full text-left rounded-md px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2.5 pt-1.5">
                <Link
                  href="/login"
                  className="flex-1 text-center rounded-lg border border-slate-200 py-2.5 text-[15px] font-semibold text-[#081F4D] transition hover:bg-blue-50"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center rounded-lg bg-[#081F4D] py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#0A2660]"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
