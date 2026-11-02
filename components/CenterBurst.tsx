"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

// Put pictures in /public/gallery/ (1.jpg ... 8.jpg).
// nx / ny say where each picture ends up: -1 is the left / top edge of the
// screen, 1 is the right / bottom edge, 0 is the centre. The real distance is
// worked out from the screen size, so pictures never leave the screen.
const IMAGES = [
  { src: "/gallery/1.png", nx: -0.82, ny: -0.67 },
  { src: "/gallery/2.jpg", nx: 0.77, ny: -0.75 },
  { src: "/gallery/3.webp", nx: -1, ny: 0.11 },
  { src: "/gallery/4.webp", nx: 0.97, ny: 0.19 },
  { src: "/gallery/5.jpg", nx: -0.67, ny: 0.81 },
  { src: "/gallery/6.png", nx: 0.69, ny: 0.83 },
  { src: "/gallery/7.png", nx: -0.15, ny: -1 },
  { src: "/gallery/8.png", nx: 0.2, ny: 1 },
];

const END_SCALE = 1.15;
const MARGIN = 16; // px kept free at the screen edge

// Screen size, read after mount so the first render matches the server HTML
function useViewport() {
  const [size, setSize] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const update = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

function BurstImage({
  src,
  nx,
  ny,
  index,
  progress,
  width,
  reachX,
  reachY,
}: {
  src: string;
  nx: number;
  ny: number;
  index: number;
  progress: MotionValue<number>;
  width: number;
  reachX: number;
  reachY: number;
}) {
  const start = index * 0.03; // stagger so they leave the centre one by one
  const moveX = useTransform(progress, [start, 0.85], [0, nx * reachX]);
  const moveY = useTransform(progress, [start, 0.85], [0, ny * reachY]);
  const scale = useTransform(progress, [start, 0.85], [0.25, END_SCALE]);
  const opacity = useTransform(
    progress,
    [start, start + 0.06, 0.7, 0.95],
    [0, 1, 1, 0]
  );

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <motion.div
        style={{ x: moveX, y: moveY, scale, opacity, width }}
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 1536px) 440px, 340px"
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
  const { w, h } = useViewport();

  // Picture size grows with the screen, up to a cap on very large screens
  const width = Math.min(w < 768 ? w * 0.36 : w * 0.22, w >= 1536 ? 440 : 340);
  const height = width * 0.75;

  // How far from the centre a picture may travel and still be fully on screen
  const reachX = Math.max(0, w / 2 - (width * END_SCALE) / 2 - MARGIN);
  const reachY = Math.max(0, h / 2 - (height * END_SCALE) / 2 - MARGIN);

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
            width={width}
            reachX={reachX}
            reachY={reachY}
          />
        ))}

        <div className="relative z-10 grid h-full place-items-center px-6">
          <div className="max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Complete security surveillance, supplied and serviced
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-white/70 sm:text-lg">
              Analog and IP cameras, DVR and NVR recorders, cables, switches,
              accessories, monitors, biometric attendance, video door phones,
              boom barriers and interactive panels. We also service what we
              sell, so every job is delivered on time and to your satisfaction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
