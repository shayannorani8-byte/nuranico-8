import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact NURANICO to discuss film, photography, content production and creative projects.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact | NURANICO',
    description:
      'Contact NURANICO to discuss film, photography, content production and creative projects.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
