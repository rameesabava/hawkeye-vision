import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

// Change this to your real domain when the site goes live
const SITE_URL = "https://www.hawkeyevision.in";
const SITE_NAME = "Hawkeye Vision";
const DESCRIPTION =
  "Hawkeye Vision is a CCTV wholesale distributor in Kochi, supplying Hikvision, CP Plus, TP-Link, Dahua, Panasonic, Toshiba, Western Digital, D-Link, Hi Focus and eSSL. Cameras, DVR, NVR, hard disks, biometric attendance, access control and service.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hawkeye Vision",
    template: "%s | Hawkeye Vision",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "CCTV wholesale Kochi",
    "CCTV distributor Ernakulam",
    "Hikvision distributor Kerala",
    "CP Plus dealer Kochi",
    "DVR NVR wholesale",
    "surveillance hard disk",
    "biometric attendance",
    "security cameras Kochi",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Hawkeye Vision | CCTV Wholesale Distributor in Kochi",
    description: DESCRIPTION,
    // Add app/opengraph-image.png (1200x630) and Next.js will use it automatically
  },
  twitter: {
    card: "summary_large_image",
    title: "Hawkeye Vision | CCTV Wholesale Distributor in Kochi",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  // Put icon.png / apple-icon.png in /app and Next.js picks them up automatically.
  // Remove this block if you do that.
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#081F4D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main>{children}</main>
        <WhatsAppButton />
        <Footer />
      </body>
    </html>
  );
}
