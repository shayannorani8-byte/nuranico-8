import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { requireAdmin, jsonError } from '@/lib/admin-api';

function parseResource(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('resource') || '';
  const [resource, ...parts] = raw.split('&');
  const params = new URLSearchParams(parts.join('&'));
  return { resource, id: params.get('id') ? Number(params.get('id')) : null };
}

const projectFields = [
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
        db.from('media_assets').select('*').order('created_at', { ascending: false }),
        db.from('hero_slides').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true }),
        db.from('brands').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true }),
        db.from('services').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true }),
        db.from('project_destinations').select('project_id,destination'),
        db.from('project_media').select('project_id,media_asset_id'),
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
      const result = await db.from('media_assets').select('*').order('created_at', { ascending: false });
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
      const mediaIds = Array.isArray(body.mediaIds)
        ? body.mediaIds
            .map((value: unknown) => Number(value))
            .filter((value: number) => Number.isFinite(value) && value > 0)
        : [];

      const uniqueMediaIds = Array.from(new Set(mediaIds));

      const clearResult = await db
        .from('bts_media')
        .delete()
        .neq('id', 0);

      if (clearResult.error) throw clearResult.error;

      if (uniqueMediaIds.length) {
        const insertResult = await db
          .from('bts_media')
          .insert(
            uniqueMediaIds.map((media_asset_id, index) => ({
              media_asset_id,
              sort_order: index,
            }))
          );

        if (insertResult.error) throw insertResult.error;
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
