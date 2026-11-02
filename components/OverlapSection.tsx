import Link from "next/link";
import { CCTV_SEGMENT, IT_SEGMENT } from "@/data/products";

const SEGMENTS = [
  { title: "CCTV Segment", items: CCTV_SEGMENT },
  { title: "IT Segment", items: IT_SEGMENT },
];

export default function OverlapSection() {
  return (
    // -mt-[100vh] pulls this section up so it slides over the products section
    <section className="relative z-20 -mt-[100vh] flex min-h-screen items-center rounded-t-[2.5rem] bg-neutral-950 px-6 py-28 text-white shadow-[0_-30px_60px_rgba(0,0,0,0.25)]">
      <div className="mx-auto grid w-full max-w-6xl gap-16 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Kochi&rsquo;s CCTV wholesale distributor
          </h2>
          <p className="mt-8 max-w-xl text-lg text-white/70">
            Hawkeye Vision is a CCTV wholesale distributor based in Kochi,
            dealing with almost all premium brands including Hikvision, CP Plus,
            TP Link, Toshiba, WD and many more.
          </p>
        </div>

        <div className="lg:pt-4">
          <p className="text-lg text-white/70">
            We deal with security surveillance systems and also undertake
            service of these products, for timely execution with utmost
            satisfaction to our valued customers.
          </p>

          <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {SEGMENTS.map((segment) => (
              <li key={segment.title} className="py-6">
                <h3 className="text-xl font-semibold">{segment.title}</h3>
                <p className="mt-2 text-white/60">
                  {segment.items.join(", ")}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              View products
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/30 px-8 py-4 text-sm font-semibold transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
