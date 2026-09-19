-- NURANICO FINAL portfolio media / brand / BTS upgrade
-- Run once in Supabase SQL Editor.

alter table portfolio
  add column if not exists media_sources jsonb default '{}'::jsonb,
  add column if not exists gallery_urls jsonb default '[]'::jsonb,
  add column if not exists brand_id integer references brands(id) on delete set null,
  add column if not exists bts_media_url text,
  add column if not exists bts_media_type text,
  add column if not exists bts_gallery_urls jsonb default '[]'::jsonb;

update portfolio
set media_sources = coalesce(media_sources, '{}'::jsonb),
    gallery_urls = coalesce(gallery_urls, '[]'::jsonb),
    bts_gallery_urls = coalesce(bts_gallery_urls, '[]'::jsonb);

create index if not exists portfolio_brand_id_idx on portfolio(brand_id);
create index if not exists portfolio_bts_idx on portfolio((bts_media_url is not null));

-- Optional examples:
-- media_sources = {"1080p":"https://...","720p":"https://...","480p":"https://..."}
-- gallery_urls = ["https://.../one.jpg","https://.../two.jpg"]
-- bts_media_url = "https://.../behind-the-scenes.mp4"
-- bts_media_type = "video"
-- bts_gallery_urls = ["https://.../bts-1.jpg","https://.../bts-2.jpg"]
