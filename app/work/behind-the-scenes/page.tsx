"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import PortfolioFooter from "../../../components/PortfolioFooter";
import ProjectGallery from "../../../components/ProjectGallery";
import ContentStatus from "../../../components/ContentStatus";
import { localizedValue } from "../../../lib/media";
import { usePageTexts } from "../../../lib/usePageTexts";
type Item = {
  id: number;
  file_url: string;
  kind: "photo" | "video";
  name: string;
  brand_name?: string;
  project_name?: string;
  project_id?: number;
  project_title_en?: string;
  project_title_fa?: string;
  alt_text_en?: string;
  alt_text_fa?: string;
};
export default function BehindTheScenesPage() {
  const { lang, text } = usePageTexts("bts");
  const [items, setItems] = useState<Item[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [retry, setRetry] = useState(0),
    [query, setQuery] = useState("");
  const [kind,setKind]=useState<"photo"|"video">("photo");
  useEffect(()=>{setKind(new URLSearchParams(window.location.search).get("type")==="video" ? "video" : "photo");},[]);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch("/api/public/bts", {
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
  }, [retry]);
  const groups = new Map<string, Item[]>();
  for (const item of items) {
    if(item.kind!==kind)continue;
    if (
      ![
        item.name,
        item.brand_name,
        item.project_name,
        item.project_title_en,
        item.project_title_fa,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase())
    )
      continue;
    const key = item.project_id
      ? `project-${item.project_id}`
      : [item.brand_name, item.project_name].filter(Boolean).join(":") ||
        "independent";
    groups.set(key, [...(groups.get(key) || []), item]);
  }
  return (
    <main className="content-page bts-collection-page">
      <SiteHeader />
      <section className="portfolio-library">
        <header className="portfolio-library-heading">
          <div>
            <p className="portfolio-eyebrow">
              NURANICO / {lang === "fa" ? "پشت صحنه" : "Behind the scenes"}
            </p>
            <h1>{text("hero_title", "Behind the scenes.", "پشت صحنه.")}</h1>
          </div>
        </header>
        <div className="bts-type-switch" role="group" aria-label={lang==='fa' ? 'نوع پشت‌صحنه' : 'Behind-the-scenes type'}>{(['photo','video'] as const).map(type=><button type="button" key={type} aria-pressed={kind===type} onClick={()=>setKind(type)}>{lang==='fa' ? type==='photo' ? 'عکس‌ها' : 'ویدیوها' : type==='photo' ? 'Photos' : 'Videos'} <span>{loading ? '…' : new Intl.NumberFormat(lang).format(items.filter(item=>item.kind===type).length)}</span></button>)}</div>
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
              lang === "fa" ? "جست‌وجوی پشت صحنه" : "Search behind the scenes"
            }
            placeholder={
              lang === "fa" ? "نام پروژه یا برند…" : "Project or brand…"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {loading ? (
          <ContentStatus>
            {lang === "fa" ? "در حال بارگذاری…" : "Loading…"}
          </ContentStatus>
        ) : error ? (
          <ContentStatus error onRetry={() => setRetry((value) => value + 1)}>
            {lang === "fa"
              ? "پشت صحنه بارگذاری نشد."
              : "Behind the scenes could not be loaded."}
          </ContentStatus>
        ) : (
          <div className="bts-project-groups">
            {Array.from(groups.entries()).map(([key, files]) => {
              const first = files[0];
              const title = localizedValue(
                lang,
                first.project_title_en,
                first.project_title_fa,
                first.project_name ||
                  (lang === "fa" ? "پشت صحنه" : "Behind the scenes"),
              );
              return (
                <section className="bts-project-group" key={key}>
                  <header>
                    <div>
                      {first.brand_name && (
                        <p className="portfolio-brand" dir="auto">
                          {first.brand_name}
                        </p>
                      )}
                      <h2 dir="auto">{title}</h2>
                      <span>
                        {new Intl.NumberFormat(lang).format(files.length)}{" "}
                        {lang === "fa" ? "محتوا" : files.length===1 ? "item" : "items"}
                      </span>
                    </div>
                    {first.project_id && (
                      <Link
                        className="bts-project-link"
                        href={`/work/${first.project_id}`}
                      >
                        {lang === "fa" ? "مشاهده پروژه" : "View project"}{" "}

                      </Link>
                    )}
                  </header>
                  <ProjectGallery
                    title={title}
                    lang={lang}
                    renderVideo={(url) => (
                      <video
                        src={url}
                        controls
                        preload="metadata"
                        playsInline
                      />
                    )}
                    items={files.map((item) => ({
                      url: item.file_url,
                      video: item.kind === "video",
                      label: localizedValue(
                        lang,
                        item.alt_text_en,
                        item.alt_text_fa,
                        item.name || title,
                      ),
                    }))}
                  />
                </section>
              );
            })}
            {!groups.size && (
              <ContentStatus>
                {query
                  ? lang === "fa"
                    ? "نتیجه‌ای پیدا نشد."
                    : "No matches."
                  : lang === "fa"
                    ? kind==='photo' ? "هنوز عکس پشت‌صحنه‌ای منتشر نشده است." : "هنوز ویدیوی پشت‌صحنه‌ای منتشر نشده است."
                    : kind==='photo' ? "No behind-the-scenes photos yet." : "No behind-the-scenes videos yet."}
              </ContentStatus>
            )}
          </div>
        )}
      </section>
      <PortfolioFooter />
    </main>
  );
}
