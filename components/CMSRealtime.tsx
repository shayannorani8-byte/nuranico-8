'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const TABLES = [
  'site_settings',
  'site_content',
  'portfolio',
  'brands',
  'services',
  'font_assets',
  'media_assets',
];

export default function CMSRealtime() {
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
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
  }, []);

  return null;
}
