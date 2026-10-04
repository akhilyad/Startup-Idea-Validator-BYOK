import type { AnalysisStatus } from '@sift/types';
import { publishAnalysisEvent } from '../events.js';
import type { PipelineDeps, PipelineOptions } from './types.js';

export interface IdeaRef {
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

/** Mutable state threaded through the pipeline phases. */
export interface ResearchState {
  analysisId: string;
  runId: string;
  runType: PipelineOptions['runType'];
  focus?: string;
  baseIdea: IdeaRef;
  assumptionContext: Array<{ category: string; statement: string; criticality: string }>;
  clock: () => Date;
  setStatus: (status: AnalysisStatus, stage?: string) => Promise<void>;
  isCancelled: () => Promise<boolean>;
  tokenCost: number;
  searchCost: number;
  sourceCount: number;
  claimCount: number;
}

export function makeSetStatus(
  deps: PipelineDeps,
  analysisId: string,
  clock: () => Date,
): (status: AnalysisStatus, stage?: string) => Promise<void> {
  return async (status, stage) => {
    await deps.prisma.analysis.update({ where: { id: analysisId }, data: { status } });
    publishAnalysisEvent({ analysisId, type: 'status', status, stage, at: clock().toISOString() });
  };
}

export function makeIsCancelled(
  deps: PipelineDeps,
  analysisId: string,
): () => Promise<boolean> {
  return async () => {
    const fresh = await deps.prisma.analysis.findUnique({
      where: { id: analysisId },
      select: { cancelRequested: true },
    });
    return fresh?.cancelRequested ?? false;
  };
}
