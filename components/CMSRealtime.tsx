'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';

const TABLES = [
  'site_settings',
  'site_content',
  'portfolio',
  'brands',
  'services',
  'font_assets',
  'media_assets',
  'page_texts',
  'hero_slides',
  'project_destinations',
  'project_media',
  'bts_media',
];

export default function CMSRealtime() {
  const pathname = usePathname();
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reload published pages only. A reload in the CMS would discard unsaved edits.
    if (pathname.startsWith('/admin')) return;
    const scheduleReload = () => {
      if (reloadTimer.current) {
        clearTimeout(reloadTimer.current);
      }

      reloadTimer.current = setTimeout(() => {
        window.location.reload();
      }, 350);
    };

    const channel = supabase.channel('nuranico-cms-live');

    TABLES.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        scheduleReload
      );
    });

    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.error('NURANICO CMS realtime channel error');
      }

      if (status === 'TIMED_OUT') {
        console.error('NURANICO CMS realtime channel timed out');
      }
    });

    return () => {
      if (reloadTimer.current) {
        clearTimeout(reloadTimer.current);
      }

      void supabase.removeChannel(channel);
    };
  }, [pathname]);

  return null;
}
