# AGENTS.md

Astro 5 SSR app (Spanish UI) that turns uploaded photos into AI images with `gpt-image-1` via an OpenAI-compatible proxy. One row in the `styles` table drives the catalog card, `/generate/[slug]`, `GenerateForm`, `/api/generate/[slug]`, and the result modal. The `README.md` is the untouched Astro starter; this file and the config are the real source of truth.

## Commands

- `npm install`, `npm run dev` (port 4321), `npm run build`, `npm run preview`, `npm test`, `npm run db:seed`.
- No lint, typecheck, or formatter scripts exist. `astro check` is not installed. Verify with `npm test` and `npm run build`.
- Production build emits `dist/server/entry.mjs` (Node standalone). Start it from the repo root (`node dist/server/entry.mjs`) because runtime code resolves `data/` from `process.cwd()`.
- Both `bun.lock` and `package-lock.json` are committed (README says bun). Do not swap package managers, regenerate lockfiles, or upgrade Drizzle off `1.0.0-rc.5`.

## Adding or changing a style

Insert or edit a row in `styles` (seed: `src/db/style-seeds.ts`, admin UI: `/admin/estilos`). Do not add a page, form, or API route per style.

- Public URL is `/generate/<slug>`. Style id and slug differ for three styles: `que-paso-ayer` → `que-paso-ayer-fiesta`, `buzz-cut` → `buzz-cut-street`, `film-noir` → `film-noir-portrait`.
- Unknown or inactive slug returns 404.
- Icons are Lucide names from `ICON_OPTIONS`, rendered by the static map in `src/components/Icon.jsx`. Do not import `lucide-react/dynamic`.
- Generation is split: `src/lib/prompt.ts` (pure), `src/lib/images.ts` (bytes, thumbnail, path jail), `src/server/records.ts` (style and generation rows), `src/lib/openaiImage.ts` (the only OpenAI client), `src/lib/generate.ts`, `src/lib/handleGenerate.ts`. `handleGenerate` loads the style once and passes the row through.

## Multipart

`POST /api/generate/<slug>` accepts `person`, `extraDetails`, and `quality` (`medium` or `high`). Send `celebrity` and `celebrityName` only when `requiresCelebrity`. A field mismatch is a 400 that the UI surfaces as an alert.

Success JSON keys, identical for every style: `success`, `message`, `imageUrl`, `thumbUrl`, `fileName`, `generationTime`, `prompt`, `styleId`, `images`, `data`, `style`. `images.celebrity` and `data.celebrityName` only when `requiresCelebrity`. Errors are `{ success: false, error }` with no `details` field.

## Generated data

- Files land in `data/generated/` as `<styleId>_<timestamp>_<rand>.png`, a `.webp` thumbnail, and `_person_original` / `_celebrity_original` PNGs.
- History lives in the `generations` table. Gallery and TV read `src/server/gallery.ts`. Do not serialize functions into `/tv-display`.
- There is no Astro content collection for generated images. Legacy `data/generated/metadata/*.json` is only an import source for `npm run db:seed`.
- Do not delete `data/generated` PNGs or `data/expo-feria.db`.
- Images are served by `src/pages/api/images/[...path].ts` as `/api/images/<fileName>`.

## Auth and API surface

- Better Auth (`src/auth.ts`, `src/pages/api/auth/[...all].ts`): email + password, public signup disabled, roles `admin` and `operator`.
- No session on `/generate` or `/api/generate` → redirect to login, or `401` JSON for API routes. Operator or admin may generate. `/admin/*` is admin-only.
- `/tv-display` and `/api/latest-image.json` stay public.
- `OPENAI_API_KEY` comes only from the environment. Do not hardcode keys.
- `.env.example` documents `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and the first admin. `.env` is gitignored.

## AI client

- Model `gpt-image-1`, `1024x1024`, quality `medium|high`. Default base URL is `https://api.laozhang.ai/v1` when `OPENAI_BASE_URL` is unset.
- Only `src/lib/openaiImage.ts` constructs the client. Tests must not import it.

## Styling

- Tailwind v4 through `@tailwindcss/vite`. Theme tokens are defined in `src/styles/global.css` under `@theme` (`primary`/`secondary`/`accent` OKLCH scales, custom classes such as `shadow-elegant`).
- `tailwind.config.js` is not loaded (no `@config` in CSS), so edits there have no effect.
- User-facing copy is Spanish. Icons are Lucide, not emoji.

## Runtime notes

- `output: 'server'` with `@astrojs/node` standalone. Data-driven pages declare `export const prerender = false` explicitly.
- `/tv-display` is a standalone page (no `Layout`) that polls `/api/latest-image.json` every 5 seconds to prepend new images.
