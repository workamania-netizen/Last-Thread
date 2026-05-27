# Last Thread Co. — Technical Context

## Stack (Stage 1, current build)
- **Framework:** Astro (latest stable) + TypeScript
- **Styling:** Tailwind CSS with custom theme tokens for the brand palette
- **Content:** Astro content collections (markdown + frontmatter)
- **Deployment:** Replit hosting
- **Domain:** lastthread.co (registered separately, CNAME to Replit)
- **Email capture:** Inline form POSTing to SSD's /api/crm/intake with 
  source='lastthread-newsletter'. No popup. Fire-and-forget — if SSD 
  errors, log it client-side and move on. No retry queue.
- **Tracking:** Meta Pixel + GA4. Both env-gated. No SSD analytics 
  integration in Stage 1.
- **Affiliate routing:** /go/[slug] route reads from a config file mapping 
  slugs to destination URLs.

## Why Astro
Static site generation = fast page loads = lower Meta ad costs. Content 
collections fit gift-guide listicles naturally. Markdown authoring matches 
how Jonathan wants to add daily content. Founder is fluent with this stack.

## Why Replit
Founder ships fast on Replit. Has shipped 25+ apps on it. Built-in hosting, 
secrets management, git, and Claude Code integration. No reason to leave.

## File structure expected
/
├── .replit                       # Port config (port 3000, host 0.0.0.0)
├── astro.config.mjs              # Astro config — host 0.0.0.0, port 3000
├── package.json
├── tailwind.config.mjs
├── tsconfig.json
├── README.md
├── .env.example
├── public/                       # Static assets
└── src/
├── content/
│   ├── config.ts             # Zod schemas for guides + journal
│   ├── guides/
│   │   ├── fathers-day-gifts.md
│   │   └── cabin-sock-edit.md
│   └── journal/
│       └── why-we-started.md
├── data/
│   └── affiliates.ts         # slug → destination URL map
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── EmailSignup.astro
│   ├── GuideCard.astro
│   ├── ProductCard.astro
│   └── DisclosureBanner.astro
├── layouts/
│   └── BaseLayout.astro
└── pages/
├── index.astro
├── about.astro
├── disclosure.astro
├── privacy.astro
├── 404.astro
├── guides/
│   ├── index.astro
│   └── [slug].astro
├── journal/
│   ├── index.astro
│   └── [slug].astro
├── go/
│   └── [slug].astro       # 302 redirect handler
└── api/
└── subscribe.ts        # POSTs to SSD /api/crm/intake

## Known Replit port issue (CRITICAL)
Replit's Nix sandbox has a recurring EADDRINUSE issue when zombie Node 
processes hold port bindings between workflow runs. Standard kill commands 
(pkill node, lsof -ti:PORT | xargs kill -9) do NOT reliably release ports.

**Mitigation pattern that must be in the build from day one:**

1. Use port 3000 (NOT 5000 or 5173 — those commonly conflict in Replit).
2. The port in .replit, astro.config.mjs, and any PORT env variable must 
   ALL agree. Mismatches cause silent failures.
3. Implement graceful port fallback in the dev server startup that 
   auto-retries 3001, 3002, etc. if the primary is bound. Pattern:

   const startServer = (port, attempts = 0) => {
     server.listen(port).on('error', (err) => {
       if (err.code === 'EADDRINUSE' && attempts < 5) {
         startServer(port + 1, attempts + 1);
       } else {
         throw err;
       }
     });
   };

4. Last resort: fork the Repl (~95% success rate). The fork spins up a 
   fresh sandbox with clean process state.

**What NOT to waste time on when this happens:**
- pkill -9 node
- lsof -ti:PORT | xargs kill -9
- Restarting the workflow repeatedly
- Rebooting the Repl from the UI

## SSD (Scout Sales Dashboard) integration
SSD is Jonathan's existing admin platform — Express + Postgres + Drizzle 
ORM, hosted on Replit, managing real estate sites like easternwv.com and 
myocmd.com. It has a working CRM with /api/crm/intake endpoint.

**Stage 1 integration with SSD: email signup capture only.**

Last Thread's /api/subscribe endpoint POSTs to SSD's /api/crm/intake with:
{
source: 'lastthread-newsletter',
email: '<user email>'
}

SSD's existing schema accepts this — `crmContacts` table has a 
`lead_source` field that distinguishes by source string. Leads will appear 
in SSD's command center alongside real estate leads.

**Prerequisite on SSD side (required before email works):**
Add `https://lastthread.co` (and likely `https://*.replit.dev` for 
development) to the CORS allowlist (`leadsCors` config in 
`server/routes.ts`). One-line change.

**Failure handling:** Fire-and-forget. If SSD errors or is unreachable, 
the user still sees success — log the error client-side. No retry queue, 
no localStorage buffer. Stage 1 accepts some lead loss in exchange for 
zero engineering complexity.

## Environment variables
- PUBLIC_META_PIXEL_ID — Meta Pixel ID (from Meta Business)
- PUBLIC_GA4_ID — GA4 Measurement ID (from Google Analytics)
- SSD_CRM_ENDPOINT — full URL to SSD's /api/crm/intake (production URL)

Set as Replit Secrets. The .env.example file in the repo documents these.

## Tracking events to fire
On every page load:
- Meta Pixel: fbq('track', 'PageView')
- GA4: gtag('event', 'page_view')

On guide and journal post views:
- Meta Pixel: fbq('track', 'ViewContent', { content_name, content_category })
- GA4: gtag('event', 'view_item', { item_name, item_category })

On email signup submit:
- Meta Pixel: fbq('track', 'Lead')
- GA4: gtag('event', 'generate_lead')
- POST to /api/subscribe (which then POSTs to SSD)

On /go/[slug] visits (server-side, before redirect):
- Pass tracking params if possible, but the redirect happens server-side 
  so client tracking won't fire reliably. Solution: use the page that 
  links to /go/[slug] to fire the custom event on click, then let the 
  redirect happen. Pattern:
  
  <a href="/go/cabin-socks" 
     onclick="fbq('trackCustom','OutboundClick',{slug:'cabin-socks'}); 
              gtag('event','outbound_click',{slug:'cabin-socks'});">
    Shop this
  </a>

## Stage 2 readiness (just enough to not paint ourselves into a corner)
- Branded Printify merch in Stage 2 is added by including new entries in 
  the gift guides with affiliate slugs that map to Printify's hosted store 
  URLs (printify.me/...).
- The /go/[slug] redirect works identically whether the destination is 
  Amazon or Printify.
- No site rebuild required. No new tables, no new code paths, no schema 
  changes.
- Stage 2 details (when to start, which products, pricing) are out of 
  scope for this build.