"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import {
  BRANDS,
  CATEGORIES,
  CATEGORY_IMAGES,
  PRODUCTS,
  type Product,
} from "@/data/products";

const EASE = [0.22, 1, 0.36, 1] as const;

// Reads the reduced-motion setting only after mount, so the first client render
// matches the server HTML.
function useReduce() {
  const prefers = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? !!prefers : false;
}

// Pictures for the rotating ring (files in /public/products/)
const RING = [
  { title: "Analog Camera", img: "/products/analog-cameras.png" },
  { title: "IP Camera", img: "/products/ip-camera.png" },
  { title: "DVR", img: "/products/dvr.png" },
  { title: "NVR", img: "/products/nvr.png" },
  { title: "Biometric attendance", img: "/products/biometric.png" },
  { title: "Video Door Phones", img: "/products/video-door-phones.png" },
];

/* ---------------------------------------------------------------------- */
/* Hero: cards sit on a ring that turns slowly; scrolling spins it further */
/* ---------------------------------------------------------------------- */

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

  // Cards facing the viewer are bright, cards at the back fade away.
  // The opacity is written straight to the element after mount, so the HTML the
  // server sends is a fixed value and always matches the first client render.
  const ref = useRef<HTMLDivElement>(null);
  const brightness = (v: number) =>
    0.25 + 0.75 * ((Math.cos(((v + angle) * Math.PI) / 180) + 1) / 2);

  useEffect(() => {
    const apply = (v: number) => {
      if (ref.current) ref.current.style.opacity = brightness(v).toFixed(3);
    };
    apply(rotation.get());
    return rotation.on("change", apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {/* The whole picture is shown (object-contain), never cropped */}
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
        <div className="bg-neutral-950 px-2 py-2 text-center text-xs font-semibold leading-tight text-white sm:text-sm">
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

  // Scroll adds extra spin. It is applied after mount so the first client
  // render matches the server HTML even if the browser restores a scroll position.
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

  // Size the ring from the screen so every card fits inside it.
  // A ring of 6 cards spans about 1.2 x the card width on each side of centre.
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

  // Slow, continuous turn (degrees per second); eases off on hover
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
    <section className="relative isolate overflow-hidden bg-neutral-950 px-4 pb-20 sm:px-6 pt-32 text-white sm:pb-28 sm:pt-40 md:pt-48">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-2/3 -z-10 h-[70vw] max-h-[760px] w-[70vw] max-w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky/15 blur-[130px]"
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="mx-auto max-w-4xl text-center"
      >
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Our products
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
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
          className="rounded-full bg-white px-8 py-4 text-center text-sm font-semibold text-black transition hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Browse the catalogue
        </a>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Catalogue                                                               */
/* ---------------------------------------------------------------------- */

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [broken, setBroken] = useState(false);
  const src = product.img ?? CATEGORY_IMAGES[product.category];
  const href = product.href ?? "/contact";
  const external = href.startsWith("http");

  const viewClass =
    "rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-950 transition hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
  const arrowClass =
    "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-neutral-950 transition hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  const actions = external ? (
    <>
      <a href={href} target="_blank" rel="noopener noreferrer" className={viewClass}>
        View Product
      </a>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${product.name}`}
        className={arrowClass}
      >
        <ArrowIcon />
      </a>
    </>
  ) : (
    <>
      <Link href={href} className={viewClass}>
        View Product
      </Link>
      <Link href={href} aria-label={`Enquire about ${product.name}`} className={arrowClass}>
        <ArrowIcon />
      </Link>
    </>
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="group flex h-full w-full flex-col overflow-hidden rounded-3xl bg-neutral-950"
    >
      {/* Picture area: same square size on every card, the whole product is
          shown (object-contain), never cropped */}
      <div className="relative aspect-square w-full bg-white">
        {src && !broken ? (
          <Image
            src={src}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 sm:p-6"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-neutral-100 px-6 text-center text-2xl font-semibold tracking-tight text-neutral-400 sm:text-3xl">
            {product.brand}
          </div>
        )}
      </div>

      {/* Details sit below the picture, so they never cover the product */}
      <div className="flex flex-1 flex-col p-4 text-white sm:p-5">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-medium leading-snug sm:text-lg">
          {product.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-white/65 sm:text-sm">
          <span>{product.category}</span>
          <span className="text-white/85">
            {product.price ?? "Price on request"}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-1 sm:mt-auto sm:pt-4">
          {actions}
        </div>
      </div>
    </motion.article>
  );
}

const chip =
  "shrink-0 rounded-full border px-5 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950";

function Catalogue() {
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const rowRef = useRef<HTMLDivElement>(null);

  const items = PRODUCTS.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (brand === "All" || p.brand === brand)
  );

  return (
    <section id="catalogue" className="scroll-mt-24 bg-white px-4 py-16 text-neutral-950 sm:px-6 sm:py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Browse the catalogue
        </h2>

        {/* Category chips + scroll arrow */}
        <div className="mt-10 flex items-center gap-3">
          <div
            ref={rowRef}
            role="group"
            aria-label="Filter by category"
            className="flex flex-1 gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`${chip} ${
                  category === c
                    ? "border-neutral-950 text-neutral-950"
                    : "border-neutral-300 text-neutral-500 hover:border-neutral-950 hover:text-neutral-950"
                }`}
              >
                {c === "All" ? "All Products" : c}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Scroll categories"
            onClick={() =>
              rowRef.current?.scrollBy({ left: 260, behavior: "smooth" })
            }
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-neutral-100 transition hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
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
              aria-hidden="true"
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
          <span className="mr-2 text-sm text-neutral-500">Brand</span>
          {["All", ...BRANDS].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBrand(b)}
              aria-pressed={brand === b}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 ${
                brand === b
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {b === "All" ? "All brands" : b}
            </button>
          ))}
        </div>

        <p className="mt-8 text-sm text-neutral-500" aria-live="polite">
          {items.length} {items.length === 1 ? "product" : "products"}
        </p>

        {/* Cards: every card is the same size, 1 / 2 / 3 columns */}
        <motion.div
          layout
          className="mt-4 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </AnimatePresence>
        </motion.div>

        {items.length === 0 && (
          <div className="mt-6 rounded-3xl bg-neutral-100 px-6 py-16 text-center">
            <p className="text-lg font-medium">Nothing listed here yet.</p>
            <p className="mt-2 text-neutral-600">
              We may still stock it. Get in touch and we will check.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block rounded-full bg-neutral-950 px-8 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950"
            >
              Contact us
            </Link>
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <Link
            href="/contact"
            className="rounded-full bg-neutral-950 px-8 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950"
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
