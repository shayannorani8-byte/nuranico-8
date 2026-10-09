import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { SiteBootstrap } from '../components/SiteData';

export async function getSiteTypography(): Promise<SiteBootstrap> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (!url || !key) return { settings: {}, fonts: [], content: {}, pageTexts: [] };
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store', signal: init?.signal || AbortSignal.timeout(5000) }) },
  });
  try {
    const [settings, fonts, content, pageTexts] = await Promise.all([
      db.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      db.from('font_assets').select('id,family_name,file_url,format,font_weight,font_style').order('id'),
      db.from('site_content').select('*').limit(1).maybeSingle(),
      db.from('page_texts').select('id,page,text_key,label,value_en,value_fa,sort_order').order('sort_order'),
    ]);
    if (settings.error || fonts.error) console.error('Site typography could not be fully loaded');
    return { settings: settings.data || {}, fonts: fonts.data || [], content: content.data || {}, pageTexts: pageTexts.data || [] };
  } catch {
    return { settings: {}, fonts: [], content: {}, pageTexts: [] };
  }
}
