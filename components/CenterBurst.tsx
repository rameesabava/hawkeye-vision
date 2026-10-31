"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

// Put pictures in /public/gallery/ (1.jpg ... 8.jpg).
// x / y are how far (in vw / vh) each picture travels from the centre.
const IMAGES = [
  { src: "/gallery/1.png", x: -32, y: -24 },
  { src: "/gallery/2.jpg", x: 30, y: -27 },
  { src: "/gallery/3.webp", x: -39, y: 4 },
  { src: "/gallery/4.webp", x: 38, y: 7 },
  { src: "/gallery/5.jpg", x: -26, y: 29 },
  { src: "/gallery/6.png", x: 27, y: 30 },
  { src: "/gallery/7.png", x: -6, y: -36 },
  { src: "/gallery/8.png", x: 8, y: 36 },
];

function BurstImage({
  src,
  x,
  y,
  index,
  progress,
}: {
  src: string;
  x: number;
  y: number;
  index: number;
  progress: MotionValue<number>;
}) {
  const start = index * 0.03; // stagger so they leave the centre one by one
  const moveX = useTransform(progress, [start, 0.85], ["0vw", `${x}vw`]);
  const moveY = useTransform(progress, [start, 0.85], ["0vh", `${y}vh`]);
  const scale = useTransform(progress, [start, 0.85], [0.25, 1.15]);
  const opacity = useTransform(
    progress,
    [start, start + 0.06, 0.7, 0.95],
    [0, 1, 1, 0]
  );

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <motion.div
        style={{ x: moveX, y: moveY, scale, opacity }}
        className="relative aspect-[4/3] w-[34vw] max-w-[340px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl md:w-[22vw]"
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 768px) 22vw, 34vw"
          className="object-cover"
        />
      </motion.div>
    </div>
  );
}

export default function CenterBurst() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={ref} className="relative h-[350vh] bg-neutral-950 text-white">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Pictures fly out from behind the text */}
        {IMAGES.map((img, i) => (
          <BurstImage
            key={img.src}
            {...img}
            index={i}
            progress={scrollYProgress}
          />
        ))}

        <div className="relative z-10 grid h-full place-items-center px-6">
          <div className="max-w-3xl text-center">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Complete security surveillance, supplied and serviced
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              Cameras, IP cameras, security camera systems, DVR, NVR and XVR
              recorders, access control systems and other IoT products. We also
              service what we sell, so every job is delivered on time and to
              your satisfaction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
