"use client";
import Link from "next/link";
import { useSiteLanguage } from "./SiteLanguage";
export default function PortfolioFooter() {
  const { lang } = useSiteLanguage();
  return (
    <footer className="portfolio-footer">
      <Link href="/" lang="en" dir="ltr">
        NURANICO®
      </Link>
      <nav aria-label={lang === "fa" ? "پاورقی" : "Footer"}>
        <Link href="/work">{lang === "fa" ? "پروژه‌ها" : "Work"}</Link>
        <Link href="/contact">{lang === "fa" ? "تماس" : "Contact"}</Link>
      </nav>
      <span lang="en" dir="ltr">
        Creative studio / 2026
      </span>
    </footer>
  );
}
