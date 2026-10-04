import { z } from 'zod';
import {
  AppError,
  createLogger,
  observe,
} from '@sift/observability';
import type {
  GenerateStructuredParams,
  GenerateTextParams,
  LLMProvider,
  LLMUsage,
  ModelMetadata,
  StructuredResult,
  TextResult,
} from './types.js';

const logger = createLogger('ai');

export interface ValidatedGenerateResult<T> {
  output: T;
  usage: LLMUsage;
  synthetic: boolean;
  attempts: number;
}

/**
 * Wraps a provider's structured generation with the validation loop required by
 * TPRD §38:
 *
 *   LLM output -> parse -> Zod validate -> (retry | fail)
 *
 * The provider already parses+validates; this helper adds bounded retries with a
 * repair instruction. After the retry budget is exhausted it throws a
 * `TASK_FAILED` AppError so callers mark the task failed rather than persisting
 * malformed output.
 */
export async function generateValidated<T>(
  provider: LLMProvider,
  params: GenerateStructuredParams<T>,
  options: { maxAttempts?: number } = {},
): Promise<ValidatedGenerateResult<T>> {
  const maxAttempts = options.maxAttempts ?? 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await provider.generateStructured(params);
      return { ...result, attempts: attempt };
    } catch (error) {
      lastError = error;
      const isValidationError =
        error instanceof z.ZodError ||
        (error instanceof Error && /valid|schema|parse/i.test(error.message));
      logger.warn('llm.structured.invalid', {
        schemaName: params.schemaName,
        attempt,
        retryable: isValidationError,
        error: error instanceof Error ? error.message : String(error),
      });
      if (!isValidationError) throw error;
      observe('llm_validation_retry_total', 1, { schema: params.schemaName });
    }
  }

  throw new AppError('TASK_FAILED', `Structured output for ${params.schemaName} failed validation.`, {
    httpStatus: 502,
    details: { schemaName: params.schemaName, error: String(lastError) },
  });
}

export type { GenerateTextParams, TextResult, LLMUsage, ModelMetadata, StructuredResult };
