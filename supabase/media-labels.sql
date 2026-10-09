-- Optional labels used by the CMS media library. No existing files or links change.
alter table public.media_assets
  add column if not exists brand_name text,
  add column if not exists project_name text,
  add column if not exists destinations text[] not null default '{}',
  add column if not exists show_on_home boolean not null default false,
  add column if not exists published boolean not null default false;
notify pgrst, 'reload schema';
