"use client";

import Link from "next/link";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import { useEffect, useRef, useState } from "react";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "800"] });
const body = Manrope({ subsets: ["latin"], weight: ["500", "700"] });

const VIDEOS = ["/videos/hero-1.mp4", "/videos/hero-2.mp4"];

export default function Hero() {
  const [active, setActive] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const next = () => setActive((i) => (i + 1) % VIDEOS.length);

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
    <section
      className={`${body.className} relative isolate min-h-[100svh] overflow-hidden bg-[#06142F]`}
    >
      {/* Background video carousel */}
      <div className="absolute inset-0 -z-20 bg-[#06142F]">
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
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 motion-reduce:transition-none md:object-cover ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Overlays: even tint, plus depth toward the bottom-left where the text sits */}
      <div className="absolute inset-0 -z-10 bg-[#06142F]/30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06142F] via-[#06142F]/55 to-transparent" />
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-[#06142F]/80 via-[#06142F]/20 to-transparent md:block" />

      <div className="mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col px-6 py-8 md:px-12 md:py-10">
       

        {/* Headline block */}
        <div className="flex flex-1 flex-col justify-end pb-4 md:pb-8">
          <span className="mb-6 block h-1 w-14 rounded-full bg-sky-400" />

         <h1
  className={`${display.className} max-w-2xl text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl`}
>
  The ultimate destination for surveillance systems
</h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
            Wholesale distributor
          </p>

          <div className="mt-8 flex items-center justify-between gap-6">
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-full bg-sky-400 px-8 py-3.5 text-sm font-bold text-[#06142F] shadow-lg shadow-sky-400/25 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
            >
              Contact us
            </Link>

            {/* Video selector */}
            <div className="hidden items-center gap-2 sm:flex" role="group" aria-label="Background video">
              {VIDEOS.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show video ${i + 1}`}
                  aria-current={i === active}
                  className="group py-3"
                >
                  <span
                    className={`block h-1 rounded-full transition-all duration-500 ${
                      i === active ? "w-12 bg-sky-400" : "w-6 bg-white/40 group-hover:bg-white/70"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
