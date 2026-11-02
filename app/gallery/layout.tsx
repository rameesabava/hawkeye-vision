import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photo gallery of Hawkeye Vision: CCTV installations, surveillance systems, products and projects from Kochi, Ernakulam.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Gallery | Hawkeye Vision",
    description:
      "Photos of CCTV installations, surveillance systems and products from Hawkeye Vision, Kochi.",
    url: "/gallery",
    type: "website",
    images: [{ url: "/images/photo1.jpg", width: 1200, height: 630 }],
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}