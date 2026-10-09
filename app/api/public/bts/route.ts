import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { isVideoAsset, localizedValue } from '@/lib/media';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getAdminSupabase();
    const [links, destinations] = await Promise.all([
      db.from('bts_media').select('id,media_asset_id,sort_order').order('sort_order').order('id'),
      db.from('project_destinations').select('project_id').eq('destination', 'bts'),
    ]);
    if (links.error) throw links.error;
    if (destinations.error) throw destinations.error;

    const projectIds = Array.from(new Set((destinations.data || []).map(row => row.project_id)));
    const projectsResult = projectIds.length
      ? await db.from('portfolio').select('id,title_en,title_fa,media_url,media_type,cover_url').in('id', projectIds).eq('published', true).order('sort_order').order('id')
      : { data: [], error: null };
    if (projectsResult.error) throw projectsResult.error;
    const projects = projectsResult.data || [];
    const attachedResult = projects.length
      ? await db.from('project_media').select('project_id,media_asset_id,sort_order').in('project_id', projects.map(project => project.id)).order('sort_order').order('media_asset_id')
      : { data: [], error: null };
    if (attachedResult.error) throw attachedResult.error;
    const attached = attachedResult.data || [];
    const mediaIds = Array.from(new Set([
      ...(links.data || []).map(row => row.media_asset_id),
      ...attached.map(row => row.media_asset_id),
    ]));
    const assetsResult = mediaIds.length
      ? await db.from('media_assets').select('id,name,file_url,file_type,mime_type,alt_text_en,alt_text_fa').in('id', mediaIds)
      : { data: [], error: null };
    if (assetsResult.error) throw assetsResult.error;
    const assetMap = new Map((assetsResult.data || []).map(asset => [asset.id, asset]));
    const seen = new Set<string>();
    const items: {
      id: number; media_asset_id: number | null; name: string; file_url: string;
      file_type: string | null; mime_type: string | null; alt_text_en: string | null;
      alt_text_fa: string | null; sort_order: number; kind: 'video' | 'photo';
    }[] = [];
    const add = (id: number, asset: {
      id?: number; name: string; file_url: string; file_type?: string | null;
      mime_type?: string | null; alt_text_en?: string | null; alt_text_fa?: string | null;
    }) => {
      if (!asset.file_url || seen.has(asset.file_url)) return;
      seen.add(asset.file_url);
      items.push({
        id, media_asset_id: asset.id ?? null, name: asset.name, file_url: asset.file_url,
        file_type: asset.file_type || null, mime_type: asset.mime_type || null,
        alt_text_en: asset.alt_text_en || null, alt_text_fa: asset.alt_text_fa || null,
        sort_order: items.length, kind: isVideoAsset(asset) ? 'video' : 'photo',
      });
    };
    // Independent selections retain their order and win when the same file is reused.
    for (const row of links.data || []) {
      const asset = assetMap.get(row.media_asset_id);
      if (asset) add(row.id, asset);
    }
    // A project's BTS destination exposes its main file and gallery, never drafts.
    for (const project of projects) {
      const projectAssets = attached.filter(row => row.project_id === project.id);
      const urls = Array.from(new Set<string>([
        project.media_url,
        ...(!project.media_url && !projectAssets.length ? [project.cover_url] : []),
      ].filter((url): url is string => typeof url === 'string' && !!url)));
      urls.forEach((file_url, index) => add(-(project.id * 1_000_000 + index + 1), {
        name: localizedValue('en', project.title_en, project.title_fa, 'Behind the scenes'),
        file_url, file_type: file_url === project.media_url ? project.media_type : null,
        alt_text_en: project.title_en, alt_text_fa: project.title_fa,
      }));
      for (const row of projectAssets) {
        const asset = assetMap.get(row.media_asset_id);
        if (asset) add(-asset.id, asset);
      }
    }
    return NextResponse.json({
      items,
      photos: items.filter(item => item.kind === 'photo'),
      videos: items.filter(item => item.kind === 'video'),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Public BTS API error:', error);
    return NextResponse.json({
      items: [], photos: [], videos: [],
      error: error instanceof Error ? error.message : 'Could not load BTS',
    }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
