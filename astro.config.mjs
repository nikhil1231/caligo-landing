import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

const site = process.env.PUBLIC_SITE_URL ?? 'https://caligotracker.app';

export default defineConfig({
  site,
  base: '/caligo-landing',
  output: 'static',
  integrations: [tailwind(), sitemap()]
});
