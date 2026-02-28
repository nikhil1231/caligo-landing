import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

const site = process.env.PUBLIC_SITE_URL ?? 'https://caligotracker.app';

export default defineConfig({
  site,
  output: 'static',
  integrations: [tailwind(), sitemap()]
});
