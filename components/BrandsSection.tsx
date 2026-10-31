"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

// Put logos in /public/brands/ (png, svg or webp; update the extension below)
const BRANDS = [
  { name: "Hikvision", logo: "/brands/hikvision.png" },
  { name: "CP Plus", logo: "/brands/cp-plus.png" },
  { name: "TP-Link", logo: "/brands/tp-link.webp" },
  { name: "Dahua", logo: "/brands/dahua.jpg" },
  { name: "Panasonic", logo: "/brands/panasonic.jpg" },
  { name: "Toshiba", logo: "/brands/toshiba.png" },
  { name: "Western Digital", logo: "/brands/western-digital.png" },
  { name: "D-Link", logo: "/brands/d-link.png" },
  { name: "Hi Focus", logo: "/brands/hi-focus.webp" },
  { name: "eSSL", logo: "/brands/essl.png" },
];

function BrandCard({
  brand,
  flipped,
  instant,
}: {
  brand: (typeof BRANDS)[number];
  flipped: boolean;
  instant: boolean;
}) {
  const [broken, setBroken] = useState(false);

  return (
    <div className="[perspective:1000px]">
      <motion.div
        className="relative aspect-[16/10] [transform-style:preserve-3d]"
        animate={{ rotateX: flipped ? 180 : 0 }}
        transition={{
          duration: instant ? 0 : 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Front: logo */}
        <div className="absolute inset-0 rounded-2xl border border-neutral-200 bg-white [backface-visibility:hidden]">
          {broken ? (
            <span className="grid h-full place-items-center text-xl font-bold text-neutral-900">
              {brand.name}
            </span>
          ) : (
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              sizes="(min-width: 768px) 18vw, 45vw"
              className="object-contain p-6 sm:p-8"
              onError={() => setBroken(true)}
            />
          )}
        </div>

        {/* Back: brand name */}
        <div className="absolute inset-0 grid place-items-center rounded-2xl bg-neutral-950 text-lg font-semibold text-white [backface-visibility:hidden] [transform:rotateX(180deg)]">
          {brand.name}
        </div>
      </motion.div>
    </div>
  );
}

export default function BrandsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduce = useReducedMotion() ?? false;

  // Every card starts on its back face, then flips to the logo in sequence
  const [flipped, setFlipped] = useState<boolean[]>(() =>
    BRANDS.map(() => true)
  );

  useEffect(() => {
    if (!inView) return;
    const timers = BRANDS.map((_, i) =>
      setTimeout(
        () => setFlipped((p) => p.map((v, j) => (j === i ? false : v))),
        reduce ? 0 : i * 100
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce]);

  // After the intro, keep flipping random cards to show the brand name
  useEffect(() => {
    if (!inView || reduce) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let interval: ReturnType<typeof setInterval> | undefined;

    const start = setTimeout(() => {
      interval = setInterval(() => {
        const i = Math.floor(Math.random() * BRANDS.length);
        setFlipped((p) => p.map((v, j) => (j === i ? true : v)));
        timers.push(
          setTimeout(
            () => setFlipped((p) => p.map((v, j) => (j === i ? false : v))),
            1800
          )
        );
      }, 1400);
    }, 2600);

    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [inView, reduce]);

  return (
    <section className="bg-white px-6 py-28 text-neutral-950">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            All the major brands, one wholesale partner
          </h2>
          <p className="mt-6 text-lg text-neutral-600">
            Hikvision, CP Plus, TP-Link, Toshiba, Western Digital and many more,
            all available through Hawkeye Vision.
          </p>
        </div>

        <div
          ref={ref}
          className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-5"
        >
          {BRANDS.map((brand, i) => (
            <BrandCard
              key={brand.name}
              brand={brand}
              flipped={flipped[i]}
              instant={reduce}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
