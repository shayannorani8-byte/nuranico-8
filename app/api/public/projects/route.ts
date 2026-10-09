import { NextRequest, NextResponse } from "next/server";
import { readPublicRows } from "@/lib/read-public-rows";
import { isVideoAsset } from "@/lib/media";
import { getAdminSupabase } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const allowed = new Set([
  "all",
  "home",
  "work",
  "film",
  "photography",
  "content",
  "featured",
  "bts",
]);

export async function GET(request: NextRequest) {
  try {
    const destination = request.nextUrl.searchParams.get("destination") || "";

    if (!allowed.has(destination)) {
      return NextResponse.json(
        { items: [], error: "Invalid destination" },
        { status: 400 },
      );
    }

    const db = getAdminSupabase();
    const homeOnly =
      destination === "home" ||
      request.nextUrl.searchParams.get("home") === "1";
    let mediaQuery = db
      .from("media_assets")
      .select(
        "id,name,file_url,file_type,mime_type,brand_name,project_name,destinations,show_on_home",
      )
      .eq("published", true)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    if (
      destination !== "home" &&
      destination !== "work" &&
      destination !== "all"
    )
      mediaQuery = mediaQuery.contains("destinations", [destination]);
    if (homeOnly) mediaQuery = mediaQuery.eq("show_on_home", true);
    const assets = await readPublicRows((from, to) =>
      mediaQuery.range(from, to),
    );
    if (assets.error) throw assets.error;
    const assetItems = (assets.data || [])
      .filter((asset) => asset.destinations?.length)
      .map((asset) => ({
        show_on_home: asset.show_on_home,
        brand_name: asset.brand_name,
        id: -asset.id,
        href: `/media/${asset.id}`,
        title_en: asset.project_name || asset.name,
        title_fa: asset.project_name || asset.name,
        description_en: asset.brand_name || "",
        description_fa: asset.brand_name || "",
        media_url: asset.file_url,
        media_type: isVideoAsset(asset) ? "video" : "image",
        cover_url: isVideoAsset(asset) ? null : asset.file_url,
        preview_url: isVideoAsset(asset) ? asset.file_url : null,
        preview_enabled: isVideoAsset(asset),
        preview_type: "video",
        media_count: 1,
        category: isVideoAsset(asset) ? "video" : "photo",
        destinations: asset.destinations,
      }));

    const [links, projects] = await Promise.all([
      readPublicRows((from, to) =>
        db
          .from("project_destinations")
          .select("project_id,destination")
          .order("project_id")
          .order("destination")
          .range(from, to),
      ),
      readPublicRows((from, to) =>
        db
          .from("portfolio")
          .select("*")
          .eq("published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false })
          .order("id")
          .range(from, to),
      ),
    ]);
    if (links.error) throw links.error;
    if (projects.error) throw projects.error;
    const projectIds = (projects.data || []).map((project) => project.id);
    const attached: { project_id: number; media_asset_id: number }[] = [];
    if (projectIds.length) {
      for (let start = 0; ; start += 1000) {
        const result = await db
          .from("project_media")
          .select("project_id,media_asset_id")
          .in("project_id", projectIds)
          .order("project_id")
          .order("sort_order")
          .order("media_asset_id")
          .range(start, start + 999);
        if (result.error) throw result.error;
        attached.push(...(result.data || []));
        if ((result.data || []).length < 1000) break;
      }
    }
    const assetIds = Array.from(
      new Set([
        ...attached.map((link) => link.media_asset_id),
        ...(projects.data || []).flatMap(
          (project) => project.bts_media_ids || [],
        ),
      ]),
    );
    const urls = new Map<number, string>();
    const videoUrls = new Set<string>();
    const attachedByProject = new Map<number, number[]>();
    for (const link of attached)
      attachedByProject.set(link.project_id, [
        ...(attachedByProject.get(link.project_id) || []),
        link.media_asset_id,
      ]);
    for (let start = 0; start < assetIds.length; start += 200) {
      const result = await db
        .from("media_assets")
        .select("id,file_url,file_type,mime_type")
        .in("id", assetIds.slice(start, start + 200));
      if (result.error) throw result.error;
      for (const asset of result.data || []) {
        urls.set(asset.id, asset.file_url);
        if (isVideoAsset(asset)) videoUrls.add(asset.file_url);
      }
    }
    function mediaCount(project: {
      id: number;
      media_url?: string | null;
      bts_media_ids?: number[] | null;
      cover_url?: string | null;
    }) {
      const files = new Set<string>();
      if (project.media_url) files.add(project.media_url);
      for (const id of [
        ...(attachedByProject.get(project.id) || []),
        ...(project.bts_media_ids || []),
      ]) {
        const url = urls.get(id);
        if (url) files.add(url);
      }
      if (!files.size && project.cover_url) files.add(project.cover_url);
      return files.size;
    }
    const sections = new Map<number, string[]>();
    for (const link of links.data || [])
      sections.set(link.project_id, [
        ...(sections.get(link.project_id) || []),
        link.destination,
      ]);
    const projectItems = (projects.data || [])
      .filter((project) => {
        const assigned = sections.get(project.id) || [];
        const explicit = assigned.filter((section) =>
          ["film", "photography", "content", "bts"].includes(section),
        );
        // Legacy published projects can lack section links; classify them by their actual media.
        const fallback = isVideoAsset(project) || /film|teaser|video/i.test(project.category || "")
          ? "film"
          : /photograph|photo/i.test(project.category || "")
            ? "photography"
            : /content/i.test(project.category || "")
              ? "content"
              : "content";
        const matches =
          destination === "all" ||
          destination === "work" ||
          assigned.includes(destination) ||
          (!explicit.length && destination === fallback);
        return matches && (!homeOnly || assigned.includes("home"));
      })
      .map((project) => ({
        ...project,
        destinations: sections.get(project.id) || [],
        media_count: mediaCount(project),
        has_video:
          isVideoAsset(project) ||
          [
            ...(attachedByProject.get(project.id) || []),
            ...(project.bts_media_ids || []),
          ].some((id) => videoUrls.has(urls.get(id) || "")),
        show_on_home: (sections.get(project.id) || []).includes("home"),
      }));

    return NextResponse.json(
      {
        items: [...projectItems, ...assetItems].sort(
          (a, b) => Number(!!b.show_on_home) - Number(!!a.show_on_home),
        ),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Public projects API error:", error);

    return NextResponse.json(
      {
        items: [],
        error: "Could not load projects",
      },
      { status: 500 },
    );
  }
}
