"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto max-w-6xl rounded-xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
        <div className="flex items-stretch">
          {/* Logo (already contains name + tagline).
              The wrapper has a wide, short ratio and object-cover trims the
              empty space above/below the artwork, so the height classes
              below size the actual logo. */}
         <Link
  href="/"
  aria-label="Hawkeye Vision home"
  className="flex shrink-0 items-center px-4 py-3 md:border-r md:border-neutral-200 md:px-6"
>
  <span className="relative block aspect-[850/160] h-9 overflow-hidden sm:h-11 md:h-12 lg:h-16">
    <Image
      src="/logo.png"
      alt="Hawkeye Vision – The Ultimate Destination for Surveillance Systems"
      fill
      priority
      sizes="(min-width: 1024px) 340px, (min-width: 768px) 255px, (min-width: 640px) 234px, 191px"
      className="object-cover object-[50%_57%]"
    />
  </span>
</Link>

          {/* Desktop nav */}
          <nav
            aria-label="Main"
            className="ml-auto hidden items-center gap-8 px-8 md:flex"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`relative py-1 text-sm font-semibold uppercase tracking-wider transition-colors
                  after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:bg-neutral-900 after:transition-transform
                  focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900
                  ${
                    isActive(href)
                      ? "text-neutral-900 after:scale-x-100"
                      : "text-neutral-600 after:scale-x-0 hover:text-neutral-900 hover:after:scale-x-100"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="ml-auto flex items-center border-l border-neutral-200 px-5 md:hidden"
          >
            <svg
              width="22"
              height="22"
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

        {/* Mobile menu */}
        {open && (
          <nav
            id="mobile-menu"
            aria-label="Mobile"
            className="flex flex-col border-t border-neutral-200 px-4 py-2 md:hidden"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`rounded-md px-2 py-3 text-sm font-semibold uppercase tracking-wider ${
                  isActive(href)
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}