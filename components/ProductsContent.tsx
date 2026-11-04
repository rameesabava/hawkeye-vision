"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { api, getImageUrl, Product } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Pagination from "@/components/Pagination";

const EASE = [0.22, 1, 0.36, 1] as const;

function useReduce() {
  const prefers = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? !!prefers : false;
}

const RING = [
  { title: "Analog Camera", img: "/products/analog-cameras.png" },
  { title: "IP Camera", img: "/products/ip-camera.png" },
  { title: "DVR", img: "/products/dvr.png" },
  { title: "NVR", img: "/products/nvr.png" },
  { title: "Biometric attendance", img: "/products/biometric.png" },
  { title: "Video Door Phones", img: "/products/video-door-phones.png" },
];

function RingCard({
  index,
  width,
  radius,
  rotation,
  title,
  img,
}: {
  index: number;
  width: number;
  radius: number;
  rotation: MotionValue<number>;
  title: string;
  img: string;
}) {
  const [broken, setBroken] = useState(false);
  const angle = index * (360 / RING.length);

  const ref = useRef<HTMLDivElement>(null);
  const brightness = (v: number) =>
    0.25 + 0.75 * ((Math.cos(((v + angle) * Math.PI) / 180) + 1) / 2);

  useEffect(() => {
    const apply = (v: number) => {
      if (ref.current) ref.current.style.opacity = brightness(v).toFixed(3);
    };
    apply(rotation.get());
    return rotation.on("change", apply);
  }, [rotation, angle]);

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width,
        height: width * 1.25,
        transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`,
      }}
    >
      <div
        ref={ref}
        style={{ opacity: Number(brightness(-20).toFixed(3)) }}
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-neutral-100 shadow-2xl"
      >
        <div className="relative min-h-0 flex-1">
          {!broken && (
            <Image
              src={img}
              alt=""
              fill
              sizes="300px"
              className="object-contain p-3"
              onError={() => setBroken(true)}
            />
          )}
        </div>
        <div className="bg-[#081F4D] px-2 py-2 text-center text-xs font-semibold leading-tight text-white sm:text-sm">
          {title}
        </div>
      </div>
    </div>
  );
}

function ProductRing() {
  const reduce = useReduce();
  const spin = useMotionValue(-20);
  const slow = useRef(false);
  const [size, setSize] = useState({ width: 230, radius: 300 });

  const { scrollY } = useScroll();
  const boost = useMotionValue(0);
  useEffect(() => {
    boost.set(scrollY.get() * 0.08);
    return scrollY.on("change", (v) => boost.set(v * 0.08));
  }, [scrollY, boost]);
  const rotation = useTransform(
    [spin, boost],
    (latest: number[]) => latest[0] + latest[1]
  );

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const cap = vw < 640 ? 200 : vw < 1024 ? 220 : vw < 1536 ? 250 : 300;
      const fit = (vw / 2 - 16) / 1.3;
      const width = Math.round(Math.max(110, Math.min(cap, fit)));
      const radius = Math.round(
        (width / (2 * Math.tan(Math.PI / RING.length))) * 1.25
      );
      setSize({ width, radius });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    spin.set(spin.get() + (delta / 1000) * (slow.current ? 3 : 9));
  });

  return (
    <div
      className="relative mx-auto mt-10 w-full sm:mt-16"
      style={{ perspective: 1600, height: size.width * 1.4 + 80 }}
      onPointerEnter={() => (slow.current = true)}
      onPointerLeave={() => (slow.current = false)}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={{ rotateX: -8, rotateY: rotation }}
      >
        {RING.map((c, i) => (
          <RingCard
            key={c.title}
            index={i}
            width={size.width}
            radius={size.radius}
            rotation={rotation}
            title={c.title}
            img={c.img}
          />
        ))}
      </motion.div>
    </div>
  );
}

function Hero() {
  const reduce = useReduce();
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#081F4D] via-[#0A2660] to-[#071838] px-4 pb-20 sm:px-6 pt-32 text-white sm:pb-28 sm:pt-40 md:pt-48">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-2/3 -z-10 h-[70vw] max-h-[760px] w-[70vw] max-w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/15 blur-[130px]"
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="mx-auto max-w-4xl text-center"
      >
        <div className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300 border border-white/20 mb-3">
          Surveillance Catalogue
        </div>
        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
          Our products
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100/80">
          CCTV and IT security products from the brands you trust, supplied
          wholesale from Kochi.
        </p>
      </motion.div>

      <ProductRing />

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.5 }}
        className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4"
      >
        <a
          href="#catalogue"
          className="rounded-full bg-white px-8 py-4 text-center text-sm font-bold text-[#081F4D] transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white shadow-lg"
        >
          Browse the catalogue
        </a>
      </motion.div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { user, refreshCartCount } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = getImageUrl(product.image);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to add items to your cart", {
        description: "Login with your customer account to place orders.",
        action: {
          label: "Login",
          onClick: () => router.push(`/login?redirect=/products/${product.id}`),
        },
      });
      return;
    }

    try {
      setAdding(true);
      await api.addToCart(product.id, 1);
      await refreshCartCount();
      setAdded(true);
      toast.success(`"${product.name}" added to cart successfully!`, {
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart"),
        },
      });
      setTimeout(() => setAdded(false), 2000);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to add product to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.45, ease: EASE }}
      onClick={() => router.push(`/products/${product.id}`)}
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_10px_30px_rgba(8,31,77,0.06)] transition-all hover:border-blue-300 hover:shadow-[0_16px_36px_rgba(8,31,77,0.12)] text-slate-900"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-slate-50 border-b border-slate-100">
        {!imageError && imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 sm:p-6"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-slate-100 px-6 text-center text-xl font-bold tracking-tight text-slate-400 sm:text-2xl">
            {product.brand}
          </div>
        )}
        <div className="absolute top-3 left-3 rounded-full bg-[#081F4D] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
          {product.brand}
        </div>
      </div>

      {/* Details Section */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
          Model: {product.model}
        </div>
        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-base font-bold leading-snug text-[#081F4D] sm:text-lg">
          {product.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-500 sm:text-sm">
          <span>{product.category}</span>
          <span className="font-bold text-[#081F4D]">
            {Number(product.price) > 0 ? `₹${Number(product.price).toLocaleString("en-IN")}` : "Price on request"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 sm:mt-auto sm:pt-4">
          <Link
            href={`/products/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded-full border border-blue-200 bg-blue-50/70 px-4 py-2.5 text-center text-xs font-bold text-[#081F4D] transition hover:bg-blue-100"
          >
            View Product
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className={`flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition shadow-sm ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-[#081F4D] text-white hover:bg-[#0A2660]"
            }`}
          >
            {added ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Added
              </>
            ) : adding ? (
              "Adding..."
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

const chip =
  "shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#081F4D]";

function Catalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(6);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await api.getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Reset to page 1 whenever search, category, or brand filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, brand]);

  // Compute unique categories and brands from fetched products
  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ["All", ...list];
  }, [products]);

  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
    return ["All", ...list];
  }, [products]);

  // Filter products by search term, category, and brand
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === "All" || p.category.toLowerCase() === category.toLowerCase();
      const matchesBrand = brand === "All" || p.brand.toLowerCase() === brand.toLowerCase();
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.model.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.type && p.type.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term));

      return matchesCategory && matchesBrand && matchesSearch;
    });
  }, [products, category, brand, search]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;

  // Paginated slice for current page
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage, productsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="catalogue" className="scroll-mt-24 bg-slate-50 px-4 py-16 text-slate-900 sm:px-6 sm:py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#081F4D]">
              Full Equipment Lineup
            </div>
            <h2 className="max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-[#081F4D] sm:text-5xl">
              Browse the catalogue
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Explore our range of professional security and surveillance equipment.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search products, models, brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-blue-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-[#081F4D] focus:outline-none focus:ring-2 focus:ring-[#081F4D]/10"
            />
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category chips + scroll arrow */}
        <div className="mt-8 flex items-center gap-3">
          <div
            ref={rowRef}
            role="group"
            aria-label="Filter by category"
            className="flex flex-1 gap-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`${chip} ${
                  category === c
                    ? "border-[#081F4D] bg-[#081F4D] text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#081F4D] hover:text-[#081F4D]"
                }`}
              >
                {c === "All" ? "All Categories" : c}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Scroll categories"
            onClick={() => rowRef.current?.scrollBy({ left: 260, behavior: "smooth" })}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-blue-100 bg-white text-[#081F4D] shadow-sm transition hover:bg-blue-50"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        {/* Brand chips */}
        <div
          role="group"
          aria-label="Filter by brand"
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Brand:</span>
          {brands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBrand(b)}
              aria-pressed={brand === b}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                brand === b
                  ? "bg-[#081F4D] text-white shadow-sm"
                  : "border border-blue-100 bg-blue-50/70 text-slate-700 hover:bg-blue-100/70"
              }`}
            >
              {b === "All" ? "All Brands" : b}
            </button>
          ))}
        </div>

        {/* Count indicator & Page Info */}
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500">
          <p aria-live="polite" className="font-medium">
            {loading
              ? "Loading products..."
              : filteredProducts.length === 0
              ? "No products found"
              : `Showing ${Math.min((currentPage - 1) * productsPerPage + 1, filteredProducts.length)}–${Math.min(
                  currentPage * productsPerPage,
                  filteredProducts.length
                )} of ${filteredProducts.length} products`}
          </p>
          {!loading && filteredProducts.length > 0 && totalPages > 1 && (
            <span className="text-xs font-semibold text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-3xl border border-blue-100 bg-blue-50/60" />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="mt-6 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {paginatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination Controls */}
        {!loading && filteredProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            totalItems={filteredProducts.length}
            itemsPerPage={productsPerPage}
            pageSize={productsPerPage}
            pageSizeOptions={[6, 12, 24]}
            onPageSizeChange={(sz) => {
              setProductsPerPage(sz);
              setCurrentPage(1);
            }}
            itemName="products"
            scrollToId="catalogue"
          />
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="mt-6 rounded-3xl border border-blue-100 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#081F4D]">No products match your search or filter.</p>
            <p className="mt-2 text-slate-600">
              Try searching with another keyword or resetting the category and brand filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
                setBrand("All");
              }}
              className="mt-6 inline-block rounded-full bg-[#081F4D] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0A2660]"
            >
              Reset Filters
            </button>
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <Link
            href="/contact"
            className="rounded-full bg-[#081F4D] px-8 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#0A2660] hover:shadow-lg"
          >
            Request the full price list
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function ProductsContent() {
  return (
    <>
      <Hero />
      <Catalogue />
    </>
  );
}
