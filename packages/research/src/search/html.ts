/**
 * Minimal, dependency-free HTML → text + metadata extraction (TPRD §41).
 * Deliberately conservative: when a field cannot be determined it returns null
 * rather than guessing.
 */

export interface ExtractedHtml {
  title: string | null;
  publisher: string | null;
  author: string | null;
  publishedAt: string | null;
  canonicalUrl: string | null;
  text: string;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  rsquo: '’',
  lsquo: '‘',
  ldquo: '“',
  rdquo: '”',
};

export function decodeEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
}

function metaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeEntities(m[1].trim());
  }
  return null;
}

function resolveUrl(href: string, baseUrl: string): string | null {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

export function extractHtml(html: string, baseUrl: string): ExtractedHtml {
  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const title = metaContent(html, 'og:title') ?? (titleTag ? decodeEntities(titleTag.trim()) : null);

  const publisher =
    metaContent(html, 'og:site_name') ?? metaContent(html, 'application-name') ?? null;
  const author = metaContent(html, 'article:author') ?? metaContent(html, 'author') ?? null;
  const publishedAt =
    metaContent(html, 'article:published_time') ??
    metaContent(html, 'datepublished') ??
    html.match(/"datePublished"\s*:\s*"([^"]+)"/i)?.[1] ??
    null;

  const canonicalHref = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
  const canonicalUrl = canonicalHref ? resolveUrl(decodeEntities(canonicalHref), baseUrl) : null;

  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  const text = decodeEntities(
    stripped
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6])[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t\f\v]+/g, ' ')
      .replace(/\n\s*\n+/g, '\n\n')
      .trim(),
  );

  return {
    title,
    publisher,
    author,
    publishedAt: publishedAt ? publishedAt.trim() : null,
    canonicalUrl,
    text,
  };
}
