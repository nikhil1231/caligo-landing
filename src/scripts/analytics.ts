import type { AnalyticsConfig, FirebaseAnalyticsConfig } from '../lib/analytics';

type EventParamInput = string | number | boolean | null | undefined;
type EventParamsInput = Record<string, EventParamInput>;
type EventParam = string | number;
type EventParams = Record<string, EventParam>;
type EventHandler = (eventName: string, params: EventParams) => void;
type VisitorType = 'new' | 'returning';

interface VisitorState {
  type: VisitorType;
  firstSeenAt?: number;
}

interface AttributionData {
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
  referrerHost?: string;
  capturedAt: string;
}

interface TrackLinkOptions {
  hasCustomEvent: boolean;
}

declare global {
  interface Window {
    __CALIGO_ANALYTICS__?: AnalyticsConfig;
    gtag?: (...args: unknown[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

const VISITOR_STORAGE_KEY = 'caligo:analytics:visitor:first_seen';
const ATTRIBUTION_STORAGE_KEY = 'caligo:analytics:attribution:first_touch';
const ANALYTICS_EVENT_NAME = 'caligo:analytics:event';
const SCROLL_MILESTONES = [25, 50, 75, 90] as const;
const MAX_BUFFERED_EVENTS = 60;
const MAX_ERROR_EVENTS = 8;

let initStarted = false;
let disableTracking = false;
let eventHandler: EventHandler | null = null;
let cachedVisitorState: VisitorState | null = null;
const pendingEvents: Array<{ name: string; params: EventParamsInput }> = [];
const trackedOnceKeys = new Set<string>();

function handleForwardedAnalyticsEvent(event: Event) {
  const customEvent = event as CustomEvent<{
    name?: unknown;
    params?: EventParamsInput;
  }>;
  const detail = customEvent.detail;

  if (!detail || typeof detail.name !== 'string') {
    return;
  }

  trackEvent(detail.name, detail.params ?? {});
}

if (typeof window !== 'undefined') {
  window.addEventListener(ANALYTICS_EVENT_NAME, handleForwardedAnalyticsEvent);
}

function normalizeToken(raw: string, fallback: string) {
  const normalized = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || fallback;
}

function normalizeEventName(raw: string) {
  let value = normalizeToken(raw, 'event');
  if (!/^[a-z]/.test(value)) {
    value = `event_${value}`;
  }
  return value.slice(0, 40);
}

function normalizeParamKey(raw: string) {
  let value = normalizeToken(raw, 'param');
  if (!/^[a-z]/.test(value)) {
    value = `p_${value}`;
  }
  return value.slice(0, 40);
}

function normalizeParamValue(value: EventParamInput): EventParam | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return undefined;
    }
    return Math.round(value * 100) / 100;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.slice(0, 100);
}

function normalizeParams(params: EventParamsInput): EventParams {
  const normalized: EventParams = {};

  Object.entries(params).forEach(([key, value]) => {
    const normalizedValue = normalizeParamValue(value);
    if (normalizedValue === undefined) {
      return;
    }

    const normalizedKey = normalizeParamKey(key);
    normalized[normalizedKey] = normalizedValue;
  });

  return normalized;
}

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
    // Ignore localStorage access issues.
  }
}

function detectDeviceClass() {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  const ua = window.navigator.userAgent.toLowerCase();
  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }
  if (/(mobile|iphone|ipod|android|iemobile|blackberry|opera mini)/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function detectPlatformHint() {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  const ua = window.navigator.userAgent.toLowerCase();
  if (/(iphone|ipad|ipod)/i.test(ua)) {
    return 'ios';
  }
  if (/android/i.test(ua)) {
    return 'android';
  }
  if (/mac os x/i.test(ua)) {
    return 'macos';
  }
  if (/windows/i.test(ua)) {
    return 'windows';
  }
  if (/linux/i.test(ua)) {
    return 'linux';
  }
  return 'other';
}

function getVisitorState(): VisitorState {
  if (cachedVisitorState) {
    return cachedVisitorState;
  }

  if (typeof window === 'undefined') {
    cachedVisitorState = { type: 'new' };
    return cachedVisitorState;
  }

  const existing = safeGetStorage(VISITOR_STORAGE_KEY);
  if (existing) {
    const parsed = Number(existing);
    cachedVisitorState = {
      type: 'returning',
      firstSeenAt: Number.isFinite(parsed) ? parsed : undefined
    };
    return cachedVisitorState;
  }

  const now = Date.now();
  safeSetStorage(VISITOR_STORAGE_KEY, String(now));
  cachedVisitorState = {
    type: 'new',
    firstSeenAt: now
  };
  return cachedVisitorState;
}

function readStoredAttribution() {
  const raw = safeGetStorage(ATTRIBUTION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AttributionData;
    if (!parsed.source || !parsed.medium || !parsed.capturedAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function getReferrerHost() {
  if (!document.referrer) {
    return undefined;
  }

  try {
    return new URL(document.referrer).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

function getCurrentAttribution(): AttributionData {
  const url = new URL(window.location.href);
  const source = url.searchParams.get('utm_source')?.trim() || getReferrerHost() || 'direct';
  const medium =
    url.searchParams.get('utm_medium')?.trim() || (document.referrer ? 'referral' : 'none');
  const campaign = url.searchParams.get('utm_campaign')?.trim() || undefined;
  const content = url.searchParams.get('utm_content')?.trim() || undefined;
  const term = url.searchParams.get('utm_term')?.trim() || undefined;

  return {
    source,
    medium,
    campaign,
    content,
    term,
    referrerHost: getReferrerHost(),
    capturedAt: new Date().toISOString()
  };
}

function getAttributionContext() {
  const firstTouch = readStoredAttribution();
  const currentTouch = getCurrentAttribution();

  if (!firstTouch) {
    safeSetStorage(ATTRIBUTION_STORAGE_KEY, JSON.stringify(currentTouch));
  }

  return {
    current: currentTouch,
    first: firstTouch ?? currentTouch
  };
}

function flushPendingEvents() {
  if (!eventHandler || pendingEvents.length === 0) {
    return;
  }

  const buffered = pendingEvents.splice(0, pendingEvents.length);
  buffered.forEach(({ name, params }) => {
    dispatchEvent(name, params);
  });
}

function dispatchEvent(name: string, params: EventParamsInput = {}) {
  if (!eventHandler) {
    return;
  }

  const normalizedName = normalizeEventName(name);
  const normalizedParams = normalizeParams(params);
  eventHandler(normalizedName, normalizedParams);
}

function bufferEvent(name: string, params: EventParamsInput = {}) {
  if (pendingEvents.length >= MAX_BUFFERED_EVENTS) {
    pendingEvents.shift();
  }

  pendingEvents.push({ name, params });
}

function trackOnce(key: string, eventName: string, params: EventParamsInput) {
  if (trackedOnceKeys.has(key)) {
    return;
  }

  trackedOnceKeys.add(key);
  trackEvent(eventName, params);
}

function createGa4Handler(): EventHandler | null {
  if (typeof window.gtag !== 'function') {
    return null;
  }

  return (eventName, params) => {
    window.gtag?.('event', eventName, params);
  };
}

function createPlausibleHandler(): EventHandler {
  return (eventName, params) => {
    if (typeof window.plausible !== 'function') {
      return;
    }
    window.plausible(eventName, { props: params });
  };
}

async function createFirebaseHandler(config: FirebaseAnalyticsConfig): Promise<EventHandler | null> {
  try {
    const appModule = await import('firebase/app');
    const analyticsModule = await import('firebase/analytics');
    const supported = await analyticsModule.isSupported();

    if (!supported) {
      return null;
    }

    const app = appModule.getApps()[0] ?? appModule.initializeApp(config.firebase);
    const analytics = analyticsModule.getAnalytics(app);

    analyticsModule.setConsent({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
      functionality_storage: 'granted',
      security_storage: 'granted'
    });

    const visitorState = getVisitorState();
    analyticsModule.setUserProperties(analytics, {
      visitor_type: visitorState.type,
      device_class: detectDeviceClass(),
      platform_hint: detectPlatformHint()
    });

    return (eventName, params) => {
      analyticsModule.logEvent(analytics, eventName, params);
    };
  } catch {
    return createGa4Handler();
  }
}

async function resolveEventHandler(config: AnalyticsConfig): Promise<EventHandler | null> {
  if (config.provider === 'firebase') {
    return createFirebaseHandler(config);
  }

  if (config.provider === 'ga4') {
    return createGa4Handler();
  }

  if (config.provider === 'plausible') {
    return createPlausibleHandler();
  }

  return null;
}

function inferLinkLabel(link: HTMLAnchorElement) {
  const dataLabel = link.dataset.analyticsLabel;
  if (dataLabel) {
    return dataLabel;
  }

  const ariaLabel = link.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel;
  }

  return link.textContent?.trim() || 'link';
}

function parseHref(rawHref: string) {
  try {
    return new URL(rawHref, window.location.href);
  } catch {
    return null;
  }
}

function inferLinkType(url: URL) {
  const host = url.hostname.toLowerCase();

  if (url.protocol === 'mailto:') {
    return 'email';
  }
  if (url.protocol === 'tel:') {
    return 'phone';
  }
  if (host.includes('testflight.apple.com')) {
    return 'testflight';
  }
  if (host.includes('apps.apple.com')) {
    return 'app_store';
  }
  if (host.includes('play.google.com')) {
    return 'google_play';
  }
  if (
    host.includes('x.com') ||
    host.includes('twitter.com') ||
    host.includes('instagram.com') ||
    host.includes('tiktok.com') ||
    host.includes('github.com')
  ) {
    return 'social';
  }
  return 'external';
}

function inferClickLocation(element: HTMLElement) {
  if (element.dataset.analyticsLocation) {
    return element.dataset.analyticsLocation;
  }

  const parentSection = element.closest('section[id]');
  if (parentSection) {
    return parentSection.id;
  }

  const parentHeader = element.closest('header');
  if (parentHeader) {
    return 'header';
  }

  const parentFooter = element.closest('footer');
  if (parentFooter) {
    return 'footer';
  }

  return 'global';
}

function trackLinkClick(link: HTMLAnchorElement, options: TrackLinkOptions) {
  const rawHref = link.getAttribute('href');
  if (!rawHref) {
    return;
  }

  const url = parseHref(rawHref);
  if (!url) {
    return;
  }

  const isExternal = url.origin !== window.location.origin;
  const linkType = inferLinkType(url);
  const label = inferLinkLabel(link);
  const location = inferClickLocation(link);

  if (!options.hasCustomEvent) {
    const hasWaitlistHash = url.hash === '#waitlist';
    if (hasWaitlistHash) {
      trackEvent('cta_click', {
        cta_target: 'waitlist',
        cta_label: label,
        cta_location: location
      });
    }

    if (linkType === 'testflight' || linkType === 'app_store' || linkType === 'google_play') {
      trackEvent('cta_click', {
        cta_target: linkType,
        cta_label: label,
        cta_location: location
      });
    }
  }

  if (isExternal || url.protocol === 'mailto:' || url.protocol === 'tel:') {
    trackEvent('outbound_click', {
      link_type: linkType,
      link_host: url.hostname || url.protocol.replace(':', ''),
      link_path: url.pathname,
      link_label: label,
      link_location: location
    });
  }
}

function trackCustomElementEvent(element: HTMLElement) {
  const eventName = element.dataset.analyticsEvent;
  if (!eventName) {
    return;
  }

  trackEvent(eventName, {
    cta_target: element.dataset.analyticsTarget,
    cta_label: element.dataset.analyticsLabel,
    cta_location: inferClickLocation(element)
  });
}

function setupClickTracking() {
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const trackedElement = target.closest<HTMLElement>('[data-analytics-event]');
      const link = target.closest<HTMLAnchorElement>('a[href]');

      if (trackedElement) {
        trackCustomElementEvent(trackedElement);
      }

      if (link) {
        trackLinkClick(link, { hasCustomEvent: Boolean(trackedElement) });
      }
    },
    { capture: true }
  );
}

function setupScrollDepthTracking() {
  const seenMilestones = new Set<number>();
  let ticking = false;

  const handleScroll = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      const doc = document.documentElement;
      const totalHeight = doc.scrollHeight;
      const viewportBottom = window.scrollY + window.innerHeight;
      const progress = totalHeight > 0 ? (viewportBottom / totalHeight) * 100 : 0;

      SCROLL_MILESTONES.forEach((milestone) => {
        if (seenMilestones.has(milestone)) {
          return;
        }

        if (progress >= milestone) {
          seenMilestones.add(milestone);
          trackEvent('scroll_depth', {
            scroll_percent: milestone,
            page_path: window.location.pathname
          });
        }
      });

      ticking = false;
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

function setupSectionTracking() {
  if (!('IntersectionObserver' in window)) {
    return;
  }

  const sectionIds = ['how-it-works', 'waitlist'];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.3) {
          return;
        }

        const target = entry.target as HTMLElement;
        const sectionId = target.id;
        if (!sectionId) {
          return;
        }

        trackOnce(`section:${sectionId}`, 'section_view', {
          section_id: sectionId,
          visibility_percent: Math.round(entry.intersectionRatio * 100)
        });
        observer.unobserve(target);
      });
    },
    {
      threshold: [0.3, 0.6]
    }
  );

  sectionIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      observer.observe(element);
    }
  });
}

function getPaintMetric(name: string) {
  const paintEntries = performance.getEntriesByType('paint');
  const entry = paintEntries.find((item) => item.name === name);
  if (!entry) {
    return undefined;
  }
  return Math.round(entry.startTime);
}

function setupPerformanceTracking() {
  let lcpMs: number | undefined;

  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          lcpMs = Math.round(lastEntry.startTime);
        }
      });

      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      const stopObserving = () => {
        const records = lcpObserver.takeRecords();
        const lastRecord = records[records.length - 1];
        if (lastRecord) {
          lcpMs = Math.round(lastRecord.startTime);
        }
        lcpObserver.disconnect();
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          stopObserving();
        }
      });

      window.addEventListener('pagehide', stopObserving, { once: true });
    } catch {
      // Ignore unsupported observer APIs.
    }
  }

  window.addEventListener(
    'load',
    () => {
      window.setTimeout(() => {
        const metrics: EventParamsInput = {};
        const navigationEntries = performance.getEntriesByType(
          'navigation'
        ) as PerformanceNavigationTiming[];
        const navigation = navigationEntries[0];

        if (navigation) {
          metrics.ttfb_ms = Math.round(navigation.responseStart - navigation.requestStart);
          metrics.dom_content_loaded_ms = Math.round(
            navigation.domContentLoadedEventEnd - navigation.startTime
          );
          metrics.load_ms = Math.round(navigation.loadEventEnd - navigation.startTime);
          if (navigation.transferSize > 0) {
            metrics.transfer_kb = Math.round(navigation.transferSize / 1024);
          }
        }

        const fcpMs = getPaintMetric('first-contentful-paint');
        if (fcpMs !== undefined) {
          metrics.fcp_ms = fcpMs;
        }

        if (lcpMs !== undefined) {
          metrics.lcp_ms = lcpMs;
        }

        if (Object.keys(metrics).length > 0) {
          trackEvent('page_performance', metrics);
        }
      }, 0);
    },
    { once: true }
  );
}

function normalizeErrorMessage(value: unknown) {
  if (typeof value === 'string') {
    return value.slice(0, 140);
  }

  if (value && typeof value === 'object' && 'message' in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message.slice(0, 140);
    }
  }

  return 'unknown';
}

function extractErrorSource(urlString: string | undefined) {
  if (!urlString) {
    return undefined;
  }

  const parsed = parseHref(urlString);
  if (!parsed) {
    return undefined;
  }

  return parsed.pathname;
}

function setupFailureTracking() {
  const seenFingerprints = new Set<string>();

  const trackError = (eventName: string, fingerprint: string, params: EventParamsInput) => {
    if (seenFingerprints.has(fingerprint)) {
      return;
    }
    if (seenFingerprints.size >= MAX_ERROR_EVENTS) {
      return;
    }

    seenFingerprints.add(fingerprint);
    trackEvent(eventName, params);
  };

  window.addEventListener(
    'error',
    (event) => {
      const target = event.target;

      if (
        target instanceof HTMLImageElement ||
        target instanceof HTMLScriptElement ||
        target instanceof HTMLLinkElement ||
        target instanceof HTMLVideoElement
      ) {
        const urlValue =
          ('currentSrc' in target ? target.currentSrc : '') ||
          ('src' in target ? target.src : '') ||
          ('href' in target ? target.href : '');
        const parsedUrl = urlValue ? parseHref(urlValue) : null;
        const fingerprint = `resource:${target.tagName}:${urlValue}`;

        trackError('resource_load_failure', fingerprint, {
          resource_type: target.tagName.toLowerCase(),
          resource_host: parsedUrl?.hostname || undefined,
          resource_path: parsedUrl?.pathname || undefined
        });
        return;
      }

      const errorEvent = event as ErrorEvent;
      if (!errorEvent.message) {
        return;
      }

      const fingerprint = `js:${errorEvent.message}:${errorEvent.filename}:${errorEvent.lineno}`;
      trackError('js_error', fingerprint, {
        message: normalizeErrorMessage(errorEvent.message),
        source_file: extractErrorSource(errorEvent.filename),
        line: errorEvent.lineno || undefined
      });
    },
    true
  );

  window.addEventListener('unhandledrejection', (event) => {
    const message = normalizeErrorMessage(event.reason);
    const fingerprint = `rejection:${message}`;
    trackError('promise_rejection', fingerprint, { message });
  });
}

function setupMediaTracking() {
  const mediaElements = document.querySelectorAll<HTMLMediaElement>('video, audio');
  mediaElements.forEach((media, index) => {
    let played = false;

    media.addEventListener('play', () => {
      if (played) {
        return;
      }

      played = true;
      trackEvent('media_play', {
        media_type: media.tagName.toLowerCase(),
        media_id: media.dataset.analyticsMedia || media.id || `media_${index + 1}`,
        page_path: window.location.pathname
      });
    });
  });
}

function setupPageViewTracking() {
  const visitorState = getVisitorState();
  const attribution = getAttributionContext();

  trackEvent('landing_page_view', {
    page_path: window.location.pathname,
    page_title: document.title,
    visitor_type: visitorState.type,
    device_class: detectDeviceClass(),
    platform_hint: detectPlatformHint(),
    source: attribution.current.source,
    medium: attribution.current.medium,
    campaign: attribution.current.campaign,
    content: attribution.current.content,
    term: attribution.current.term,
    referrer_host: attribution.current.referrerHost,
    first_source: attribution.first.source,
    first_medium: attribution.first.medium
  });
}

export function trackEvent(name: string, params: EventParamsInput = {}) {
  if (disableTracking || typeof window === 'undefined') {
    return;
  }

  if (!initStarted) {
    void initLandingAnalytics();
  }

  if (!eventHandler) {
    bufferEvent(name, params);
    return;
  }

  dispatchEvent(name, params);
}

export async function initLandingAnalytics() {
  if (initStarted || typeof window === 'undefined') {
    return;
  }
  initStarted = true;

  const analyticsConfig = window.__CALIGO_ANALYTICS__;
  if (!analyticsConfig) {
    initStarted = false;
    if (document.readyState === 'complete') {
      disableTracking = true;
      pendingEvents.length = 0;
    }
    return;
  }

  const resolvedHandler = await resolveEventHandler(analyticsConfig);
  if (!resolvedHandler) {
    disableTracking = true;
    pendingEvents.length = 0;
    return;
  }

  eventHandler = resolvedHandler;
  setupPageViewTracking();
  flushPendingEvents();
  setupClickTracking();
  setupSectionTracking();
  setupScrollDepthTracking();
  setupPerformanceTracking();
  setupFailureTracking();
  setupMediaTracking();
}
