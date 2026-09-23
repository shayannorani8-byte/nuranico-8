'use client';
import SiteHeader from '../../../components/SiteHeader';


import { useEffect, useState } from 'react';
import Link from 'next/link';
import ServiceProjectShowcase from '../../../components/ServiceProjectShowcase';
import { usePageTexts } from '../../../lib/usePageTexts';

type BtsItem = {
  id: number;
  media_asset_id: number;
  name: string;
  file_url: string;
  file_type?: string | null;
  mime_type?: string | null;
  alt_text_en?: string | null;
  alt_text_fa?: string | null;
  sort_order?: number;
  kind: 'photo' | 'video';
};

export default function FilmTeasersPage() {
  const { text } = usePageTexts('film');
  const [btsItems, setBtsItems] = useState<BtsItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadBts() {
      try {
        const response = await fetch('/api/public/bts', {
          cache: 'no-store',
        });

        const result = await response.json();

        console.log('FILM BTS API RESULT:', result);

        if (!response.ok) {
          throw new Error(result?.error || 'Could not load BTS');
        }

        if (!cancelled) {
          setBtsItems(result.items || []);
        }
      } catch (error) {
        console.error('Could not load Film BTS:', error);

        if (!cancelled) {
          setBtsItems([]);
        }
      }
    }

    loadBts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="service-page">
      <SiteHeader />

      <ServiceProjectShowcase
        destination="film"
        eyebrow={text(
          'projects_eyebrow',
          'SELECTED FILM WORK',
          'پروژه‌های منتخب فیلم'
        )}
        title={text(
          'projects_title',
          'Film projects.',
          'پروژه‌های فیلم.'
        )}
      />

      <section className="film-bts">
          <div className="film-bts-head">
            <div>
              <span>
                {text(
                  'bts_eyebrow',
                  'BEHIND THE SCENES',
                  'پشت صحنه'
                )}
              </span>
              <h2>
                {text(
                  'bts_title',
                  'Behind the scenes.',
                  'پشت صحنه.'
                )}
              </h2>
            </div>

            <Link href="/work/behind-the-scenes">
              {text(
                'view_all',
                'VIEW ALL ↗',
                'مشاهده همه ↗'
              )}
            </Link>
          </div>

          <div className="film-bts-grid">
            {btsItems.length === 0 && (
              <div className="film-bts-empty">
                {text(
                  'empty_bts',
                  'No behind the scenes media yet.',
                  'هنوز محتوای پشت صحنه‌ای وجود ندارد.'
                )}
              </div>
            )}

            {btsItems.slice(0, 4).map((item, index) => {
              const isVideo = item.kind === 'video';

              return (
                <Link
                  href="/work/behind-the-scenes"
                  className="film-bts-card"
                  key={item.id}
                >
                  <div className="film-bts-media">
                    {isVideo ? (
                      <video
                        src={item.file_url}
                        muted
                        playsInline
                        preload="metadata"
                        onMouseEnter={e => {
                          e.currentTarget.play().catch(() => {});
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                    ) : (
                      <img
                        src={item.file_url}
                        alt={
                          item.alt_text_en ||
                          item.alt_text_fa ||
                          item.name ||
                          text(
                            'bts_item_fallback',
                            'Behind the scenes',
                            'پشت صحنه'
                          )
                        }
                        loading="lazy"
                      />
                    )}

                    {isVideo && (
                      <span className="film-bts-play">▶</span>
                    )}
                  </div>

                  <div className="film-bts-meta">
                    <div>
                      <span>
                        BTS / {String(index + 1).padStart(2, '0')}
                      </span>

                      <h3>
                        {item.name ||
                          text(
                            'bts_item_fallback',
                            'Behind the scenes',
                            'پشت صحنه'
                          )}
                      </h3>
                    </div>

                    <span className="film-bts-arrow">↗</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
<style jsx>{`
        .service-page {
          min-height: 100vh;
          background: #151515;
          color: #f2f2f2;
          overflow: hidden;
        }

        .service-hero {
          min-height: 78vh;
          padding: 170px 6vw 100px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .service-hero > span {
          font-size: 9px;
          letter-spacing: .2em;
          color: #777;
          margin-bottom: 40px;
        }

        .service-hero h1 {
          margin: 0;
          font-size: clamp(75px, 15vw, 220px);
          line-height: .8;
          font-weight: 300;
          letter-spacing: -.08em;
        }

        .service-hero p {
          max-width: 470px;
          margin: 55px 0 0;
          color: #999;
          font-size: 15px;
          line-height: 1.8;
        }

        .service-content {
          padding: 100px 6vw 160px;
        }

        .service-line {
          border-top: 1px solid #333;
          padding: 15px 0 50px;
          display: flex;
          justify-content: space-between;
          color: #666;
          font-size: 9px;
          letter-spacing: .18em;
        }

        .service-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10vw;
        }

        .service-grid h2 {
          margin: 0;
          font-size: clamp(50px, 7vw, 105px);
          line-height: .88;
          font-weight: 300;
          letter-spacing: -.06em;
        }

        .service-grid p {
          max-width: 520px;
          color: #aaa;
          font-size: 16px;
          line-height: 1.9;
          margin: 0 0 70px;
        }

        .service-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-top: 1px solid #333;
        }

        .service-meta div {
          padding: 22px 0;
          border-bottom: 1px solid #333;
        }

        .service-meta span {
          display: block;
          color: #666;
          font-size: 8px;
          letter-spacing: .2em;
          margin-bottom: 10px;
        }

        .service-meta strong {
          font-size: 11px;
          font-weight: 400;
        }

        .film-bts {
          padding: 120px 6vw 150px;
          border-top: 1px solid #2d2d2d;
        }

        .film-bts-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 40px;
          margin-bottom: 70px;
        }

        .film-bts-head > div > span {
          display: block;
          color: #666;
          font-size: 9px;
          letter-spacing: .2em;
          margin-bottom: 25px;
        }

        .film-bts-head h2 {
          margin: 0;
          font-size: clamp(55px, 8vw, 120px);
          line-height: .82;
          font-weight: 300;
          letter-spacing: -.065em;
        }

        .film-bts-head > a {
          color: #999;
          text-decoration: none;
          font-size: 9px;
          letter-spacing: .18em;
          border-bottom: 1px solid #444;
          padding-bottom: 10px;
          white-space: nowrap;
        }

        .film-bts-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 70px 24px;
        }

        .film-bts-card {
          color: inherit;
          text-decoration: none;
          min-width: 0;
        }

        .film-bts-media {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: #1c1c1c;
        }

        .film-bts-media img,
        .film-bts-media video {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform .7s cubic-bezier(.2,.7,.2,1);
        }

        .film-bts-card:hover .film-bts-media img,
        .film-bts-card:hover .film-bts-media video {
          transform: scale(1.025);
        }

        .film-bts-placeholder {
          width: 100%;
          height: 100%;
          background: #1c1c1c;
        }

        .film-bts-play {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.45);
          border-radius: 50%;
          color: #fff;
          font-size: 11px;
          padding-left: 2px;
          background: rgba(0,0,0,.12);
          backdrop-filter: blur(5px);
        }

        .film-bts-meta {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding-top: 17px;
          border-top: 1px solid #333;
          margin-top: 14px;
        }

        .film-bts-meta span {
          display: block;
          color: #666;
          font-size: 8px;
          letter-spacing: .18em;
        }

        .film-bts-meta h3 {
          margin: 10px 0 0;
          font-size: 18px;
          line-height: 1.2;
          font-weight: 400;
          letter-spacing: -.02em;
        }

        .film-bts-meta .film-bts-arrow {
          color: #aaa;
          font-size: 13px;
          letter-spacing: 0;
        }

        .service-bottom {
          min-height: 70vh;
          padding: 100px 6vw;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #191919;
        }

        .service-bottom small {
          color: #666;
          font-size: 9px;
          letter-spacing: .2em;
        }

        .service-bottom h2 {
          margin: 100px 0;
          font-size: clamp(75px, 15vw, 220px);
          line-height: .78;
          font-weight: 300;
          letter-spacing: -.08em;
        }

        .service-bottom a {
          width: max-content;
          color: #fff;
          text-decoration: none;
          border-bottom: 1px solid #555;
          padding-bottom: 12px;
          font-size: 9px;
          letter-spacing: .18em;
        }

        @media(max-width:800px) {
          .service-hero {
            padding: 140px 20px 80px;
          }

          .service-content {
            padding: 80px 20px 110px;
          }

          .service-grid {
            grid-template-columns: 1fr;
            gap: 60px;
          }

          .film-bts {
            padding: 75px 20px 90px;
          }

          .film-bts-head {
            align-items: flex-end;
            gap: 20px;
            margin-bottom: 38px;
          }

          .film-bts-head > div > span {
            font-size: 7px;
            margin-bottom: 16px;
          }

          .film-bts-head h2 {
            font-size: clamp(31px, 9vw, 40px);
            line-height: .9;
            letter-spacing: -.05em;
          }

          .film-bts-head > a {
            font-size: 7px;
            padding-bottom: 7px;
          }

          .film-bts-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }

          .film-bts-media {
            aspect-ratio: 4 / 3;
          }

          .film-bts-play {
            width: 42px;
            height: 42px;
            font-size: 9px;
          }

          .film-bts-meta {
            margin-top: 10px;
            padding-top: 13px;
          }

          .film-bts-meta span {
            font-size: 7px;
          }

          .film-bts-meta h3 {
            margin-top: 8px;
            font-size: 14px;
          }

          .service-bottom {
            min-height: auto;
            padding: 72px 20px;
          }

          /* MOBILE TYPOGRAPHY */
          .service-hero h1 {
            max-width: 340px;
            font-size: clamp(34px, 9.5vw, 40px);
            line-height: .94;
            letter-spacing: -.045em;
          }

          .service-grid h2 {
            max-width: 340px;
            font-size: clamp(27px, 7.5vw, 33px);
            line-height: .98;
            letter-spacing: -.04em;
          }

          .service-grid p {
            font-size: 12px;
            line-height: 1.8;
            margin-bottom: 45px;
          }

          .service-bottom h2 {
            max-width: 340px;
            margin: 65px 0;
            font-size: clamp(31px, 8.5vw, 38px);
            line-height: .9;
            letter-spacing: -.045em;
          }

          .service-bottom small {
            font-size: 7px;
            letter-spacing: .16em;
          }
        }


        /* FINAL COMPACT BTS LIBRARY */
        .film-bts {
          padding: 68px 4vw 78px !important;
          border-top: 1px solid #292929 !important;
        }

        .film-bts-head {
          margin-bottom: 26px !important;
          align-items: flex-end !important;
        }

        .film-bts-head > div > span {
          margin-bottom: 9px !important;
          color: #737373 !important;
          font-size: 7px !important;
          line-height: 1 !important;
          letter-spacing: .19em !important;
        }

        .film-bts-head h2 {
          font-size: clamp(26px, 2.7vw, 40px) !important;
          line-height: .94 !important;
          font-weight: 400 !important;
          letter-spacing: -.04em !important;
        }

        .film-bts-head > a,
        .film-bts-head > a:visited,
        .film-bts-head > a:hover,
        .film-bts-head > a:active {
          color: #b7b7b7 !important;
          text-decoration: none !important;
          font-size: 7px !important;
          line-height: 1 !important;
          font-weight: 400 !important;
          letter-spacing: .16em !important;
          padding-bottom: 5px !important;
          border-bottom: 1px solid #414141 !important;
        }

        .film-bts-grid {
          display: grid !important;
          grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          gap: 22px 9px !important;
        }

        .film-bts-card,
        .film-bts-card:visited,
        .film-bts-card:hover,
        .film-bts-card:active {
          color: #fff !important;
          text-decoration: none !important;
        }

        .film-bts-media {
          width: 100% !important;
          aspect-ratio: 16 / 9 !important;
          overflow: hidden !important;
        }

        .film-bts-meta {
          display: block !important;
          margin-top: 0 !important;
          padding-top: 0 !important;
          border-top: 0 !important;
          text-align: center !important;
        }

        .film-bts-meta > div > span {
          display: none !important;
        }

        .film-bts-meta h3 {
          margin: 9px 2px 0 !important;
          color: #f1f1f1 !important;
          font-size: 11px !important;
          line-height: 1.2 !important;
          font-weight: 500 !important;
          letter-spacing: .055em !important;
          text-transform: uppercase !important;
          text-align: center !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        .film-bts-arrow,
        .film-bts-play {
          display: none !important;
        }

        @media (max-width: 700px) {
          .film-bts {
            padding: 44px 12px 52px !important;
          }

          .film-bts-head {
            margin-bottom: 18px !important;
            gap: 12px !important;
          }

          .film-bts-head > div > span {
            font-size: 5.5px !important;
            margin-bottom: 6px !important;
          }

          .film-bts-head h2 {
            font-size: 23px !important;
            line-height: .94 !important;
          }

          .film-bts-head > a,
          .film-bts-head > a:visited,
          .film-bts-head > a:hover,
          .film-bts-head > a:active {
            font-size: 5.5px !important;
            letter-spacing: .13em !important;
            padding-bottom: 4px !important;
          }

          .film-bts-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 14px 5px !important;
          }

          .film-bts-media {
            aspect-ratio: 16 / 9 !important;
          }

          .film-bts-meta h3 {
            margin-top: 6px !important;
            font-size: 8px !important;
            line-height: 1.15 !important;
            letter-spacing: .04em !important;
          }
        }



        /* SERVICE TOP SPACING OPTIMIZATION */
        .service-hero {
          min-height: auto !important;
          padding: 125px 6vw 72px !important;
        }

        .service-hero > span {
          margin-bottom: 22px !important;
        }

        .service-hero h1 {
          margin-bottom: 28px !important;
        }

        .service-hero p {
          margin-top: 0 !important;
          max-width: 520px !important;
          line-height: 1.7 !important;
        }

        .service-content {
          padding: 72px 6vw 95px !important;
        }

        .service-line {
          margin-bottom: 52px !important;
        }

        .service-grid {
          gap: 7vw !important;
        }

        @media (max-width: 700px) {
          .service-hero {
            min-height: auto !important;
            padding: 92px 20px 52px !important;
          }

          .service-hero > span {
            margin-bottom: 16px !important;
          }

          .service-hero h1 {
            margin-bottom: 20px !important;
          }

          .service-hero p {
            margin-top: 0 !important;
            max-width: 100% !important;
            line-height: 1.65 !important;
          }

          .service-content {
            padding: 50px 20px 62px !important;
          }

          .service-line {
            margin-bottom: 34px !important;
          }

          .service-grid {
            gap: 32px !important;
          }
        }

      `}</style>
    </main>
  );
}
