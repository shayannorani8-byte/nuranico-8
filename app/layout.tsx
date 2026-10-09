import './globals.css';
import './home.css';
import './work/project.css';
import './content-page.css';
import './site-refinements.css';

import type { Metadata } from 'next';

import GlobalTypography from '../components/GlobalTypography';
import CMSRealtime from '../components/CMSRealtime';
import { SiteLanguage } from '../components/SiteLanguage';
import { SiteData } from '../components/SiteData';
import { getSiteTypography } from '../lib/site-typography';
import { getAdminSupabase } from '../lib/supabase-admin';

const SITE_URL = 'https://nuranico.com';
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const fallbackTitle = 'NURANICO — Creative Studio';
  const fallbackDescription =
    'NURANICO is a creative studio specializing in film, teasers, photography and content production.';

  let title = fallbackTitle;
  let description = fallbackDescription;

  try {
    const db = getAdminSupabase();

    const { data, error } = await db
      .from('site_content')
      .select(
        'seo_title_en,seo_title_fa,seo_description_en,seo_description_fa'
      )
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Root SEO load failed:', error);
    } else if (data) {
      title =
        data.seo_title_en?.trim() ||
        data.seo_title_fa?.trim() ||
        fallbackTitle;

      description =
        data.seo_description_en?.trim() ||
        data.seo_description_fa?.trim() ||
        fallbackDescription;
    }
  } catch (error) {
    console.error('Root SEO metadata failed:', error);
  }

  return {
    metadataBase: new URL(SITE_URL),

    title: {
      default: title,
      template: '%s | NURANICO',
    },

    description,

    applicationName: 'NURANICO',

    alternates: {
      canonical: '/',
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    openGraph: {
      type: 'website',
      url: SITE_URL,
      siteName: 'NURANICO',
      title,
      description,
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const typography = await getSiteTypography();
  const selectedFonts = typography.fonts.filter(font =>
    [typography.settings.font_en, typography.settings.font_fa].includes(font.family_name)
  );
  return (
    <html lang="en" dir="ltr" data-scroll-behavior="smooth">
      <head>
        <link rel="preload" href="/fonts/DM-Sans.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Vazirmatn.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        {selectedFonts.map(font => <link key={font.id} rel="preload" href={font.file_url} as="font" crossOrigin="anonymous" />)}
        <GlobalTypography {...typography} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://nuranico.com/#organization',
                  name: 'NURANICO',
                  url: 'https://nuranico.com',
                  description:
                    'Creative studio specializing in film, teasers, photography and content production.',
                  sameAs: [
                    'https://instagram.com/nuranico',
                    'https://instagram.com/shayannourani',
                  ],
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://nuranico.com/#website',
                  url: 'https://nuranico.com',
                  name: 'NURANICO',
                  publisher: {
                    '@id': 'https://nuranico.com/#organization',
                  },
                  inLanguage: ['en', 'fa'],
                },
              ],
            }),
          }}
        />

        <SiteData data={typography}>
          <SiteLanguage>
            <CMSRealtime />
            {children}
          </SiteLanguage>
        </SiteData>
      </body>
    </html>
  );
}
