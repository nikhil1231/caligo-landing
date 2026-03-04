export const SITE_NAME = 'Caligo Tracker';
export const DEFAULT_SITE_URL = 'https://caligotracker.app';
export const CONTACT_EMAIL = 'hello@caligotracker.app';

export const SITE_URL = (import.meta.env.PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(
  /\/+$/,
  ''
);

export function absoluteUrl(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, `${SITE_URL}/`).toString();
}

export function withBasePath(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = import.meta.env.BASE_URL ?? '/';

  if (base === '/' || base === '') {
    return normalized;
  }

  const cleanBase = base.replace(/\/$/, '');
  return `${cleanBase}${normalized}`;
}

export function homeSectionLink(sectionId: string) {
  const hash = sectionId.startsWith('#') ? sectionId : `#${sectionId}`;
  return `${withBasePath('/')}${hash}`;
}
