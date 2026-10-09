import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { isVideoAsset, localizedValue } from '@/lib/media';

export const dynamic = 'force-dynamic';

export async function GET(request:NextRequest) {
  try {
    const db = getAdminSupabase();
    const homeOnly = request.nextUrl.searchParams.get('home') === '1';
    const [links, destinations, homeLinks] = await Promise.all([
      db.from('bts_media').select('id,media_asset_id,sort_order').order('sort_order').order('id'),
      db.from('project_destinations').select('project_id').eq('destination', 'bts'),
      db.from('project_destinations').select('project_id').eq('destination','home'),
    ]);
    if (links.error) throw links.error;
    if (destinations.error) throw destinations.error;
    if (homeLinks.error) throw homeLinks.error;
    const homeIds = new Set((homeLinks.data || []).map(row => row.project_id));

    let projectIds = Array.from(new Set((destinations.data || []).map(row => row.project_id)));
    if (homeOnly) projectIds = projectIds.filter(id => homeIds.has(id));
    let directQuery = db.from('media_assets').select('*').eq('published',true).contains('destinations',['bts']).order('created_at',{ascending:false});
    if (homeOnly) directQuery = directQuery.eq('show_on_home',true);
    const direct = await directQuery;
    if (direct.error) throw direct.error;
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
      ? await db.from('media_assets').select('*').in('id', mediaIds)
      : { data: [], error: null };
    if (assetsResult.error) throw assetsResult.error;
    const assetMap = new Map((assetsResult.data || []).map(asset => [asset.id, asset]));
    const seen = new Set<string>();
    const items: {
      id: number; media_asset_id: number | null; name: string; file_url: string;
      file_type: string | null; mime_type: string | null; alt_text_en: string | null;
      alt_text_fa: string | null; sort_order: number; kind: 'video' | 'photo'; brand_name: string | null; project_name: string | null; show_on_home:boolean;
    }[] = [];
    const add = (id: number, asset: {
      show_on_home?: boolean; brand_name?: string | null; project_name?: string | null; id?: number; name: string; file_url: string; file_type?: string | null;
      mime_type?: string | null; alt_text_en?: string | null; alt_text_fa?: string | null;
    }) => {
      if (!asset.file_url || seen.has(asset.file_url)) return;
      seen.add(asset.file_url);
      items.push({
        show_on_home:!!asset.show_on_home, brand_name:asset.brand_name || null, project_name:asset.project_name || null, id, media_asset_id: asset.id ?? null, name: asset.name, file_url: asset.file_url,
        file_type: asset.file_type || null, mime_type: asset.mime_type || null,
        alt_text_en: asset.alt_text_en || null, alt_text_fa: asset.alt_text_fa || null,
        sort_order: items.length, kind: isVideoAsset(asset) ? 'video' : 'photo',
      });
    };
    // Independent selections retain their order and win when the same file is reused.
    for (const row of links.data || []) {
      const asset = assetMap.get(row.media_asset_id);
      if (asset && (!homeOnly || asset.show_on_home)) add(row.id, {...asset,name:asset.project_name || asset.name});
    }
    for (const asset of direct.data || []) add(-asset.id, {...asset, name:asset.project_name || asset.name, alt_text_en:[asset.brand_name,asset.project_name].filter(Boolean).join(' · ') || asset.alt_text_en});
    // A project's BTS destination exposes its main file and gallery, never drafts.
    for (const project of projects) {
      const projectAssets = attached.filter(row => row.project_id === project.id);
      const urls = Array.from(new Set<string>([
        project.media_url,
        ...(!project.media_url && !projectAssets.length ? [project.cover_url] : []),
      ].filter((url): url is string => typeof url === 'string' && !!url)));
      urls.forEach((file_url, index) => add(-(project.id * 1_000_000 + index + 1), {
        show_on_home:homeIds.has(project.id), name: localizedValue('en', project.title_en, project.title_fa, 'Behind the scenes'),
        file_url, file_type: file_url === project.media_url ? project.media_type : null,
        alt_text_en: project.title_en, alt_text_fa: project.title_fa,
      }));
      for (const row of projectAssets) {
        const asset = assetMap.get(row.media_asset_id);
        if (asset) add(-asset.id, {...asset,show_on_home:asset.show_on_home || homeIds.has(project.id)});
      }
    }
    items.sort((a,b) => Number(b.show_on_home) - Number(a.show_on_home));
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
