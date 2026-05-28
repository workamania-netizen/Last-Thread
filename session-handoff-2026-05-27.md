# Last Thread Co. — Session Handoff (2026-05-27)

## Status
Stage 1 is LIVE. Site reachable at https://lastthread.co and https://www.lastthread.co.

## Repo state
- Branch: main, working tree clean
- Workspace cleaned: artifacts/astro-site is the only deployable artifact in the pnpm workspace
- Build/run commands in .replit point at astro-site explicitly

## Replit deployment
- Type: Reserved VM Basic ($7/mo)
- Build: pnpm install && pnpm --filter @workspace/astro-site run build
- Run: pnpm --filter @workspace/astro-site run start
- Port: 4321 mapped to external 80
- Default URL: astro-tailwind-setup.replit.app (can rename later, not blocking)

## Cloudflare DNS — current state
- A @ → 34.111.179.208, DNS only
- A www → 34.111.179.208, DNS only
- TXT @ → replit-verify=ed77bb56-cf98-4d47-b279-850b278fdfed
- TXT www → replit-verify=ed77bb56-cf98-4d47-b279-850b278fdfed
- 5 MX records for Namecheap email forwarding — DO NOT TOUCH
- SPF TXT for email — DO NOT TOUCH
- All records gray-cloud (DNS only). Orange-cloud (proxy on) breaks Replit SSL. Don't enable.

## Secrets in Replit
- SSD_INTAKE_URL: set
- PUBLIC_META_PIXEL_ID: empty (Meta account dispute, pending)
- PUBLIC_GA4_ID: empty (pending generation)
- Env-gated rendering means missing IDs don't break the site

## Known issues / planned swaps before ad launch
- Placeholder hero images (3 JPGs in src/content/_images/, plus og-default.jpg and favicon.svg). Were generated as brand-palette gradients because Replit's sandbox blocks images.unsplash.com for curl. Browsers load real Unsplash for items[].image URLs in markdown — only the heroes/OG/favicon are placeholders.
- Affiliate URLs are placeholder amazon.com/s?k=... search URLs in src/data/affiliates.ts.
- Father's Day guide is titled "fourteen things" but has 15 items. Cosmetic.

## Gotchas / hard-won lessons from build night
1. **Workspace is pnpm monorepo.** Project lives at artifacts/astro-site. All commands need `pnpm --filter @workspace/astro-site` or `cd artifacts/astro-site` prefix.
2. **Replit's "Could not find run command" error** = .replit needs explicit build/run in [deployment] block. UI doesn't expose those fields for Autoscale-style "Publish" pane.
3. **Replit's monorepo auto-discovery** runs whatever artifact it finds, ignoring .replit run command. Solution was to delete unused artifact dirs.
4. **Vite host blocking** = needs '.replit.dev' wildcard in astro.config.mjs vite.server.allowedHosts.
5. **pnpm install needs to run on Replit separately** from Claude Code's sandbox. Claude Code installs in its environment, Replit needs its own.
6. **Cloudflare proxy must stay off** (DNS only / gray cloud) or Replit's Let's Encrypt SSL breaks.

## Up next
- Homepage redesign (Jonathan has new design from Claude design tool)
- Real affiliate links once Amazon Associates approved
- Real hero photography swap
- Ad channel decision (Pinterest + Google Ads, probably)
- Artifact 5: pre-launch checklist (email test to SSD, outbound click verification, GA4 real-time check)