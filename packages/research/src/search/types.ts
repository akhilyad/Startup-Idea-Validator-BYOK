import type { QueryClass, SourceTier, SourceType } from '@sift/types';

export interface SearchQuery {
  text: string;
  queryClass: QueryClass;
  maxResults?: number;
  /** Restrict to a locale/geography when the provider supports it. */
  geography?: string | null;
}

export interface SearchResult {
  url: string;
  title: string | null;
  snippet: string | null;
  publisher: string | null;
  publishedAt: string | null;
  sourceType: SourceType;
  tier: SourceTier;
  queryClass: QueryClass;
  /** True when produced by a placeholder provider rather than a real index. */
  synthetic: boolean;
}

export interface RetrievedDocument {
  url: string;
  canonicalUrl: string;
  httpStatus: number;
  accessibilityStatus:
    | 'ACCESSIBLE'
    | 'ACCESS_UNAVAILABLE'
    | 'PARTIAL'
    | 'PAYWALLED'
    | 'BLOCKED';
  title: string | null;
  publisher: string | null;
  author: string | null;
  publishedAt: string | null;
  content: string;
  contentHash: string;
  geography: string | null;
  population: string | null;
  synthetic: boolean;
  /** Byte length of the raw response, for observability/cost accounting. */
  rawBytes: number;
}

export interface SearchProviderMetadata {
  name: string;
  supportsRetrieval: boolean;
  requiresApiKey: boolean;
  synthetic: boolean;
}

/**
 * The single seam through which all external search/retrieval flows
 * (TPRD §40). Swapping vendors must not require changing research agents.
 */
export interface SearchProvider {
  readonly name: string;
  search(query: SearchQuery): Promise<SearchResult[]>;
  retrieve(url: string): Promise<RetrievedDocument>;
  getMetadata(): SearchProviderMetadata;
  healthCheck(): Promise<boolean>;
}

export interface SearchProviderHealth {
  ok: boolean;
  provider: string;
  detail?: string;
}
