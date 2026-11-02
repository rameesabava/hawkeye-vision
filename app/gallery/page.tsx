"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

/* ------------------------------------------------------------------
   Hawkeye Vision: page-turning photo book

   It behaves like a real book:
   - Pages you have already turned stack up on the LEFT, pages still to
     read stack on the RIGHT, both fanned out like in the reference video
   - Moving forward turns the right page over the spine onto the left
   - Each photo spreads across both open pages
   - Drag / swipe and the pages follow your finger. Also: mouse wheel,
     arrow keys, or click a page.

   HOW TO ADD YOUR IMAGES
   Put files in  /public/images  and list the file names in `entries`.
------------------------------------------------------------------- */

const TITLE = "Hawkeye Journal";
const ASPECT = 1.22; // width / height of one open spread (two pages together)

type Entry = string | { file: string; title?: string };

const entries: Entry[] = [
  "photo1.jpg",
  "photo2.jpg",
  "photo3.jpg",
  "photo4.jpg",
  "photo5.jpg",
  "photo6.jpg",
  "photo7.jpg",
  "photo8.jpg",
];

type Photo = { src: string; title: string };

const photos: Photo[] = entries.map((e) => {
  const file = typeof e === "string" ? e : e.file;
  const nice = file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  return { src: `/images/${file}`, title: typeof e === "string" ? nice : e.title ?? nice };
});

/* A leaf is one sheet of paper: its front is the RIGHT half of photo j,
   its back is the LEFT half of photo j+1. Leaf -1 is the permanent left
   page under photo 0. */
type Leaf = { j: number; front?: Photo; back?: Photo };
const leaves: Leaf[] = [];
for (let j = -1; j < photos.length; j++) {
  leaves.push({ j, front: photos[j] as Photo | undefined, back: photos[j + 1] as Photo | undefined });
}

/* ------------------------- 3D pose of a leaf -------------------------
   c = j - t, where t is the (fractional) number of leaves turned.
   c >= 0   leaf waits on the right  (rank = c)
   c <= -1  leaf lies on the left    (rank = -c - 1)
   between  leaf is turning over the spine
   Units: x is in book-widths, angles in degrees, z in px.            */
const HALF = 0.5; // one page = half the book width
const REST = 0; // angle of the open pages at the spine
const SLIVER = 66; // angle of fanned-out pages
const GAP = 0.11; // spacing of the fan
const DEPTH = 34; // how far each fanned page sits behind the one before
const ease = (x: number) => x * x * (3 - 2 * x);

function pose(c: number) {
  if (c >= 0) {
    const e = ease(Math.min(c, 1));
    return { x: HALF * (e + Math.max(c - 1, 0) * GAP), phi: -REST + (SLIVER + REST) * e, z: -c * DEPTH, rank: c, lift: 0 };
  }
  if (c <= -1) {
    const r = -c - 1;
    const e = ease(Math.min(r, 1));
    return { x: -HALF * (e + Math.max(r - 1, 0) * GAP), phi: -180 + REST - (REST + SLIVER) * e, z: -r * DEPTH, rank: r, lift: 0 };
  }
  const p = -c;
  return { x: 0, phi: -REST + (-180 + 2 * REST) * ease(p), z: Math.sin(Math.PI * p) * 70, rank: 0, lift: Math.sin(Math.PI * p) };
}

const vars = (o: Record<string, string | number>) => o as unknown as CSSProperties;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/* ---------------- curved paper ----------------
   Each page is built from N narrow strips, each tilted a little more than
   the one before, so the open spread bows towards you like the video.   */
const N = 7;
const CURVE = 26; // total bend at the outer edge of a page, degrees

function Strips({ side, src }: { side: "front" | "back"; src?: string }) {
  const build = (k: number): React.ReactNode => {
    if (k >= N) return null;
    const a0 = 0.14 * Math.pow(Math.max(1 - k / 3, 0), 2);
    const a1 = 0.14 * Math.pow(Math.max(1 - (k + 1) / 3, 0), 2);
    const left =
      side === "front"
        ? `calc(var(--w) * ${-(0.5 + k / (2 * N))})` // right half of the photo
        : `calc(var(--w) * ${-(0.5 - (k + 1) / (2 * N))})`; // left half of the photo
    return (
      <div className={`strip ${side === "front" ? "sf" : "sb"}${k === 0 ? " first" : ""}`}>
        <div
          className={`clip${k === N - 1 ? " end" : ""}`}
          style={vars({ "--a0": a0, "--a1": a1 })}
        >
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" draggable={false} style={{ left }} />
          )}
        </div>
        {build(k + 1)}
      </div>
    );
  };
  return <div className={`face ${side}`}>{build(0)}</div>;
}

export default function GalleryPage() {
  const last = photos.length - 1;
  const start = Math.floor(last / 2);

  const [t, setT] = useState(start); // how many leaves have been turned (fractional while moving)
  const [dragging, setDragging] = useState(false);

  const tRef = useRef(start);
  const targetRef = useRef(start);
  const raf = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const book = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; t: number; time: number; moved: boolean; dx: number } | null>(null);
  const justDragged = useRef(false);
  const wheelLock = useRef(0);

  /* smooth glide of t towards a target */
  const animateTo = useCallback(
    (target: number) => {
      targetRef.current = clamp(target, 0, last);
      if (raf.current) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let prev = performance.now();
      const step = (now: number) => {
        const dt = Math.min((now - prev) / 1000, 0.05);
        prev = now;
        const diff = targetRef.current - tRef.current;
        if (reduce || Math.abs(diff) < 0.0008) {
          tRef.current = targetRef.current;
          setT(tRef.current);
          raf.current = 0;
          return;
        }
        tRef.current += diff * (1 - Math.exp(-dt * 6.5));
        setT(tRef.current);
        raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    },
    [last]
  );

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const next = useCallback(() => animateTo(Math.round(targetRef.current) + 1), [animateTo]);
  const prev = useCallback(() => animateTo(Math.round(targetRef.current) - 1), [animateTo]);

  /* keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  /* wheel / trackpad */
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelLock.current < 330) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(d) < 8) return;
      wheelLock.current = now;
      if (d > 0) next();
      else prev();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [next, prev]);

  /* drag: the page follows the pointer */
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, t: tRef.current, time: Date.now(), moved: false, dx: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    d.dx = dx;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      setDragging(true);
    }
    if (d.moved) {
      const w = book.current?.offsetWidth ?? 700;
      tRef.current = clamp(d.t - dx / (w * 0.45), 0, last);
      targetRef.current = tRef.current;
      setT(tRef.current);
    }
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.moved) return;
    justDragged.current = true;
    setTimeout(() => (justDragged.current = false), 0);
    setDragging(false);
    const v = d.dx / Math.max(Date.now() - d.time, 1); // px per ms
    animateTo(Math.round(tRef.current - clamp(v * 0.6, -1, 1)));
  };

  /* clicking a page */
  const clickLeaf = (j: number) => {
    if (justDragged.current) return;
    const cur = Math.round(tRef.current);
    if (j >= cur) animateTo(j === cur ? cur + 1 : j); // a page on the right
    else animateTo(j); // a page on the left
  };

  const shown = Math.round(t);

  return (
    <main className="hv">
      <style>{css}</style>

      <header className="top">
        <h1>{TITLE}</h1>
        <p>
          {photos.length} photos · {shown + 1} of {photos.length}
        </p>
      </header>

      <div
        ref={stage}
        className={`stage${dragging ? " dragging" : ""}`}
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label={TITLE}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div ref={book} className="book" style={{ aspectRatio: ASPECT }}>
          <span className="floor" />
          {leaves.map((lf) => {
            const c = lf.j - t;
            const ps = pose(c);
            if (ps.rank > 8) return null;
            const fade = clamp(8 - ps.rank, 0, 1);
            return (
              <div
                key={lf.j}
                className="leaf"
                onClick={() => lf.j >= 0 && clickLeaf(lf.j)}
                style={vars({
                  "--x": ps.x,
                  "--phi": ps.phi,
                  "--z": ps.z,
                  "--dim": Math.min(ps.rank * 0.07, 0.5),
                  "--fs": ps.lift * 0.22,
                  "--curl": (CURVE / N) * (1 - 0.55 * Math.min(ps.rank, 1)) * (1 + ps.lift * 1.2),
                  ...(fade < 1 ? { opacity: fade } : {}),
                })}
              >
                <Strips side="front" src={lf.front?.src} />
                <Strips side="back" src={lf.back?.src} />
              </div>
            );
          })}
        </div>
      </div>

      <p className="sr">{photos[shown]?.title}</p>
    </main>
  );
}

const css = `
.hv{--w:max(280px,min(46vw,calc((100vh - 240px) * 1.22),780px));min-height:100vh;display:flex;flex-direction:column;align-items:center;position:relative;overflow:hidden;
background:radial-gradient(110% 80% at 50% 8%,#323c72 0%,#222949 48%,#171c38 100%);color:#fff;
font-family:"Inter Tight",system-ui,-apple-system,"Segoe UI",sans-serif;
padding:env(safe-area-inset-top,0) 0 env(safe-area-inset-bottom,0)}
.hv *{box-sizing:border-box}
.hv .top{text-align:center;padding:26px 16px 0}
.hv .top h1{margin:0;font-size:16px;font-weight:600;letter-spacing:.01em}
.hv .top p{margin:6px 0 0;font-size:11px;color:#a5acd0}
.hv .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.hv .stage{flex:1;width:100%;display:flex;align-items:center;justify-content:center;perspective:1700px;padding:0 0 56px;
cursor:grab;touch-action:pan-y;user-select:none;outline:none}
.hv .stage.dragging{cursor:grabbing}
.hv .stage:focus-visible{box-shadow:inset 0 0 0 2px rgba(255,255,255,.35)}
.hv .book{position:relative;width:var(--w);transform-style:preserve-3d}
.hv .floor{position:absolute;left:50%;bottom:-11%;width:104%;height:13%;transform:translateX(-50%);
background:radial-gradient(ellipse at center,rgba(0,0,0,.5),rgba(0,0,0,0) 70%);filter:blur(10px);pointer-events:none}
.hv .leaf{position:absolute;top:0;left:50%;width:50%;height:100%;transform-style:preserve-3d;transform-origin:0 50%;cursor:pointer;
transform:translateX(calc(var(--x) * var(--w))) translateZ(calc(var(--z) * 1px)) rotateY(calc(var(--phi) * 1deg))}
.hv .face{position:absolute;inset:0;transform-style:preserve-3d}
.hv .back{transform:rotateY(180deg)}
.hv .strip{position:absolute;top:0;height:100%;width:calc(var(--w) / 14);transform-style:preserve-3d}
.hv .sf{left:100%;transform-origin:0 50%;transform:rotateY(calc(var(--curl) * -1deg))}
.hv .sb{right:100%;left:auto;transform-origin:100% 50%;transform:rotateY(calc(var(--curl) * 1deg))}
.hv .strip.first{transform:none}
.hv .sf.first{left:0}
.hv .sb.first{left:auto;right:0}
.hv .clip{position:absolute;top:0;bottom:0;left:0;right:-1px;overflow:hidden;background:#d9d4c8;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.hv .sb .clip{left:-1px;right:0}
.hv .sf.first .clip{left:-3px}
.hv .sb.first .clip{right:-3px}
.hv .sf .clip.end{border-radius:0 14px 14px 0}
.hv .sb .clip.end{border-radius:14px 0 0 14px}
.hv .sf.first .clip.end{border-radius:0 14px 14px 0}
.hv .clip img{position:absolute;top:0;width:var(--w);height:100%;object-fit:cover;pointer-events:none;max-width:none}
.hv .clip::after{content:"";position:absolute;inset:0;pointer-events:none;
background:linear-gradient(to right,rgba(0,0,0,var(--a0)),rgba(0,0,0,var(--a1))),rgba(12,16,40,calc(var(--dim) + var(--fs)))}
.hv .sb .clip::after{background:linear-gradient(to left,rgba(0,0,0,var(--a0)),rgba(0,0,0,var(--a1))),rgba(12,16,40,calc(var(--dim) + var(--fs)))}
@media (max-width:700px){.hv{--w:70vw}}
`;
