import { createLogger } from '@sift/observability';
import type { SourceTier, SourceType } from '@sift/types';
import { canonicalizeUrl, registrableDomain, sha256 } from '../util/url.js';
import { extractHtml } from './html.js';
import type {
  RetrievedDocument,
  SearchProvider,
  SearchProviderMetadata,
  SearchQuery,
  SearchResult,
} from './types.js';

const logger = createLogger('research.search');

export interface SearchProviderOptions {
  /** Milliseconds before an outbound fetch is aborted. */
  fetchTimeoutMs?: number;
  /** User-Agent used for real fetches. */
  userAgent?: string;
}

const SYNTHETIC_PUBLISHERS = [
  'Example Industry Review',
  'Synthetic Market Notes',
  'Placeholder Community Thread',
  'Example Regulatory Bulletin',
  'Synthetic Pricing Index',
];

/**
 * Offline placeholder search provider.
 *
 * It performs NO network search: results are deterministically derived from the
 * query text and every result is flagged `synthetic: true` with an unresolvable
 * `.invalid` URL. This keeps the pipeline runnable without API keys while never
 * masquerading as real research (TPRD §94 Rule 3 / Rule 8).
 *
 * `retrieve()` is real: for genuine http(s) URLs it performs an actual HTTP
 * fetch, extracts readable text and records accessibility. Only synthetic
 * `.invalid` URLs short-circuit to generated content.
 */
export class PlaceholderSearchProvider implements SearchProvider {
  readonly name = 'placeholder';
  private readonly fetchTimeoutMs: number;
  private readonly userAgent: string;

  constructor(options: SearchProviderOptions = {}) {
    this.fetchTimeoutMs = options.fetchTimeoutMs ?? 8000;
    this.userAgent = options.userAgent ?? 'SiftBot/0.1 (+https://example.invalid/sift)';
  }

  getMetadata(): SearchProviderMetadata {
    return { name: this.name, supportsRetrieval: true, requiresApiKey: false, synthetic: true };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const seed = parseInt(sha256(query.text).slice(0, 8), 16);
    const count = 3 + (seed % 3);
    const tier: SourceTier =
      query.queryClass === 'COMMUNITY' ? 'TIER_3_COMMUNITY' : 'TIER_4_LOW_CONFIDENCE';
    const sourceType: SourceType = query.queryClass === 'COMMUNITY' ? 'COMMUNITY' : 'LOW_CONFIDENCE';

    const results: SearchResult[] = [];
    for (let i = 0; i < count; i += 1) {
      const slug = sha256(`${query.text}:${i}`).slice(0, 10);
      const label = SYNTHETIC_PUBLISHERS[(seed + i) % SYNTHETIC_PUBLISHERS.length] as string;
      results.push({
        url: `https://example.invalid/sift/synthetic/${slug}`,
        title: `[SYNTHETIC] ${label}: ${query.text.slice(0, 70)}`,
        snippet: `Placeholder result for query class ${query.queryClass}. Not a real source; configure a search provider for production research.`,
        publisher: label,
        publishedAt: null,
        sourceType,
        tier,
        queryClass: query.queryClass,
        synthetic: true,
      });
    }
    logger.debug('search.placeholder.results', { queryClass: query.queryClass, count });
    return results;
  }

  async retrieve(url: string): Promise<RetrievedDocument> {
    const canonical = canonicalizeUrl(url) ?? url;
    const host = (() => {
      try {
        return new URL(canonical).hostname;
      } catch {
        return '';
      }
    })();

    if (host.endsWith('.invalid')) {
      const content =
        `Synthetic placeholder document for ${canonical}. ` +
        'This content was generated locally because no real search provider is configured. ' +
        'It must not be treated as evidence.';
      return {
        url,
        canonicalUrl: canonical,
        httpStatus: 200,
        accessibilityStatus: 'ACCESSIBLE',
        title: `[SYNTHETIC] ${host}`,
        publisher: 'placeholder.local',
        author: null,
        publishedAt: null,
        content,
        contentHash: sha256(content),
        geography: null,
        population: null,
        synthetic: true,
        rawBytes: content.length,
      };
    }

    return this.fetchReal(url, canonical);
  }

  /** Real network retrieval with timeout, used for genuine URLs (TPRD §41). */
  private async fetchReal(url: string, canonical: string): Promise<RetrievedDocument> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.fetchTimeoutMs);
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': this.userAgent, accept: 'text/html,application/xhtml+xml' },
      });
      const body = await response.text();
      const extracted = extractHtml(body, response.url || url);
      const finalCanonical = extracted.canonicalUrl
        ? canonicalizeUrl(extracted.canonicalUrl) ?? canonical
        : canonicalizeUrl(response.url) ?? canonical;
      const status = response.status;
      const accessibilityStatus =
        status === 403 || status === 451
          ? 'BLOCKED'
          : status === 401
            ? 'PAYWALLED'
            : status >= 400
              ? 'ACCESS_UNAVAILABLE'
              : extracted.text.length < 200
                ? 'PARTIAL'
                : 'ACCESSIBLE';
      return {
        url,
        canonicalUrl: finalCanonical,
        httpStatus: status,
        accessibilityStatus,
        title: extracted.title,
        publisher: extracted.publisher ?? registrableDomain(new URL(finalCanonical).hostname),
        author: extracted.author,
        publishedAt: extracted.publishedAt,
        content: extracted.text,
        contentHash: sha256(extracted.text),
        geography: null,
        population: null,
        synthetic: false,
        rawBytes: body.length,
      };
    } catch (error) {
      logger.warn('retrieval.failed', {
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        url,
        canonicalUrl: canonical,
        httpStatus: 0,
        accessibilityStatus: 'ACCESS_UNAVAILABLE',
        title: null,
        publisher: null,
        author: null,
        publishedAt: null,
        content: '',
        contentHash: sha256(''),
        geography: null,
        population: null,
        synthetic: false,
        rawBytes: 0,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
