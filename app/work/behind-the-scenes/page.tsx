'use client';

import SiteHeader from '../../../components/SiteHeader';
import { useEffect, useRef, useState } from 'react';
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

export default function BehindTheScenesPage() {
  const { text } = usePageTexts('bts');
  const [items, setItems] = useState<BtsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeItem, setActiveItem] = useState<BtsItem | null>(null);

  const photoRailRef = useRef<HTMLDivElement>(null);
  const videoRailRef = useRef<HTMLDivElement>(null);

  const scrollBtsRail = (
    rail: HTMLDivElement | null,
    direction: 'left' | 'right'
  ) => {
    if (!rail) return;

    const card = rail.querySelector<HTMLElement>('.nur-bts-card');
    const gap = 10;

    const amount = card
      ? card.getBoundingClientRect().width + gap
      : rail.clientWidth * 0.75;

    rail.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    fetch('/api/public/bts', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || 'Could not load BTS');
        }

        setItems(data.items || []);
      })
      .catch((err) => {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load BTS'
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeItem) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveItem(null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeItem]);

  const photoItems = items.filter((item) => item.kind === 'photo');
  const videoItems = items.filter((item) => item.kind === 'video');

  const renderCard = (item: BtsItem) => {
    const isVideo = item.kind === 'video';

    return (
      <button
        type="button"
        key={`${item.kind}-${item.id}`}
        className="nur-bts-card"
        onClick={() => setActiveItem(item)}
        aria-label={`${text('open_media', 'Open', 'باز کردن')} ${item.name || text('media_name', 'behind the scenes media', 'رسانه پشت صحنه')}`}
      >
        <span className="nur-bts-media">
          {isVideo ? (
            <video
              src={item.file_url}
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={item.file_url}
              alt={
                item.alt_text_en ||
                item.alt_text_fa ||
                item.name ||
                text('media_alt', 'Behind the scenes', 'پشت صحنه')
              }
              loading="lazy"
            />
          )}

          {isVideo && (
            <span className="nur-bts-play" aria-hidden="true">
              ▶
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <main className="nur-bts-page">
      <SiteHeader />

      <section className="nur-bts-hero">
        <p>
          {text(
            'eyebrow',
            'BEHIND THE SCENES',
            'پشت صحنه'
          )}
        </p>

        <h1>
          {text(
            'hero_title',
            'Behind the scenes.',
            'پشت صحنه.'
          )}
        </h1>
      </section>

      {loading && (
        <div className="nur-bts-status">
          {text('loading', 'Loading...', 'در حال بارگذاری...')}
        </div>
      )}

      {!loading && error && (
        <div className="nur-bts-status">
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="nur-bts-sections">

          <section className="nur-bts-section">
            <header className="nur-bts-head">
              <span>01</span>
              <h2>{text('photo_title', 'PHOTO', 'عکس')}</h2>
              <span className="nur-bts-count">
                {String(photoItems.length).padStart(2, '0')}
              </span>
            </header>

            {photoItems.length ? (
              <div className="nur-bts-rail-wrap">

                <div
                  className="nur-bts-rail"
                  ref={photoRailRef}
                >
                  {photoItems.map(renderCard)}
                </div>

                <button
                  type="button"
                  className="nur-bts-gallery-arrow nur-bts-gallery-arrow-left"
                  aria-label={text('previous_photos', 'Previous photos', 'عکس‌های قبلی')}
                  onClick={() =>
                    scrollBtsRail(photoRailRef.current, 'left')
                  }
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="nur-bts-gallery-arrow nur-bts-gallery-arrow-right"
                  aria-label={text('next_photos', 'Next photos', 'عکس‌های بعدی')}
                  onClick={() =>
                    scrollBtsRail(photoRailRef.current, 'right')
                  }
                >
                  ›
                </button>

              </div>
            ) : (
              <div className="nur-bts-empty">
                {text(
                  'empty_photos',
                  'No photos yet.',
                  'هنوز عکسی وجود ندارد.'
                )}
              </div>
            )}
          </section>

          <section className="nur-bts-section">
            <header className="nur-bts-head">
              <span>02</span>
              <h2>{text('video_title', 'VIDEO', 'ویدیو')}</h2>
              <span className="nur-bts-count">
                {String(videoItems.length).padStart(2, '0')}
              </span>
            </header>

            {videoItems.length ? (
              <div className="nur-bts-rail-wrap">

                <div
                  className="nur-bts-rail"
                  ref={videoRailRef}
                >
                  {videoItems.map(renderCard)}
                </div>

                <button
                  type="button"
                  className="nur-bts-gallery-arrow nur-bts-gallery-arrow-left"
                  aria-label={text('previous_videos', 'Previous videos', 'ویدیوهای قبلی')}
                  onClick={() =>
                    scrollBtsRail(videoRailRef.current, 'left')
                  }
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="nur-bts-gallery-arrow nur-bts-gallery-arrow-right"
                  aria-label={text('next_videos', 'Next videos', 'ویدیوهای بعدی')}
                  onClick={() =>
                    scrollBtsRail(videoRailRef.current, 'right')
                  }
                >
                  ›
                </button>

              </div>
            ) : (
              <div className="nur-bts-empty">
                {text(
                  'empty_videos',
                  'No videos yet.',
                  'هنوز ویدیویی وجود ندارد.'
                )}
              </div>
            )}
          </section>

        </section>
      )}

      {activeItem && (
        <div
          className="nur-bts-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={text('viewer_label', 'Behind the scenes viewer', 'نمایشگر پشت صحنه')}
          onClick={() => setActiveItem(null)}
        >
          <button
            type="button"
            className="nur-bts-close"
            aria-label={text('close_viewer', 'Close viewer', 'بستن نمایشگر')}
            onClick={() => setActiveItem(null)}
          >
            ×
          </button>

          <div
            className="nur-bts-lightbox-inner"
            onClick={(event) => event.stopPropagation()}
          >
            {activeItem.kind === 'video' ? (
              <video
                src={activeItem.file_url}
                controls
                autoPlay
                playsInline
                className="nur-bts-lightbox-media"
              />
            ) : (
              <img
                src={activeItem.file_url}
                alt={
                  activeItem.alt_text_en ||
                  activeItem.alt_text_fa ||
                  activeItem.name ||
                  'Behind the scenes'
                }
                className="nur-bts-lightbox-media"
              />
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .nur-bts-page {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background: #171716;
          color: #f1efe9;
        }

        .nur-bts-hero {
          box-sizing: border-box;
          padding: 155px 5vw 65px;
        }

        .nur-bts-hero p {
          margin: 0 0 14px;
          font-size: 8px;
          line-height: 1;
          letter-spacing: .17em;
          opacity: .55;
        }

        .nur-bts-hero h1 {
          margin: 0;
          font-size: clamp(54px, 6.4vw, 104px);
          line-height: .87;
          font-weight: 500;
          letter-spacing: -.055em;
        }

        .nur-bts-status {
          box-sizing: border-box;
          padding: 30px 5vw 100px;
          font-size: 10px;
          letter-spacing: .1em;
          opacity: .55;
        }

        .nur-bts-sections {
          box-sizing: border-box;
          width: 100%;
          padding: 0 5vw 120px;
        }

        .nur-bts-section {
          width: 100%;
          min-width: 0;
          margin: 0 0 58px;
        }

        .nur-bts-section:last-child {
          margin-bottom: 0;
        }

        .nur-bts-head {
          box-sizing: border-box;
          width: 100%;
          min-height: 46px;

          display: grid;
          grid-template-columns: 42px 1fr auto;
          align-items: center;
          gap: 8px;

          margin: 0 0 14px;

          border-top: 1px solid rgba(255,255,255,.20);
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        .nur-bts-head span {
          font-size: 7px;
          line-height: 1;
          letter-spacing: .14em;
          opacity: .45;
        }

        .nur-bts-head h2 {
          margin: 0;
          font-size: 11px;
          line-height: 1;
          font-weight: 500;
          letter-spacing: .09em;
        }

        .nur-bts-head-end {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
          min-width: max-content;
        }

        .nur-bts-arrows {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .nur-bts-arrow {
          appearance: none;
          -webkit-appearance: none;

          width: 28px;
          height: 28px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0;
          margin: 0;

          border: 1px solid rgba(241,239,233,.28);
          border-radius: 50%;

          background: transparent;
          color: #f1efe9;

          font-family: Arial, sans-serif;
          font-size: 18px;
          font-weight: 300;
          line-height: 1;

          cursor: pointer;

          transition:
            background .2s ease,
            color .2s ease,
            border-color .2s ease,
            transform .2s ease;
        }

        .nur-bts-arrow:hover {
          background: #f1efe9;
          color: #171716;
          border-color: #f1efe9;
        }

        .nur-bts-arrow:active {
          transform: scale(.92);
        }

        .nur-bts-rail {
          --gap: 10px;

          box-sizing: border-box;
          display: flex;
          flex-flow: row nowrap;

          width: 100%;
          min-width: 0;

          gap: var(--gap);

          margin: 0;
          padding: 0 0 8px;

          overflow-x: auto;
          overflow-y: hidden;

          scroll-snap-type: x proximity;
          overscroll-behavior-x: contain;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .nur-bts-rail::-webkit-scrollbar {
          display: none;
        }

        .nur-bts-card {
          appearance: none;
          -webkit-appearance: none;

          box-sizing: border-box;
          display: block;

          flex: 0 0 calc((100% - 30px) / 4);
          width: calc((100% - 30px) / 4);
          min-width: calc((100% - 30px) / 4);
          max-width: calc((100% - 30px) / 4);

          padding: 0;
          margin: 0;

          border: 0;
          outline: 0;
          border-radius: 0;

          color: inherit;
          background: transparent;
          box-shadow: none;

          text-align: left;
          font: inherit;
          cursor: pointer;

          scroll-snap-align: start;
        }

        .nur-bts-media {
          box-sizing: border-box;
          position: relative;

          display: block;

          width: 100%;
          aspect-ratio: 4 / 5;

          overflow: hidden;

          background: #222;
          border: 0;
          border-radius: 0;
        }

        .nur-bts-media img,
        .nur-bts-media video {
          position: absolute;
          inset: 0;

          display: block;

          width: 100%;
          height: 100%;

          margin: 0;
          padding: 0;

          object-fit: cover;
          object-position: center;

          border: 0;
          border-radius: 0;

          transition: transform .45s ease;
        }

        .nur-bts-card:hover .nur-bts-media img,
        .nur-bts-card:hover .nur-bts-media video {
          transform: scale(1.018);
        }

        .nur-bts-play {
          position: absolute;
          z-index: 2;

          left: 50%;
          top: 50%;

          width: 36px;
          height: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          transform: translate(-50%, -50%);

          border: 1px solid rgba(255,255,255,.65);
          border-radius: 50%;

          background: rgba(0,0,0,.15);
          backdrop-filter: blur(4px);

          font-size: 8px;
          line-height: 1;
        }

        .nur-bts-empty {
          box-sizing: border-box;
          min-height: 110px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid rgba(255,255,255,.08);

          font-size: 8px;
          letter-spacing: .1em;
          opacity: .45;
        }

        .nur-bts-lightbox {
          position: fixed;
          z-index: 99999;
          inset: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          box-sizing: border-box;
          padding: 40px;

          background: rgba(8,8,8,.97);
        }

        .nur-bts-lightbox-inner {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;

          width: 100%;
          height: 100%;
        }

        .nur-bts-lightbox-media {
          display: block;

          width: auto;
          height: auto;

          max-width: 92vw;
          max-height: 88vh;

          object-fit: contain;
        }

        .nur-bts-close {
          appearance: none;

          position: absolute;
          z-index: 3;

          top: 24px;
          right: 24px;

          width: 44px;
          height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0;

          color: #f1efe9;
          background: transparent;

          border: 1px solid rgba(255,255,255,.25);
          border-radius: 50%;

          font-size: 25px;
          font-weight: 300;
          line-height: 1;

          cursor: pointer;
        }

        @media (max-width: 1000px) and (min-width: 701px) {
          .nur-bts-sections {
            padding-left: 20px;
            padding-right: 20px;
          }

          .nur-bts-card {
            flex-basis: calc((100% - 20px) / 3);
            width: calc((100% - 20px) / 3);
            min-width: calc((100% - 20px) / 3);
            max-width: calc((100% - 20px) / 3);
          }
        }

        @media (max-width: 700px) {
          .nur-bts-hero {
            padding: 145px 20px 42px;
          }

          .nur-bts-hero p {
            margin-bottom: 9px;
            font-size: 6px;
            letter-spacing: .16em;
          }

          .nur-bts-hero h1 {
            font-size: 34px;
            line-height: .9;
            letter-spacing: -.045em;
          }

          .nur-bts-status {
            padding: 22px 20px 70px;
          }

          .nur-bts-sections {
            width: 100%;
            padding: 22px 0 70px;
          }

          .nur-bts-section {
            margin-bottom: 34px;
          }

          .nur-bts-head {
            width: auto;
            min-height: 34px;

            grid-template-columns: 24px 1fr auto;
            gap: 6px;

            margin: 0 20px 10px;
          }

          .nur-bts-head span {
            font-size: 5.5px;
            letter-spacing: .12em;
          }

          .nur-bts-head h2 {
            font-size: 8px;
            letter-spacing: .08em;
          }

          .nur-bts-head-end {
            gap: 7px;
          }

          .nur-bts-arrows {
            gap: 3px;
          }

          .nur-bts-arrow {
            width: 22px;
            height: 22px;
            font-size: 14px;
          }

          .nur-bts-rail {
            --gap: 5px;

            width: 100%;

            gap: var(--gap);

            padding: 0 20px 5px;

            scroll-padding-left: 20px;
          }

          .nur-bts-card {
            flex: 0 0 calc(
              (100vw - 40px - 15px) / 3.5
            );

            width: calc(
              (100vw - 40px - 15px) / 3.5
            );

            min-width: calc(
              (100vw - 40px - 15px) / 3.5
            );

            max-width: calc(
              (100vw - 40px - 15px) / 3.5
            );
          }

          .nur-bts-media {
            aspect-ratio: 4 / 5;
          }

          .nur-bts-play {
            width: 25px;
            height: 25px;
            font-size: 6px;
          }

          .nur-bts-empty {
            margin: 0 20px;
            min-height: 80px;
          }

          .nur-bts-lightbox {
            padding: 12px;
          }

          .nur-bts-lightbox-media {
            max-width: 100%;
            max-height: 82vh;
          }

          .nur-bts-close {
            top: 15px;
            right: 15px;
            width: 38px;
            height: 38px;
            font-size: 23px;
          }
        }

        /* ==================================================
           FINAL BTS GALLERY NAVIGATION
           ================================================== */

        .nur-bts-count {
          justify-self: end;
        }

        .nur-bts-rail-wrap {
          position: relative;
          width: 100%;
          min-width: 0;
        }

        .nur-bts-gallery-arrow {
          appearance: none;
          -webkit-appearance: none;

          position: absolute;
          z-index: 50;
          top: 50%;

          width: 54px;
          height: 54px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0;
          margin: 0;

          border: 1px solid rgba(255,255,255,.48);
          border-radius: 999px;

          background: rgba(18,18,17,.70);
          color: #f1efe9;

          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);

          font-family: Arial, sans-serif;
          font-size: 36px;
          font-weight: 200;
          line-height: 1;

          cursor: pointer;

          transform: translateY(-50%);

          transition:
            background .2s ease,
            color .2s ease,
            border-color .2s ease,
            transform .2s ease;
        }

        .nur-bts-gallery-arrow-left {
          left: 16px;
        }

        .nur-bts-gallery-arrow-right {
          right: 16px;
        }

        .nur-bts-gallery-arrow:hover {
          background: #f1efe9;
          color: #171716;
          border-color: #f1efe9;
          transform: translateY(-50%) scale(1.06);
        }

        .nur-bts-gallery-arrow:active {
          transform: translateY(-50%) scale(.94);
        }

        @media (max-width: 700px) {

          .nur-bts-gallery-arrow {
            width: 44px;
            height: 44px;

            font-size: 30px;

            background: rgba(18,18,17,.72);
          }

          .nur-bts-gallery-arrow-left {
            left: 8px;
          }

          .nur-bts-gallery-arrow-right {
            right: 8px;
          }
        }

      `}</style>
    </main>
  );
}
