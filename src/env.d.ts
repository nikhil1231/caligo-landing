/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WAITLIST_ENDPOINT?: string;
  readonly PUBLIC_ANALYTICS_PROVIDER?: 'plausible' | 'ga4';
  readonly PUBLIC_ANALYTICS_KEY?: string;
  readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
