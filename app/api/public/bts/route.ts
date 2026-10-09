import { readPublicRows } from "@/lib/read-public-rows";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase-admin";
import { isVideoAsset, localizedValue } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getAdminSupabase();
    const homeOnly = request.nextUrl.searchParams.get("home") === "1";
    const [links, destinations, homeLinks] = await Promise.all([
      readPublicRows((from, to) =>
        db
          .from("bts_media")
          .select("id,media_asset_id,sort_order")
          .order("sort_order")
          .order("id")
          .range(from, to),
      ),
      readPublicRows((from, to) =>
        db
          .from("project_destinations")
          .select("project_id")
          .eq("destination", "bts")
          .order("project_id")
          .range(from, to),
      ),
      readPublicRows((from, to) =>
        db
          .from("project_destinations")
          .select("project_id")
          .eq("destination", "home")
          .order("project_id")
          .range(from, to),
      ),
    ]);
    if (links.error) throw links.error;
    if (destinations.error) throw destinations.error;
    if (homeLinks.error) throw homeLinks.error;
    const homeIds = new Set(
      (homeLinks.data || []).map((row) => row.project_id),
    );

    let projectIds = Array.from(
      new Set((destinations.data || []).map((row) => row.project_id)),
    );
    if (homeOnly) projectIds = projectIds.filter((id) => homeIds.has(id));
    let directQuery = db
      .from("media_assets")
      .select("*")
      .eq("published", true)
      .contains("destinations", ["bts"])
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    if (homeOnly) directQuery = directQuery.eq("show_on_home", true);
    const direct = await readPublicRows((from, to) =>
      directQuery.range(from, to),
    );
    if (direct.error) throw direct.error;
    const projectsResult = await readPublicRows((from, to) =>
      db
        .from("portfolio")
        .select(
          "id,title_en,title_fa,media_url,media_type,cover_url,brand_name,bts_media_ids",
        )
        .eq("published", true)
        .order("sort_order")
        .order("id")
        .range(from, to),
    );
    if (projectsResult.error) throw projectsResult.error;
    const projects = (projectsResult.data || []).filter(
      (project) =>
        (projectIds.includes(project.id) || project.bts_media_ids?.length) &&
        (!homeOnly || homeIds.has(project.id)),
    );
    const attachedResult = projects.length
      ? await readPublicRows((from, to) =>
          db
            .from("project_media")
            .select("project_id,media_asset_id,sort_order")
            .in(
              "project_id",
              projects.map((project) => project.id),
            )
            .order("project_id")
            .order("sort_order")
            .order("media_asset_id")
            .range(from, to),
        )
      : { data: [], error: null };
    if (attachedResult.error) throw attachedResult.error;
    const attached = attachedResult.data || [];
    const mediaIds = Array.from(
      new Set([
        ...(links.data || []).map((row) => row.media_asset_id),
        ...attached.map((row) => row.media_asset_id),
        ...projects.flatMap((project) => project.bts_media_ids || []),
      ]),
    );
    const assetMap = new Map<number, any>();
    for (let start = 0; start < mediaIds.length; start += 200) {
      const result = await db
        .from("media_assets")
        .select("*")
        .in("id", mediaIds.slice(start, start + 200));
      if (result.error) throw result.error;
      for (const asset of result.data || []) assetMap.set(asset.id, asset);
    }
    const seen = new Set<string>();
    const items: {
      id: number;
      media_asset_id: number | null;
      name: string;
      file_url: string;
      file_type: string | null;
      mime_type: string | null;
      alt_text_en: string | null;
      alt_text_fa: string | null;
      sort_order: number;
      kind: "video" | "photo";
      brand_name: string | null;
      project_name: string | null;
      show_on_home: boolean;
      project_id?: number;
      project_title_en?: string | null;
      project_title_fa?: string | null;
    }[] = [];
    const add = (
      id: number,
      asset: {
        project_id?: number;
        project_title_en?: string | null;
        project_title_fa?: string | null;
        show_on_home?: boolean;
        brand_name?: string | null;
        project_name?: string | null;
        id?: number;
        name: string;
        file_url: string;
        file_type?: string | null;
        mime_type?: string | null;
        alt_text_en?: string | null;
        alt_text_fa?: string | null;
      },
    ) => {
      if (!asset.file_url) return;
      if (seen.has(asset.file_url)) {
        if (asset.project_id) {
          const existing = items.find(
            (item) => item.file_url === asset.file_url,
          );
          if (existing)
            Object.assign(existing, {
              project_id: asset.project_id,
              project_title_en: asset.project_title_en,
              project_title_fa: asset.project_title_fa,
              project_name: asset.project_name || existing.project_name,
              brand_name: asset.brand_name || existing.brand_name,
            });
        }
        return;
      }
      seen.add(asset.file_url);
      items.push({
        project_id: asset.project_id,
        project_title_en: asset.project_title_en,
        project_title_fa: asset.project_title_fa,
        show_on_home: !!asset.show_on_home,
        brand_name: asset.brand_name || null,
        project_name: asset.project_name || null,
        id,
        media_asset_id: asset.id ?? null,
        name: asset.name,
        file_url: asset.file_url,
        file_type: asset.file_type || null,
        mime_type: asset.mime_type || null,
        alt_text_en: asset.alt_text_en || null,
        alt_text_fa: asset.alt_text_fa || null,
        sort_order: items.length,
        kind: isVideoAsset(asset) ? "video" : "photo",
      });
    };
    // Independent selections retain their order and win when the same file is reused.
    for (const row of links.data || []) {
      const asset = assetMap.get(row.media_asset_id);
      if (asset && (!homeOnly || asset.show_on_home))
        add(row.id, { ...asset, name: asset.project_name || asset.name });
    }
    for (const asset of direct.data || [])
      add(-asset.id, {
        ...asset,
        name: asset.project_name || asset.name,
        alt_text_en:
          [asset.brand_name, asset.project_name].filter(Boolean).join(" · ") ||
          asset.alt_text_en,
      });
    // A project's BTS destination exposes its main file and gallery, never drafts.
    for (const project of projects) {
      if (project.bts_media_ids != null) {
        for (const mediaId of project.bts_media_ids) {
          const asset = assetMap.get(mediaId);
          if (asset)
            add(-asset.id, {
              ...asset,
              project_id: project.id,
              project_title_en: project.title_en,
              project_title_fa: project.title_fa,
              brand_name: project.brand_name || asset.brand_name,
              project_name: project.title_en || project.title_fa,
              name: project.title_en || project.title_fa,
              alt_text_en: project.title_en,
              alt_text_fa: project.title_fa,
              show_on_home: homeIds.has(project.id),
            });
        }
        continue;
      }
      const projectAssets = attached.filter(
        (row) => row.project_id === project.id,
      );
      const urls = Array.from(
        new Set<string>(
          [
            project.media_url,
            ...(!project.media_url && !projectAssets.length
              ? [project.cover_url]
              : []),
          ].filter((url): url is string => typeof url === "string" && !!url),
        ),
      );
      urls.forEach((file_url, index) =>
        add(-(project.id * 1_000_000 + index + 1), {
          project_id: project.id,
          project_title_en: project.title_en,
          project_title_fa: project.title_fa,
          brand_name: project.brand_name,
          project_name: project.title_en || project.title_fa,
          show_on_home: homeIds.has(project.id),
          name: localizedValue(
            "en",
            project.title_en,
            project.title_fa,
            "Behind the scenes",
          ),
          file_url,
          file_type: file_url === project.media_url ? project.media_type : null,
          alt_text_en: project.title_en,
          alt_text_fa: project.title_fa,
        }),
      );
      for (const row of projectAssets) {
        const asset = assetMap.get(row.media_asset_id);
        if (asset)
          add(-asset.id, {
            ...asset,
            project_id: project.id,
            project_title_en: project.title_en,
            project_title_fa: project.title_fa,
            brand_name: project.brand_name,
            project_name: project.title_en || project.title_fa,
            show_on_home: asset.show_on_home || homeIds.has(project.id),
          });
      }
    }
    items.sort((a, b) => Number(b.show_on_home) - Number(a.show_on_home));
    return NextResponse.json(
      {
        items,
        photos: items.filter((item) => item.kind === "photo"),
        videos: items.filter((item) => item.kind === "video"),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Public BTS API error:", error);
    return NextResponse.json(
      {
        items: [],
        photos: [],
        videos: [],
        error: "Could not load BTS",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
