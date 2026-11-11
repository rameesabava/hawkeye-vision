
import type { Metadata } from "next";
import type { ReactNode } from "react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Hawkeye Vision",
  description:
    "Contact Hawkeye Vision, CCTV wholesale distributor at DD Trade Centre, MG Road, Ernakulam. Call, email or send an enquiry.",
};

const PHONES = [
  { label: "889 1457 889", href: "tel:+918891457889" },
  { label: "858 9997 889", href: "tel:+918589997889" },
];

const EMAIL = "hawkeyevisioncok@gmail.com";

const MAP_SRC =
  "https://www.google.com/maps?q=DD+Trade+Centre,+MG+Road,+Jos+Junction,+Ernakulam&output=embed";

function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-100 text-[#081F4D]">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </span>
  );
}

export default function ContactPage() {
  return (
    <>
      {/* Full rich blue hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#081F4D] via-[#0A2660] to-[#071838] px-6 pb-24 pt-32 text-center text-white md:pt-40 md:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent" />

        <div className="absolute left-1/2 top-0 -z-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-sky-200 backdrop-blur-md sm:px-5 sm:py-2.5 sm:text-sm">
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
              className="shrink-0 text-sky-300"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>

            Wholesale enquiries
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:mt-8 sm:text-6xl md:text-7xl">
            Tell us what you need to watch over
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-blue-100/80 sm:mt-8 sm:text-lg">
            Ask for a price list, a quote or service support. Call us,
            message us or send the form below and we will get back to you.
          </p>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <a
              href={PHONES[0].href}
              className="w-full rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#081F4D] shadow-lg transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
            >
              Call {PHONES[0].label}
            </a>
          </div>
        </div>
      </section>

      {/* Contact details and enquiry form */}
      <section className="bg-slate-50 px-6 py-24 text-slate-900 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">

          {/* Left: Contact details */}
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#081F4D]">
              Direct Contact
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#081F4D] sm:text-4xl">
              Visit or call Hawkeye Vision
            </h2>

            <p className="mt-4 text-slate-600">
              Our office is at Jos Junction on MG Road, in the heart of
              Ernakulam.
            </p>

            <ul className="mt-10 space-y-6">

              {/* Address */}
              <li className="flex gap-4">
                <Icon>
                  <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </Icon>

                <address className="not-italic">
                  <p className="font-semibold text-slate-900">
                    Address
                  </p>

                  <p className="mt-1 text-slate-600">
                    Hawkeye Vision
                    <br />
                    G48, DD Trade Centre,
                    <br />
                    Jos Junction, MG Road,
                    <br />
                    Ernakulam – 682016
                  </p>
                </address>
              </li>

              {/* Phone */}
              <li className="flex gap-4">
                <Icon>
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
                </Icon>

                <div>
                  <p className="font-semibold text-slate-900">
                    Phone
                  </p>

                  <div className="mt-1 flex flex-col text-slate-600">
                    {PHONES.map((p) => (
                      <a
                        key={p.href}
                        href={p.href}
                        className="w-fit font-medium text-blue-600 transition hover:text-[#081F4D] hover:underline"
                      >
                        {p.label}
                      </a>
                    ))}
                  </div>
                </div>
              </li>

              {/* Email */}
              <li className="flex gap-4">
                <Icon>
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path d="m3 7 9 6 9-6" />
                </Icon>

                <div>
                  <p className="font-semibold text-slate-900">
                    Email
                  </p>

                  <a
                    href={`mailto:${EMAIL}`}
                    className="mt-1 block break-all font-medium text-blue-600 transition hover:text-[#081F4D] hover:underline"
                  >
                    {EMAIL}
                  </a>
                </div>
              </li>
            </ul>

            {/* Google Maps */}
            <div className="mt-10 overflow-hidden rounded-2xl border border-blue-200 shadow-sm">
              <iframe
                title="Hawkeye Vision location on the map"
                src={MAP_SRC}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-64 w-full border-0 sm:h-72"
              />
            </div>
          </div>

          {/* Right: Contact form */}
          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight text-[#081F4D] sm:text-3xl">
              Send an enquiry
            </h2>

            <p className="mt-3 text-slate-600">
              Include the brand, model and quantity if you know them.
            </p>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* Navy closing band */}
      <section className="bg-gradient-to-r from-[#081F4D] via-[#0A2660] to-[#081F4D] px-6 py-24 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Looking for Hikvision, CP Plus, TP-Link or hard disks?
          </h2>

          <p className="mt-6 text-lg text-blue-100/80">
            Price lists and model details are available on request.
          </p>

          <a
            href={PHONES[1].href}
            className="mt-10 inline-block rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#081F4D] shadow-md transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Call {PHONES[1].label}
          </a>
        </div>
      </section>
    </>
  );
}
