import { generateValidated } from '@sift/ai';
import { contradictionSetSchema } from '@sift/validation';
import { RESEARCH_AGENTS } from '../agents/definitions.js';
import type { ResearchState } from './context.js';
import { logEvent, persistClaim, persistEvidence, upsertSource } from './persist.js';
import { runResearchAgent, type AcceptedSource } from './agent-runner.js';
import { updateAssumptions } from './run-assumptions.js';
import type { PipelineDeps } from './types.js';

export interface ChallengeResult {
  cancelled: boolean;
  failed: boolean;
  counterEvidenceCount: number;
}

/** Challenge the Idea: disconfirming queries → negative evidence → contradictions (PRD §4, §45). */
export async function runChallengeStage(
  deps: PipelineDeps,
  state: ResearchState,
  allAccepted: AcceptedSource[],
): Promise<ChallengeResult> {
  const counterAgent = RESEARCH_AGENTS.find((a) => a.counterEvidence);
  if (!counterAgent) return { cancelled: false, failed: false, counterEvidenceCount: 0 };
  if (await state.isCancelled()) return { cancelled: true, failed: false, counterEvidenceCount: 0 };

  try {
    const challengeRun = await runResearchAgent(deps, state, counterAgent);
    state.tokenCost += challengeRun.tokenCost;
    state.sourceCount += challengeRun.sources;
    state.claimCount += challengeRun.claims;
    allAccepted.push(...challengeRun.accepted);

    const contradictionSet = await generateValidated(deps.llm, {
      schemaName: 'contradiction_set',
      schema: contradictionSetSchema,
      system: 'Find credible evidence that weakens the current thesis. Do not manufacture contradictions.',
      prompt: 'Identify contradictions between gathered evidence and the thesis.',
      context: {
        idea: state.baseIdea,
        assumptions: state.assumptionContext,
        sources: challengeRun.accepted.map((a) => ({
          index: a.index,
          title: a.title,
          publisher: a.publisher,
          sourceType: 'COMMUNITY',
          snippet: a.doc.content.slice(0, 240),
        })),
      },
    });
    state.tokenCost += contradictionSet.usage.costUsd;

    for (const c of contradictionSet.output.contradictions) {
      const claim = await persistClaim(deps, {
        analysisId: state.analysisId,
        section: 'COUNTER_EVIDENCE',
        statement: c.contradictingStatement,
        claimType: 'COUNTER_EVIDENCE',
        confidence: 'MEDIUM',
      });
      state.claimCount += 1;
      const source =
        typeof c.sourceIndex === 'number' ? challengeRun.accepted[c.sourceIndex] : undefined;
      if (source) {
        const { source: sourceRow } = await upsertSource(deps, { doc: source.doc });
        await persistEvidence(deps, {
          claimId: claim.id,
          sourceId: sourceRow.id,
          evidenceType: 'COUNTER',
          excerpt: c.excerpt ?? source.doc.content.slice(0, 240),
          relevance: c.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
          confidence: 'MEDIUM',
          geography: source.doc.geography,
          population: source.doc.population,
          timePeriod: null,
          notes: c.resolution,
        });
      }
      await logEvent(deps, {
        analysisId: state.analysisId,
        runId: state.runId,
        agent: counterAgent.name,
        eventType: 'CONTRADICTION_FOUND',
        decision: c.severity,
        payload: { conclusion: c.conclusion },
      });
    }

    // Re-verify assumptions in light of counter-evidence.
    await updateAssumptions(deps, state, allAccepted);
    const counterEvidenceCount = contradictionSet.output.contradictions.length || challengeRun.claims;
    return { cancelled: false, failed: false, counterEvidenceCount };
  } catch (error) {
    deps.logger.warn('research.challenge.failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return { cancelled: false, failed: true, counterEvidenceCount: 0 };
  }
}
