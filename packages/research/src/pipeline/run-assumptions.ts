import { generateValidated } from '@sift/ai';
import { assumptionUpdateSetSchema } from '@sift/validation';
import { publishAnalysisEvent } from '../events.js';
import type { AcceptedSource } from './agent-runner.js';
import type { ResearchState } from './context.js';
import { logEvent } from './persist.js';
import type { PipelineDeps, PipelineResult } from './types.js';

/** Apply assumption state updates derived from evidence (never inflates confidence). */
export async function updateAssumptions(
  deps: PipelineDeps,
  state: ResearchState,
  accepted: AcceptedSource[],
): Promise<void> {
  const assumptions = await deps.prisma.assumption.findMany({
    where: { analysisId: state.analysisId },
    orderBy: { createdAt: 'asc' },
  });
  if (assumptions.length === 0) return;

  const updateSet = await generateValidated(deps.llm, {
    schemaName: 'assumption_update_set',
    schema: assumptionUpdateSetSchema,
    system:
      'Classify each assumption as SUPPORTED, MIXED, WEAKLY_SUPPORTED, CONTRADICTED, UNKNOWN or NON_COMPARABLE. Never inflate confidence.',
    prompt: 'Update assumption evidence states from the gathered evidence.',
    context: {
      idea: state.baseIdea,
      assumptions: assumptions.map((a) => ({
        category: a.category,
        statement: a.statement,
        criticality: a.criticality,
      })),
      sources: accepted.map((a) => ({
        index: a.index,
        title: a.title,
        publisher: a.publisher,
        geography: a.doc.geography,
        population: a.doc.population,
        isCounter: a.isCounter,
      })),
    },
  });
  state.tokenCost += updateSet.usage.costUsd;

  for (const update of updateSet.output.updates) {
    const assumption = assumptions[update.assumptionIndex];
    if (!assumption) continue;
    await deps.prisma.assumption.update({
      where: { id: assumption.id },
      data: {
        evidenceState: update.evidenceState,
        confidence: update.confidence,
        unknowns: update.unknowns ?? assumption.unknowns,
        status:
          update.evidenceState === 'CONTRADICTED'
            ? 'CONTRADICTED'
            : update.evidenceState === 'SUPPORTED'
              ? 'SUPPORTED'
              : 'OPEN',
      },
    });
    await logEvent(deps, {
      analysisId: state.analysisId,
      runId: state.runId,
      eventType: 'ASSUMPTION_UPDATED',
      decision: update.evidenceState,
      reason: update.rationale,
      payload: { statement: assumption.statement },
    });
  }
}

/** Cancellation: stop scheduling, preserve gathered evidence, mark appropriately (TPRD §82). */
export async function cancelRun(deps: PipelineDeps, state: ResearchState): Promise<PipelineResult> {
  await deps.prisma.researchRun.update({
    where: { id: state.runId },
    data: {
      status: 'CANCELLED',
      completedAt: state.clock(),
      tokenCost: state.tokenCost,
      searchCost: state.searchCost,
      sourceCount: state.sourceCount,
    },
  });
  await state.setStatus('CANCELLED', 'CANCELLED');
  publishAnalysisEvent({
    analysisId: state.analysisId,
    type: 'done',
    status: 'CANCELLED',
    message: 'Analysis cancelled; gathered evidence preserved.',
    at: state.clock().toISOString(),
  });
  await logEvent(deps, {
    analysisId: state.analysisId,
    runId: state.runId,
    eventType: 'RESEARCH_FAILED',
    reason: 'Cancelled by user',
  });
  return {
    status: 'CANCELLED',
    qualityStatus: 'NOT_RUN',
    sourceCount: state.sourceCount,
    claimCount: state.claimCount,
    assumptionCount: 0,
    tokenCost: state.tokenCost,
    searchCost: state.searchCost,
  };
}
