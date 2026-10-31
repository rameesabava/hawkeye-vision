"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

// Put product pictures in /public/products/
const PRODUCTS = [
  {
    title: "CCTV Cameras",
    text: "Reliable cameras from leading brands.",
    img: "/products/cctv-cameras.webp",
  },
  
  {
    title: "Security Camera Systems",
    text: "Complete systems, ready to install.",
    img: "/products/camera-systems.jpg",
  },
  {
    title: "DVR, NVR & XVR",
    text: "Recorders to store and manage your footage.",
    img: "/products/recorders.jpg",
  },
  {
    title: "Access Control Systems",
    text: "Control who enters, and when.",
    img: "/products/access-control.jpg",
  },
  {
    title: "IoT Products",
    text: "Connected devices that extend your security setup.",
    img: "/products/iot.jpg",
  },
  {
    title: "Service & Support",
    text: "We service the products we sell, on time.",
    img: "/products/service.jpg",
  },
];

// The next section slides over the last part of this one, so the sideways
// movement has to finish before then (see OverlapSection's -mt-[100vh]).
const END = 0.65;

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
    <section ref={wrapRef} className="relative h-[400vh] bg-white text-neutral-950">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pb-8 pt-28">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need for a complete surveillance setup
          </h2>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="mt-8 flex w-max gap-6 px-6 md:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
        >
          {PRODUCTS.map((p) => (
            <article
              key={p.title}
              className="relative aspect-[4/5] h-[50vh] shrink-0 overflow-hidden rounded-3xl bg-neutral-200"
            >
              <Image
                src={p.img}
                alt={p.title}
                fill
                sizes="(min-width: 1024px) 28vw, 78vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-6 pt-24 text-white">
                <h3 className="text-xl font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-white/75">{p.text}</p>
              </div>
            </article>
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
