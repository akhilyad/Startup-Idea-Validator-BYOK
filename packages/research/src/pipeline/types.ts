import type { PrismaClient } from '@sift/db';
import type { LLMProvider } from '@sift/ai';
import type { Logger } from '@sift/observability';
import type { ResearchRunType } from '@sift/types';
import type { SearchProvider } from '../search/types.js';

export interface PipelineDeps {
  prisma: PrismaClient;
  llm: LLMProvider;
  search: SearchProvider;
  logger: Logger;
  /** Injectable clock for deterministic tests. */
  now?: () => Date;
}

export interface PipelineOptions {
  analysisId: string;
  runId: string;
  runType: ResearchRunType;
  /** Optional free-text focus for a challenge run. */
  focus?: string;
}

export interface PipelineResult {
  status: 'COMPLETE' | 'PARTIAL' | 'FAILED' | 'CANCELLED';
  qualityStatus: string;
  sourceCount: number;
  claimCount: number;
  assumptionCount: number;
  tokenCost: number;
  searchCost: number;
}

export interface NormalizedIdeaContext {
  customer: string;
  problem: string;
  solution: string;
  industry: string | null;
  geography: string | null;
  businessModel: string | null;
  pricing: string | null;
  distribution: string | null;
  technology: string | null;
}
