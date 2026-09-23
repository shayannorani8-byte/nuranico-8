import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Production',
  description:
    'Creative content production for brands, campaigns and digital platforms by NURANICO.',
  alternates: {
    canonical: '/services/content',
  },
  openGraph: {
    title: 'Content Production | NURANICO',
    description:
      'Creative content production for brands, campaigns and digital platforms by NURANICO.',
    url: '/services/content',
    type: 'website',
  },
};

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
