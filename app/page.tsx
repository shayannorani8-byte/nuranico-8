'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import './home.css';

type Lang = 'en' | 'fa';

type Settings = {
  bg_color?: string;
  text_color?: string;
  button_color?: string;
  surface_color?: string;
  muted_color?: string;
  heading_color?: string;
  logo_color?: string;
  link_color?: string;
  nav_bg?: string;
  nav_text?: string;
  nav_active?: string;
  button_text?: string;
  button_hover?: string;
  card_bg?: string;
  card_text?: string;
  tag_color?: string;
  footer_bg?: string;
  footer_text?: string;
  border_color?: string;
  logo_url?: string;
  font_en?: string;
  font_fa?: string;
  heading_size?: number;
  body_size?: number;
  small_size?: number;
  heading_weight?: number;
  body_weight?: number;
  letter_spacing?: number;
};

type FontAsset = {
  id: number;
  family_name: string;
  file_url: string;
  format: string;
  font_weight?: number | null;
  font_style?: string | null;
};

type Content = {
  hero_title_fa?: string;
  hero_title_en?: string;
  hero_description_fa?: string;
  hero_description_en?: string;
  hero_button_fa?: string;
  hero_button_en?: string;
  about_title_fa?: string;
  about_title_en?: string;
  about_text_fa?: string;
  about_text_en?: string;
  about_image_url?: string | null;
  contact_title_fa?: string;
  contact_title_en?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_instagram?: string;
};

type PortfolioItem = {
  id: number;
  title_fa: string;
  title_en?: string;
  description_fa?: string;
  description_en?: string;
  category: string;
  cover_url?: string;
  media_url?: string;
  media_type?: string;
  preview_url?: string | null;
  preview_type?: string | null;
  preview_enabled?: boolean | null;
  featured?: boolean;
  brand_id?: number | null;
  bts_media_url?: string | null;
  bts_media_type?: string | null;
  bts_gallery_urls?: string[] | null;
};

type Brand = {
  id: number;
  name: string;
  logo_url?: string;
  website_url?: string;
};

type Service = {
  id: number;
  title_en: string;
  title_fa?: string | null;
  description_en?: string | null;
  description_fa?: string | null;
  published?: boolean;
  sort_order?: number;
};

function isVideo(item: PortfolioItem) {
  const type = (item.media_type || '').toLowerCase();
  const url = `${item.media_url || ''} ${item.cover_url || ''}`.toLowerCase();

  return (
    type.includes('video') ||
    /\.(mp4|webm|mov|m4v)(\?|$)/.test(url)
  );
}

function hasVideoPreview(item: PortfolioItem) {
  if (!item.preview_enabled || !item.preview_url) return false;

  const type = (item.preview_type || '').toLowerCase();
  const url = item.preview_url.toLowerCase();

  return (
    type.includes('video') ||
    /\.(mp4|webm|mov|m4v)(\?|$)/.test(url)
  );
}

function PreviewVideo({
  src,
  className = '',
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const keepShort = () => {
      if (video.currentTime >= 6) {
        video.currentTime = 0;
        void video.play().catch(() => undefined);
      }
    };

    video.addEventListener('timeupdate', keepShort);

    return () => video.removeEventListener('timeupdate', keepShort);
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('en');
  const [langReady, setLangReady] = useState(false);
  const [settings, setSettings] = useState<Settings>({});
  const [fonts, setFonts] = useState<FontAsset[]>([]);
  const [content, setContent] = useState<Content>({});
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filter, setFilter] = useState('all');
  const [heroIndex, setHeroIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem('nuranico-lang');
    const initialLang: Lang = saved === 'fa' ? 'fa' : 'en';

    setLang(initialLang);
    document.documentElement.lang = initialLang;
    document.documentElement.dir = initialLang === 'fa' ? 'rtl' : 'ltr';
    setLangReady(true);
  }, []);

  useEffect(() => {
    if (!langReady) return;

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    window.localStorage.setItem('nuranico-lang', lang);
  }, [lang, langReady]);

  useEffect(() => {
    loadSite();
  }, []);

  useEffect(() => {
    const root = document.querySelector('.site');
    if (!root) return;

    const applyLanguageToLatinText = () => {
      root.querySelectorAll<HTMLElement>('*').forEach((el) => {
        if (
          el.tagName === 'SCRIPT' ||
          el.tagName === 'STYLE' ||
          el.tagName === 'NOSCRIPT'
        ) return;

        const directText = Array.from(el.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent || '')
          .join(' ')
          .trim();

        if (!directText) return;

        const hasLatin = /[A-Za-z]/.test(directText);
        const hasPersian = /[\u0600-\u06FF]/.test(directText);

        if (hasLatin && !hasPersian) {
          el.setAttribute('lang', 'en');
        } else if (hasPersian) {
          el.removeAttribute('lang');
        }
      });
    };

    applyLanguageToLatinText();

    const observer = new MutationObserver(applyLanguageToLatinText);

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [lang, content, portfolio, brands]);

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal')
    );

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [loading]);

  const heroSlides = useMemo(() => {
    const featured = portfolio.filter((item) => item.featured);
    const source = featured.length ? featured : portfolio;

    return source.slice(0, 3);
  }, [portfolio]);

  useEffect(() => {
    if (!heroSlides.length) return;

    const timer = window.setInterval(
      () =>
        setHeroIndex(
          (current) => (current + 1) % heroSlides.length
        ),
      6500
    );

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  async function loadSite() {
    setLoading(true);

    const { supabase } = await import('../lib/supabase');

    const [
      settingsResult,
      contentResult,
      portfolioResult,
      brandsResult,
      servicesResult,
      fontsResult,
    ] = await Promise.all([
      supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle(),

      supabase
        .from('site_content')
        .select('*')
        .limit(1)
        .maybeSingle(),

      supabase
        .from('portfolio')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }),

      supabase
        .from('brands')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }),

      supabase
        .from('services')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }),

      supabase
        .from('font_assets')
        .select('id,family_name,file_url,format,font_weight,font_style')
        .order('created_at', { ascending: false }),
    ]);

    if (settingsResult.data) {
      setSettings(settingsResult.data);
    }

    if (contentResult.data) {
      setContent(contentResult.data);
    }

    if (portfolioResult.data) {
      setPortfolio(portfolioResult.data);
    }

    if (brandsResult.data) {
      setBrands(brandsResult.data);
    }

    if (servicesResult.data) {
      setServices(servicesResult.data);
    }

    if (fontsResult.data) {
      setFonts(fontsResult.data);
    }

    setLoading(false);
  }

  const shown = useMemo(() => {
    if (filter === 'all') return portfolio;

    if (filter === 'bts') {
      return portfolio.filter(
        (item) =>
          !!item.bts_media_url ||
          !!item.bts_gallery_urls?.length
      );
    }

    return portfolio.filter(
      (item) => item.category === filter
    );
  }, [portfolio, filter]);

  const displayItems = shown;

  const currentHero = heroSlides[heroIndex];

  const heroImage =
    currentHero?.cover_url || '';

  const cssVars = {
    '--site-bg': settings.bg_color || '#171716',
    '--site-text': settings.text_color || '#f4f2ed',
    '--site-surface':
      settings.surface_color || '#222220',
    '--site-muted':
      settings.muted_color || '#98958e',
    '--site-line':
      settings.border_color || 'rgba(255,255,255,.13)',
    '--site-accent':
      settings.button_color || '#e9e6df',

    '--heading-size':
      `${settings.heading_size || 48}px`,

    '--body-size':
      `${settings.body_size || 16}px`,

    '--small-size':
      `${settings.small_size || 11}px`,

    '--heading-weight':
      settings.heading_weight || 500,

    '--body-weight':
      settings.body_weight || 400,

    '--site-letter-spacing':
      `${settings.letter_spacing ?? 0}px`,
  } as React.CSSProperties;

  const t = {
    navWork: lang === 'fa' ? 'نمونه‌کارها' : 'Work',
    navServices: lang === 'fa' ? 'خدمات' : 'Services',
    navAbout: lang === 'fa' ? 'درباره' : 'About',
    navClients: lang === 'fa' ? 'مشتریان' : 'Clients',
    navContact: lang === 'fa' ? 'تماس' : 'Contact',

    cta:
      lang === 'fa'
        ? 'شروع یک پروژه'
        : 'Start a project',

    servicesTitle:
      lang === 'fa'
        ? 'از ایده تا فریم نهایی.'
        : 'From idea to final frame.',

    workTitle:
      lang === 'fa'
        ? 'منتخب پروژه‌ها.'
        : 'Selected work.',

    aboutFallback:
      lang === 'fa'
        ? 'NURANICO یک استودیوی خلاق برای ساخت تصویر، ویدیو و محتوای تبلیغاتی است؛ از ایده و کارگردانی تا تولید و فریم نهایی.'
        : 'NURANICO is a creative studio for image, film and campaign content — from concept and direction to production and the final frame.',

    brandsTitle:
      lang === 'fa'
        ? 'برندهایی که با ما دیده شدند.'
        : 'Brands we have brought into focus.',

    contactFallback:
      lang === 'fa'
        ? 'بیایید چیزی بسازیم.'
        : 'Let’s create something.',

    contactSub:
      lang === 'fa'
        ? 'پروژه بعدی‌تان را برای ما بفرستید.'
        : 'Tell us about the next project.',
  };

  const categories = [
    {
      key: 'all',
      label: lang === 'fa' ? 'همه' : 'All',
    },
    {
      key: 'video',
      label: lang === 'fa' ? 'ویدیو' : 'Film',
    },
    {
      key: 'photo',
      label: lang === 'fa' ? 'عکس' : 'Photography',
    },
    {
      key: 'content',
      label: lang === 'fa' ? 'محتوا' : 'Content',
    },
    {
      key: 'advertising',
      label: lang === 'fa' ? 'تبلیغات' : 'Advertising',
    },
    {
      key: 'bts',
      label:
        lang === 'fa'
          ? 'پشت صحنه'
          : 'Behind the Scenes',
    },
  ];

  return (
    <>


    <main
      className="site"
      lang={lang}
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
      style={{
        ...cssVars,

        ['--heading-weight' as string]:
          String(settings.heading_weight || 500),

        ['--body-weight' as string]:
          String(settings.body_weight || 400),

        ['--body-size' as string]:
          `${settings.body_size || 16}px`,

        ['--small-size' as string]:
          `${settings.small_size || 11}px`,

        ['--letter-spacing' as string]:
          `${settings.letter_spacing || 0}px`,
      }}>
      <header
        className={`site-nav ${
          menuOpen ? 'is-open' : ''
        }`}
      >
        <Link
          className="brand"
          href="#top"
          aria-label="NURANICO"
        >
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt="NURANICO"
            />
          ) : (
            <span>
              <span className="latin" lang="en">NURANICO</span>
              <span className="brand-mark latin" lang="en">®</span>
            </span>
          )}
        </Link>

        <nav
          className="desktop-nav"
          aria-label="Main navigation"
        >
          <a href="#work">{t.navWork}</a>
          <a href="#services">{t.navServices}</a>
          <a href="#about">{t.navAbout}</a>
          <a href="#brands">{t.navClients}</a>
          <a href="#contact">{t.navContact}</a>
        </nav>

        <div className="nav-actions">
          <button
            className="lang-switch"
            type="button"
            onClick={() =>
              setLang(lang === 'en' ? 'fa' : 'en')
            }
            aria-label="Change language"
          >
            {lang === 'en' ? 'FA' : 'EN'}
          </button>

          <a
            className="nav-cta"
            href={`mailto:${
              content.contact_email ||
              'hello@nuranico.com'
            }`}
          >
            {t.cta}
          </a>

          <button
            className="menu-button"
            type="button"
            onClick={() =>
              setMenuOpen((open) => !open)
            }
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
          </button>
        </div>

        <div className="mobile-menu">
          <a
            href="#work"
            onClick={() => setMenuOpen(false)}
          >
            {t.navWork}
          </a>

          <a
            href="#services"
            onClick={() => setMenuOpen(false)}
          >
            {t.navServices}
          </a>

          <a
            href="#about"
            onClick={() => setMenuOpen(false)}
          >
            {t.navAbout}
          </a>

          <a
            href="#brands"
            onClick={() => setMenuOpen(false)}
          >
            {t.navClients}
          </a>

          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
          >
            {t.navContact}
          </a>
        </div>
      </header>

      <div id="top" />

      <section className="hero">
        <div className="hero-media">
          {heroSlides.length ? (
            heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`hero-slide ${
                  index === heroIndex
                    ? 'active'
                    : ''
                }`}
                style={{
                  backgroundImage: slide.cover_url
                    ? `url(${slide.cover_url})`
                    : 'none',
                }}
              >
                {hasVideoPreview(slide) &&
                slide.preview_url ? (
                  <PreviewVideo
                    src={slide.preview_url}
                    className="hero-video"
                  />
                ) : null}
              </div>
            ))
          ) : (
            <div
              className="hero-slide active"
              style={{
                backgroundImage: heroImage
                  ? `url(${heroImage})`
                  : 'none',
              }}
            >
            </div>
          )}

          <div className="hero-vignette" />
          <div className="hero-fade" />
        </div>

        <div className="hero-content reveal">
          <p className="eyebrow">
            NURANICO / CREATIVE STUDIO
          </p>

          <h1>
            {lang === 'fa'
              ? content.hero_title_fa ||
                'تصویر می‌سازیم، اثر می‌گذاریم.'
              : content.hero_title_en ||
                'We create images that leave an impact.'}
          </h1>

          <p className="hero-copy">
            {lang === 'fa'
              ? content.hero_description_fa ||
                'استودیو خلاق NURANICO برای برندهایی که می‌خواهند متفاوت دیده شوند.'
              : content.hero_description_en ||
                'A creative studio for brands that want to be seen differently.'}
          </p>

          <a
            className="primary-button"
            href="#work"
          >
            <span>
              {lang === 'fa'
                ? content.hero_button_fa ||
                  'دیدن پروژه‌ها'
                : content.hero_button_en ||
                  'Explore work'}
            </span>
            <b>↗</b>
          </a>
        </div>

        <div className="hero-meta">
          <span className="latin" lang="en">SCROLL TO EXPLORE</span>

          <div className="hero-dots">
            {(heroSlides.length
              ? heroSlides
              : [{ id: 0 } as PortfolioItem]
            ).map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={
                  index === heroIndex
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setHeroIndex(index)
                }
                aria-label={`Slide ${
                  index + 1
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="services"
        className="section services reveal"
      >
        <div className="section-head">
          <div>
            <p className="eyebrow">
              01 / SERVICES
            </p>

            <h2>{t.servicesTitle}</h2>
          </div>

          <span className="section-index">
            01—03
          </span>
        </div>

        <div className="service-grid">
          {(services.length
            ? services.slice(0, 3)
            : [
                {
                  id: 1,
                  title_en: 'Film & Teasers',
                  title_fa: 'ساخت تیزر',
                  description_en:
                    'Cinematic stories for products, brands and campaigns.',
                  description_fa:
                    'روایت‌های سینمایی برای معرفی محصول، برند و کمپین.',
                  sort_order: 0,
                },
                {
                  id: 2,
                  title_en: 'Photography',
                  title_fa: 'عکاسی',
                  description_en:
                    'Precise imagery for campaigns, products and visual identity.',
                  description_fa:
                    'تصاویر دقیق و ماندگار برای هویت بصری و تبلیغات.',
                  sort_order: 1,
                },
                {
                  id: 3,
                  title_en: 'Content',
                  title_fa: 'تولید محتوا',
                  description_en:
                    'Social-first content with a consistent visual language.',
                  description_fa:
                    'محتوای متحرک و اجتماعی با زبان بصری یکپارچه.',
                  sort_order: 2,
                },
              ]
          ).map((service, index) => {
            const number = String(index + 1).padStart(2, '0');

            const href =
              index === 0
                ? '/services/film-teasers'
                : index === 1
                  ? '/services/photography'
                  : '/services/content';

            const title =
              lang === 'fa'
                ? service.title_fa || service.title_en
                : service.title_en || service.title_fa || '';

            const description =
              lang === 'fa'
                ? service.description_fa || service.description_en
                : service.description_en || service.description_fa || '';

            return (
              <a
                href={href}
                className="service-card"
                key={service.id}
                style={{
                  display: 'grid',
                  color: 'inherit',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>{number}</span>

                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>

                <b>↗</b>
              </a>
            );
          })}
        </div>
      </section>

      <section
        id="work"
        className="section work reveal"
      >
        <div className="section-head">
          <div>
            <p className="eyebrow">
              02 / SELECTED WORK
            </p>

            <h2>{t.workTitle}</h2>
          </div>

          <span className="section-index">
            {String(
              shown.length || 6
            ).padStart(2, '0')}{' '}
            WORKS
          </span>
        </div>

        <div
          className="filter-row"
          role="tablist"
        >
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              className={
                filter === category.key
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setFilter(category.key)
              }
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-line">
            Loading projects…
          </div>
        ) : filter === 'bts' &&
          !shown.length ? (
          <div className="loading-line">
            {lang === 'fa'
              ? 'هنوز پشت صحنه‌ای اضافه نشده.'
              : 'No Behind the Scenes has been added yet.'}
          </div>
        ) : (
          <div className="portfolio-grid">
            {displayItems.map(
              (item, index) => {
                const href = `/work/${item.id}`;

                const title =
                  lang === 'fa'
                    ? item.title_fa
                    : item.title_en ||
                      item.title_fa;

                const description =
                  lang === 'fa'
                    ? item.description_fa
                    : item.description_en ||
                      item.description_fa;

                return (
                  <Link
                    className={`project-card card-${
                      index % 3
                    }`}
                    href={href}
                    key={item.id}
                  >
                    <div className="project-media">
                      {item.cover_url ? (
                        <img
                          src={item.cover_url}
                          alt={title}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="project-media-empty"
                          aria-label={title}
                        />
                      )}

                      {hasVideoPreview(item) &&
                      item.preview_url ? (
                        <PreviewVideo
                          src={item.preview_url}
                          className="project-preview"
                        />
                      ) : null}

                      <div className="project-overlay">
                        <span>
                          {lang === 'fa'
                            ? 'مشاهده پروژه'
                            : 'VIEW PROJECT'}
                        </span>
                        <b>↗</b>
                      </div>
                    </div>

                    <div className="project-meta">
                      <div>
                        <p>
                          {item.category ===
                          'video'
                            ? 'FILM'
                            : item.category ===
                              'photo'
                            ? 'PHOTO'
                            : item.category ===
                              'advertising'
                            ? 'ADVERTISING'
                            : item.category ===
                              'bts'
                            ? 'BEHIND THE SCENES'
                            : 'CONTENT'}
                        </p>

                        <h3>{title}</h3>

                        {description ? (
                          <span>
                            {description}
                          </span>
                        ) : null}
                      </div>

                      <strong>
                        {String(index + 1).padStart(
                          2,
                          '0'
                        )}
                      </strong>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        )}
      </section>

      <section
        id="about"
        className="section about reveal"
      >
        <div className="about-image">
          {content.about_image_url ? (
            <img
              src={content.about_image_url}
              alt="NURANICO creative direction"
              loading="lazy"
            />
          ) : (
            <div className="about-image-empty" />
          )}

          <span>N / 2026</span>
        </div>

        <div className="about-copy">
          <p className="eyebrow">
            03 / ABOUT
          </p>

          <h2>
            {lang === 'fa'
              ? content.about_title_fa ||
                'تصویر، وقتی ماندگار می‌شود که داستان داشته باشد.'
              : content.about_title_en ||
                'Images become memorable when they carry a story.'}
          </h2>

          <p>
            {lang === 'fa'
              ? content.about_text_fa ||
                t.aboutFallback
              : content.about_text_en ||
                t.aboutFallback}
          </p>

          <div className="about-stats">
            <div>
              <strong>01</strong>
              <span>
                {lang === 'fa'
                  ? 'ایده تا اجرا'
                  : 'Concept to frame'}
              </span>
            </div>

            <div>
              <strong>∞</strong>
              <span>
                {lang === 'fa'
                  ? 'قاب‌های تازه'
                  : 'Fresh frames'}
              </span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>
                {lang === 'fa'
                  ? 'برای پروژه'
                  : 'For the project'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="brands"
        className="section brands reveal"
      >
        <div className="section-head">
          <div>
            <p className="eyebrow">
              04 / CLIENTS
            </p>

            <h2>{t.brandsTitle}</h2>
          </div>
        </div>

        <div className="brand-grid">
          {(brands.length
            ? brands
            : [1, 2, 3, 4, 5, 6]
          ).map((brand) => {
            if (typeof brand === 'number') {
              return (
                <Link
                  className="brand-card placeholder"
                  key={brand}
                  href={`/clients/${brand}`}
                >
                  CLIENT /{' '}
                  {String(brand).padStart(
                    2,
                    '0'
                  )}
                </Link>
              );
            }

            return (
              <Link
                className="brand-card"
                key={brand.id}
                href={`/clients/${brand.id}`}
              >
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                  />
                ) : (
                  brand.name
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="statement reveal">
        <p className="eyebrow">
          05 / THE APPROACH
        </p>

        <h2>
          Less noise.
          <br />
          <em>More impact.</em>
        </h2>

        <p>
          {lang === 'fa'
            ? 'حرکت، نور، قاب و جزئیات؛ همه برای یک چیز: دیده‌شدن و ماندن.'
            : 'Movement, light, framing and detail — all in service of one thing: making brands seen and remembered.'}
        </p>
      </section>

      <section className="landscape reveal">
        {content.about_image_url ? (
          <img
            src={content.about_image_url}
            alt="NURANICO cinematic landscape"
            loading="lazy"
          />
        ) : null}

        <div className="landscape-copy">
          <span className="latin" lang="en">NURANICO / 05</span>

          <strong>
            KEEP
            <br />
            LOOKING.
          </strong>
        </div>
      </section>

      <section
        id="contact"
        className="section contact reveal"
      >
        <div>
          <p className="eyebrow">
            06 / LET’S TALK
          </p>

          <h2>
            {lang === 'fa'
              ? content.contact_title_fa ||
                t.contactFallback
              : content.contact_title_en ||
                t.contactFallback}
          </h2>

          <p>{t.contactSub}</p>

          <a
            className="primary-button"
            href={`mailto:${
              content.contact_email ||
              'hello@nuranico.com'
            }`}
          >
            <span>{t.cta}</span>
            <b>↗</b>
          </a>
        </div>

        <div className="contact-mark">
          N
        </div>
      </section>

      <footer className="footer">
        <div>
          <a
            className="brand"
            href="#top"
          >
            <span className="latin" lang="en">NURANICO</span>
            <span className="brand-mark latin" lang="en">
              ®
            </span>
          </a>

          <p>
            Creative studio for brands that
            want to be seen differently.
          </p>
        </div>

        <div>
          <span>CONTACT</span>

          <a
            href={`mailto:${
              content.contact_email ||
              'hello@nuranico.com'
            }`}
          >
            {content.contact_email ||
              'hello@nuranico.com'}
          </a>

          {content.contact_instagram ? (
            <a
              href={content.contact_instagram}
              target="_blank"
              rel="noreferrer"
            >
              Instagram ↗
            </a>
          ) : null}
        </div>

        <div>
          <span>NAVIGATION</span>

          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </main>
    </>
  );
}