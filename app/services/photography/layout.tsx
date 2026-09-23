import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photography',
  description:
    'Commercial, campaign and product photography by NURANICO.',
  alternates: {
    canonical: '/services/photography',
  },
  openGraph: {
    title: 'Photography | NURANICO',
    description:
      'Commercial, campaign and product photography by NURANICO.',
    url: '/services/photography',
    type: 'website',
  },
};

export default function PhotographyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
