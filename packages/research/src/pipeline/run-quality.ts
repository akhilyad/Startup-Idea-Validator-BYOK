import { generateValidated } from '@sift/ai';
import { qualityCheckSchema } from '@sift/validation';
import { publishAnalysisEvent } from '../events.js';
import type { ResearchState } from './context.js';
import { completeTask, ensureTask, logEvent, startTask } from './persist.js';
import type { PipelineDeps, PipelineResult } from './types.js';

export interface QualityInputs {
  flags: { hadFailure: boolean; counterEvidenceCount: number };
  sourceCount: number;
  counterCount: number;
  assumptionCount: number;
}

/**
 * Stage 8 — Quality gate (PRD §59, §60). The gate decides COMPLETE vs PARTIAL.
 * A partial result is NEVER presented as complete (TPRD §94 Rule 7).
 */
export async function runQualityStage(
  deps: PipelineDeps,
  state: ResearchState,
  inputs: QualityInputs,
): Promise<PipelineResult> {
  const { prisma } = deps;
  await state.setStatus('QUALITY_CHECK', 'QUALITY_CHECK');

  const qualityTask = await ensureTask(deps, state.runId, 'QUALITY_CHECK');
  await startTask(deps, qualityTask.id);

  const quality = await generateValidated(deps.llm, {
    schemaName: 'quality_check',
    schema: qualityCheckSchema,
    system: 'Audit the report for unsupported claims, citation gaps and coverage problems. Be strict.',
    prompt: 'Run the report quality gate.',
    context: {
      sourceCount: inputs.sourceCount,
      counterCount: inputs.counterCount,
      assumptionCount: inputs.assumptionCount,
      unsupportedClaims: [],
    },
  });
  state.tokenCost += quality.usage.costUsd;
  await completeTask(deps, qualityTask.id, quality.output);

  const latestReport = await prisma.report.findFirst({
    where: { analysisId: state.analysisId },
    orderBy: { version: 'desc' },
  });
  if (latestReport) {
    await prisma.report.update({
      where: { id: latestReport.id },
      data: { qualityStatus: quality.output.overall },
    });
  }

  const passed = quality.output.overall === 'PASSED';
  const finalStatus: 'COMPLETE' | 'PARTIAL' =
    passed && !inputs.flags.hadFailure && inputs.sourceCount > 0 ? 'COMPLETE' : 'PARTIAL';

  await prisma.analysis.update({
    where: { id: state.analysisId },
    data: {
      status: finalStatus,
      qualityStatus: quality.output.overall,
      completedAt: state.clock(),
    },
  });
  await prisma.researchRun.update({
    where: { id: state.runId },
    data: {
      status: finalStatus === 'COMPLETE' ? 'COMPLETE' : 'PARTIAL',
      completedAt: state.clock(),
      tokenCost: state.tokenCost,
      searchCost: state.searchCost,
      sourceCount: inputs.sourceCount,
    },
  });

  await logEvent(deps, {
    analysisId: state.analysisId,
    runId: state.runId,
    eventType: 'RESEARCH_COMPLETED',
    decision: finalStatus,
    reason: quality.output.summary,
    payload: {
      qualityStatus: quality.output.overall,
      sourceCount: inputs.sourceCount,
      counterCount: inputs.counterCount,
    },
  });

  publishAnalysisEvent({
    analysisId: state.analysisId,
    type: 'done',
    status: finalStatus,
    message: `Research ${finalStatus.toLowerCase()} (${inputs.sourceCount} sources).`,
    at: state.clock().toISOString(),
  });

  return {
    status: finalStatus,
    qualityStatus: quality.output.overall,
    sourceCount: inputs.sourceCount,
    claimCount: state.claimCount,
    assumptionCount: inputs.assumptionCount,
    tokenCost: state.tokenCost,
    searchCost: state.searchCost,
  };
}
