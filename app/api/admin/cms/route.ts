import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { requireAdmin, jsonError } from '@/lib/admin-api';

function parseResource(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('resource') || '';
  const [resource, ...parts] = raw.split('&');
  const params = new URLSearchParams(parts.join('&'));
  return { resource, id: params.get('id') ? Number(params.get('id')) : null };
}

// Supabase caps a response at 1,000 rows; keep larger libraries searchable.
async function readMedia(db: ReturnType<typeof getAdminSupabase>) {
  const data: Record<string,any>[] = [];
  for (let start = 0; ; start += 1000) {
    const result = await db.from('media_assets').select('*').order('created_at',{ascending:false}).order('id',{ascending:false}).range(start,start + 999);
    if (result.error) return {data:[],error:result.error};
    data.push(...(result.data || []));
    if ((result.data || []).length < 1000) return {data,error:null};
  }
}

const projectFields = [
  'brand_name',
  'bts_media_ids',
  'title_fa',
  'title_en',
  'description_fa',
  'description_en',
  'category',
  'cover_url',
  'media_url',
  'media_type',
  'preview_url',
  'preview_type',
  'preview_enabled',
  'featured',
  'published',
  'sort_order',
];

const heroFields = [
  'title_fa',
  'title_en',
  'description_fa',
  'description_en',
  'media_url',
  'media_type',
  'button_text_fa',
  'button_text_en',
  'button_url',
  'sort_order',
  'published',
];

const brandFields = ['name', 'logo_url', 'website_url', 'published', 'sort_order'];

const serviceFields = [
  'title_en',
  'title_fa',
  'description_en',
  'description_fa',
  'published',
  'sort_order',
];

const contentFields = [
  'hero_title_fa',
  'hero_title_en',
  'hero_description_fa',
  'hero_description_en',
  'hero_button_fa',
  'hero_button_en',
  'about_title_fa',
  'about_title_en',
  'about_text_fa',
  'about_text_en',
  'about_image_url',
  'contact_title_fa',
  'contact_title_en',
  'contact_email',
  'contact_phone',
  'contact_instagram',
  'personal_instagram',
  'start_project_url',
  'seo_title_fa',
  'seo_title_en',
  'seo_description_fa',
  'seo_description_en',
];

const settingsFields = [
  'bg_color',
  'text_color',
  'button_color',
  'surface_color',
  'muted_color',
  'logo_url',
  'font_en',
  'font_fa',
  'heading_size',
  'body_size',
  'small_size',
  'heading_weight',
  'body_weight',
  'letter_spacing',

  'heading_size_en',
  'heading_size_fa',
  'body_size_en',
  'body_size_fa',
  'small_size_en',
  'small_size_fa',
  'line_height_en',
  'line_height_fa',
  'letter_spacing_en',
  'letter_spacing_fa',
  'heading_color',
  'logo_color',
  'link_color',
  'nav_bg',
  'nav_text',
  'nav_active',
  'button_text',
  'button_hover',
  'card_bg',
  'card_text',
  'tag_color',
  'footer_bg',
  'footer_text',
  'border_color',

  'brands_bg',
  'brands_text',
  'brands_muted',
  'brands_hover',

  'contact_bg',
  'contact_text',
  'contact_muted',
  'contact_button',
  'contact_button_text',
];

function pick(source: Record<string, any>, fields: string[]) {
  return Object.fromEntries(fields.map(field => [field, source[field]]));
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { resource } = parseResource(request);
    const db = getAdminSupabase();

    if (resource === 'all') {
      const [
        projects,
        media,
        hero,
        brands,
        services,
        destinations,
        projectMedia,
        content,
        settings,
        fonts,
        btsMedia,
        pageTexts,
      ] = await Promise.all([
        db.from('portfolio').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true }),
        readMedia(db),
        db.from('hero_slides').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true }),
        db.from('brands').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true }),
        db.from('services').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true }),
        db.from('project_destinations').select('project_id,destination'),
        db.from('project_media').select('project_id,media_asset_id').order('sort_order', { ascending: true }),
        db.from('site_content').select('*').limit(1).maybeSingle(),
        db.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        db.from('font_assets').select('*').order('created_at', { ascending: false }),
        db.from('bts_media').select('id,media_asset_id,sort_order').order('sort_order', { ascending: true }).order('id', { ascending: true }),
        db.from('page_texts').select('*').order('page', { ascending: true }).order('sort_order', { ascending: true }).order('id', { ascending: true }),
      ]);

      const result = [projects, media, hero, brands, services, destinations, projectMedia, content, settings, fonts, btsMedia, pageTexts]
        .find(x => x.error);
      if (result?.error) throw result.error;

      const destinationMap: Record<number, string[]> = {};
      for (const row of destinations.data || []) {
        (destinationMap[row.project_id] ||= []).push(row.destination);
      }

      const projectMediaMap: Record<number, number[]> = {};
      for (const row of projectMedia.data || []) {
        if (row.media_asset_id != null) {
          (projectMediaMap[row.project_id] ||= []).push(row.media_asset_id);
        }
      }

      return NextResponse.json({
        projects: projects.data || [],
        media: media.data || [],
        hero: hero.data || [],
        brands: brands.data || [],
        services: services.data || [],
        destinations: destinationMap,
        projectMedia: projectMediaMap,
        content: content.data || null,
        settings: settings.data || null,
        fonts: fonts.data || [],
        btsMedia: btsMedia.data || [],
        pageTexts: pageTexts.data || [],
      });
    }

    if (resource === 'page-texts') {
      const result = await db
        .from('page_texts')
        .select('*')
        .order('page', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (result.error) throw result.error;

      return NextResponse.json({
        rows: result.data || [],
      });
    }

    if (resource === 'media') {
      const result = await readMedia(db);
      if (result.error) throw result.error;
      return NextResponse.json({ rows: result.data || [] });
    }

    if (resource === 'bts') {
      const result = await db
        .from('bts_media')
        .select('id,media_asset_id,sort_order')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (result.error) throw result.error;

      return NextResponse.json({
        rows: result.data || [],
      });
    }

    throw new Error('Unknown resource');
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { resource } = parseResource(request);
    const body = await request.json();
    const db = getAdminSupabase();

    if (resource === 'project-home') {
      const id = Number(body.id);
      if (!Number.isSafeInteger(id) || id <= 0 || typeof body.show !== 'boolean') throw new Error('Invalid project selection.');
      const project = await db.from('portfolio').select('id,published').eq('id',id).single();
      if (project.error) throw project.error;
      if (body.show && !project.data.published) throw new Error('Publish the project first.');
      const existing = await db.from('project_destinations').select('project_id').eq('project_id',id).eq('destination','home');
      if (existing.error) throw existing.error;
      if (body.show && !existing.data?.length) {
        const result = await db.from('project_destinations').insert({project_id:id,destination:'home'});
        if (result.error) throw result.error;
      } else if (!body.show) {
        const result = await db.from('project_destinations').delete().eq('project_id',id).eq('destination','home');
        if (result.error) throw result.error;
      }
      return NextResponse.json({ok:true});
    }

    if (resource === 'media-labels') {
      const ids = Array.isArray(body.ids) ? Array.from(new Set(body.ids.map(Number))) : [];
      if (!ids.length || ids.some(id => !Number.isSafeInteger(id) || Number(id) <= 0)) throw new Error('Choose valid media files.');
      const payload: Record<string,unknown> = {};
      for (const key of ['brand_name','project_name']) {
        if (typeof body[key] === 'string') {
          if (body[key].length > 200) throw new Error('Labels must be 200 characters or fewer.');
          payload[key] = body[key].trim();
        }
      }
      if (Array.isArray(body.destinations)) {
        if (body.destinations.some((value:unknown) => !['film','photography','content','bts'].includes(String(value)))) throw new Error('Invalid section.');
        payload.destinations = Array.from(new Set(body.destinations));
      }
      for (const key of ['published','show_on_home']) if (typeof body[key] === 'boolean') payload[key] = body[key];
      if (!Object.keys(payload).length) throw new Error('Enter labels or placement.');
      if (payload.show_on_home === true) {
        const existing = await db.from('media_assets').select('id,destinations,published').in('id',ids);
        if (existing.error) throw existing.error;
        if ((existing.data || []).some(row => !(payload.published ?? row.published) || !(payload.destinations as string[] ?? row.destinations)?.length)) throw new Error('Publish the files and choose a section before showing them on the homepage.');
      }
      const result = await db.from('media_assets').update(payload).in('id',ids).select('*');
      if (result.error) throw result.error;
      return NextResponse.json({rows:result.data || []});
    }

    if (resource === 'page-texts') {
      const rows = Array.isArray(body.rows) ? body.rows : [];

      const payload = rows
        .map((row: Record<string, any>) => ({
          id: Number(row.id),
          page: String(row.page || '').trim(),
          text_key: String(row.text_key || '').trim(),
          label: row.label == null ? null : String(row.label),
          value_en: String(row.value_en ?? ''),
          value_fa: String(row.value_fa ?? ''),
          sort_order: Number.isFinite(Number(row.sort_order))
            ? Number(row.sort_order)
            : 0,
          updated_at: new Date().toISOString(),
        }))
        .filter(
          (row: Record<string, any>) =>
            Number.isFinite(row.id) &&
            row.id > 0 &&
            row.page &&
            row.text_key
        );

      if (payload.length !== rows.length) {
        throw new Error('Invalid page text rows');
      }

      for (const row of payload) {
        const { id, ...updates } = row;

        const result = await db
          .from('page_texts')
          .update(updates)
          .eq('id', id);

        if (result.error) throw result.error;
      }

      const result = await db
        .from('page_texts')
        .select('*')
        .order('page', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (result.error) throw result.error;

      return NextResponse.json({
        rows: result.data || [],
      });
    }

    if (resource === 'bts') {
      if (!Array.isArray(body.mediaIds)) throw new Error('Missing media selection.');
      const mediaIds: number[] = body.mediaIds.map((value: unknown) => Number(value));
      if (mediaIds.some(value => !Number.isSafeInteger(value) || value <= 0)) {
        throw new Error('Invalid media selection.');
      }
      const uniqueMediaIds = Array.from(new Set(mediaIds));
      if (uniqueMediaIds.length) {
        const assets = await db.from('media_assets').select('id').in('id', uniqueMediaIds);
        if (assets.error) throw assets.error;
        if ((assets.data || []).length !== uniqueMediaIds.length) {
          throw new Error('One or more selected files no longer exist. Refresh the media library.');
        }
      }
      const existing = await db.from('bts_media').select('id,media_asset_id');
      if (existing.error) throw existing.error;
      const byAsset = new Map<number, { id: number; media_asset_id: number }>();
      for (const row of existing.data || []) {
        if (!byAsset.has(row.media_asset_id)) byAsset.set(row.media_asset_id, row);
      }
      const additions = uniqueMediaIds.filter(id => !byAsset.has(id));
      // Additions must succeed before any previous selection is removed.
      if (additions.length) {
        const inserted = await db.from('bts_media').insert(additions.map(media_asset_id => ({
          media_asset_id, sort_order: uniqueMediaIds.indexOf(media_asset_id),
        })));
        if (inserted.error) throw inserted.error;
      }
      const retained = uniqueMediaIds.filter(id => byAsset.has(id)).map(media_asset_id => ({
        id: byAsset.get(media_asset_id)!.id, media_asset_id,
        sort_order: uniqueMediaIds.indexOf(media_asset_id),
      }));
      if (retained.length) {
        const reordered = await db.from('bts_media').upsert(retained, { onConflict: 'id' });
        if (reordered.error) throw reordered.error;
      }
      const removals = (existing.data || []).filter(row =>
        !uniqueMediaIds.includes(row.media_asset_id) || byAsset.get(row.media_asset_id)?.id !== row.id
      ).map(row => row.id);
      if (removals.length) {
        const removed = await db.from('bts_media').delete().in('id', removals);
        if (removed.error) throw removed.error;
      }

      const result = await db
        .from('bts_media')
        .select('id,media_asset_id,sort_order')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      if (result.error) throw result.error;

      return NextResponse.json({
        rows: result.data || [],
      });
    }

    if (resource === 'projects') {
      const raw = body.row || {};
      const payload = pick(raw, projectFields);
      const id = Number(raw.id || 0);
      if (payload.bts_media_ids != null) {
        if (!Array.isArray(payload.bts_media_ids) || payload.bts_media_ids.some((value:unknown) => !Number.isSafeInteger(value) || Number(value) <= 0)) return NextResponse.json({error:'Invalid behind-the-scenes files.'},{status:400});
        payload.bts_media_ids = Array.from(new Set(payload.bts_media_ids));
        if (payload.bts_media_ids.length) {const assets = await db.from('media_assets').select('id').in('id',payload.bts_media_ids);if (assets.error) throw assets.error;if (assets.data?.length !== payload.bts_media_ids.length) return NextResponse.json({error:'A behind-the-scenes file no longer exists.'},{status:400});}
      }

      const result = id > 0
        ? await db.from('portfolio').update(payload).eq('id', id).select().single()
        : await db.from('portfolio').insert(payload).select().single();

      if (result.error) throw result.error;

      const projectId = result.data.id;

      const destinations = Array.isArray(body.destinations) ? body.destinations : [];
      const mediaIds = Array.isArray(body.mediaIds) ? body.mediaIds : [];

      const d = await db.from('project_destinations').delete().eq('project_id', projectId);
      if (d.error) throw d.error;
      if (destinations.length) {
        const insert = await db.from('project_destinations').insert(
          destinations.map((destination: string) => ({ project_id: projectId, destination })),
        );
        if (insert.error) throw insert.error;
      }

      const pm = await db.from('project_media').delete().eq('project_id', projectId);
      if (pm.error) throw pm.error;
      if (mediaIds.length) {
        const insert = await db.from('project_media').insert(
          mediaIds.map((media_asset_id: number, index: number) => ({
            project_id: projectId,
            media_asset_id,
            role: index === 0 ? 'primary' : 'gallery',
            sort_order: index,
          })),
        );
        if (insert.error) throw insert.error;
      }

      return NextResponse.json({ row: result.data, id: projectId });
    }

    if (resource === 'hero') {
      const raw = body.row || {};
      const payload = pick(raw, heroFields);
      const id = Number(raw.id || 0);
      const result = id > 0
        ? await db.from('hero_slides').update(payload).eq('id', id).select().single()
        : await db.from('hero_slides').insert(payload).select().single();
      if (result.error) throw result.error;
      return NextResponse.json({ row: result.data });
    }

    if (resource === 'brands') {
      const raw = body.row || {};
      const payload = pick(raw, brandFields);
      const id = Number(raw.id || 0);
      const result = id > 0
        ? await db.from('brands').update(payload).eq('id', id).select().single()
        : await db.from('brands').insert(payload).select().single();
      if (result.error) throw result.error;
      return NextResponse.json({ row: result.data });
    }

    if (resource === 'services') {
      const raw = body.row || {};
      const payload = pick(raw, serviceFields);
      const id = Number(raw.id || 0);
      const result = id > 0
        ? await db.from('services').update(payload).eq('id', id).select().single()
        : await db.from('services').insert(payload).select().single();
      if (result.error) throw result.error;
      return NextResponse.json({ row: result.data });
    }

    if (resource === 'content') {
      const payload = pick(body.row || {}, contentFields);
      const existing = await db.from('site_content').select('id').limit(1).maybeSingle();
      if (existing.error) throw existing.error;

      const result = existing.data?.id
        ? await db.from('site_content').update(payload).eq('id', existing.data.id).select().single()
        : await db.from('site_content').insert(payload).select().single();

      if (result.error) throw result.error;
      return NextResponse.json({ row: result.data });
    }

    if (resource === 'settings') {
      const payload = pick(body.row || {}, settingsFields);

      const result = await db
        .from('site_settings')
        .update(payload)
        .eq('id', 1)
        .select()
        .single();

      if (result.error) throw result.error;

      return NextResponse.json({ row: result.data });
    }

    throw new Error('Unknown resource');
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const { resource, id } = parseResource(request);
    if (!id) throw new Error('Missing id');

    const db = getAdminSupabase();

    if (resource === 'projects') {
      for (const table of ['project_destinations', 'project_media', 'project_seo', 'project_social']) {
        const result = await db.from(table).delete().eq('project_id', id);
        if (result.error) throw result.error;
      }
      const result = await db.from('portfolio').delete().eq('id', id);
      if (result.error) throw result.error;
      return NextResponse.json({ ok: true });
    }

    if (resource === 'hero') {
      const result = await db.from('hero_slides').delete().eq('id', id);
      if (result.error) throw result.error;
      return NextResponse.json({ ok: true });
    }

    if (resource === 'brands') {
      const result = await db.from('brands').delete().eq('id', id);
      if (result.error) throw result.error;
      return NextResponse.json({ ok: true });
    }

    if (resource === 'services') {
      const result = await db.from('services').delete().eq('id', id);
      if (result.error) throw result.error;
      return NextResponse.json({ ok: true });
    }

    throw new Error('Unknown resource');
  } catch (error) {
    return jsonError(error);
  }
}
