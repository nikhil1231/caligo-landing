export type AnalyticsProvider = 'plausible' | 'ga4';

interface AnalyticsConfig {
  provider: AnalyticsProvider;
  key: string;
}

export function getAnalyticsConfig(): AnalyticsConfig | null {
  const provider = import.meta.env.PUBLIC_ANALYTICS_PROVIDER;
  const key = import.meta.env.PUBLIC_ANALYTICS_KEY;

  if (!provider || !key) {
    return null;
  }

  if (provider !== 'plausible' && provider !== 'ga4') {
    return null;
  }

  return {
    provider,
    key
  };
}
