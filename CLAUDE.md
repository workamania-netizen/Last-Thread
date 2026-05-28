# Last Thread Co.

Content-driven affiliate gift site for men. Launching for Father's Day 2026 
(June 21). Domain: lastthread.co. Hosted on Replit (Reserved VM Basic), 
Cloudflare for DNS.

## Brand voice

"For the men who wear things out." Observational, dry, warm. Editorial — 
like a vintage L.L. Bean catalog written by someone with a sense of humor. 
Audience is primarily women buying gifts for husbands/fathers (~60-65%).

Sample blurbs in voice:
- "The kind of socks he'll wear until they have holes in them. Then you 
  can throw the old ones out without him noticing."
- "He's been carrying the same wallet since the second Bush administration. 
  It's time."

Never use: "elevate", "curated experience", "thoughtfully designed", 
"luxury", "premium", startup-speak. Sentence case always. No mid-sentence 
bold. Short sentences.

## Repo layout

This is a **pnpm workspace**. The Astro site lives at 
`artifacts/astro-site/`. Every path in this document under `src/...` is 
relative to that directory (i.e. the real path is 
`artifacts/astro-site/src/...`).

Other workspace packages (`lib/`, `scripts/`) are unrelated to this 
site and can be ignored during Last Thread work.

The root `package.json` has a `preinstall` guard that blocks `npm`. Use 
`pnpm` for everything.

## Stack

- Astro 5 + TypeScript + Tailwind v4 (via `@tailwindcss/vite`)
- @astrojs/node adapter, standalone mode
- @astrojs/sitemap (site: `https://lastthread.co`)
- @fontsource/fraunces, @fontsource/inter (self-hosted Google Fonts)
- Zod for content schemas (provided by `astro:content`)
- `sharp` for `astro:assets` image optimization
- `output: 'server'` with per-page `export const prerender = true` on 
  static pages. Endpoints (`/api/*`, `/go/[slug]`) do NOT prerender.

## Design tokens (Tailwind v4 `@theme` in `src/styles/global.css`)
cream: #f5f1ea       (background)
surface: #fbf8f2     (cards)
ink: #1c1c1a         (primary text)
muted: #5a544a       (secondary text)
accent: #a44a2a      (rust copper — buttons, links)
accent-dark: #82391f (hover)
olive: #5a6b4d       (tags)
tan: #d4c8b8         (borders)

Tailwind v4 uses the `@theme` directive instead of `tailwind.config.mjs`. 
Tokens above are declared as `--color-*` CSS custom properties inside the 
`@theme {}` block and exposed as utilities like `bg-cream`, `text-accent`, 
`border-tan`, etc.

Fonts: Fraunces (serif, headlines, weights 400/500/600), Inter (sans, 
body, weights 400/500). Line-height 1.7 for paragraphs.

## Routes

- `/` homepage
- `/guides` index, `/guides/[slug]` detail
- `/journal` index, `/journal/[slug]` detail
- `/about`, `/disclosure`, `/privacy`, `/404`
- `/go/[slug].ts` — server endpoint, 302 to affiliate URL from 
  `src/data/affiliates.ts`, or 404 status if slug unmapped
- `/api/subscribe.ts` — server endpoint, validates email + honeypot + 
  IP rate limit, derives firstName from email local-part, POSTs to SSD

## Content collections

- `guides` — listicles with `items[]` array. `heroImage` is local 
  (use `image()` from astro:content for optimization). `items[].image` 
  is remote URL (Amazon/Printify CDN, plain `z.string().url()`).
- `journal` — editorial posts, markdown body.

## SSD integration (email capture only)

POST proxies to SSD's `/api/crm/intake` (open POST, no auth header). 
Payload shape:
{ email, firstName, source: 'lastthread-newsletter' }
Required: email AND firstName. Derive firstName from email local-part 
(capitalize first letter, strip non-letters, fallback to "Subscriber").

Fire-and-forget with 3s timeout. Return success to client unless our 
own validation rejects. Don't surface SSD failures to user.

Endpoint URL is in env var `SSD_INTAKE_URL`.

## Known Replit port issue

Replit's Nix sandbox has recurring EADDRINUSE from zombie Node processes. 
`pkill node` and `lsof` don't reliably release ports.

Mitigation (already wired up):
1. Use port 4321 (Astro's default — cleaner history than 3000/5000/5173)
2. `predev` and `prestart` scripts in 
   `artifacts/astro-site/package.json` run 
   `fuser -k 4321/tcp 2>/dev/null || true` before every `dev` and `start`
3. If issue persists: fork the Repl (~95% success rate)

Port 4321 is configured in three places and they must stay in agreement:
`.replit` (workflow `waitForPort` + `[[ports]]` block), 
`artifacts/astro-site/astro.config.mjs` (default `PORT` value), and any 
explicit `PORT` env var. The Replit workflow no longer sets `PORT` so the 
astro config default stands.

## Tracking

Meta Pixel and GA4 in BaseLayout, gated on env vars 
(`PUBLIC_META_PIXEL_ID`, `PUBLIC_GA4_ID`). If env vars missing, snippet 
doesn't render — no console errors.

Fire on:
- PageView: automatic from Pixel/GA defaults
- ViewContent: on guide and journal detail pages (client-side script)
- Lead: on email signup success
- OutboundClick: on `<a>` to `/go/[slug]` via `navigator.sendBeacon` 
  (NOT fetch — fetch races navigation)

Server-side logging in `/go/[slug].ts` is the authoritative outbound 
click record. Client-side beacon is supplementary.

## File structure
All paths below are inside `artifacts/astro-site/`.

src/
├── content/
│   ├── config.ts           Zod schemas
│   ├── _images/            local hero images (referenced by guide/journal
│   │                       frontmatter as `../_images/...`)
│   ├── guides/             markdown files
│   └── journal/            markdown files
├── data/
│   └── affiliates.ts       slug → destination URL map (+ getAffiliateUrl)
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── EmailSignup.astro   inline form, used everywhere
│   └── Card.astro          shared card, variant prop for guide vs product
├── layouts/
│   └── BaseLayout.astro
├── styles/
│   └── global.css          Tailwind v4 @theme + fonts + base styles
└── pages/
    ├── index.astro
    ├── about.astro
    ├── disclosure.astro
    ├── privacy.astro
    ├── 404.astro
    ├── guides/index.astro, [slug].astro
    ├── journal/index.astro, [slug].astro
    ├── go/[slug].ts
    └── api/subscribe.ts

## Conventions

- One `Card.astro` component, not separate Guide/Product cards. Variant 
  prop (`'guide' | 'product'`) handles both layouts.
- `/disclosure` and `/privacy` are plain `.astro` pages, not content 
  collections.
- Inline FTC disclosure paragraph in BaseLayout footer area — no separate 
  `DisclosureBanner` component.
- Per-content `heroImage` doubles as OG image. Default to `/og-default.jpg` 
  if not provided.
- All images need alt text. Default to item/page name if not specified.

## Environment variables

In Replit Secrets:
- `PUBLIC_META_PIXEL_ID` — Meta Pixel ID
- `PUBLIC_GA4_ID` — GA4 Measurement ID
- `SSD_INTAKE_URL` — full URL to SSD's `/api/crm/intake`

`.env.example` in repo documents these.

## Build & dev commands

Use `pnpm` — the root has a `preinstall` guard that rejects `npm`. From 
anywhere in the repo:

    pnpm --filter @workspace/astro-site run dev      # http://localhost:4321
    pnpm --filter @workspace/astro-site run build    # produces dist/
    pnpm --filter @workspace/astro-site run start    # serves dist/server/entry.mjs

Or `cd artifacts/astro-site && pnpm run dev` for shorter commands during 
focused work.

`predev` and `prestart` run before `dev` and `start` to kill zombie port 
processes.

## What's out of scope (do not build)

- Shopping cart, checkout, Stripe, Shopify
- User accounts, login, auth
- Search, filtering, tags, category pages
- Email sequences, Klaviyo, welcome flows
- Email popup with scroll/time triggers
- localStorage retry queue
- SSD analytics integration (just Meta + GA4 in Stage 1)
- Cookie consent banner
- Dark mode

Stage 2 (later, not now) will add branded Printify products by appending 
entries to gift guides that redirect to Printify's hosted store. No site 
rebuild needed.