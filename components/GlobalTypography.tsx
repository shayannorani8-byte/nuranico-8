export type TypographySettings = {
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

export type FontAsset = {
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

// Static uploaded faces have an intrinsic weight; a Black face cannot render Regular.
function assetWeight(font: FontAsset) {
  const name = `${font.family_name} ${font.file_url}`;
  if (/black|heavy/i.test(name)) return 900;
  if (/extra[\s_-]*bold|ultra[\s_-]*bold/i.test(name)) return 800;
  if (/semi[\s_-]*bold|demi[\s_-]*bold/i.test(name)) return 600;
  if (/bold/i.test(name)) return 700;
  return font.font_weight || 400;
}

export default function GlobalTypography({ settings, fonts }: {
  settings: TypographySettings & Record<string, unknown>;
  fonts: FontAsset[];
}) {
  const resolveFont = (family: string | null | undefined, fallback: string) => {
    if (!family) return fallback;

    const asset = fonts.find(font => font.family_name === family);

    return asset ? `CMSFont-${asset.id}` : ['DM Sans', 'Space Grotesk', 'Vazirmatn'].includes(family) ? family : fallback;
  };

  const fontEn = resolveFont(settings.font_en, 'DM Sans');
  const fontFa = resolveFont(settings.font_fa, 'Vazirmatn');
  const displayWeight = (family: string | null | undefined) => {
    const asset = fonts.find(font => font.family_name === family);
    return asset && assetWeight(asset) >= 700 ? assetWeight(asset) : settings.heading_weight || 700;
  };
  const readableBodyFont = (family: string | null | undefined, resolved: string, fallback: string) => {
    const asset = fonts.find(font => font.family_name === family);
    const heavy = !!asset && assetWeight(asset) >= 700;
    return heavy && (settings.body_weight || 400) < 600 ? fallback : resolved;
  };
  const bodyEn = readableBodyFont(settings.font_en, fontEn, 'DM Sans');
  const bodyFa = readableBodyFont(settings.font_fa, fontFa, 'Vazirmatn');

  const faces = fonts
    .filter(font => font.family_name && font.file_url)
    .map(font => `
      @font-face {
        font-family: 'CMSFont-${font.id}';
        src: url('${font.file_url}') format('${fontFormat(font.format)}');
        font-weight: ${assetWeight(font)};
        font-style: ${font.font_style || 'normal'};
        font-display: block;
      }
    `)
    .join('\n');

  return (
    <style>{`
      ${faces}

      :root {
        --nav-text: ${String(settings.nav_text || '#f1efe9')};
        --nav-bg: ${String(settings.nav_bg || '#171716')};
        --nav-active: ${String(settings.nav_active || '#ffffff')};
        --site-line: ${String(settings.border_color || '#3a3936')};
        --site-logo: ${String(settings.logo_color || '#f1efe9')};
        --site-accent: ${String(settings.button_color || '#e9e6df')};
        --button-text: ${String(settings.button_text || '#151514')};
        --button-hover: ${String(settings.button_hover || '#ffffff')};
        --font-en: '${fontEn.replace(/'/g, "\\'")}';
        --font-fa: '${fontFa.replace(/'/g, "\\'")}';
        --font-en-body: '${bodyEn.replace(/'/g, "\\'")}';
        --font-fa-body: '${bodyFa.replace(/'/g, "\\'")}';

        --font-body: var(--font-en-body);
        --font-heading: var(--font-en);
        --display-weight-en: ${displayWeight(settings.font_en)};
        --display-weight-fa: ${displayWeight(settings.font_fa)};
        --display-weight: var(--display-weight-en);

        --cms-heading-size: ${settings.heading_size_en ?? settings.heading_size ?? 48}px;
        --cms-body-size: ${settings.body_size_en ?? settings.body_size ?? 16}px;
        --cms-small-size: ${settings.small_size_en ?? settings.small_size ?? 11}px;
        --cms-line-height: ${settings.line_height_en ?? 1.15};
        --cms-letter-spacing: ${settings.letter_spacing_en ?? settings.letter_spacing ?? 0}px;

        --heading-weight: ${settings.heading_weight || 500};
        --body-weight: ${settings.body_weight || 400};
      }

      html[lang='en'] {
        --font-body: var(--font-en-body);
        --font-heading: var(--font-en);
        --display-weight: var(--display-weight-en);

        --cms-heading-size: ${settings.heading_size_en ?? settings.heading_size ?? 48}px;
        --cms-body-size: ${settings.body_size_en ?? settings.body_size ?? 16}px;
        --cms-small-size: ${settings.small_size_en ?? settings.small_size ?? 11}px;
        --cms-line-height: ${settings.line_height_en ?? 1.15};
        --cms-letter-spacing: ${settings.letter_spacing_en ?? settings.letter_spacing ?? 0}px;
      }

      html[lang='fa'] {
        --font-body: var(--font-fa-body);
        --font-heading: var(--font-fa);
        --display-weight: var(--display-weight-fa);

        --cms-heading-size: ${settings.heading_size_fa ?? settings.heading_size ?? 48}px;
        --cms-body-size: ${settings.body_size_fa ?? settings.body_size ?? 16}px;
        --cms-small-size: ${settings.small_size_fa ?? settings.small_size ?? 11}px;
        --cms-line-height: ${Math.max(settings.line_height_fa ?? 1.5, 1.3)};
        --cms-letter-spacing: 0px;
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
        font-family: var(--font-body), 'DM Sans', 'Vazirmatn', sans-serif !important;
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
        font-family: var(--font-heading), 'DM Sans', 'Vazirmatn', sans-serif !important;
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
        font-weight: var(--heading-weight);
        font-synthesis: none;
      }

      html[lang='fa'] body {
        font-synthesis: none;
        text-rendering: optimizeLegibility;
        font-family: var(--font-fa-body, var(--font-fa)), 'Vazirmatn', sans-serif !important;
      }

      /*
       * Explicit element language always wins over page language.
       */
      [lang='en']:not(html),
      [lang='en']:not(html) * {
        font-family: var(--font-en-body, var(--font-en)), 'DM Sans', Arial, sans-serif !important;
      }

      /*
       * Element-level language has FINAL priority.
       * These selectors intentionally have higher specificity
       * than html[lang='fa'] h1 etc.
       */
      html body [lang='en'],
      html body [lang='en'] * {
        font-family: var(--font-en-body, var(--font-en)), 'DM Sans', Arial, sans-serif !important;
      }

      html body [lang='fa'],
      html body [lang='fa'] * {
        font-family: var(--font-fa-body, var(--font-fa)), 'Vazirmatn', sans-serif !important;
      }

      /*
       * Keep intentionally Latin UI elements on the English CMS font,
       * even while the page language is Persian.
       */
      .latin,
      [lang='en'] {
        font-family: var(--font-en-body, var(--font-en)), 'DM Sans', Arial, sans-serif !important;
        font-synthesis: none;
      }

      html body :is(h1,h2,h3,h4,h5,h6)[lang='en'],
      html body [lang='en'] :is(h1,h2,h3,h4,h5,h6) { font-family: var(--font-en), 'DM Sans', sans-serif !important; }
      html body :is(h1,h2,h3,h4,h5,h6)[lang='fa'],
      html body [lang='fa'] :is(h1,h2,h3,h4,h5,h6) { font-family: var(--font-fa), 'Vazirmatn', sans-serif !important; }

      html[lang='fa'] .brand,
      html[lang='fa'] .brand-mark,
      html[lang='fa'] .section-index,
      html[lang='fa'] .footer .brand {
        font-family: var(--font-en-body, var(--font-en)), 'DM Sans', Arial, sans-serif !important;
        font-synthesis: none;
      }


    `}</style>
  );
}
