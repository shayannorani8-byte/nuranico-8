# NURANICO

Bilingual creative-studio portfolio built with Next.js 15, React 19 and TypeScript. Public content, appearance and language settings are managed through the admin panel.

## Pages

- `/` — hero slider, services, selected work, About and brands
- `/work` — searchable project library
- `/work/[id]` — project information, mixed image/video gallery and behind-the-scenes media
- `/work/behind-the-scenes` — behind-the-scenes photos and videos, grouped by project
- `/services` — services directory
- `/services/film-teasers`, `/services/photography`, `/services/content` — category libraries
- `/about`, `/contact`
- `/brands` — redirects to the homepage brands section
- `/media/[id]` — individual media view
- `/admin`, `/admin/login` — content and appearance management

## Local setup

1. Install Node.js LTS and restore your private `.env.local` into the project root.
2. Run `npm ci` to install the versions in `package-lock.json`.
3. Run `npm run dev` and open the URL printed by Next.js.

For a production preview, run `npm run build`, then `npm start`.

## Environment

Configure these variables privately; never commit their values:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY` — public database connection
- `SUPABASE_SERVICE_ROLE_KEY` — server-only CMS access
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET` — admin authentication
- `ARVAN_ENDPOINT`, `ARVAN_BUCKET`, `ARVAN_ACCESS_KEY`, `ARVAN_SECRET_KEY` — media storage
- `ARVAN_REGION` — optional storage region; defaults to `us-east-1`
- `NEXT_PUBLIC_SITE_URL` — site URL for authentication redirects

Schema upgrades are kept in `supabase/`. Apply the relevant migrations to the database before using their fields; deployments do not apply them automatically.

## Code organization

- `app/` — pages, API routes and page styles
- `components/` — shared header, language/data providers, galleries and media cards
- `lib/` — database, storage, authentication and shared settings helpers
- `app/home-motion.css` — homepage entrance and loop animations, with reduced-motion fallbacks
- `app/site-refinements.css` — shared responsive type, gutters, controls and internal-page presentation
- `app/admin/form-controls.css` — mobile form sizing to prevent iOS focus zoom

Appearance settings include About and portfolio gradients. Website language availability and admin interface language are independent settings.

## Checks

- `npm run typecheck` — TypeScript checks, including unused locals and parameters
- `npm run build` — production compilation and route generation

Responsive layouts should be reviewed in both languages at phone, tablet and desktop widths. Real iOS focus behavior requires an iPhone/iPad check; desktop viewport emulation does not reproduce Safari's automatic field zoom.

## Hosting and backups

Production runs on Vercel at `https://www.nuranico.com`. Supabase stores records; Arvan Object Storage hosts uploaded media.

A local project backup contains source, private configuration and Git history. Remote database records and uploaded storage objects require separate service backups. Restore `.env.local` privately and use `npm ci` / `npm run build` to recreate dependencies and build output when restoring a source-only copy.
