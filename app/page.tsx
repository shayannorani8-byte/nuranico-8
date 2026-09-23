'use client';
import SiteHeader from '../components/SiteHeader';


import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePageTexts } from '../lib/usePageTexts';
import './home.css';
import './home-mobile.css';
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

  brands_bg?: string;
  brands_text?: string;
  brands_muted?: string;
  brands_hover?: string;

  contact_bg?: string;
  contact_text?: string;
  contact_muted?: string;
  contact_button?: string;
  contact_button_text?: string;

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
  personal_instagram?: string;
  start_project_url?: string;
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
};

type Brand = {
  id: number;
  name: string;
  logo_url?: string;
  website_url?: string;
  sort_order?: number | null;
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
  const { text: pageText } = usePageTexts('home');
  const [lang, setLang] = useState<Lang>('en');
  const [langReady, setLangReady] = useState(false);
  const [settings, setSettings] = useState<Settings>({});
  const [fonts, setFonts] = useState<FontAsset[]>([]);
  const [content, setContent] = useState<Content>({});
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [filmPortfolio, setFilmPortfolio] = useState<PortfolioItem[]>([]);
  const [photoPortfolio, setPhotoPortfolio] = useState<PortfolioItem[]>([]);
  const [contentPortfolio, setContentPortfolio] = useState<PortfolioItem[]>([]);
  const [btsPortfolio, setBtsPortfolio] = useState<PortfolioItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filter, setFilter] = useState('all');
  const [workViewAll, setWorkViewAll] = useState(false);
  const workCarouselRef = useRef<HTMLDivElement>(null);
  const clientsCarouselRef = useRef<HTMLDivElement>(null);
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

    try {
      const [filmResponse, photoResponse, contentResponse, btsResponse] =
        await Promise.all([
          fetch('/api/public/projects?destination=film', { cache: 'no-store' }),
          fetch('/api/public/projects?destination=photography', { cache: 'no-store' }),
          fetch('/api/public/projects?destination=content', { cache: 'no-store' }),
          fetch('/api/public/bts', { cache: 'no-store' }),
        ]);

      const [filmResult, photoResult, contentResult2, btsResult] =
        await Promise.all([
          filmResponse.json(),
          photoResponse.json(),
          contentResponse.json(),
          btsResponse.json(),
        ]);

      setFilmPortfolio(filmResponse.ok ? filmResult.items || [] : []);
      setPhotoPortfolio(photoResponse.ok ? photoResult.items || [] : []);
      setContentPortfolio(contentResponse.ok ? contentResult2.items || [] : []);
      setBtsPortfolio(
        btsResponse.ok
          ? (btsResult.items || []).map((item: any) => ({
              ...item,
              cover_url: item.file_url || item.cover_url || '',
              preview_url:
                item.kind === 'video'
                  ? item.file_url
                  : item.preview_url || null,
              category:
                item.kind === 'video'
                  ? 'video'
                  : 'photo',
              title_en: item.name || 'Behind the Scenes',
              title_fa: item.name || 'Behind the Scenes',
              description_en: '',
              description_fa: '',
            }))
          : []
      );
    } catch (error) {
      console.error('Could not load destination projects on home:', error);
      setFilmPortfolio([]);
      setPhotoPortfolio([]);
      setContentPortfolio([]);
      setBtsPortfolio([]);
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
    if (filter === 'video') return filmPortfolio;
    if (filter === 'photo') return photoPortfolio;
    if (filter === 'content') return contentPortfolio;
    if (filter === 'bts') return btsPortfolio;

    // Advertising currently has no dedicated destination in Admin,
    // so keep using its category.
    if (filter === 'advertising') {
      return portfolio.filter(
        (item) => item.category === 'advertising'
      );
    }

    return [];
  }, [
    portfolio,
    filmPortfolio,
    photoPortfolio,
    contentPortfolio,
    btsPortfolio,
    filter,
  ]);

  const displayItems = shown;

  // Homepage work is always a horizontal browser.
  const workIsCarousel = true;

  // Desktop shows 6 cards, mobile shows 4.
  // Controls are useful as soon as there is more than one item.
  const showWorkControls = shown.length > 1;

  const workViewAllHref =
    filter === 'video'
      ? '/services/film-teasers'
      : filter === 'photo'
      ? '/services/photography'
      : filter === 'content'
      ? '/services/content'
      : filter === 'bts'
      ? '/work/behind-the-scenes'
      : filter === 'advertising'
      ? '/work?category=advertising'
      : '/work';

  function scrollClients(direction: 'prev' | 'next') {
    const container = clientsCarouselRef.current;
    if (!container) return;

    const amount = container.clientWidth * 0.75;

    container.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  function scrollWork(direction: 'prev' | 'next') {
    const container = workCarouselRef.current;
    if (!container) return;

    const amount = container.clientWidth * 0.78;

    container.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  const currentHero = heroSlides[heroIndex];

  const heroImage =
    currentHero?.cover_url || '';

  const cssVars = {
    '--site-bg':
      settings.bg_color || '#171716',

    '--site-text':
      settings.text_color || '#f1efe9',

    '--site-surface':
      settings.surface_color || '#20201e',

    '--site-muted':
      settings.muted_color || '#99958d',

    '--site-line':
      settings.border_color || '#3a3936',

    '--site-accent':
      settings.button_color || '#e9e6df',

    '--site-heading':
      settings.heading_color || settings.text_color || '#f1efe9',

    '--site-logo':
      settings.logo_color || settings.text_color || '#f1efe9',

    '--site-link':
      settings.link_color || settings.text_color || '#f1efe9',

    '--nav-bg':
      settings.nav_bg || settings.bg_color || '#171716',

    '--nav-text':
      settings.nav_text || settings.text_color || '#f1efe9',

    '--nav-active':
      settings.nav_active || '#ffffff',

    '--button-text':
      settings.button_text || '#151514',

    '--button-hover':
      settings.button_hover || '#ffffff',

    '--card-bg':
      settings.card_bg || '#1d1d1b',

    '--card-text':
      settings.card_text || settings.text_color || '#f1efe9',

    '--tag-color':
      settings.tag_color || settings.muted_color || '#99958d',

    '--footer-bg':
      settings.footer_bg || '#111110',

    '--footer-text':
      settings.footer_text || '#e8e5de',

    '--brands-bg':
      settings.brands_bg || '#e2dfd8',

    '--brands-text':
      settings.brands_text || '#171716',

    '--brands-muted':
      settings.brands_muted || '#68655f',

    '--brands-hover':
      settings.brands_hover || '#d6d2c9',

    '--contact-bg':
      settings.contact_bg || '#e7e4dd',

    '--contact-text':
      settings.contact_text || '#151514',

    '--contact-muted':
      settings.contact_muted || '#66635e',

    '--contact-button':
      settings.contact_button || '#151514',

    '--contact-button-text':
      settings.contact_button_text || '#eeeae2',

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
    navWork: pageText('nav_work', 'Work', 'نمونه‌کارها'),
    navServices: pageText('nav_services', 'Services', 'خدمات'),
    navAbout: pageText('nav_about', 'About', 'درباره'),
    navClients: pageText('nav_clients', 'Clients', 'مشتریان'),
    navContact: pageText('nav_contact', 'Contact', 'تماس'),

    cta: pageText(
      'start_project',
      'Start a project',
      'شروع یک پروژه'
    ),

    servicesTitle: pageText(
      'services_title',
      'From idea to final frame.',
      'از ایده تا فریم نهایی.'
    ),

    workTitle: pageText(
      'work_title',
      'Selected work.',
      'منتخب پروژه‌ها.'
    ),

    aboutFallback:
      lang === 'fa'
        ? 'NURANICO یک استودیوی خلاق برای ساخت تصویر، ویدیو و محتوای تبلیغاتی است؛ از ایده و کارگردانی تا تولید و فریم نهایی.'
        : 'NURANICO is a creative studio for image, film and campaign content — from concept and direction to production and the final frame.',

    brandsTitle: pageText(
      'brands_title',
      'Brands we have brought into focus.',
      'برندهایی که با ما دیده شدند.'
    ),

    contactFallback: pageText(
      'contact_title',
      'Let’s create something.',
      'بیایید چیزی بسازیم.'
    ),

    contactSub: pageText(
      'contact_description',
      'Tell us about the next project.',
      'پروژه بعدی‌تان را برای ما بفرستید.'
    ),
  };

  const categories = [
    {
      key: 'all',
      label: pageText('filter_all', 'All', 'همه'),
    },
    {
      key: 'video',
      label: pageText(
        'filter_video',
        'Film & Teasers',
        'فیلم و تیزر'
      ),
    },
    {
      key: 'photo',
      label: pageText(
        'filter_photo',
        'Photography',
        'عکس'
      ),
    },
    {
      key: 'content',
      label: pageText(
        'filter_content',
        'Content',
        'محتوا'
      ),
    },
    {
      key: 'bts',
      label: pageText(
        'filter_bts',
        'Behind the Scenes',
        'پشت صحنه'
      ),
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
      <SiteHeader />

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
            {pageText(
              'studio_label',
              'NURANICO / CREATIVE STUDIO',
              'NURANICO / استودیوی خلاق'
            )}
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
          <span className="latin">
            {pageText(
              'scroll_to_explore',
              'SCROLL TO EXPLORE',
              'برای مشاهده اسکرول کنید'
            )}
          </span>

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
              01 / {pageText(
                'services_eyebrow',
                'SERVICES',
                'خدمات'
              )}
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
                <div className="service-card-top">
                  <span>{number}</span>
                  <b>↗</b>
                </div>

                <div
                  className={`service-vector service-vector-${index + 1}`}
                  aria-hidden="true"
                >
                  {index === 0 ? (
                    <svg
                      viewBox="0 0 260 120"
                      fill="none"
                      className="service-art-film"
                    >
                      <g className="art-main">
                        <rect x="43" y="34" width="116" height="64" rx="2" />
                        <rect x="72" y="22" width="116" height="64" rx="2" />
                        <rect x="101" y="10" width="116" height="64" rx="2" />
                      </g>

                      <g className="art-detail">
                        <path d="M116 42H173" />
                        <path d="M116 50H157" />
                        <circle cx="196" cy="91" r="3" />
                        <path d="M188 91H153" />
                      </g>
                    </svg>
                  ) : index === 1 ? (
                    <svg
                      viewBox="0 0 260 120"
                      fill="none"
                      className="service-art-photo"
                    >
                      <g className="art-main">
                        <circle cx="130" cy="60" r="42" />
                        <circle cx="130" cy="60" r="23" />

                        <path d="M130 18L146 42" />
                        <path d="M166 39L145 52" />
                        <path d="M172 76L145 72" />
                        <path d="M130 102L119 78" />
                        <path d="M94 81L115 68" />
                        <path d="M88 44L115 48" />
                      </g>

                      <g className="art-detail">
                        <path d="M72 25H91M72 25V44" />
                        <path d="M188 25H169M188 25V44" />
                        <path d="M72 95H91M72 95V76" />
                        <path d="M188 95H169M188 95V76" />
                      </g>
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 260 120"
                      fill="none"
                      className="service-art-content"
                    >
                      <g className="art-main">
                        <rect x="63" y="21" width="58" height="36" rx="2" />
                        <rect x="128" y="21" width="69" height="36" rx="2" />
                        <rect x="63" y="64" width="82" height="35" rx="2" />
                        <rect x="152" y="64" width="45" height="35" rx="2" />
                      </g>

                      <g className="art-detail">
                        <circle cx="92" cy="39" r="5" />
                        <path d="M143 34H180" />
                        <path d="M143 43H168" />
                        <path d="M77 78H130" />
                        <path d="M77 86H112" />
                        <path d="M166 76L184 87" />
                        <path d="M184 76L166 87" />
                      </g>
                    </svg>
                  )}
                </div>

                <div className="service-card-copy">
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
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
              02 / {pageText(
                'work_eyebrow',
                'SELECTED WORK',
                'نمونه‌کارهای منتخب'
              )}
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
              onClick={() => {
                setFilter(category.key);

                requestAnimationFrame(() => {
                  workCarouselRef.current?.scrollTo({
                    left: 0,
                    behavior: 'smooth',
                  });
                });
              }}
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-line">
            {pageText(
              'loading_projects',
              'Loading projects…',
              'در حال بارگذاری پروژه‌ها…'
            )}
          </div>
        ) : filter === 'bts' &&
          !shown.length ? (
          <div className="loading-line">
            {pageText(
              'no_bts',
              'No Behind the Scenes has been added yet.',
              'هنوز پشت صحنه‌ای اضافه نشده است.'
            )}
          </div>
        ) : (
          <>
            {shown.length > 0 ? (
              <div className="work-browser-head">
                <div className="work-browser-count">
                  {String(shown.length).padStart(2, '0')}{' '}
                  {pageText(
                    'projects_label',
                    'PROJECTS',
                    'پروژه'
                  )}
                </div>

              </div>
            ) : null}

            <div className={`work-carousel-shell ${
              workIsCarousel ? 'is-carousel' : ''
            }`}>
              {workIsCarousel && showWorkControls ? (
                <>
                  <button
                    type="button"
                    className="work-edge-arrow work-edge-arrow-left"
                    aria-label={pageText(
                    'previous_projects',
                    'Previous projects',
                    'پروژه‌های قبلی'
                  )}
                    onClick={() => scrollWork('prev')}
                  >
                    <span>←</span>
                  </button>

                  <button
                    type="button"
                    className="work-edge-arrow work-edge-arrow-right"
                    aria-label={pageText(
                    'next_projects',
                    'Next projects',
                    'پروژه‌های بعدی'
                  )}
                    onClick={() => scrollWork('next')}
                  >
                    <span>→</span>
                  </button>
                </>
              ) : null}

            <div
              ref={workCarouselRef}
              className={`portfolio-grid ${
                workIsCarousel ? 'portfolio-carousel' : ''
              }`}
            >
            {displayItems.map(
              (item, index) => {
                const href =
                  filter === 'bts'
                    ? '/work/behind-the-scenes'
                    : `/work/${item.id}`;

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
                          {pageText(
                            'view_project',
                            'VIEW PROJECT',
                            'مشاهده پروژه'
                          )}
                        </span>
                        <b>↗</b>
                      </div>
                    </div>

                    <div className="project-meta">
                      <div>
                        <p>
                          {filter === 'bts'
                            ? pageText(
                                'card_bts',
                                'BEHIND THE SCENES',
                                'پشت صحنه'
                              )
                            : item.category === 'video'
                            ? pageText(
                                'card_film',
                                'FILM',
                                'فیلم'
                              )
                            : item.category === 'photo'
                            ? pageText(
                                'card_photo',
                                'PHOTO',
                                'عکس'
                              )
                            : item.category === 'advertising'
                            ? pageText(
                                'card_advertising',
                                'ADVERTISING',
                                'تبلیغات'
                              )
                            : pageText(
                                'card_content',
                                'CONTENT',
                                'محتوا'
                              )}
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
            </div>

            {shown.length ? (
              <div className="work-view-all-bottom">
                <Link
                  className="work-view-all"
                  href={workViewAllHref}
                >
                  {pageText(
                    'view_all',
                    'VIEW ALL',
                    'مشاهده همه'
                  )}
                </Link>
              </div>
            ) : null}
          </>
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
              alt={pageText(
                'about_image_alt',
                'NURANICO creative direction',
                'کارگردانی خلاق NURANICO'
              )}
              loading="lazy"
            />
          ) : (
            <div className="about-image-empty" />
          )}

          <span>N / 2026</span>
        </div>

        <div className="about-copy">
          <p className="eyebrow">
            03 / {pageText(
              'about_eyebrow',
              'ABOUT',
              'درباره ما'
            )}
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

        </div>
      </section>

      <section
        id="brands"
        className="section brands reveal"
      >
        <div className="section-head">
          <div>
            <p className="eyebrow">
              04 / {pageText(
                'brands_eyebrow',
                'SELECTED CLIENTS',
                'مشتریان منتخب'
              )}
            </p>

            <h2>{t.brandsTitle}</h2>
          </div>
        </div>

        <div className="brand-scroll-shell">

          <button
            type="button"
            className="brand-scroll-arrow brand-scroll-arrow-left"
            aria-label={pageText(
              'previous_clients',
              'Previous clients',
              'مشتریان قبلی'
            )}
            onClick={() => {
              const el = document.querySelector('.brand-grid');
              if (el) {
                el.scrollBy({
                  left: -el.clientWidth * 0.75,
                  behavior: 'smooth'
                });
              }
            }}
          >
            ←
          </button>

          <button
            type="button"
            className="brand-scroll-arrow brand-scroll-arrow-right"
            aria-label={pageText(
              'next_clients',
              'Next clients',
              'مشتریان بعدی'
            )}
            onClick={() => {
              const el = document.querySelector('.brand-grid');
              if (el) {
                el.scrollBy({
                  left: el.clientWidth * 0.75,
                  behavior: 'smooth'
                });
              }
            }}
          >
            →
          </button>

          <div className="brand-grid">
          {(() => {
            const brandBySlot = new Map<number, Brand>();

            brands.forEach((brand, fallbackIndex) => {
              const slot =
                typeof brand.sort_order === 'number'
                  ? brand.sort_order
                  : fallbackIndex;

              if (!brandBySlot.has(slot)) {
                brandBySlot.set(slot, brand);
              }
            });

            const highestUsedSlot = Math.max(
              -1,
              ...Array.from(brandBySlot.keys())
            );

            const totalSlots = Math.max(14, highestUsedSlot + 1);

            return Array.from({ length: totalSlots }, (_, index) => {
              const brand = brandBySlot.get(index);
              const slotNumber = index + 1;

              if (!brand) {
                return (
                  <div
                    className="brand-card placeholder"
                    key={`placeholder-${slotNumber}`}
                  >
                    {pageText(
                      'client_placeholder',
                      'CLIENT',
                      'مشتری'
                    )} /{' '}
                    {String(slotNumber).padStart(2, '0')}
                  </div>
                );
              }

              return (
                <div
                  className="brand-card"
                  key={brand.id}
                >
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      loading="lazy"
                    />
                  ) : (
                    brand.name
                  )}
                </div>
              );
            });
          })()}
          </div>
        </div>
      </section>

      <section className="statement reveal">
        <p className="eyebrow">
          05 / {pageText(
            'statement_eyebrow',
            'OUR APPROACH',
            'رویکرد ما'
          )}
        </p>

        <h2>
          {pageText(
            'statement_title',
            'Less noise. More impact.',
            'کمتر شلوغی. تأثیر بیشتر.'
          )}
        </h2>

        <p>
          {pageText(
            'statement_description',
            'Movement, light, framing and detail — all in service of one thing: making brands seen and remembered.',
            'حرکت، نور، قاب و جزئیات؛ همه برای یک چیز: دیده‌شدن و ماندن.'
          )}
        </p>
      </section>

      <section className="landscape reveal">
        {content.about_image_url ? (
          <img
            src={content.about_image_url}
            alt={pageText(
              'landscape_alt',
              'NURANICO cinematic landscape',
              'تصویر سینمایی NURANICO'
            )}
            loading="lazy"
          />
        ) : null}

        <div className="landscape-copy">
          <span className="latin" lang="en">NURANICO / 05</span>

          <strong>
            {pageText('keep_line_1', 'KEEP', 'ادامه بده')}
            <br />
            {pageText('keep_line_2', 'LOOKING.', 'به دیدن.')}
          </strong>
        </div>
      </section>

      <section
        id="contact"
        className="section contact reveal"
      >
        <div>
          <p className="eyebrow">
            06 / {pageText(
              'contact_eyebrow',
              "LET'S TALK",
              'تماس با ما'
            )}
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
            href={content.start_project_url || '/contact'}
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
            {pageText(
              'footer_description',
              'Creative studio for brands that want to be seen differently.',
              'استودیوی خلاق برای برندهایی که می‌خواهند متفاوت دیده شوند.'
            )}
          </p>
        </div>

        <div>
          <span>
            {pageText(
              'footer_contact',
              'CONTACT',
              'تماس'
            )}
          </span>

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
              aria-label="Instagram"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>

              <span className="latin" lang="en">
                @{content.contact_instagram
                  .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
                  .replace(/^@/, '')
                  .split(/[/?#]/)[0]
                  .replace(/\/$/, '')}
              </span>
            </a>
          ) : null}

          {content.personal_instagram ? (
            <a
              href={content.personal_instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>

              <span className="latin" lang="en">
                @{content.personal_instagram
                  .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
                  .replace(/^@/, '')
                  .split(/[/?#]/)[0]
                  .replace(/\/$/, '')}
              </span>
            </a>
          ) : null}
        </div>

        <div>
          <span>
            {pageText(
              'footer_navigation',
              'NAVIGATION',
              'ناوبری'
            )}
          </span>

          <a href="#work">{t.navWork}</a>
          <a href="#about">{t.navAbout}</a>
          <a href="#contact">{t.navContact}</a>
        </div>
      </footer>
    </main>
    </>
  );
}