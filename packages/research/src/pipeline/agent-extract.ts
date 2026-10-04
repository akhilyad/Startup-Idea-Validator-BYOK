import { generateValidated } from '@sift/ai';
import { agentFindingSchema, claimSetSchema, competitorSetSchema } from '@sift/validation';
import type { AgentDefinition } from '../agents/definitions.js';
import type { ResearchState } from './context.js';
import { logEvent, persistClaim, persistEvidence, upsertSource } from './persist.js';
import type { PipelineDeps } from './types.js';
import type { AcceptedSource } from './agent-runner.js';

export interface ExtractionResult {
  claims: number;
  tokenCost: number;
}

/**
 * Claim extraction, evidence classification, section findings and competitor
 * records. Every persisted claim either carries evidence with provenance or is
 * explicitly typed as assumption/unknown (TPRD §3.2, §5.2).
 */
export async function extractAgentFindings(
  deps: PipelineDeps,
  state: ResearchState,
  agent: AgentDefinition,
  accepted: AcceptedSource[],
): Promise<ExtractionResult> {
  const { llm } = deps;
  let claims = 0;
  let tokenCost = 0;

  const retrievedContext = accepted.map((a) => ({
    index: a.index,
    title: a.title,
    publisher: a.publisher,
    url: a.doc.canonicalUrl,
    content: a.doc.content.slice(0, 1200),
    excerpt: a.doc.content.slice(0, 240),
    geography: a.doc.geography,
    population: a.doc.population,
    isCounter: a.isCounter,
    sourceType: a.doc.synthetic ? 'COMMUNITY' : 'SECONDARY',
  }));

  if (retrievedContext.length > 0) {
    const claimSet = await generateValidated(llm, {
      schemaName: 'claim_set',
      schema: claimSetSchema,
      system: 'Extract only claims supported by the provided sources. Never invent sources.',
      prompt: `Extract and classify evidence for the ${agent.section} section.`,
      context: { idea: state.baseIdea, retrieved: retrievedContext },
    });
    tokenCost += claimSet.usage.costUsd;

    for (const claim of claimSet.output.claims) {
      if (claim.sourceIndex === null || !claim.supportedBySource) continue;
      const source = accepted[claim.sourceIndex];
      if (!source) continue;
      const { source: sourceRow } = await upsertSource(deps, { doc: source.doc });
      const persisted = await persistClaim(deps, {
        analysisId: state.analysisId,
        section: agent.section,
        statement: claim.statement,
        claimType: claim.claimType,
        confidence: claim.confidence,
      });
      await persistEvidence(deps, {
        claimId: persisted.id,
        sourceId: sourceRow.id,
        evidenceType: claim.evidenceType,
        excerpt: claim.excerpt ?? source.doc.content.slice(0, 240),
        relevance: claim.relevance,
        confidence: claim.confidence,
        geography: claim.geography,
        population: claim.population,
        timePeriod: claim.timePeriod,
        notes: claim.notes,
      });
      claims += 1;
      await logEvent(deps, {
        analysisId: state.analysisId,
        runId: state.runId,
        agent: agent.name,
        eventType: 'EVIDENCE_CLASSIFIED',
        sourceId: sourceRow.id,
        decision: claim.evidenceType,
        payload: { claimType: claim.claimType, relevance: claim.relevance },
      });
    }
  }

  return finishFindings(deps, state, agent, accepted, retrievedContext, { claims, tokenCost });
}

interface RetrievedContextItem {
  index: number;
  title: string | null;
  publisher: string | null;
  url: string;
  content: string;
  excerpt: string;
  geography: string | null;
  population: string | null;
  isCounter: boolean;
  sourceType: string;
}

async function finishFindings(
  deps: PipelineDeps,
  state: ResearchState,
  agent: AgentDefinition,
  accepted: AcceptedSource[],
  retrievedContext: RetrievedContextItem[],
  acc: ExtractionResult,
): Promise<ExtractionResult> {
  const { llm } = deps;
  let claims = acc.claims;
  let tokenCost = acc.tokenCost;

  const finding = await generateValidated(llm, {
    schemaName: 'agent_finding',
    schema: agentFindingSchema,
    system: 'Summarise findings. If no evidence exists, say so explicitly and never fabricate.',
    prompt: `Produce the ${agent.section} finding.`,
    context: {
      idea: state.baseIdea,
      section: agent.section,
      counterEvidence: agent.counterEvidence,
      sources: retrievedContext,
    },
  });
  tokenCost += finding.usage.costUsd;

  await persistClaim(deps, {
    analysisId: state.analysisId,
    section: agent.section,
    statement: finding.output.summary,
    claimType: 'DERIVED_ANALYSIS',
    confidence: 'LOW',
  });
  claims += 1;

  for (const s of finding.output.statements) {
    const idx = s.sourceIndexes?.[0];
    const source = typeof idx === 'number' ? accepted[idx] : undefined;
    const claimRow = await persistClaim(deps, {
      analysisId: state.analysisId,
      section: agent.section,
      statement: s.statement,
      claimType: s.claimType,
      confidence: s.confidence,
    });
    claims += 1;
    if (source) {
      const { source: sourceRow } = await upsertSource(deps, { doc: source.doc });
      await persistEvidence(deps, {
        claimId: claimRow.id,
        sourceId: sourceRow.id,
        evidenceType: s.isCounterEvidence ? 'COUNTER' : 'SUPPORTING',
        excerpt: source.doc.content.slice(0, 240),
        relevance: 'MEDIUM',
        confidence: s.confidence,
        geography: source.doc.geography,
        population: source.doc.population,
        timePeriod: null,
        notes: null,
      });
    }
  }

  if (agent.taskType === 'COMPETITOR_RESEARCH' && retrievedContext.length > 0) {
    const competitorSet = await generateValidated(llm, {
      schemaName: 'competitor_set',
      schema: competitorSetSchema,
      system: 'Identify competitors only from the provided sources. Use NON_CONSUMPTION when appropriate.',
      prompt: 'Extract competitor records.',
      context: { idea: state.baseIdea, sources: retrievedContext },
    });
    tokenCost += competitorSet.usage.costUsd;
    for (const c of competitorSet.output.competitors) {
      await deps.prisma.competitor.create({
        data: {
          analysisId: state.analysisId,
          classification: c.classification,
          company: c.company,
          product: c.product,
          targetCustomer: c.targetCustomer,
          geography: c.geography,
          pricing: c.pricing,
          businessModel: c.businessModel,
          distribution: c.distribution,
          funding: c.funding,
          tractionEvidence: c.tractionEvidence,
          strengths: c.strengths,
          weaknesses: c.weaknesses,
          complaints: c.complaints,
          positioning: c.positioning,
          differentiation: c.differentiation,
          evidenceJson: JSON.stringify(c.sourceIndexes),
          lastVerified: state.clock(),
        },
      });
    }
  }

  return { claims, tokenCost };
}
