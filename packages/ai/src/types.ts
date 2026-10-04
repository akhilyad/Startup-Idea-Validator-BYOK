import type { z } from 'zod';
import type { JsonValue } from '@sift/types';

/** Metadata describing a model available through an LLM provider. */
export interface ModelMetadata {
  id: string;
  provider: string;
  /** Rough reasoning capability class — used for model routing (TPRD §68). */
  tier: 'fast' | 'standard' | 'reasoning';
  contextWindow: number;
  costPer1kInputUsd: number;
  costPer1kOutputUsd: number;
}

export interface LLMUsage {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export interface GenerateStructuredParams<T> {
  /** Stable, schema-name key. Used by the placeholder provider to route. */
  schemaName: string;
  schema: z.ZodType<T>;
  system: string;
  prompt: string;
  /** Machine-readable task input. Used by providers and for repair prompts. */
  context: Record<string, unknown>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface StructuredResult<T> {
  output: T;
  usage: LLMUsage;
  /** True when produced by a placeholder/heuristic provider, not a real model. */
  synthetic: boolean;
}

export interface GenerateTextParams {
  system: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
  context?: Record<string, unknown>;
}

export interface TextResult {
  text: string;
  usage: LLMUsage;
  synthetic: boolean;
}

/**
 * The single seam through which all model calls flow (TPRD §39). Domain code
 * depends on this interface, never on a vendor SDK.
 */
export interface LLMProvider {
  readonly name: string;
  generateStructured<T>(params: GenerateStructuredParams<T>): Promise<StructuredResult<T>>;
  generateText(params: GenerateTextParams): Promise<TextResult>;
  estimateCost(inputTokens: number, outputTokens: number, model?: string): number;
  getModelMetadata(model?: string): ModelMetadata;
  healthCheck(): Promise<boolean>;
}

/** JSON Schema-ish description passed alongside prompts (for real providers). */
export type StructuredSchemaHint = JsonValue;
