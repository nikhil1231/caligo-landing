import type { AnalyticsConfig } from '../lib/analytics';

interface ConsentState {
  necessary: true;
  analytics: boolean;
  updatedAt: string;
}

declare global {
  interface Window {
    __CALIGO_ANALYTICS__?: AnalyticsConfig;
    __CALIGO_CLARITY_PROJECT_ID__?: string;
    __CALIGO_ANALYTICS_BOOTSTRAPPED__?: boolean;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_STORAGE_KEY = 'caligo:cookie-consent:v1';
const CONSENT_UPDATED_EVENT = 'caligo:cookie-consent:updated';

let initialized = false;
let bootstrapPromise: Promise<void> | null = null;

function safeGetStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage access failures.
  }
}

function readConsent(): ConsentState | null {
  const raw = safeGetStorage(CONSENT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (typeof parsed.analytics !== 'boolean') {
      return null;
    }

    return {
      necessary: true,
      analytics: parsed.analytics,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return null;
  }
}

function persistConsent(analytics: boolean): ConsentState {
  const nextState: ConsentState = {
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString()
  };

  safeSetStorage(CONSENT_STORAGE_KEY, JSON.stringify(nextState));
  return nextState;
}

function emitConsentUpdate(consent: ConsentState) {
  window.dispatchEvent(
    new CustomEvent<ConsentState>(CONSENT_UPDATED_EVENT, {
      detail: consent
    })
  );
}

function loadExternalScript(
  id: string,
  src: string,
  attributes: Record<string, string> = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
        once: true
      });
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;

    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true }
    );
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
      once: true
    });

    document.head.append(script);
  });
}

function initGtag(measurementId: string) {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  }

  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}

async function bootstrapAnalytics() {
  if (window.__CALIGO_ANALYTICS_BOOTSTRAPPED__) {
    return;
  }

  if (bootstrapPromise) {
    await bootstrapPromise;
    return;
  }

  bootstrapPromise = (async () => {
    const analyticsConfig = window.__CALIGO_ANALYTICS__;
    const clarityProjectId = window.__CALIGO_CLARITY_PROJECT_ID__;

    if (analyticsConfig?.provider === 'plausible') {
      await loadExternalScript('caligo-plausible-script', 'https://plausible.io/js/script.js', {
        'data-domain': analyticsConfig.key
      });
    }

    if (analyticsConfig?.provider === 'ga4') {
      await loadExternalScript(
        'caligo-ga4-script',
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsConfig.key)}`
      );
      initGtag(analyticsConfig.key);
    }

    if (clarityProjectId) {
      await loadExternalScript(
        'caligo-clarity-script',
        `https://www.clarity.ms/tag/${encodeURIComponent(clarityProjectId)}`
      );
    }

    if (analyticsConfig) {
      const analyticsModule = await import('./analytics');
      await analyticsModule.initLandingAnalytics();
    }

    window.__CALIGO_ANALYTICS_BOOTSTRAPPED__ = true;
  })();

  try {
    await bootstrapPromise;
  } catch {
    bootstrapPromise = null;
  }
}

function switchModalView(
  bannerView: HTMLElement | null,
  preferencesView: HTMLElement | null,
  view: 'banner' | 'preferences'
) {
  if (bannerView) {
    bannerView.classList.toggle('hidden', view !== 'banner');
  }
  if (preferencesView) {
    preferencesView.classList.toggle('hidden', view !== 'preferences');
  }
}

function openModal(
  modal: HTMLElement,
  bannerView: HTMLElement | null,
  preferencesView: HTMLElement | null,
  view: 'banner' | 'preferences',
  focusTarget: HTMLElement | null
) {
  switchModalView(bannerView, preferencesView, view);
  modal.classList.remove('hidden', 'pointer-events-none');
  modal.setAttribute('aria-hidden', 'false');

  if (focusTarget) {
    window.setTimeout(() => {
      focusTarget.focus();
    }, 0);
  }
}

function closeModal(modal: HTMLElement) {
  modal.classList.add('hidden', 'pointer-events-none');
  modal.setAttribute('aria-hidden', 'true');
}

export function initCookieConsent() {
  if (initialized || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  initialized = true;

  const modal = document.querySelector<HTMLElement>('[data-cookie-consent-modal]');
  if (!modal) {
    return;
  }

  const bannerView = modal.querySelector<HTMLElement>('[data-cookie-view="banner"]');
  const preferencesView = modal.querySelector<HTMLElement>('[data-cookie-view="preferences"]');
  const backdrop = modal.querySelector<HTMLElement>('[data-cookie-consent-backdrop]');
  const acceptButton = modal.querySelector<HTMLElement>('[data-cookie-action="accept"]');
  const rejectButton = modal.querySelector<HTMLElement>('[data-cookie-action="reject"]');
  const manageButton = modal.querySelector<HTMLElement>('[data-cookie-action="manage"]');
  const saveButton = modal.querySelector<HTMLElement>('[data-cookie-action="save"]');
  const backButton = modal.querySelector<HTMLElement>('[data-cookie-action="back"]');
  const analyticsToggle = modal.querySelector<HTMLInputElement>('[data-cookie-analytics-toggle]');
  const settingsTriggers = document.querySelectorAll<HTMLElement>('[data-cookie-settings-trigger]');

  let currentConsent = readConsent();
  let decisionRequired = currentConsent === null;
  let draftAnalytics = currentConsent?.analytics ?? false;

  if (analyticsToggle) {
    analyticsToggle.checked = draftAnalytics;
  }

  const applyConsent = async (analyticsAllowed: boolean) => {
    const previousConsent = currentConsent;
    currentConsent = persistConsent(analyticsAllowed);
    decisionRequired = false;
    draftAnalytics = analyticsAllowed;

    if (analyticsToggle) {
      analyticsToggle.checked = analyticsAllowed;
    }

    closeModal(modal);
    emitConsentUpdate(currentConsent);

    if (analyticsAllowed) {
      await bootstrapAnalytics();
      return;
    }

    if (previousConsent?.analytics) {
      window.location.reload();
    }
  };

  acceptButton?.addEventListener('click', () => {
    void applyConsent(true);
  });

  rejectButton?.addEventListener('click', () => {
    void applyConsent(false);
  });

  manageButton?.addEventListener('click', () => {
    openModal(
      modal,
      bannerView,
      preferencesView,
      'preferences',
      analyticsToggle ?? (saveButton as HTMLElement | null)
    );
  });

  saveButton?.addEventListener('click', () => {
    const analyticsAllowed = analyticsToggle ? analyticsToggle.checked : draftAnalytics;
    void applyConsent(analyticsAllowed);
  });

  backButton?.addEventListener('click', () => {
    if (decisionRequired) {
      openModal(modal, bannerView, preferencesView, 'banner', acceptButton);
      return;
    }
    closeModal(modal);
  });

  analyticsToggle?.addEventListener('change', () => {
    draftAnalytics = analyticsToggle.checked;
  });

  backdrop?.addEventListener('click', () => {
    if (decisionRequired) {
      return;
    }
    closeModal(modal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || decisionRequired || modal.classList.contains('hidden')) {
      return;
    }
    closeModal(modal);
  });

  settingsTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      draftAnalytics = currentConsent?.analytics ?? false;
      if (analyticsToggle) {
        analyticsToggle.checked = draftAnalytics;
      }
      openModal(
        modal,
        bannerView,
        preferencesView,
        'preferences',
        analyticsToggle ?? (saveButton as HTMLElement | null)
      );
    });
  });

  if (currentConsent?.analytics) {
    void bootstrapAnalytics();
    return;
  }

  if (!currentConsent) {
    openModal(modal, bannerView, preferencesView, 'banner', acceptButton);
  }
}
