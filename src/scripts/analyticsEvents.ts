type EventParamInput = string | number | boolean | null | undefined;
type EventParamsInput = Record<string, EventParamInput>;

interface AnalyticsEventDetail {
  name: string;
  params?: EventParamsInput;
}

const ANALYTICS_EVENT_NAME = 'caligo:analytics:event';

export function emitAnalyticsEvent(name: string, params: EventParamsInput = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const detail: AnalyticsEventDetail = { name, params };
  window.dispatchEvent(new CustomEvent<AnalyticsEventDetail>(ANALYTICS_EVENT_NAME, { detail }));
}
