import { env } from '@sift/config';
import { AppError } from '@sift/observability';
import { PlaceholderSearchProvider } from './placeholder.js';
import type { SearchProvider } from './types.js';

let cached: SearchProvider | undefined;

/**
 * Resolve the configured search provider (TPRD §40). Only the offline
 * placeholder is implemented in this build; adding a vendor means implementing
 * `SearchProvider` and registering it here.
 */
export function getSearchProvider(): SearchProvider {
  if (cached) return cached;
  switch (env.SEARCH_PROVIDER) {
    case 'placeholder':
      cached = new PlaceholderSearchProvider();
      break;
    default:
      throw new AppError(
        'SEARCH_PROVIDER_NOT_CONFIGURED',
        `Search provider "${env.SEARCH_PROVIDER}" is not implemented in this build. ` +
          'Set SEARCH_PROVIDER=placeholder or register an adapter implementing SearchProvider.',
        { httpStatus: 500 },
      );
  }
  return cached;
}

export function setSearchProvider(provider: SearchProvider): void {
  cached = provider;
}

export * from './types.js';
export { PlaceholderSearchProvider } from './placeholder.js';
