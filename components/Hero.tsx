"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Put your two clips in /public/videos/
const VIDEOS = ["/videos/hero-1.mp4", "/videos/hero-2.mp4"];

export default function Hero() {
  const [active, setActive] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const next = () => setActive((i) => (i + 1) % VIDEOS.length);

  // Play the active clip from the start; pause the other after it has faded out
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === active) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        timers.push(setTimeout(() => video.pause(), 1000));
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-black text-white">
      {/* Video carousel (cross-fades when a clip ends).
          Phones show the whole frame (object-contain); larger screens fill the
          section (object-cover). The text sits over the video on every screen. */}
      <div className="absolute inset-0 -z-10 bg-black">
        {VIDEOS.map((src, i) => (
          <video
            key={src}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={src}
            muted
            playsInline
            preload="auto"
            autoPlay={i === 0}
            onEnded={i === active ? next : undefined}
            onError={i === active ? next : undefined}
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 md:object-cover ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/45 to-black/80" />

      {/* Text */}
      <div className="mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-6 pb-28 pt-32 text-center md:pt-36">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-medium backdrop-blur-md sm:px-5 sm:py-2.5 sm:text-sm">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          CCTV wholesale distributor in Kochi
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:mt-8 sm:text-6xl md:text-7xl">
          Premium Surveillance Systems, Wholesale From Kochi
        </h1>

        <p className="mt-6 max-w-2xl text-base text-white/80 sm:mt-8 sm:text-lg">
          Hawkeye Vision deals with almost all premium brands including
          Hikvision, CP Plus, TP Link, Toshiba, WD and many more.
        </p>

        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4">
          <Link
            href="/products"
            className="w-full rounded-full bg-white px-8 py-4 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
          >
            View products
          </Link>
          <Link
            href="/contact"
            className="w-full rounded-full border border-white/40 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
          >
            Contact us
          </Link>
        </div>
      </div>

      {/* Carousel indicators */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3">
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show video ${i + 1}`}
            aria-current={i === active}
            className={`h-1.5 w-10 rounded-full transition-colors ${
              i === active ? "bg-white" : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
