import type { Metadata } from "next";
import ProductsContent from "@/components/ProductsContent";

export const metadata: Metadata = {
  title: "Products | Hawkeye Vision",
  description:
    "CCTV cameras, DVR, NVR, hard disks, biometric attendance and more from Hikvision, CP Plus, TP-Link, Toshiba, WD, eSSL and other brands.",
};

export default function ProductsPage() {
  return <ProductsContent />;
}
