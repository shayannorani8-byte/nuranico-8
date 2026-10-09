"use client";
import { useEffect, useState } from "react";
import PortfolioCard, {
  type PortfolioItem,
  projectSections,
  sectionName,
} from "./PortfolioCard";
import ContentStatus from "./ContentStatus";
import { usePageTexts } from "../lib/usePageTexts";

export default function PortfolioLibrary({
  destination = "all",
  title,
}: {
  destination?: string;
  title?: string;
}) {
  const { lang, text } = usePageTexts(
    destination === "all"
      ? "work"
      : destination === "photography"
        ? "photography"
        : destination === "film"
          ? "film"
          : "content",
  );
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [retry, setRetry] = useState(0);
  const [filter, setFilter] = useState("all"),
    [query, setQuery] = useState(""),
    [limit, setLimit] = useState(24);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setFilter("all");
    setLimit(24);
    fetch(`/api/public/projects?destination=${destination}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (!cancelled) setItems(data.items || []);
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
  }, [destination, retry]);
  const filtered = items.filter(
    (item) =>
      (filter === "all" || projectSections(item).includes(filter)) &&
      [item.title_en, item.title_fa, item.brand_name]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <section className="portfolio-library">
      <header className="portfolio-library-heading">
        <div>
          <p className="portfolio-eyebrow">
            NURANICO / {lang === "fa" ? "نمونه‌کارها" : "Portfolio"}
          </p>
          <h1>
            {title ||
              (destination === "all"
                ? text("title", "Our work.", "پروژه‌های ما.")
                : sectionName(destination, lang))}
          </h1>
        </div>
        {!loading && !error && (
          <span className="portfolio-total">
            {new Intl.NumberFormat(lang).format(items.length)}{" "}
            {lang === "fa" ? "پروژه" : "projects"}
          </span>
        )}
      </header>
      <div className="portfolio-library-tools">
        {destination === "all" && (
          <div
            className="portfolio-filters"
            role="group"
            aria-label={
              lang === "fa" ? "دسته‌بندی پروژه‌ها" : "Project categories"
            }
          >
            {["all", "film", "photography", "content", "bts"].map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => {
                  setFilter(key);
                  setLimit(24);
                }}
              >
                {key === "all"
                  ? lang === "fa"
                    ? "همه"
                    : "All"
                  : sectionName(key, lang)}
              </button>
            ))}
          </div>
        )}
        <label className="portfolio-search">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 5 5" />
          </svg>
          <input
            type="search"
            aria-label={
              lang === "fa"
                ? "جست‌وجوی پروژه یا برند"
                : "Search project or brand"
            }
            placeholder={
              lang === "fa" ? "نام پروژه یا برند…" : "Project or brand…"
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(24);
            }}
          />
        </label>
      </div>
      {loading ? (
        <div
          className="portfolio-skeleton-grid"
          aria-label={lang === "fa" ? "در حال بارگذاری" : "Loading"}
          aria-busy="true"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div className="portfolio-skeleton" key={i} />
          ))}
        </div>
      ) : error ? (
        <ContentStatus
          error
          onRetry={() => setRetry((value) => value + 1)}
          retryLabel={lang === "fa" ? "تلاش دوباره" : "Try again"}
        >
          {lang === "fa"
            ? "پروژه‌ها بارگذاری نشدند."
            : "Projects could not be loaded."}
        </ContentStatus>
      ) : (
        <>
          <p className="portfolio-results" role="status">
            {new Intl.NumberFormat(lang).format(filtered.length)}{" "}
            {lang === "fa" ? "نتیجه" : "results"}
          </p>
          <div className="portfolio-library-grid">
            {filtered.slice(0, limit).map((item) => (
              <PortfolioCard key={item.id} item={item} lang={lang} />
            ))}
          </div>
          {!filtered.length && (
            <ContentStatus>
              {query || filter !== "all"
                ? lang === "fa"
                  ? "نتیجه‌ای پیدا نشد. جست‌وجو یا دسته‌بندی را تغییر دهید."
                  : "No matches. Try a different search or category."
                : text(
                    "empty_projects",
                    "No projects have been published here yet.",
                    "هنوز پروژه‌ای در این بخش منتشر نشده است.",
                  )}
            </ContentStatus>
          )}
          {filtered.length > limit && (
            <button
              className="portfolio-load-more"
              onClick={() => setLimit((value) => value + 24)}
            >
              {lang === "fa" ? "نمایش بیشتر" : "Load more"}
            </button>
          )}
        </>
      )}
    </section>
  );
}
