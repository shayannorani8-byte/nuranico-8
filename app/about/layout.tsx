import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about NURANICO, a creative studio focused on film, photography and content production.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About | NURANICO',
    description:
      'Learn about NURANICO, a creative studio focused on film, photography and content production.',
    url: '/about',
    type: 'website',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
