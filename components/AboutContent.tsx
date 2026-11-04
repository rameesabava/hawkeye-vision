"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// Reads the reduced-motion setting only after mount, so the first client render
// matches the server HTML.
function useReduce() {
  const prefers = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? !!prefers : false;
}

const STATEMENT_INTRO =
  "Hawkeye Vision is a CCTV wholesale distributor based in Kochi, dealing with almost all premium brands including";
const STATEMENT_BRANDS = ["Hikvision", "CP Plus", "TP Link", "Toshiba", "WD"];
const STATEMENT_END = "and many more.";

const SUPPLY = [
  {
    title: "CCTV Segment",
    items: [
      "Analog Camera",
      "DVR",
      "IP Camera",
      "NVR",
      "Cables",
      "Switches",
      "Accessories",
      "Monitors",
    ],
  },
  {
    title: "IT Segment",
    items: [
      "Biometric attendance",
      "Video Door Phones",
      "Boom Barriers",
      "Interactive Panels",
    ],
  },
];

const BRANDS = [
  "Hikvision",
  "CP Plus",
  "TP-Link",
  "Dahua",
  "Panasonic",
  "Toshiba",
  "Western Digital",
  "D-Link",
  "Hi Focus",
  "eSSL",
];

/* ---------- Hero: headline slides up word by word ---------- */

function HeroHeadline({ text }: { text: string }) {
  const reduce = useReduce();
  return (
    <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          className="mr-[0.25em] inline-block overflow-hidden pb-[0.1em] align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.08 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

function Hero() {
  const reduce = useReduce();
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#081F4D] via-[#0A2660] to-[#071838] px-6 pb-28 pt-44 text-white md:pt-56">
      {/* Slow-moving glow behind the headline */}
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-10 h-[60vw] max-h-[720px] w-[60vw] max-w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/20 blur-[120px]"
        animate={reduce ? undefined : { x: [-80, 80, -80], y: [-30, 30, -30] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky-200 backdrop-blur-md"
        >
          About Hawkeye Vision
        </motion.div>

        <div className="mt-6 max-w-5xl">
          <HeroHeadline text="Surveillance systems, supplied and serviced from Kochi" />
        </div>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 1.1 }}
          className="mt-10 max-w-2xl text-lg text-blue-100/80"
        >
          Wholesale supply of premium CCTV and security products, backed by
          service for everything we sell.
        </motion.p>
      </div>
    </section>
  );
}

/* ---------- Statement: text sharpens from a blur, brand names pop in ---------- */

function Statement() {
  const reduce = useReduce();

  const container = {
    hidden: {},
    shown: { transition: { staggerChildren: 0.12 } },
  };
  const blurUp = {
    hidden: { opacity: 0, y: 30, filter: "blur(14px)" },
    shown: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1, ease: EASE },
    },
  };
  const pop = {
    hidden: { opacity: 0, scale: 0.6 },
    shown: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 260, damping: 16 },
    },
  };

  return (
    <section className="bg-slate-50 px-6 py-28 text-slate-900 md:py-40">
      <motion.p
        variants={container}
        initial={reduce ? "shown" : "hidden"}
        whileInView="shown"
        viewport={{ once: true, margin: "-120px" }}
        className="mx-auto max-w-5xl text-3xl font-semibold leading-[1.6] tracking-tight sm:text-4xl md:text-5xl md:leading-[1.6]"
      >
        <motion.span variants={blurUp} className="inline-block">
          {STATEMENT_INTRO}
        </motion.span>{" "}
        {STATEMENT_BRANDS.map((b) => (
          <motion.span
            key={b}
            variants={pop}
            className="mx-1 inline-block rounded-full border border-blue-200 bg-white px-5 py-0.5 align-middle text-[0.75em] font-medium text-[#081F4D] shadow-sm transition-colors hover:border-[#081F4D] hover:bg-[#081F4D] hover:text-white"
          >
            {b}
          </motion.span>
        ))}{" "}
        <motion.span variants={blurUp} className="inline-block">
          {STATEMENT_END}
        </motion.span>
      </motion.p>
    </section>
  );
}

/* ---------- What we deal in ---------- */

function Supply() {
  const reduce = useReduce();
  return (
    <section className="bg-gradient-to-br from-[#081F4D] via-[#0A2660] to-[#071838] px-6 py-28 text-white md:py-36">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1fr_1.4fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-200"
          >
            Core Offerings
          </motion.div>
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
          >
            What we deal in
          </motion.h2>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="mt-6 max-w-md text-lg text-blue-100/80"
          >
            Security surveillance systems from the camera to the recorder to
            the door, and the service to keep them running.
          </motion.p>
        </div>

        <ul>
          {SUPPLY.map((item, i) => (
            <motion.li
              key={item.title}
              initial={reduce ? false : "hidden"}
              whileInView="shown"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delayChildren: 0.05, staggerChildren: 0.1 }}
              className="group relative py-8"
            >
              {/* Divider line draws in from the left */}
              <motion.span
                variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
                transition={{ duration: 1, ease: EASE }}
                className="absolute inset-x-0 top-0 h-px origin-left bg-sky-400/30"
              />
              <motion.h3
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  shown: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.7, ease: EASE }}
                className="text-2xl font-bold tracking-tight text-white transition duration-300 group-hover:translate-x-2 group-hover:text-sky-300 sm:text-3xl"
              >
                {item.title}
              </motion.h3>
              <motion.ul
                variants={{
                  hidden: {},
                  shown: { transition: { staggerChildren: 0.05 } },
                }}
                className="mt-5 flex flex-wrap gap-2.5"
              >
                {item.items.map((name) => (
                  <motion.li
                    key={name}
                    variants={{
                      hidden: { opacity: 0, y: 14 },
                      shown: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur-sm"
                  >
                    {name}
                  </motion.li>
                ))}
              </motion.ul>
              {i === SUPPLY.length - 1 && (
                <motion.span
                  variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
                  transition={{ duration: 1, ease: EASE, delay: 0.3 }}
                  className="absolute inset-x-0 bottom-0 h-px origin-left bg-sky-400/30"
                />
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Brands: a rolling spotlight with a sliding highlight ---------- */

function BrandsAndCta() {
  const reduce = useReduce();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Roll to the next brand every couple of seconds
  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % BRANDS.length),
      2200
    );
    return () => clearInterval(id);
  }, [reduce, paused]);

  return (
    <section className="overflow-hidden bg-white px-6 py-28 text-slate-900 md:py-36">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-[#081F4D] sm:text-5xl"
        >
          All the major brands, one wholesale partner
        </motion.h2>

        {/* Rolling brand name */}
        <div
          className="mt-16 flex items-baseline gap-4 sm:gap-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <span className="shrink-0 text-lg font-medium text-slate-500">We supply</span>
          <div className="h-[1.25em] flex-1 overflow-hidden text-5xl font-bold tracking-tight text-[#081F4D] sm:text-7xl md:text-8xl">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={BRANDS[active]}
                initial={reduce ? false : { y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="whitespace-nowrap leading-[1.25]"
              >
                {BRANDS[active]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Brand picker with a sliding highlight */}
        <div
          className="mt-12 flex flex-wrap gap-3"
          role="group"
          aria-label="Brands we deal in"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {BRANDS.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={`relative rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#081F4D] ${
                i === active
                  ? "border-transparent text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#081F4D] hover:text-[#081F4D]"
              }`}
            >
              {i === active && (
                <motion.span
                  layoutId="brand-highlight"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-[#081F4D]"
                />
              )}
              <span className="relative">{name}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="mx-auto mt-24 max-w-6xl"
      >
        <div className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-gradient-to-br from-[#081F4D] via-[#0A2660] to-[#071838] p-8 text-white shadow-xl sm:p-12 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Looking for a wholesale supplier?
            </h3>
            <p className="mt-3 text-blue-100/80">
              Tell us what you need, or browse what we stock.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#081F4D] shadow-md transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Contact us
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-white/30 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              View products
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default function AboutContent() {
  return (
    <>
      <Hero />
      <Statement />
      <Supply />
      <BrandsAndCta />
    </>
  );
}
