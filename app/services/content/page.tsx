"use client";
import SiteHeader from "../../../components/SiteHeader";
import PortfolioFooter from "../../../components/PortfolioFooter";
import PortfolioLibrary from "../../../components/PortfolioLibrary";
import { usePageTexts } from "../../../lib/usePageTexts";
export default function ContentPage() {
  const { text } = usePageTexts("content");
  return (
    <main className="content-page service-page">
      <SiteHeader />
      <PortfolioLibrary
        destination="content"
        title={text("projects_title", "Content projects.", "پروژه‌های محتوا.")}
      />
      <PortfolioFooter />
    </main>
  );
}
