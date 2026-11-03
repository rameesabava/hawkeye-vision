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
  "transition-colors hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

export default function Footer() {
  return (
    <footer className="relative z-30 border-t border-white/10 bg-neutral-950 px-6 pb-8 pt-16 text-white md:pt-20">
      <div className="mx-auto max-w-6xl">
        {/* Top row: logo and description */}
        <div className="border-b border-white/10 pb-12">
          <div className="max-w-xl">
            {/* White panel because the logo has a white background.
                object-cover trims the empty space above/below the artwork. */}
          <Link
  href="/"
  aria-label="Hawkeye Vision home"
  className="inline-block rounded-xl bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
>
  <span className="relative block aspect-[850/160] h-12 overflow-hidden sm:h-14 md:h-16">
    <Image
      src="/logo.png"
      alt="Hawkeye Vision – The Ultimate Destination for Surveillance Systems"
      fill
      sizes="(min-width: 768px) 340px, (min-width: 640px) 298px, 255px"
      className="object-cover object-[50%_57%]"
    />
  </span>
</Link>
            <p className="mt-5 text-white/70">
              CCTV wholesale distributor in Kochi, supplying and servicing
              premium brands.
            </p>
          </div>
        </div>

        {/* Columns: 2 on phones, 3 on tablets, 4 on laptops and up */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-12 md:grid-cols-3 md:gap-x-10 lg:grid-cols-[0.7fr_1fr_1fr_auto]">
          {/* Pages */}
          <nav aria-label="Footer">
            <h2 className="text-lg font-semibold">Pages</h2>
            <ul className="mt-5 space-y-3 text-white/70">
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
              <h2 className="text-lg font-semibold">{segment.title}</h2>
              <ul className="mt-5 space-y-3 text-white/70">
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
            <h2 className="text-lg font-semibold">Contact</h2>
            <address className="mt-5 space-y-6 not-italic text-white/70">
              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open our address in Google Maps"
                className={`block leading-relaxed ${linkClass}`}
              >
                {ADDRESS.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </a>

              <div className="divide-y divide-white/10 border-y border-white/10">
                <div className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
                  <span className="w-12 shrink-0 text-white/50">Mob</span>
                  <span className="flex flex-col gap-1">
                    {PHONES.map((p) => (
                      <a key={p.tel} href={`tel:${p.tel}`} className={linkClass}>
                        {p.label}
                      </a>
                    ))}
                  </span>
                </div>
                <div className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
                  <span className="w-12 shrink-0 text-white/50">Mail</span>
                  <a
                    href={`mailto:${EMAIL}`}
                    className={`whitespace-nowrap text-[15px] sm:text-base ${linkClass}`}
                  >
                    {EMAIL}
                  </a>
                </div>
              </div>
            </address>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Hawkeye Vision. All rights reserved.</p>
          <p>Wholesale CCTV and surveillance systems, Kochi</p>
        </div>
      </div>
    </footer>
  );
}