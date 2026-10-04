import { env } from '@sift/config';
import { AppError } from '@sift/observability';
import { PlaceholderLLMProvider } from './placeholder.js';
import type { LLMProvider } from './types.js';

let cached: LLMProvider | undefined;

/**
 * Resolve the configured LLM provider (TPRD §39). Provider selection lives in
 * infrastructure configuration, never in domain code.
 *
 * Only the offline `placeholder` provider is implemented in this build. Adding a
 * vendor requires implementing `LLMProvider` and registering it here — the
 * research pipeline does not change.
 */
export function getLLMProvider(): LLMProvider {
  if (cached) return cached;

  switch (env.LLM_PROVIDER) {
    case 'placeholder':
      cached = new PlaceholderLLMProvider();
      break;
    default:
      throw new AppError(
        'LLM_PROVIDER_NOT_CONFIGURED',
        `LLM provider "${env.LLM_PROVIDER}" is not implemented in this build. ` +
          'Set LLM_PROVIDER=placeholder or register an adapter implementing LLMProvider.',
        { httpStatus: 500, expose: true },
      );
  }
  return cached;
}

export function setLLMProvider(provider: LLMProvider): void {
  cached = provider;
}
