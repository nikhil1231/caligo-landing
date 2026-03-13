# Caligo Tracker Landing

Static marketing site for **Caligo Tracker**, an ultra low-friction iOS calorie + exercise logger.

- Stack: Astro + Tailwind CSS + TypeScript
- Hosting target: GitHub Pages
- Canonical domain: `https://caligotracker.app`
- Repo base path for Pages: `/caligo-landing`

## Features Included

- Responsive landing page with hero, feature sections, trust/safety, screenshots, testimonials, FAQ, and waitlist form.
- Legal pages:
  - `/privacy`
  - `/terms`
- Contact page:
  - `/contact`
- Friendly custom `/404`
- SEO basics: meta tags, canonical, OpenGraph, Twitter card, JSON-LD, robots, sitemap generation.
- Waitlist/contact front-end stubs with:
  - email validation
  - honeypot anti-spam field
  - client-side rate limiting
  - configurable endpoint handoff
  - localStorage demo fallback
- Optional analytics integration (off by default), including Firebase Analytics support.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

## Build and Preview

```bash
npm run build
npm run preview
```

## Environment Variables

Use these optional public env vars in `.env`:

```bash
PUBLIC_SITE_URL=https://caligotracker.app
PUBLIC_WAITLIST_ENDPOINT=
PUBLIC_CONTACT_ENDPOINT=
PUBLIC_ANALYTICS_PROVIDER=
PUBLIC_ANALYTICS_KEY=
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
PUBLIC_FIREBASE_MEASUREMENT_ID=
PUBLIC_CLARITY_PROJECT_ID=
```

### Analytics Providers

- `PUBLIC_ANALYTICS_PROVIDER=plausible`
  - Requires: `PUBLIC_ANALYTICS_KEY` (domain).
- `PUBLIC_ANALYTICS_PROVIDER=ga4`
  - Requires: `PUBLIC_ANALYTICS_KEY` (GA4 measurement ID).
- `PUBLIC_ANALYTICS_PROVIDER=firebase`
  - Requires: `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_PROJECT_ID`, `PUBLIC_FIREBASE_APP_ID`, `PUBLIC_FIREBASE_MEASUREMENT_ID`.
  - Optional: `PUBLIC_FIREBASE_AUTH_DOMAIN`, `PUBLIC_FIREBASE_STORAGE_BUCKET`, `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`.

`PUBLIC_CLARITY_PROJECT_ID` is optional and enables Microsoft Clarity (session replay / heatmaps).

When analytics is enabled, the site tracks anonymous landing-page basics: page views with UTM/referrer attribution, CTA clicks, outbound/social/app-link clicks, waitlist/contact form funnel events (start/attempt/success/fail/drop-off), scroll depth milestones, key section visibility (`how-it-works`), visitor state (new vs returning), device/OS hints, and page performance/load-failure events.

### Waitlist / Contact Stub Behavior

- If `PUBLIC_WAITLIST_ENDPOINT` is set, forms POST JSON there.
- If unset, submissions are stored in localStorage and users see: `Saved locally (demo).`

Payload shape:

```json
{
  "email": "you@example.com",
  "source": "waitlist",
  "message": "optional",
  "submittedAt": "ISO timestamp"
}
```

## Deployment (GitHub Pages)

Workflow file: `.github/workflows/deploy.yml`

1. Push to `main`.
2. In GitHub repo settings, enable Pages with **GitHub Actions** source.
3. Workflow builds `dist/` and deploys automatically.

## Quick Content Edits

- Main marketing copy is centralized in:
  - `src/content/copy.ts`
- SEO defaults and canonical behavior:
  - `src/lib/site.ts`
  - `src/lib/seo.ts`

## Swap in Real Screenshots

Replace placeholder files in:

- `public/screenshots/screen-1.svg`
- `public/screenshots/screen-2.svg`
- `public/screenshots/screen-3.svg`
- `public/screenshots/screen-4.svg`
- `public/screenshots/screen-5.svg`

You can use PNG/JPG too; just update paths in `src/content/copy.ts`.

## Legal Page Updates

Edit copy directly:

- `src/pages/privacy.astro`
- `src/pages/terms.astro`

## Lint / Format / Type Check

```bash
npm run lint
npm run check
npm run format
```

## License

MIT
