const LEAD_STORAGE_KEY = 'caligo:leads';
const RATE_LIMIT_KEY = 'caligo:last-submit';
const RATE_LIMIT_MS = 15000;

export type LeadSource = 'waitlist' | 'contact';

export interface LeadPayload {
  email: string;
  source: LeadSource;
  message?: string;
  honeypot?: string;
}

export type LeadResult =
  | {
      ok: true;
      mode: 'remote' | 'local';
      message: string;
    }
  | {
      ok: false;
      message: string;
      retryAfterMs?: number;
    };

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function now() {
  return Date.now();
}

function getRetryAfterMs(source: LeadSource) {
  if (typeof window === 'undefined') {
    return 0;
  }

  const raw = window.localStorage.getItem(`${RATE_LIMIT_KEY}:${source}`);
  if (!raw) {
    return 0;
  }

  const previous = Number(raw);
  if (Number.isNaN(previous)) {
    return 0;
  }

  const elapsed = now() - previous;
  const remaining = RATE_LIMIT_MS - elapsed;
  return remaining > 0 ? remaining : 0;
}

function markSubmit(source: LeadSource) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(`${RATE_LIMIT_KEY}:${source}`, String(now()));
}

function storeLocalLead(payload: LeadPayload) {
  if (typeof window === 'undefined') {
    return;
  }

  const existingRaw = window.localStorage.getItem(LEAD_STORAGE_KEY);
  const existing = existingRaw ? (JSON.parse(existingRaw) as LeadPayload[]) : [];

  existing.push({
    email: payload.email,
    source: payload.source,
    message: payload.message
  });

  window.localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(existing));
}

async function postRemoteLead(payload: LeadPayload) {
  const endpoint = import.meta.env.PUBLIC_WAITLIST_ENDPOINT;
  if (!endpoint) {
    return null;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: payload.email,
        source: payload.source,
        message: payload.message,
        submittedAt: new Date().toISOString()
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return {
        ok: false,
        message: 'Submission failed. Please try again shortly.'
      } satisfies LeadResult;
    }

    return {
      ok: true,
      mode: 'remote',
      message: 'Thanks. You are on the list.'
    } satisfies LeadResult;
  } catch {
    return {
      ok: false,
      message: 'Network issue. Please try again shortly.'
    } satisfies LeadResult;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  const email = payload.email.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return {
      ok: false,
      message: 'Enter a valid email address.'
    };
  }

  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    return {
      ok: true,
      mode: 'local',
      message: 'Thanks for your interest.'
    };
  }

  const retryAfterMs = getRetryAfterMs(payload.source);
  if (retryAfterMs > 0) {
    return {
      ok: false,
      message: 'Please wait a few seconds before trying again.',
      retryAfterMs
    };
  }

  markSubmit(payload.source);

  const remoteResult = await postRemoteLead({ ...payload, email });
  if (remoteResult) {
    return remoteResult;
  }

  storeLocalLead({ ...payload, email });
  return {
    ok: true,
    mode: 'local',
    message: 'Saved locally (demo).'
  };
}
