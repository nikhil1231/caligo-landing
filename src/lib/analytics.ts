export type AnalyticsProvider = 'plausible' | 'ga4' | 'firebase';

interface BaseAnalyticsConfig {
  provider: AnalyticsProvider;
}

export interface PlausibleAnalyticsConfig extends BaseAnalyticsConfig {
  provider: 'plausible';
  key: string;
}

export interface Ga4AnalyticsConfig extends BaseAnalyticsConfig {
  provider: 'ga4';
  key: string;
}

export interface FirebaseWebConfig {
  apiKey: string;
  appId: string;
  projectId: string;
  measurementId: string;
  authDomain?: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

export interface FirebaseAnalyticsConfig extends BaseAnalyticsConfig {
  provider: 'firebase';
  key: string;
  firebase: FirebaseWebConfig;
}

export type AnalyticsConfig =
  | PlausibleAnalyticsConfig
  | Ga4AnalyticsConfig
  | FirebaseAnalyticsConfig;

export function getAnalyticsConfig(): AnalyticsConfig | null {
  const provider = import.meta.env.PUBLIC_ANALYTICS_PROVIDER;
  if (!provider) {
    return null;
  }

  if (provider === 'plausible' || provider === 'ga4') {
    const key = import.meta.env.PUBLIC_ANALYTICS_KEY;
    if (!key) {
      return null;
    }

    return {
      provider,
      key
    };
  }

  if (provider !== 'firebase') {
    return null;
  }

  const measurementId =
    import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID ?? import.meta.env.PUBLIC_ANALYTICS_KEY;
  const apiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY;
  const appId = import.meta.env.PUBLIC_FIREBASE_APP_ID;
  const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID;

  if (!apiKey || !appId || !projectId || !measurementId) {
    return null;
  }

  const firebase: FirebaseWebConfig = {
    apiKey,
    appId,
    projectId,
    measurementId
  };

  if (import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN) {
    firebase.authDomain = import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN;
  }

  if (import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET) {
    firebase.storageBucket = import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET;
  }

  if (import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
    firebase.messagingSenderId = import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  }

  return {
    provider: 'firebase',
    key: measurementId,
    firebase
  };
}
