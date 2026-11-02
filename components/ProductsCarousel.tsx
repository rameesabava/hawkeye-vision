"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

// Put product pictures in /public/products/
// Cards without a picture yet show a plain panel with the product name.
const PRODUCTS = [
  // CCTV segment
  {
    segment: "CCTV Segment",
    title: "Analog Camera",
    text: "Reliable analog cameras from leading brands.",
    img: "/products/analog-cameras.png",
  },
  {
    segment: "CCTV Segment",
    title: "DVR",
    text: "Recorders for analog camera systems.",
    img: "/products/dvr.png",
  },
  {
    segment: "CCTV Segment",
    title: "IP Camera",
    text: "Network cameras for modern setups.",
    img: "/products/ip-camera.png",
  },
  {
    segment: "CCTV Segment",
    title: "NVR",
    text: "Recorders for IP camera systems.",
    img: "/products/nvr.png",
  },
  {
    segment: "CCTV Segment",
    title: "Cables",
    text: "Cabling to connect your whole system.",
    img: "/products/cables.png",
  },
  {
    segment: "CCTV Segment",
    title: "Switches",
    text: "Network switches to link and power cameras.",
    img: "/products/switches.png",
  },
  {
    segment: "CCTV Segment",
    title: "Accessories",
    text: "Hard disks and the extras every setup needs.",
    img: "/products/accessories.png",
  },
  {
    segment: "CCTV Segment",
    title: "Monitors",
    text: "Displays for live viewing and playback.",
    img: "/products/monitors.png",
  },
  // IT segment
  {
    segment: "IT Segment",
    title: "Biometric attendance",
    text: "Fingerprint and face recognition attendance.",
    img: "/products/biometric.png",
  },
  {
    segment: "IT Segment",
    title: "Video Door Phones",
    text: "See and speak to visitors at the door.",
    img: "/products/video-door-phones.png",
  },
  {
    segment: "IT Segment",
    title: "Boom Barriers",
    text: "Controlled vehicle entry and exit.",
    img: "/products/barriers.png",
  },
  {
    segment: "IT Segment",
    title: "Interactive Panels",
    text: "Large touch displays for teaching and meetings.",
    img: "/products/interactive-panels.png",
  },
];

// The next section slides over the last part of this one, so the sideways
// movement has to finish before then (see OverlapSection's -mt-[100vh]).
const END = 0.65;

function ProductCard({ product }: { product: (typeof PRODUCTS)[number] }) {
  const [broken, setBroken] = useState(false);

  return (
    <article className="shrink-0">
      {/* The picture is shown whole (object-contain); the text sits below it.
          Card size follows the screen height, so it grows on large screens. */}
      <div className="relative aspect-[4/5] h-[40svh] overflow-hidden rounded-3xl bg-neutral-100 sm:h-[44svh] lg:h-[48svh] 2xl:h-[54svh]">
        {broken ? (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-neutral-700 to-neutral-950 p-6 text-center text-2xl font-semibold text-white/30">
            {product.title}
          </div>
        ) : (
          <Image
            src={product.img}
            alt={product.title}
            fill
            sizes="(min-width: 1536px) 520px, (min-width: 1024px) 400px, 320px"
            className="object-contain p-2"
            onError={() => setBroken(true)}
          />
        )}
      </div>
      {/* w-0 min-w-full keeps the text as wide as the picture */}
      <div className="mt-4 w-0 min-w-full">
        <p className="text-xs text-neutral-500">{product.segment}</p>
        <h3 className="mt-1 text-lg font-semibold 2xl:text-xl">
          {product.title}
        </h3>
        <p className="mt-1 text-sm text-neutral-600">{product.text}</p>
      </div>
    </article>
  );
}

export default function ProductsCarousel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const maxX = useRef(0);
  const x = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  const apply = (p: number) => x.set(-maxX.current * Math.min(p / END, 1));
  useMotionValueEvent(scrollYProgress, "change", apply);

  // Measure how far the track has to travel
  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      maxX.current = Math.max(
        0,
        trackRef.current.scrollWidth - window.innerWidth
      );
      apply(scrollYProgress.get());
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const barScale = useTransform(scrollYProgress, [0, END], [0, 1]);

  return (
    // Taller than before because there are now 12 cards to scroll through
    <section ref={wrapRef} className="relative h-[550vh] bg-white text-neutral-950">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pb-8 pt-24 sm:pt-28">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need for a complete surveillance setup
          </h2>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="mt-6 flex w-max gap-5 sm:mt-8 sm:gap-6 px-6 md:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
        >
          {PRODUCTS.map((p) => (
            <ProductCard key={p.title} product={p} />
          ))}
        </motion.div>

        {/* Scroll progress */}
        <div className="mx-auto mt-8 h-0.5 w-full max-w-6xl px-6">
          <div className="h-full bg-neutral-200">
            <motion.div
              style={{ scaleX: barScale }}
              className="h-full origin-left bg-neutral-950"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
