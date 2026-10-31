import Hero from "@/components/Hero";
import BrandsSection from "@/components/BrandsSection";
import CenterBurst from "@/components/CenterBurst";
import ProductsCarousel from "@/components/ProductsCarousel";
import OverlapSection from "@/components/OverlapSection";

export default function Home() {
  return (
    <>
      <Hero /> {/* dark: video carousel */}
      <BrandsSection /> {/* white: flipping brand logos */}
      <CenterBurst /> {/* black: pictures fly out from the centre */}
      <ProductsCarousel /> {/* white: scroll-driven product carousel */}
      <OverlapSection /> {/* black: slides over the products section */}
    </>
  );
}
