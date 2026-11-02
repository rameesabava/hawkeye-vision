import type { Metadata } from "next";
import AboutContent from "@/components/AboutContent";

export const metadata: Metadata = {
  title: "About Us | Hawkeye Vision",
  description:
    "Hawkeye Vision is a CCTV wholesale distributor in Kochi, supplying and servicing surveillance systems from premium brands.",
};

export default function AboutPage() {
  return <AboutContent />;
}
