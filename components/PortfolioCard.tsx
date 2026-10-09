"use client";
import Link from "next/link";
import MediaCountBadge from "./MediaCountBadge";
import ArrowUpRight from "./ArrowUpRight";
import { isVideoAsset, localizedValue } from "../lib/media";

export type PortfolioItem = {
  id: number;
  href?: string;
  title_en?: string | null;
  title_fa?: string | null;
  brand_name?: string | null;
  category?: string | null;
  destinations?: string[];
  cover_url?: string | null;
  media_url?: string | null;
  media_type?: string | null;
  media_count?: number;
  has_video?: boolean;
};
export function projectSections(item: PortfolioItem) {
  const explicit = (item.destinations || []).filter((key) =>
    ["film", "photography", "content", "bts"].includes(key),
  );
  if (explicit.length) return explicit;
  if (/film|teaser|video/i.test(item.category || "") || isVideoAsset(item))
    return ["film"];
  return /photo/i.test(item.category || "") ? ["photography"] : ["content"];
}
export function sectionName(key: string, lang: "en" | "fa") {
  const names: Record<string, [string, string]> = {
    film: ["Film & Teasers", "فیلم و تیزر"],
    photography: ["Photography", "عکاسی"],
    content: ["Content", "محتوا"],
    bts: ["Behind the scenes", "پشت صحنه"],
  };
  return names[key]?.[lang === "fa" ? 1 : 0] || key;
}
export default function PortfolioCard({
  item,
  lang,
  className = "",
}: {
  item: PortfolioItem;
  lang: "en" | "fa";
  className?: string;
}) {
  const title = localizedValue(
    lang,
    item.title_en,
    item.title_fa,
    lang === "fa" ? "بدون عنوان" : "Untitled",
  );
  const video = isVideoAsset(item);
  const image = item.cover_url || (!video ? item.media_url : null);
  return (
    <Link
      href={item.href || `/work/${item.id}`}
      className={`portfolio-card ${className} ${item.media_count && item.media_count > 1 ? "has-gallery" : ""}`}
    >
      <div className="portfolio-card-media">
        {image ? (
          <img src={image} alt={title} loading="lazy" />
        ) : (
          <video
            src={item.media_url || undefined}
            preload="metadata"
            muted
            playsInline
          />
        )}
        <MediaCountBadge count={item.media_count} lang={lang} />
        {(video || item.has_video) && (
          <span
            className="portfolio-video-cue"
            aria-label={lang === "fa" ? "ویدیو" : "Video"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}
        <span className="portfolio-open-cue" aria-hidden="true">
          <ArrowUpRight />
        </span>
      </div>
      <div className="portfolio-card-copy">
        {item.brand_name && (
          <p className="portfolio-brand" dir="auto">
            {item.brand_name}
          </p>
        )}
        <h3 dir="auto">{title}</h3>
        <p className="portfolio-section">
          {projectSections(item)
            .map((key) => sectionName(key, lang))
            .join(" · ")}
        </p>
      </div>
    </Link>
  );
}
