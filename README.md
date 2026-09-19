# NURANICO — Final Next.js Portfolio

NURANICO is a bilingual creative-studio portfolio built for real deployment.

## Final site structure

- `/` — cinematic home, hero slider, real video preview, services, work grid, clients and contact
- `/work` — complete portfolio grid
- `/work/[id]` — individual project page with photo viewer or custom video player
- `/work/behind-the-scenes` — all Behind The Scenes projects
- `/clients/[id]` — brand/client page showing only projects linked to that brand
- `/services`, `/about`, `/contact`
- `/admin` — CMS for projects, brands, media and appearance

## Project content

Each project can have:

- Cover image
- Main image or video
- Video quality sources
- Gallery images
- Client / Brand
- Optional Behind The Scenes image/video/gallery
- Featured / published state
- Display order

A Behind The Scenes asset is stored once and can appear both on its project page and on the global Behind The Scenes page.

## Local setup

1. Use Node.js LTS.
2. Copy your private `.env.local` into the project root.
3. Install dependencies:
   `npm install`
4. Run:
   `npm run dev`
5. Open the localhost URL printed by Next.js.

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_KEY=...
```

## Supabase

Before using Brand ↔ Project links and Behind The Scenes fields, run:

`supabase/portfolio-media-upgrade.sql`

The migration adds `brand_id`, BTS fields, video quality sources and project galleries.

## Deployment target

- Website: Vercel
- Database / Auth: Supabase
- Media storage: ServerNet Object Storage
- Domain: Nuranico.com

Do not commit `.env.local`.
