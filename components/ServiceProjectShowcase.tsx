'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePageTexts } from '../lib/usePageTexts';

type ProjectItem = {
  id: number;
  title_en?: string;
  title_fa?: string;
  cover_url?: string | null;
  media_url?: string | null;
};

type Props = {
  destination: 'film' | 'photography' | 'content';
  eyebrow: string;
  title: string;
};

export default function ServiceProjectShowcase({
  destination,
  eyebrow,
  title,
}: Props) {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const page =
    destination === 'film'
      ? 'film'
      : destination === 'photography'
        ? 'photography'
        : 'content';

  const { text } = usePageTexts(page);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          `/api/public/projects?destination=${destination}`,
          { cache: 'no-store' }
        );

        const result = await response.json();

        if (!cancelled) {
          setItems(response.ok ? result.items || [] : []);
        }
      } catch (error) {
        console.error(`Could not load ${destination} projects:`, error);

        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [destination]);

  const fallbackEyebrowFa =
    destination === 'film'
      ? 'پروژه‌های منتخب فیلم'
      : destination === 'photography'
        ? 'عکاسی منتخب'
        : 'محتوای منتخب';

  const fallbackTitleFa =
    destination === 'film'
      ? 'پروژه‌های فیلم.'
      : destination === 'photography'
        ? 'پروژه‌های عکاسی.'
        : 'پروژه‌های محتوا.';

  return (
    <section className={`project-library project-library-${destination}`}>
      <div className="project-library-head">
        <div>
          <span>
            {text('projects_eyebrow', eyebrow, fallbackEyebrowFa)}
          </span>
          <h2>
            {text('projects_title', title, fallbackTitleFa)}
          </h2>
        </div>

        <Link className="project-library-viewall" href="/work">
          {text('view_all', 'VIEW ALL ↗', 'مشاهده همه ↗')}
        </Link>
      </div>

      {loading ? (
        <div className="library-empty">
          {text('loading', 'LOADING...', 'در حال بارگذاری...')}
        </div>
      ) : items.length === 0 ? (
        <div className="library-empty">
          {text(
            'empty_projects',
            'NO PROJECTS YET.',
            'هنوز پروژه‌ای وجود ندارد.'
          )}
        </div>
      ) : (
        <div className="library-grid">
          {items.map((item) => {
            const projectTitle =
              item.title_en ||
              item.title_fa ||
              text('untitled', 'Untitled', 'بدون عنوان');

            const image =
              item.cover_url ||
              item.media_url ||
              '';

            return (
              <Link
                href={`/work/${item.id}`}
                className="library-card"
                key={item.id}
              >
                <div className="library-poster">
                  {image ? (
                    <img
                      src={image}
                      alt={projectTitle}
                      loading="lazy"
                    />
                  ) : (
                    <div className="library-placeholder" />
                  )}
                </div>

                <h3>{projectTitle}</h3>
              </Link>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        .project-library {
          padding: 68px 4vw 78px;
          background: #151515;
          color: #f2f2f2;
          border-top: 1px solid #292929;
        }

        .project-library-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .project-library-head > div > span {
          display: block;
          color: #737373;
          font-size: 7px;
          line-height: 1;
          letter-spacing: .19em;
          text-transform: uppercase;
          margin-bottom: 9px;
        }

        .project-library-head h2 {
          margin: 0;
          color: #f2f2f2;
          font-size: clamp(26px, 2.7vw, 40px);
          line-height: .94;
          font-weight: 400;
          letter-spacing: -.04em;
        }

        .project-library-viewall,
        .project-library-viewall:visited,
        .project-library-viewall:hover,
        .project-library-viewall:active {
          color: #b7b7b7 !important;
          text-decoration: none !important;
          font-size: 7px !important;
          line-height: 1 !important;
          font-weight: 400 !important;
          letter-spacing: .16em !important;
          text-transform: uppercase !important;
          white-space: nowrap;
          padding-bottom: 5px;
          border-bottom: 1px solid #414141;
        }

        .library-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 22px 9px;
          align-items: start;
        }

        .library-card,
        .library-card:visited,
        .library-card:hover,
        .library-card:active {
          display: block;
          min-width: 0;
          color: #ffffff !important;
          text-decoration: none !important;
        }

        .library-poster {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #202020;
          border-radius: 6px;
        }

        .library-poster::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 28%;
          pointer-events: none;
          background: linear-gradient(
            to top,
            rgba(0,0,0,.18) 0%,
            rgba(0,0,0,.07) 45%,
            rgba(0,0,0,0) 100%
          );
        }

        .project-library-photography .library-poster,
        .project-library-content .library-poster {
          aspect-ratio: 4 / 5;
        }

        .library-poster img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition:
            transform .45s cubic-bezier(.2,.7,.2,1),
            filter .45s ease;
        }

        .library-card:hover .library-poster img {
          transform: scale(1.025);
          filter: brightness(.9);
        }

        .library-placeholder {
          width: 100%;
          height: 100%;
          background: #202020;
        }

        .library-card h3 {
          margin: 9px 2px 0;
          color: #f1f1f1 !important;
          text-align: center;
          text-transform: uppercase;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11px;
          line-height: 1.2;
          font-weight: 500;
          letter-spacing: .055em;
        }

        .library-empty {
          color: #777;
          font-size: 8px;
          letter-spacing: .15em;
          padding: 18px 0;
        }

        @media (max-width: 700px) {
          .library-poster {
            border-radius: 5px;
          }

          .project-library {
            padding: 44px 12px 52px;
          }

          .project-library-head {
            margin-bottom: 18px;
            gap: 12px;
          }

          .project-library-head > div > span {
            font-size: 5.5px;
            margin-bottom: 6px;
          }

          .project-library-head h2 {
            font-size: 23px;
          }

          .project-library-viewall,
          .project-library-viewall:visited,
          .project-library-viewall:hover,
          .project-library-viewall:active {
            font-size: 5.5px !important;
            letter-spacing: .13em !important;
            padding-bottom: 4px;
          }

          .library-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px 5px;
          }

          .library-card h3 {
            margin-top: 6px;
            font-size: 8px;
            line-height: 1.15;
            letter-spacing: .04em;
          }
        }
      `}</style>
    </section>
  );
}
