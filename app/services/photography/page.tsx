"use client";
import SiteHeader from "../../../components/SiteHeader";
import PortfolioFooter from "../../../components/PortfolioFooter";
import PortfolioLibrary from "../../../components/PortfolioLibrary";
import { usePageTexts } from "../../../lib/usePageTexts";
export default function PhotographyPage() {
  const { text } = usePageTexts("photography");
  return (
    <main className="content-page service-page">
      <SiteHeader />
      <PortfolioLibrary
        destination="photography"
        title={text(
          "projects_title",
          "Photography projects.",
          "پروژه‌های عکاسی.",
        )}
      />
      <PortfolioFooter />
    </main>
  );
}
