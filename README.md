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
- Optional analytics integration (off by default).

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
PUBLIC_ANALYTICS_PROVIDER=
PUBLIC_ANALYTICS_KEY=
```

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
