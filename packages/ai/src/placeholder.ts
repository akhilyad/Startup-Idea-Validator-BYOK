import { createLogger } from '@sift/observability';
import { coreBuilders } from './placeholder-builders.js';
import { researchBuilders } from './placeholder-builders2.js';
import { synthesisBuilders } from './placeholder-builders3.js';
import type { StubBuilder } from './placeholder-context.js';
import type {
  GenerateStructuredParams,
  GenerateTextParams,
  LLMProvider,
  LLMUsage,
  ModelMetadata,
  StructuredResult,
  TextResult,
} from './types.js';

const logger = createLogger('ai.placeholder');

const builders: Record<string, StubBuilder> = {
  ...coreBuilders,
  ...researchBuilders,
  ...synthesisBuilders,
};

const MODELS: Record<string, ModelMetadata> = {
  'placeholder-reasoning': {
    id: 'placeholder-reasoning',
    provider: 'placeholder',
    tier: 'reasoning',
    contextWindow: 128000,
    costPer1kInputUsd: 0,
    costPer1kOutputUsd: 0,
  },
  'placeholder-fast': {
    id: 'placeholder-fast',
    provider: 'placeholder',
    tier: 'fast',
    contextWindow: 128000,
    costPer1kInputUsd: 0,
    costPer1kOutputUsd: 0,
  },
};

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * Deterministic, offline placeholder provider.
 *
 * It exists so the full pipeline is runnable and testable with ZERO external
 * API keys. It is a heuristic reasoner, not a language model: outputs are
 * derived from the structured task context and clearly marked `synthetic: true`.
 *
 * IMPORTANT: it must never be presented as real research. Callers persist
 * `synthetic` provenance, the UI surfaces a "placeholder research" banner, and
 * production requires configuring a real LLM_PROVIDER.
 */
export class PlaceholderLLMProvider implements LLMProvider {
  readonly name = 'placeholder';

  private usage(inputTokens: number, outputTokens: number, model: string): LLMUsage {
    const meta = this.getModelMetadata(model);
    return {
      provider: this.name,
      model,
      inputTokens,
      outputTokens,
      costUsd: this.estimateCost(inputTokens, outputTokens, model),
    };
  }

  getModelMetadata(model?: string): ModelMetadata {
    const key = model && MODELS[model] ? model : 'placeholder-reasoning';
    return MODELS[key] as ModelMetadata;
  }

  estimateCost(inputTokens: number, outputTokens: number, model?: string): number {
    const meta = this.getModelMetadata(model);
    return (inputTokens / 1000) * meta.costPer1kInputUsd + (outputTokens / 1000) * meta.costPer1kOutputUsd;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  async generateStructured<T>(params: GenerateStructuredParams<T>): Promise<StructuredResult<T>> {
    const builder = builders[params.schemaName];
    if (!builder) {
      throw new Error(
        `Placeholder provider has no builder for schema "${params.schemaName}". ` +
          'Configure a real LLM_PROVIDER for this task.',
      );
    }
    const candidate = builder(params.context);
    // Validate exactly like a real provider would, so callers can rely on the
    // same failure mode (ZodError -> retry -> TASK_FAILED).
    const output = params.schema.parse(candidate) as T;
    const usage = this.usage(
      estimateTokens(JSON.stringify(params.context)),
      estimateTokens(JSON.stringify(output)),
      params.model ?? 'placeholder-reasoning',
    );
    logger.debug('llm.placeholder.structured', { schemaName: params.schemaName });
    return { output, usage, synthetic: true };
  }

  async generateText(params: GenerateTextParams): Promise<TextResult> {
    const context = params.context ?? {};
    const summary =
      typeof context.summary === 'string'
        ? context.summary
        : 'Placeholder text generation. Configure a real LLM_PROVIDER for production output.';
    const text = `${summary}\n\n(prompt length: ${params.prompt.length} chars)`;
    return {
      text,
      usage: this.usage(
        estimateTokens(params.prompt),
        estimateTokens(text),
        params.model ?? 'placeholder-fast',
      ),
      synthetic: true,
    };
  }
}
