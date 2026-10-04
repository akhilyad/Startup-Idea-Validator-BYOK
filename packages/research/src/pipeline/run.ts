import { generateValidated } from '@sift/ai';
import { assumptionSetSchema, normalizedIdeaSchema } from '@sift/validation';
import { publishAnalysisEvent } from '../events.js';
import { makeIsCancelled, makeSetStatus, type IdeaRef } from './context.js';
import { completeTask, ensureTask, logEvent, startTask } from './persist.js';
import { runResearchStages } from './run-research.js';
import type { PipelineDeps, PipelineOptions, PipelineResult } from './types.js';

export const SYSTEM_RESEARCHER =
  'You are Sift, an evidence-first startup research engine. You never assert unsupported facts, ' +
  'you distinguish observation from inference, and you label unknown values as UNKNOWN rather than guessing.';

export async function runAnalysisPipeline(
  deps: PipelineDeps,
  options: PipelineOptions,
): Promise<PipelineResult> {
  const { prisma, llm } = deps;
  const clock = deps.now ?? (() => new Date());
  const { analysisId, runId, runType } = options;

  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: { ideaVersion: true },
  });
  if (!analysis) throw new Error(`Analysis ${analysisId} not found`);

  const ideaVersion = analysis.ideaVersion;
  const baseIdea: IdeaRef = {
    customer: ideaVersion.normalizedCustomer ?? 'the target customer',
    problem: ideaVersion.normalizedProblem ?? ideaVersion.rawInput.slice(0, 400),
    solution: ideaVersion.normalizedSolution ?? 'the proposed solution',
    industry: ideaVersion.industry,
    geography: ideaVersion.geography,
    businessModel: ideaVersion.businessModel,
    pricing: ideaVersion.pricing,
    distribution: ideaVersion.distribution,
    technology: ideaVersion.technology,
  };

  let tokenCost = 0;
  let searchCost = 0;
  let sourceCount = 0;
  let claimCount = 0;
  let assumptionCount = 0;

  const setStatus = makeSetStatus(deps, analysisId, clock);
  const isCancelled = makeIsCancelled(deps, analysisId);

  publishAnalysisEvent({
    analysisId,
    type: 'stage',
    stage: 'RESEARCH_STARTED',
    message: 'Research run started',
    at: clock().toISOString(),
  });

  await prisma.researchRun.update({
    where: { id: runId },
    data: { status: 'RUNNING', startedAt: clock() },
  });

  try {
    /* Stage 1 — Normalization (PRD §9) */
    await setStatus('PARSING', 'NORMALIZE');
    const normalizeTask = await ensureTask(deps, runId, 'NORMALIZE');
    await startTask(deps, normalizeTask.id);
    const normalized = await generateValidated(llm, {
      schemaName: 'normalized_idea',
      schema: normalizedIdeaSchema,
      system: SYSTEM_RESEARCHER,
      prompt: 'Normalize the raw idea into a structured opportunity model. Mark uncertain fields as null.',
      context: {
        idea: baseIdea,
        rawInput: ideaVersion.rawInput,
        userAssumptions: JSON.parse(ideaVersion.assumptionsJson || '[]'),
        constraints: JSON.parse(ideaVersion.constraintsJson || '[]'),
      },
    });
    tokenCost += normalized.usage.costUsd;
    await completeTask(deps, normalizeTask.id, normalized.output);
    await prisma.ideaVersion.update({
      where: { id: ideaVersion.id },
      data: {
        normalizedCustomer: normalized.output.proposedCustomer,
        normalizedProblem: normalized.output.problem,
        normalizedSolution: normalized.output.proposedSolution,
        industry: normalized.output.industry,
        geography: normalized.output.geography,
        businessModel: normalized.output.businessModel,
        pricing: normalized.output.pricing,
        distribution: normalized.output.distribution,
        technology: normalized.output.technology,
      },
    });
    baseIdea.customer = normalized.output.proposedCustomer;
    baseIdea.problem = normalized.output.problem;
    baseIdea.solution = normalized.output.proposedSolution;

    /* Stage 2 — Assumption extraction (PRD §10) */
    await setStatus('DECOMPOSING', 'GENERATE_ASSUMPTIONS');
    await setStatus('GENERATING_ASSUMPTIONS', 'GENERATE_ASSUMPTIONS');
    const assumptionTask = await ensureTask(deps, runId, 'GENERATE_ASSUMPTIONS');
    await startTask(deps, assumptionTask.id);
    const assumptionSet = await generateValidated(llm, {
      schemaName: 'assumption_set',
      schema: assumptionSetSchema,
      system: SYSTEM_RESEARCHER,
      prompt: 'Extract the assumptions that must be true for this idea to work.',
      context: { idea: baseIdea },
    });
    tokenCost += assumptionSet.usage.costUsd;
    await completeTask(deps, assumptionTask.id, assumptionSet.output);

    // Idempotency: reuse existing assumptions when the run is retried (TPRD §66).
    let assumptions = await prisma.assumption.findMany({
      where: { analysisId },
      orderBy: { createdAt: 'asc' },
    });
    if (assumptions.length === 0) {
      for (const a of assumptionSet.output.assumptions) {
        await prisma.assumption.create({
          data: {
            analysisId,
            category: a.category,
            statement: a.statement,
            criticality: a.criticality,
            confidence: a.confidence,
            evidenceState: 'UNKNOWN',
            status: 'OPEN',
            requiredExperiment: a.requiredExperiment,
            unknowns: a.unknowns,
          },
        });
      }
      assumptions = await prisma.assumption.findMany({
        where: { analysisId },
        orderBy: { createdAt: 'asc' },
      });
    }
    assumptionCount = assumptions.length;

    const result = await runResearchStages(deps, {
      analysisId,
      runId,
      runType,
      focus: options.focus,
      baseIdea,
      assumptionContext: assumptions.map((a) => ({
        category: a.category,
        statement: a.statement,
        criticality: a.criticality,
      })),
      clock,
      setStatus,
      isCancelled,
      tokenCost,
      searchCost,
      sourceCount,
      claimCount,
    });
    return { ...result, assumptionCount };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    await prisma.researchRun.update({
      where: { id: runId },
      data: { status: 'FAILED', failureReason: reason.slice(0, 900), completedAt: clock() },
    });
    await setStatus('FAILED');
    publishAnalysisEvent({ analysisId, type: 'error', message: reason, at: clock().toISOString() });
    await logEvent(deps, { analysisId, runId, eventType: 'RESEARCH_FAILED', reason });
    return {
      status: 'FAILED',
      qualityStatus: 'NOT_RUN',
      sourceCount,
      claimCount,
      assumptionCount,
      tokenCost,
      searchCost,
    };
  }
}
