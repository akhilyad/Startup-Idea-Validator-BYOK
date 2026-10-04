import { RESEARCH_AGENTS } from '../agents/definitions.js';
import { publishAnalysisEvent } from '../events.js';
import { runResearchAgent, type AcceptedSource } from './agent-runner.js';
import type { ResearchState } from './context.js';
import { logEvent } from './persist.js';
import { cancelRun } from './run-assumptions.js';
import { runChallengeStage } from './run-challenge.js';
import { updateAssumptions } from './run-assumptions.js';
import { runSynthesisStages } from './run-synthesis.js';
import type { PipelineDeps, PipelineResult } from './types.js';

const RESEARCH_TASK_ORDER = RESEARCH_AGENTS.filter(
  (a) => !a.counterEvidence && a.taskType.endsWith('_RESEARCH'),
);

export async function runResearchStages(
  deps: PipelineDeps,
  state: ResearchState,
): Promise<PipelineResult> {
  const { logger } = deps;
  let hadFailure = false;
  const allAccepted: AcceptedSource[] = [];

  /* Stage 3 — Research agents (PRD §12) */
  await state.setStatus('RESEARCHING', 'RESEARCHING');
  for (const agent of RESEARCH_TASK_ORDER) {
    if (await state.isCancelled()) return cancelRun(deps, state);
    try {
      const result = await runResearchAgent(deps, state, agent);
      state.tokenCost += result.tokenCost;
      state.sourceCount += result.sources;
      state.claimCount += result.claims;
      allAccepted.push(...result.accepted);
    } catch (error) {
      hadFailure = true;
      logger.warn('research.agent.failed', {
        agent: agent.name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /* Stage 4 — Verifying assumptions */
  await state.setStatus('VERIFYING', 'VERIFYING');
  await updateAssumptions(deps, state, allAccepted);

  /* Stage 5 — Challenge: counter-evidence (PRD §4, TPRD §45) */
  await state.setStatus('CHALLENGING', 'CHALLENGING');
  const challenge = await runChallengeStage(deps, state, allAccepted);
  if (challenge.cancelled) return cancelRun(deps, state);
  if (challenge.failed) hadFailure = true;

  if (challenge.counterEvidenceCount === 0) {
    await logEvent(deps, {
      analysisId: state.analysisId,
      runId: state.runId,
      eventType: 'SOURCE_REJECTED',
      decision: 'PASSED_WITH_WARNINGS',
      reason: 'Counter-evidence search produced no usable counter-evidence.',
    });
  }

  publishAnalysisEvent({
    analysisId: state.analysisId,
    type: 'stage',
    stage: 'CHALLENGING',
    message: `Counter-evidence phase complete (${challenge.counterEvidenceCount} counter claims).`,
    at: state.clock().toISOString(),
  });

  return runSynthesisStages(deps, state, {
    hadFailure,
    counterEvidenceCount: challenge.counterEvidenceCount,
  });
}
