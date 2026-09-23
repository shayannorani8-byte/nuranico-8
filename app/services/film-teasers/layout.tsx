import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Film & Teasers',
  description:
    'Film and teaser production by NURANICO for brands, products and advertising campaigns.',
  alternates: {
    canonical: '/services/film-teasers',
  },
  openGraph: {
    title: 'Film & Teasers | NURANICO',
    description:
      'Film and teaser production by NURANICO for brands, products and advertising campaigns.',
    url: '/services/film-teasers',
    type: 'website',
  },
};

export default function FilmTeasersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
