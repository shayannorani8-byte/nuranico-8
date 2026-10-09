"use client";
import SiteHeader from "../../components/SiteHeader";
import PortfolioLibrary from "../../components/PortfolioLibrary";
import PortfolioFooter from "../../components/PortfolioFooter";
import { useSearchParams } from "next/navigation";
export default function WorkPage() {
  const params = useSearchParams();
  const requested = params.get("destination") || "all";
  const destination = ["film", "photography", "content", "bts"].includes(
    requested,
  )
    ? requested
    : "all";
  return (
    <main className="content-page work-gallery-page">
      <SiteHeader />
      <PortfolioLibrary destination={destination} />
      <PortfolioFooter />
    </main>
  );
}
