import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Behind the Scenes',
  description:
    'Behind the scenes of NURANICO film, photography and creative productions.',
  alternates: {
    canonical: '/work/behind-the-scenes',
  },
  openGraph: {
    type: 'website',
    url: 'https://nuranico.com/work/behind-the-scenes',
    title: 'Behind the Scenes | NURANICO',
    description:
      'Behind the scenes of NURANICO film, photography and creative productions.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Behind the Scenes | NURANICO',
    description:
      'Behind the scenes of NURANICO film, photography and creative productions.',
  },
};

export default function BehindTheScenesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
