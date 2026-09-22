'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Settings = {
  font_en?: string | null;
  font_fa?: string | null;
  heading_size?: number | null;
  body_size?: number | null;
  small_size?: number | null;
  heading_weight?: number | null;
  body_weight?: number | null;
  letter_spacing?: number | null;

  heading_size_en?: number | null;
  heading_size_fa?: number | null;
  body_size_en?: number | null;
  body_size_fa?: number | null;
  small_size_en?: number | null;
  small_size_fa?: number | null;
  line_height_en?: number | null;
  line_height_fa?: number | null;
  letter_spacing_en?: number | null;
  letter_spacing_fa?: number | null;
};

type FontAsset = {
  id: number;
  family_name: string;
  file_url: string;
  format: string;
  font_weight?: number | null;
  font_style?: string | null;
};

function fontFormat(format: string) {
  switch (format?.toLowerCase()) {
    case 'ttf':
      return 'truetype';
    case 'otf':
      return 'opentype';
    case 'woff2':
      return 'woff2';
    case 'woff':
      return 'woff';
    default:
      return format || 'truetype';
  }
}

export default function GlobalTypography() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [fonts, setFonts] = useState<FontAsset[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      const [settingsResult, fontsResult] = await Promise.all([
        supabase
          .from('site_settings')
          .select(
            'font_en,font_fa,heading_size,body_size,small_size,heading_weight,body_weight,letter_spacing,heading_size_en,heading_size_fa,body_size_en,body_size_fa,small_size_en,small_size_fa,line_height_en,line_height_fa,letter_spacing_en,letter_spacing_fa'
          )
          .eq('id', 1)
          .maybeSingle(),

        supabase
          .from('font_assets')
          .select(
            'id,family_name,file_url,format,font_weight,font_style'
          )
          .order('id', { ascending: true }),
      ]);

      if (!active) return;

      if (settingsResult.data) {
        setSettings(settingsResult.data);
      }

      if (fontsResult.data) {
        setFonts(fontsResult.data);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  if (!settings) {
    return null;
  }

  const resolveFont = (family: string | null | undefined, fallback: string) => {
    if (!family) return fallback;

    const asset = fonts.find(font => font.family_name === family);

    return asset ? `CMSFont-${asset.id}` : family;
  };

  const fontEn = resolveFont(settings.font_en, 'DM Sans');
  const fontFa = resolveFont(settings.font_fa, 'DimaMostanad');

  const faces = fonts
    .filter(font => font.family_name && font.file_url)
    .map(font => `
      @font-face {
        font-family: 'CMSFont-${font.id}';
        src: url('${font.file_url}') format('${fontFormat(font.format)}');
        font-weight: ${font.font_weight || 400};
        font-style: ${font.font_style || 'normal'};
        font-display: swap;
      }
    `)
    .join('\n');

  return (
    <style>{`
      ${faces}

      :root {
        --font-en: '${fontEn.replace(/'/g, "\\'")}';
        --font-fa: '${fontFa.replace(/'/g, "\\'")}';

        --font-body: var(--font-en);
        --font-heading: var(--font-en);

        --cms-heading-size: ${settings.heading_size_en ?? settings.heading_size ?? 48}px;
        --cms-body-size: ${settings.body_size_en ?? settings.body_size ?? 16}px;
        --cms-small-size: ${settings.small_size_en ?? settings.small_size ?? 11}px;
        --cms-line-height: ${settings.line_height_en ?? 1.15};
        --cms-letter-spacing: ${settings.letter_spacing_en ?? settings.letter_spacing ?? 0}px;

        --heading-weight: ${settings.heading_weight || 500};
        --body-weight: ${settings.body_weight || 400};
      }

      html[lang='en'] {
        --font-body: var(--font-en);
        --font-heading: var(--font-en);

        --cms-heading-size: ${settings.heading_size_en ?? settings.heading_size ?? 48}px;
        --cms-body-size: ${settings.body_size_en ?? settings.body_size ?? 16}px;
        --cms-small-size: ${settings.small_size_en ?? settings.small_size ?? 11}px;
        --cms-line-height: ${settings.line_height_en ?? 1.15};
        --cms-letter-spacing: ${settings.letter_spacing_en ?? settings.letter_spacing ?? 0}px;
      }

      html[lang='fa'] {
        --font-body: var(--font-fa);
        --font-heading: var(--font-fa);

        --cms-heading-size: ${settings.heading_size_fa ?? settings.heading_size ?? 48}px;
        --cms-body-size: ${settings.body_size_fa ?? settings.body_size ?? 16}px;
        --cms-small-size: ${settings.small_size_fa ?? settings.small_size ?? 11}px;
        --cms-line-height: ${settings.line_height_fa ?? 1.35};
        --cms-letter-spacing: ${settings.letter_spacing_fa ?? settings.letter_spacing ?? 0}px;
      }

      /*
       * CMS TYPOGRAPHY SIZES
       * Admin is the single source of truth.
       */

      /*
       * TYPOGRAPHY VALUES
       * Apply typography to text elements only.
       * Never use container line-height to resize UI geometry.
       */

      body {
        font-size: var(--cms-body-size);
      }

      /* =========================
         MAIN HEADINGS
         ========================= */

      .hero h1,
      .section h2,
      .statement h2,
      .contact h2,
      .inner-hero h1,
      .contact-inner h1,
      .project-hero h1,
      .project-details h2,
      .project-end a,
      .project-not-found h1,
      .copy-section h2,
      .service-list h2,
      .brand-loading h1,
      .brand-hero h1 {
        font-size: var(--cms-heading-size) !important;
        line-height: var(--cms-line-height) !important;
        letter-spacing: var(--cms-letter-spacing) !important;
      }

      /* =========================
         NORMAL BODY COPY
         ========================= */

      .hero-copy,
      .desc,
      .copy-section > p,
      .service-list p,
      .contact-inner > p,
      .project-description,
      .about-copy > p,
      .statement > p:last-child,
      .service-card p {
        font-size: var(--cms-body-size) !important;
        line-height: var(--cms-line-height) !important;
        letter-spacing: var(--cms-letter-spacing) !important;
      }

      /* =========================
         SERVICE CARD TITLES
         Keep card geometry intact
         ========================= */

      .service-card h3 {
        font-size: var(--cms-body-size) !important;
        line-height: var(--cms-line-height) !important;
        letter-spacing: var(--cms-letter-spacing) !important;
      }

      /* =========================
         SMALL TEXT / METADATA
         Target TEXT, not containers
         ========================= */

      .eyebrow,
      .section-index,
      .filter-row button,
      .project-meta p,
      .project-meta span,
      .project-meta strong,
      .hero-meta,
      .scroll-indicator,
      .global-nav a,
      .global-cta,
      .inner-nav a,
      .inner-footer,
      .service-card > span,
      .footer p,
      .footer span,
      .footer a:not(.brand) {
        font-size: var(--cms-small-size) !important;
        letter-spacing: var(--cms-letter-spacing) !important;
      }

      body,
      .content-page,
      .project-page,
      .page {
        font-family: var(--font-body), Arial, sans-serif !important;
        font-weight: var(--body-weight);
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      .inner-logo,
      .project-logo,
      .global-logo,
      .contact-link,
      .about-stats strong,
      .landscape-copy strong {
        font-family: var(--font-heading), Arial, sans-serif !important;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-weight: var(--heading-weight);
      }

      html[lang='fa'] h1,
      html[lang='fa'] h2,
      html[lang='fa'] h3,
      html[lang='fa'] h4,
      html[lang='fa'] h5,
      html[lang='fa'] h6 {
        font-weight: 400;
        font-synthesis: none;
      }

      html[lang='fa'] body {
        font-family: var(--font-fa), Arial, sans-serif !important;
      }

      /*
       * Explicit element language always wins over page language.
       */
      [lang='en'],
      [lang='en'] * {
        font-family: var(--font-en), Arial, sans-serif !important;
      }

      /*
       * Element-level language has FINAL priority.
       * These selectors intentionally have higher specificity
       * than html[lang='fa'] h1 etc.
       */
      html body [lang='en'],
      html body [lang='en'] * {
        font-family: var(--font-en), Arial, sans-serif !important;
      }

      html body [lang='fa'],
      html body [lang='fa'] * {
        font-family: var(--font-fa), Arial, sans-serif !important;
      }

      /*
       * Keep intentionally Latin UI elements on the English CMS font,
       * even while the page language is Persian.
       */
      .latin,
      [lang='en'] {
        font-family: var(--font-en), Arial, sans-serif !important;
        font-synthesis: none;
      }

      html[lang='fa'] .eyebrow,
      html[lang='fa'] .brand,
      html[lang='fa'] .brand-mark,
      html[lang='fa'] .section-index,
      html[lang='fa'] .scroll-indicator,
      html[lang='fa'] .footer .brand {
        font-family: var(--font-en), Arial, sans-serif !important;
        font-synthesis: none;
      }


    `}</style>
  );
}
