'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePageTexts } from '../lib/usePageTexts';
import { useSiteData } from './SiteData';

export default function SiteHeader() {
  const { lang, setLang, text } = usePageTexts('global');
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButtonRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
        <button
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
        </button>

        <Link
          className="nav-cta"
          href={startProjectUrl || '/contact'}
        >
          {t.cta}
        </Link>

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

      {menuOpen && <button className="menu-backdrop" type="button" tabIndex={-1} aria-label={text('close_menu', 'Close menu', 'بستن منو')} onClick={closeMenu} />}
      <nav className="mobile-menu" id="site-mobile-menu" aria-label={text('main_navigation', 'Main navigation', 'ناوبری اصلی')} inert={!menuOpen} aria-hidden={!menuOpen}>
        <Link href="/work" onClick={closeMenu} aria-current={pathname.startsWith('/work') ? 'page' : undefined}>
          {t.work}
        </Link>

        <Link href="/services" onClick={closeMenu} aria-current={pathname.startsWith('/services') ? 'page' : undefined}>
          {t.services}
        </Link>

        <Link href="/about" onClick={closeMenu} aria-current={pathname === '/about' ? 'page' : undefined}>
          {t.about}
        </Link>

        <Link href="/#brands" onClick={closeMenu}>
          {t.brands}
        </Link>

        <Link href="/contact" onClick={closeMenu} aria-current={pathname === '/contact' ? 'page' : undefined}>
          {t.contact}
        </Link>
        <Link className="menu-project-link" href={startProjectUrl || '/contact'} onClick={closeMenu}>{t.cta}<span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
  );
}
