import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creative Services',
  description:
    'Film, teasers, photography and content production services by NURANICO.',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Creative Services | NURANICO',
    description:
      'Film, teasers, photography and content production services by NURANICO.',
    url: '/services',
    type: 'website',
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
