'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Settings = {
  bg_color: string;
  text_color: string;
  button_color: string;
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
};

type Brand = {
  id: number;
  name: string;
  logo_url?: string;
  website_url?: string;
};

const defaultSettings: Settings = {
  bg_color: '#f2f0eb',
  text_color: '#111111',
  button_color: '#111111',
};

const defaultContent: Content = {
  hero_title_fa: 'تصویر می‌سازیم، اثر می‌گذاریم.',
  hero_description_fa:
    'استودیو خلاق NURANICO؛ جایی برای ساخت تیزر، عکاسی و محتوایی که هویت برند را به تصویر تبدیل می‌کند.',
  hero_button_fa: 'مشاهده نمونه‌کارها',
  about_title_fa: 'از ایده تا فریم نهایی.',
  about_text_fa:
    'NURANICO یک استودیوی خلاق برای برندها، کسب‌وکارها و پروژه‌هایی است که به تصویر حرفه‌ای نیاز دارند.',
  contact_title_fa: 'پروژه بعدی شاید با شما باشد.',
  contact_email: 'hello@nuranico.com',
};

export default function Home() {
  const [filter, setFilter] = useState('all');
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [content, setContent] = useState<Content>(defaultContent);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSite();
  }, []);

  async function loadSite() {
    setLoading(true);

    const [
      settingsResult,
      contentResult,
      portfolioResult,
      brandsResult,
    ] = await Promise.all([
      supabase
        .from('site_settings')
        .select('*')
        .limit(1)
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
    ]);

    if (!settingsResult.error && settingsResult.data) {
      setSettings(settingsResult.data);
    }

    if (!contentResult.error && contentResult.data) {
      setContent(contentResult.data);
    }

    if (!portfolioResult.error && portfolioResult.data) {
      setPortfolio(portfolioResult.data);
    }

    if (!brandsResult.error && brandsResult.data) {
      setBrands(brandsResult.data);
    }

    setLoading(false);
  }

  const shown =
    filter === 'all'
      ? portfolio
      : portfolio.filter((item) => item.category === filter);

  const cssVariables = {
    '--bg': settings.bg_color || '#f2f0eb',
    '--text': settings.text_color || '#111111',
    '--dark': settings.button_color || '#111111',
    '--surface': settings.surface_color || '#ddd9d0',
    '--muted': settings.muted_color || '#666666',
    '--heading': settings.heading_color || settings.text_color || '#111111',
    '--logo': settings.logo_color || settings.text_color || '#111111',
    '--link': settings.link_color || settings.text_color || '#111111',
    '--nav-bg': settings.nav_bg || settings.bg_color || '#f2f0eb',
    '--nav-text': settings.nav_text || settings.text_color || '#111111',
    '--nav-active': settings.nav_active || settings.button_color || '#111111',
    '--button-text': settings.button_text || '#ffffff',
    '--button-hover': settings.button_hover || '#333333',
    '--card-bg': settings.card_bg || '#ddd9d0',
    '--card-text': settings.card_text || settings.text_color || '#111111',
    '--tag': settings.tag_color || settings.text_color || '#111111',
    '--footer-bg': settings.footer_bg || settings.text_color || '#111111',
    '--footer-text': settings.footer_text || settings.bg_color || '#f2f0eb',
    '--border': settings.border_color || '#bdbab2',
  } as React.CSSProperties;

  function categoryLabel(category: string) {
    if (category === 'video') return 'ساخت تیزر';
    if (category === 'photo') return 'عکس';
    if (category === 'content') return 'محتوا';
    return category;
  }

  return (
    <main className="site" style={cssVariables}>

      {/* NAVIGATION */}
      <header className="nav">
        <a className="logo" href="#top">
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt="NURANICO"
              style={{ maxHeight: 42, width: 'auto' }}
            />
          ) : (
            <>
              NURANICO<span>®</span>
            </>
          )}
        </a>

        <nav>
          <a href="#work">نمونه‌کار</a>
          <a href="#about">درباره</a>
          <a href="#contact">تماس</a>
        </nav>

        <a className="nav-cta" href="#contact">
          شروع یک پروژه
        </a>
      </header>

      {/* HERO */}
      <section id="top" className="hero">
        <div className="hero-kicker">
          CREATIVE STUDIO / 2026
        </div>

        <h1>
          {content.hero_title_fa
            ? content.hero_title_fa.split('،')[0] + '،'
            : 'تصویر می‌سازیم،'}
          <br />
          <em>
            {content.hero_title_fa?.includes('،')
              ? content.hero_title_fa.split('،').slice(1).join('،').trim()
              : 'اثر می‌گذاریم.'}
          </em>
        </h1>

        <p>
          {content.hero_description_fa ||
            defaultContent.hero_description_fa}
        </p>

        <a className="primary" href="#work">
          {content.hero_button_fa || 'مشاهده نمونه‌کارها'} <b>↓</b>
        </a>

        <div className="hero-mark">N</div>
      </section>

      {/* WORK */}
      <section id="work" className="work">
        <div className="section-head">
          <div>
            <span>01 / WORK</span>
            <h2>نمونه‌کارها</h2>
          </div>

          <p>
            منتخبی از پروژه‌های تصویری و محتوایی NURANICO
          </p>
        </div>

        <div className="filters">
          {[
            ['all', 'همه'],
            ['video', 'تیزر'],
            ['photo', 'عکس'],
            ['content', 'محتوا'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={filter === key ? 'active' : ''}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid">
            {[1, 2, 3].map((x) => (
              <article className="card" key={x}>
                <div className="visual">
                  <span>—</span>
                </div>
              </article>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="empty-state">
            هنوز نمونه‌کاری در این بخش منتشر نشده است.
          </div>
        ) : (
          <div className="grid">
            {shown.map((item, index) => (
              <article className="card" key={item.id}>

                <div
                  className={'visual v' + (index % 3)}
                  style={
                    item.cover_url
                      ? {
                          backgroundImage: `url(${item.cover_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : undefined
                  }
                >
                  {!item.cover_url && (
                    <>
                      <span>
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <i>
                        {item.category === 'video'
                          ? '▶'
                          : item.category === 'photo'
                          ? '✦'
                          : '✳'}
                      </i>
                    </>
                  )}
                </div>

                <div className="card-meta">
                  <div>
                    <small>
                      {categoryLabel(item.category)}
                    </small>

                    <h3>{item.title_fa}</h3>
                  </div>

                  <p>
                    {item.description_fa || ''}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section id="about" className="about">
        <div>
          <span>02 / ABOUT</span>

          <h2>
            {content.about_title_fa?.includes(' ')
              ? content.about_title_fa
              : content.about_title_fa || 'درباره NURANICO'}
          </h2>
        </div>

        <div className="about-copy">
          <p>
            {content.about_text_fa ||
              'NURANICO یک استودیوی خلاق برای برندها، کسب‌وکارها و پروژه‌هایی است که به تصویر حرفه‌ای نیاز دارند.'}
          </p>

          <p>
            تمرکز ما روی روایت، جزئیات و ساخت تجربه‌ای بصری است که بعد از دیدن، در ذهن بماند.
          </p>

          <div className="stats">
            <div>
              <b>01</b>
              <span>استراتژی</span>
            </div>

            <div>
              <b>02</b>
              <span>تولید</span>
            </div>

            <div>
              <b>03</b>
              <span>پس‌تولید</span>
            </div>
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="brands">
        <span>03 / BRANDS</span>

        <h2>
          برندهایی که
          <br />
          <em>همراه ما بودند.</em>
        </h2>

        {brands.length > 0 ? (
          <div className="brand-row">
            {brands.map((brand) => (
              <div key={brand.id}>
                {brand.website_url ? (
                  <a
                    href={brand.website_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        style={{
                          maxWidth: 150,
                          maxHeight: 55,
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      brand.name
                    )}
                  </a>
                ) : brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    style={{
                      maxWidth: 150,
                      maxHeight: 55,
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  brand.name
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="brand-row">
            <div>BRAND / 01</div>
            <div>BRAND / 02</div>
            <div>BRAND / 03</div>
          </div>
        )}
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact">
        <span>04 / CONTACT</span>

        <h2>
          {content.contact_title_fa || 'پروژه بعدی'}
        </h2>

        <a
          className="contact-link"
          href={`mailto:${
            content.contact_email || 'hello@nuranico.com'
          }`}
        >
          {content.contact_email || 'hello@nuranico.com'} <b>↗</b>
        </a>
      </section>

      {/* FOOTER */}
      <footer>
        <span>© 2026 NURANICO</span>
        <span>Creative Studio</span>
        <a href="#top">بازگشت به بالا ↑</a>
      </footer>

    </main>
  );
}