import './globals.css';
import './home.css';
import './work/project.css';
import './content-page.css';
import type { Metadata } from 'next';
import GlobalTypography from '../components/GlobalTypography';
import CMSRealtime from '../components/CMSRealtime';

export const metadata: Metadata = {
  title: 'NURANICO — Creative Studio',
  description: 'NURANICO creative studio portfolio.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body><GlobalTypography /><CMSRealtime />{children}</body>
    </html>
  );
}
