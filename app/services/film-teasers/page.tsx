"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import PortfolioFooter from "../../../components/PortfolioFooter";
import PortfolioLibrary from "../../../components/PortfolioLibrary";
import PortfolioCard from "../../../components/PortfolioCard";
import ContentStatus from "../../../components/ContentStatus";
import { localizedValue } from "../../../lib/media";
import { usePageTexts } from "../../../lib/usePageTexts";
type BtsItem = {
  id: number;
  file_url: string;
  kind: "photo" | "video";
  name?: string;
  brand_name?: string;
  project_name?: string;
  project_id?: number;
  alt_text_en?: string;
  alt_text_fa?: string;
};
export default function FilmPage() {
  const { lang, text } = usePageTexts("film");
  const [items, setItems] = useState<BtsItem[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch("/api/public/bts", {
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!cancelled) setItems(result.items || []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [retry]);
  return (
    <main className="content-page service-page">
      <SiteHeader />
      <PortfolioLibrary
        destination="film"
        title={text("projects_title", "Film projects.", "پروژه‌های فیلم.")}
      />
      {(loading || error || items.length > 0) && (
        <section className="film-bts portfolio-bts-preview">
          <header>
            <h2>{text("bts_title", "Behind the scenes.", "پشت صحنه.")}</h2>
            <Link href="/work/behind-the-scenes">
              {text("view_all", "View all", "مشاهده همه")}{" "}
              <span aria-hidden="true">↗</span>
            </Link>
          </header>
          {loading ? (
            <ContentStatus>
              {text("loading", "Loading…", "در حال بارگذاری…")}
            </ContentStatus>
          ) : error ? (
            <ContentStatus error onRetry={() => setRetry((value) => value + 1)}>
              {text(
                "bts_load_error",
                "Behind the scenes could not be loaded.",
                "پشت صحنه بارگذاری نشد.",
              )}
            </ContentStatus>
          ) : (
            <div className="portfolio-library-grid">
              {items.slice(0, 4).map((item) => (
                <PortfolioCard
                  key={item.id}
                  lang={lang}
                  item={{
                    id: item.id,
                    href: item.project_id
                      ? `/work/${item.project_id}#project-bts`
                      : "/work/behind-the-scenes",
                    title_en: localizedValue(
                      "en",
                      item.alt_text_en,
                      item.alt_text_fa,
                      item.project_name || item.name,
                    ),
                    title_fa: localizedValue(
                      "fa",
                      item.alt_text_en,
                      item.alt_text_fa,
                      item.project_name || item.name,
                    ),
                    brand_name: item.brand_name,
                    media_url: item.file_url,
                    media_type: item.kind === "video" ? "video" : "image",
                    cover_url: item.kind === "photo" ? item.file_url : null,
                    destinations: ["bts"],
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}
      <PortfolioFooter />
    </main>
  );
}
