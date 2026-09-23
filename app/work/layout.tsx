import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Selected Work',
  description:
    'Explore selected NURANICO film, photography and content production projects.',
  alternates: {
    canonical: '/work',
  },
  openGraph: {
    title: 'Selected Work | NURANICO',
    description:
      'Explore selected NURANICO film, photography and content production projects.',
    url: '/work',
    type: 'website',
  },
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
