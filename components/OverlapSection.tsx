import Link from "next/link";
import { CCTV_SEGMENT, IT_SEGMENT } from "@/data/products";

const SEGMENTS = [
  { title: "CCTV Segment", items: CCTV_SEGMENT },
  { title: "IT Segment", items: IT_SEGMENT },
];

export default function OverlapSection() {
  return (
    // -mt-[100vh] pulls this section up so it slides over the products section
    <section className="relative z-20 -mt-[100vh] flex min-h-screen items-center rounded-t-[2.5rem] bg-gradient-to-br from-[#081F4D] via-[#0A2660] to-[#071838] px-6 py-28 text-white shadow-[0_-30px_60px_rgba(8,31,77,0.35)]">
      <div className="mx-auto grid w-full max-w-6xl gap-16 lg:grid-cols-2">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-200">
            Trusted Distribution
          </div>
          <h2 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Kochi&rsquo;s CCTV wholesale distributor
          </h2>
          <p className="mt-8 max-w-xl text-lg text-blue-100/80">
            Hawkeye Vision is a CCTV wholesale distributor based in Kochi,
            dealing with almost all premium brands including Hikvision, CP Plus,
            TP Link, Toshiba, WD and many more.
          </p>
        </div>

        <div className="lg:pt-4">
          <p className="text-lg text-blue-100/80">
            We deal with security surveillance systems and also undertake
            service of these products, for timely execution with utmost
            satisfaction to our valued customers.
          </p>

          <ul className="mt-8 divide-y divide-blue-400/20 border-y border-blue-400/20">
            {SEGMENTS.map((segment) => (
              <li key={segment.title} className="py-6">
                <h3 className="text-xl font-bold text-white">{segment.title}</h3>
                <p className="mt-2 text-blue-200/80">
                  {segment.items.join(", ")}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#081F4D] shadow-md transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              View products
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/30 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
