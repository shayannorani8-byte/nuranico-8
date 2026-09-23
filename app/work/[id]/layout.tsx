import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://nuranico.com';

type Props = {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
};

type MetadataProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { id } = await params;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY;

  const canonical = `/work/${id}`;

  if (!url || !key) {
    return {
      title: 'Project',
      alternates: {
        canonical,
      },
    };
  }

  try {
    const supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: project, error } = await supabase
      .from('portfolio')
      .select(
        'id,title_en,title_fa,description_en,description_fa,cover_url,published'
      )
      .eq('id', id)
      .eq('published', true)
      .maybeSingle();

    if (error || !project) {
      return {
        title: 'Project',
        alternates: {
          canonical,
        },
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title =
      project.title_en ||
      project.title_fa ||
      'NURANICO Project';

    const description =
      project.description_en ||
      project.description_fa ||
      `${title} — a creative project by NURANICO.`;

    const image =
      project.cover_url || undefined;

    return {
      title,

      description,

      alternates: {
        canonical,
      },

      openGraph: {
        type: 'article',
        url: `${SITE_URL}${canonical}`,
        siteName: 'NURANICO',
        title: `${title} | NURANICO`,
        description,
        ...(image
          ? {
              images: [
                {
                  url: image,
                  alt: title,
                },
              ],
            }
          : {}),
      },

      twitter: {
        card: 'summary_large_image',
        title: `${title} | NURANICO`,
        description,
        ...(image
          ? {
              images: [image],
            }
          : {}),
      },

      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error(
      'Project metadata generation failed:',
      error
    );

    return {
      title: 'Project',
      alternates: {
        canonical,
      },
    };
  }
}

export default async function ProjectLayout({
  children,
}: Props) {
  return children;
}
