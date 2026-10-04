import { generateValidated } from '@sift/ai';
import { experimentSetSchema, thesisSchema } from '@sift/validation';
import type { ResearchState } from './context.js';
import { completeTask, ensureTask, startTask } from './persist.js';
import { runQualityStage } from './run-quality.js';
import type { PipelineDeps, PipelineResult } from './types.js';

export async function runSynthesisStages(
  deps: PipelineDeps,
  state: ResearchState,
  flags: { hadFailure: boolean; counterEvidenceCount: number },
): Promise<PipelineResult> {
  const { prisma } = deps;

  /* Stage 6 — Synthesis: the falsifiable thesis (PRD §28) */
  await state.setStatus('SYNTHESIZING', 'SYNTHESIS');
  const synthesisTask = await ensureTask(deps, state.runId, 'SYNTHESIS');
  await startTask(deps, synthesisTask.id);

  const assumptions = await prisma.assumption.findMany({
    where: { analysisId: state.analysisId },
    orderBy: { createdAt: 'asc' },
  });
  const contradictions = await prisma.claim.findMany({
    where: { analysisId: state.analysisId, claimType: 'COUNTER_EVIDENCE' },
  });
  const sourceCount = await prisma.source.count({
    where: { evidence: { some: { claim: { analysisId: state.analysisId } } } },
  });
  const counterCount = await prisma.evidence.count({
    where: { claim: { analysisId: state.analysisId }, evidenceType: 'COUNTER' },
  });
  const unknowns = assumptions.map((a) => a.unknowns).filter((u): u is string => Boolean(u));

  const thesis = await generateValidated(deps.llm, {
    schemaName: 'thesis',
    schema: thesisSchema,
    system:
      'Produce a falsifiable thesis. Never invent numbers. Label every figure as EVIDENCE, ASSUMPTION or UNKNOWN. Never output an overall score.',
    prompt: 'Synthesize the final evidence-based opportunity thesis.',
    context: {
      idea: state.baseIdea,
      assumptions: assumptions.map((a) => ({
        statement: a.statement,
        criticality: a.criticality,
        evidenceState: a.evidenceState,
        unknowns: a.unknowns,
      })),
      contradictions: contradictions.map((c) => ({ contradictingStatement: c.statement })),
      sources: [],
      unknowns,
    },
  });
  state.tokenCost += thesis.usage.costUsd;
  await completeTask(deps, synthesisTask.id, thesis.output);

  const reportVersion = await prisma.report.count({ where: { analysisId: state.analysisId } });
  await prisma.report.create({
    data: {
      analysisId: state.analysisId,
      version: reportVersion + 1,
      thesisJson: JSON.stringify({ ...thesis.output, synthetic: thesis.synthetic }),
      qualityStatus: 'NOT_RUN',
      generatedAt: state.clock(),
    },
  });

  /* Stage 7 — Experiment generation (PRD §26) */
  await generateExperiments(deps, state, assumptions);

  /* Stage 8 — Quality gate */
  return runQualityStage(deps, state, { flags, sourceCount, counterCount, assumptionCount: assumptions.length });
}

async function generateExperiments(
  deps: PipelineDeps,
  state: ResearchState,
  assumptions: Array<{
    id: string;
    statement: string;
    criticality: string;
    requiredExperiment: string | null;
  }>,
): Promise<void> {
  const existing = await deps.prisma.experiment.count({ where: { analysisId: state.analysisId } });
  if (existing > 0) return;

  const experimentSet = await generateValidated(deps.llm, {
    schemaName: 'experiment_set',
    schema: experimentSetSchema,
    system: 'Design the cheapest experiments that resolve the most decision-relevant uncertainty.',
    prompt: 'Generate validation experiments for critical and high assumptions.',
    context: {
      idea: state.baseIdea,
      assumptions: assumptions.map((a) => ({
        category: '',
        statement: a.statement,
        criticality: a.criticality,
        requiredExperiment: a.requiredExperiment,
      })),
    },
  });
  state.tokenCost += experimentSet.usage.costUsd;

  const critical = assumptions.filter((a) => ['CRITICAL', 'HIGH'].includes(a.criticality));
  for (const e of experimentSet.output.experiments) {
    const assumption = critical[e.assumptionIndex] ?? assumptions[e.assumptionIndex];
    await deps.prisma.experiment.create({
      data: {
        analysisId: state.analysisId,
        assumptionId: assumption?.id ?? null,
        name: e.name,
        hypothesis: e.hypothesis,
        method: e.method,
        targetParticipants: e.targetParticipants,
        successCriterion: e.successCriterion,
        failureCriterion: e.failureCriterion,
        priority: e.priority,
        status: 'PROPOSED',
      },
    });
  }
}
