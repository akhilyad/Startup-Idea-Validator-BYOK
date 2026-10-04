import { createHash } from 'node:crypto';

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'ref_src',
  'igshid',
  'yclid',
  '_hsenc',
  '_hsmi',
];

/**
 * Canonicalize a URL so equivalent links collapse to one identity
 * (TPRD §42). Returns null when the input is not a valid absolute http(s) URL.
 */
export function canonicalizeUrl(input: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

  parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  parsed.hash = '';
  parsed.username = '';
  parsed.password = '';
  parsed.protocol = 'https:';
  // Normalise default ports away.
  if ((parsed.port === '80' || parsed.port === '443') && parsed.protocol === 'https:') parsed.port = '';

  const params = new URLSearchParams();
  const entries = Array.from(parsed.searchParams.entries())
    .filter(([key]) => !TRACKING_PARAMS.includes(key.toLowerCase()))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  for (const [key, value] of entries) params.append(key, value);
  const query = params.toString();
  parsed.search = query ? `?${query}` : '';

  let path = parsed.pathname.replace(/\/+$/, '');
  if (path === '') path = '/';
  parsed.pathname = path;

  return parsed.toString();
}

/** Naive registrable-domain (eTLD+1) extraction used for independence checks. */
export function registrableDomain(hostname: string): string {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  const parts = host.split('.');
  if (parts.length <= 2) return host;
  const twoPartTlds = ['co.uk', 'com.au', 'co.nz', 'co.jp', 'com.br', 'co.in', 'org.uk', 'gov.uk', 'ac.uk'];
  const lastTwo = parts.slice(-2).join('.');
  if (twoPartTlds.includes(lastTwo)) return parts.slice(-3).join('.');
  return lastTwo;
}

export function domainOf(url: string): string | null {
  try {
    return registrableDomain(new URL(url).hostname);
  } catch {
    return null;
  }
}

/**
 * Independence key (TPRD §43): two pieces of evidence with the same key are
 * treated as the SAME underlying source (syndication, press-release copies).
 * Prefers the content hash; falls back to the registrable domain.
 */
export function independenceKeyFor(canonicalUrl: string, contentHash: string | null): string {
  if (contentHash) return `hash:${contentHash}`;
  const domain = domainOf(canonicalUrl);
  return domain ? `domain:${domain}` : `url:${canonicalUrl}`;
}
