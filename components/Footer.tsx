import Image from "next/image";
import Link from "next/link";
import { CCTV_SEGMENT, IT_SEGMENT } from "@/data/products";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
];

const PHONES = [
  { label: "889 1457 889", tel: "+918891457889" },
  { label: "858 9997 889", tel: "+918589997889" },
];

const EMAIL = "hawkeyevisioncok@gmail.com";

const ADDRESS = [
  "G48, DD Trade Centre,",
  "Jos Junction, MG Road,",
  "Ernakulam – 682016",
];

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(
    "Hawkeye Vision, G48, DD Trade Centre, Jos Junction, MG Road, Ernakulam 682016"
  );

const SEGMENTS = [
  { title: "CCTV Segment", items: CCTV_SEGMENT },
  { title: "IT Segment", items: IT_SEGMENT },
];

const linkClass =
  "transition-colors hover:text-sky-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

export default function Footer() {
  return (
    <footer className="relative z-30 border-t border-blue-900/50 bg-[#081F4D] px-6 pb-8 pt-16 text-white md:pt-20">
      <div className="mx-auto max-w-6xl">
        {/* Top row: logo and description */}
        <div className="border-b border-white/15 pb-12">
          <div className="max-w-xl">
            {/* White panel because the logo has a white background. */}
            <Link
              href="/"
              aria-label="Hawkeye Vision home"
              className="inline-block rounded-2xl bg-white px-3 py-1.5 sm:px-3.5 sm:py-2 md:px-5 md:py-2.5 lg:px-6 lg:py-3 shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span className="relative block aspect-[850/160] h-7 sm:h-8 md:h-12 lg:h-14 xl:h-16 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Hawkeye Vision – The Ultimate Destination for Surveillance Systems"
                  fill
                  sizes="(min-width: 1280px) 340px, (min-width: 1024px) 300px, (min-width: 768px) 255px, 170px"
                  className="object-cover object-[50%_57%]"
                />
              </span>
            </Link>
            <p className="mt-5 text-blue-100/80">
              CCTV wholesale distributor in Kochi, supplying and servicing
              premium surveillance and IT security brands.
            </p>
          </div>
        </div>

        {/* Columns: 2 on phones, 3 on tablets, 4 on laptops and up */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-12 md:grid-cols-3 md:gap-x-10 lg:grid-cols-[0.7fr_1fr_1fr_auto]">
          {/* Pages */}
          <nav aria-label="Footer">
            <h2 className="text-lg font-semibold text-white">Pages</h2>
            <ul className="mt-5 space-y-3 text-blue-100/75">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Products, one column per segment */}
          {SEGMENTS.map((segment) => (
            <div key={segment.title}>
              <h2 className="text-lg font-semibold text-white">{segment.title}</h2>
              <ul className="mt-5 space-y-3 text-blue-100/75">
                {segment.items.map((item) => (
                  <li key={item}>
                    <Link href="/products" className={linkClass}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact: full width on phones and tablets, own column on laptops */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h2 className="text-lg font-semibold text-white">Contact</h2>
            <address className="mt-5 space-y-5 not-italic text-blue-100/75">
              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open our address in Google Maps"
                className={`flex items-start gap-2.5 leading-relaxed ${linkClass}`}
              >
                <svg
                  className="mt-0.5 h-4 w-4 md:h-5 md:w-5 shrink-0 text-sky-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="block text-sm md:text-base">
                  {ADDRESS.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </a>

              <div className="divide-y divide-white/15 border-y border-white/15">
                <div className="flex items-start gap-2.5 py-3">
                  <svg
                    className="mt-0.5 h-4 w-4 md:h-5 md:w-5 shrink-0 text-sky-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div className="flex flex-col gap-1 text-sm md:text-base">
                    {PHONES.map((p) => (
                      <a key={p.tel} href={`tel:${p.tel}`} className={linkClass}>
                        {p.label}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 py-3">
                  <svg
                    className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-sky-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <a
                    href={`mailto:${EMAIL}`}
                    className={`whitespace-nowrap text-sm md:text-base ${linkClass}`}
                  >
                    {EMAIL}
                  </a>
                </div>
              </div>
            </address>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/15 pt-6 text-sm text-blue-200/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Hawkeye Vision. All rights reserved.</p>
          <p>Wholesale CCTV and surveillance systems, Kochi</p>
        </div>
      </div>
    </footer>
  );
}