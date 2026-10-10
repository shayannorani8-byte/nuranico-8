'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { usePageTexts } from '../lib/usePageTexts';
import { useSiteLanguage } from './SiteLanguage';
import { aboutGradientColor, DEFAULT_PORTFOLIO_GRADIENT } from '../lib/site-appearance-settings';
import { useSiteData } from './SiteData';

export default function SiteHeader() {
  const { lang, setLang, text } = usePageTexts('global');
  const { bilingual } = useSiteLanguage();
  const { text: appearanceText } = usePageTexts('site-config');
  const portfolioGradient = aboutGradientColor(appearanceText('portfolio_gradient_color', DEFAULT_PORTFOLIO_GRADIENT, DEFAULT_PORTFOLIO_GRADIENT));
  useEffect(() => { document.documentElement.style.setProperty('--portfolio-gradient-color', portfolioGradient); }, [portfolioGradient]);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.showModal();
    closeButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButtonRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      dialogRef.current?.close();
      menuButtonRef.current?.focus();
    };
  }, [menuOpen]);
  const initialData = useSiteData();

  const [logoUrl, setLogoUrl] = useState(String(initialData.settings.logo_url || ''));

  useEffect(() => {
    let active = true;

    import('../lib/supabase')
      .then(({ supabase }) =>
        supabase
          .from('site_settings')
          .select('logo_url')
          .eq('id', 1)
          .maybeSingle()
      )
      .then(({ data, error }) => {
        if (!active) return;

        if (error) {
          console.error('Could not load site logo:', error);
          return;
        }

        setLogoUrl(data?.logo_url || '');
      })
      .catch(error => {
        console.error('Could not load site logo:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  const [startProjectUrl, setStartProjectUrl] = useState(String(initialData.content.start_project_url || '/contact'));

  useEffect(() => {
    let active = true;

    import('../lib/supabase')
      .then(({ supabase }) =>
        supabase
          .from('site_content')
          .select('start_project_url')
          .limit(1)
          .maybeSingle()
      )
      .then(({ data }) => {
        if (active && data?.start_project_url) {
          setStartProjectUrl(data.start_project_url);
        }
      })
      .catch(error => {
        console.error('Could not load Start Project URL:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  const t = {
    work: text('nav_work', 'Work', 'پروژه‌ها'),
    services: text('nav_services', 'Services', 'خدمات'),
    about: text('nav_about', 'About', 'درباره ما'),
    brands: text('nav_brands', 'Brands', 'برندها'),
    contact: text('nav_contact', 'Contact', 'تماس'),
    cta: text('start_project', 'Start a project', 'شروع پروژه'),
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
      <Link
        className="brand"
        href="/"
        aria-label="NURANICO"
        onClick={closeMenu}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="NURANICO"
            className="site-logo-image"
            onError={() => setLogoUrl('')}
          />
        ) : (
          <span>
            NURANICO
            <span className="brand-mark">®</span>
          </span>
        )}
      </Link>

      <nav className="desktop-nav" aria-label={text(
        'main_navigation',
        'Main navigation',
        'ناوبری اصلی'
      )}>
        <Link href="/work">{t.work}</Link>
        <Link href="/services">{t.services}</Link>
        <Link href="/about">{t.about}</Link>
        <Link href="/#brands">{t.brands}</Link>
        <Link href="/contact">{t.contact}</Link>
      </nav>

      <div className="nav-actions">
        <Link
          className="nav-cta"
          href={startProjectUrl || '/contact'}
        >
          {t.cta}
        </Link>

        {bilingual && <button
          className="lang-switch"
          type="button"
          onClick={() => setLang(lang === 'en' ? 'fa' : 'en')}
          aria-label={text(
            'change_language',
            'Change language',
            'تغییر زبان'
          )}
        >
          {lang === 'en' ? 'FA' : 'EN'}
        </button>}



        <button
          ref={menuButtonRef}
          aria-controls="site-mobile-menu"
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? text('close_menu', 'Close menu', 'بستن منو') : text('open_menu', 'Open menu', 'باز کردن منو')}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
        </button>
      </div>

      {menuOpen && createPortal(
        <dialog ref={dialogRef} className="full-menu" id="site-mobile-menu" lang={lang} dir={lang === 'fa' ? 'rtl' : 'ltr'} aria-label={text('main_navigation', 'Main navigation', 'ناوبری اصلی')} onCancel={event => { event.preventDefault(); closeMenu(); }}>
          <div className="full-menu-top">
            <Link className="full-menu-brand" href="/" onClick={closeMenu} aria-label="NURANICO">
              {logoUrl ? <img src={logoUrl} alt="NURANICO" onError={() => setLogoUrl('')} /> : <span lang="en">NURANICO</span>}
            </Link>
            <div className="full-menu-actions">
              {bilingual && <button type="button" onClick={() => setLang(lang === 'en' ? 'fa' : 'en')} aria-label={text('change_language', 'Change language', 'تغییر زبان')}>{lang === 'en' ? 'FA' : 'EN'}</button>}
              <button ref={closeButtonRef} type="button" onClick={closeMenu} aria-label={text('close_menu', 'Close menu', 'بستن منو')}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
            </div>
          </div>
          <nav className="full-menu-links" aria-label={text('main_navigation', 'Main navigation', 'ناوبری اصلی')}>
            {[
              ['/work', t.work, pathname.startsWith('/work')],
              ['/services', t.services, pathname.startsWith('/services')],
              ['/about', t.about, pathname === '/about'],
              ['/#brands', t.brands, false],
              ['/contact', t.contact, pathname === '/contact'],
            ].map(([href, label, active]) => <Link key={String(href)} href={String(href)} onClick={closeMenu} aria-current={active ? 'page' : undefined}><span>{String(label)}</span></Link>)}
            <Link className="full-menu-project" href={startProjectUrl || '/contact'} onClick={closeMenu}><span>{t.cta}</span></Link>
          </nav>
        </dialog>, document.body
      )}
    </header>
  );
}
