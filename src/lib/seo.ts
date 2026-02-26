import { absoluteUrl, SITE_NAME } from './site';

export interface SeoInput {
  title?: string;
  description: string;
  path?: string;
  imagePath?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
}

export function buildSeo({
  title,
  description,
  path = '/',
  imagePath = '/og-image.png',
  noIndex = false,
  type = 'website'
}: SeoInput) {
  const canonical = absoluteUrl(path);
  const ogImage = absoluteUrl(imagePath);
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return {
    canonical,
    description,
    fullTitle,
    noIndex,
    ogImage,
    type
  };
}
