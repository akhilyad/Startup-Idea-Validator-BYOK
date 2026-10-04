import type { ClaimType, Confidence, EvidenceType, Relevance, ResearchTaskType, ResearchLogEventType } from '@sift/types';
import type { RetrievedDocument, SearchResult } from '../search/types.js';
import { independenceKeyFor } from '../util/url.js';
import type { PipelineDeps } from './types.js';

/**
 * Persist a discovered + retrieved source, deduplicating by canonical URL and
 * content hash so syndicated copies collapse to one record (TPRD §42).
 * Returns the existing record when an equivalent source already exists.
 */
export async function upsertSource(
  deps: PipelineDeps,
  input: { doc: RetrievedDocument; result?: SearchResult },
) {
  const { doc } = input;
  const or: Array<Record<string, string>> = [{ canonicalUrl: doc.canonicalUrl }];
  if (doc.contentHash) or.push({ contentHash: doc.contentHash });

  const existing = await deps.prisma.source.findFirst({ where: { OR: or } });
  if (existing) return { source: existing, created: false };

  const independenceKey = independenceKeyFor(doc.canonicalUrl, doc.contentHash);
  const source = await deps.prisma.source.create({
    data: {
      canonicalUrl: doc.canonicalUrl,
      title: doc.title,
      publisher: doc.publisher,
      author: doc.author,
      publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : null,
      retrievedAt: deps.now ? deps.now() : new Date(),
      sourceType: input.result?.sourceType ?? 'LOW_CONFIDENCE',
      tier: input.result?.tier ?? 'TIER_4_LOW_CONFIDENCE',
      contentHash: doc.contentHash,
      accessibilityStatus: doc.accessibilityStatus,
      geography: doc.geography,
      population: doc.population,
      independenceKey,
    },
  });
  return { source, created: true };
}

export interface EvidenceInput {
  claimId: string;
  sourceId: string;
  evidenceType: EvidenceType;
  excerpt: string;
  relevance: Relevance;
  confidence: Confidence;
  geography: string | null;
  population: string | null;
  timePeriod: string | null;
  notes: string | null;
}

export async function persistClaim(
  deps: PipelineDeps,
  input: {
    analysisId: string;
    assumptionId?: string | null;
    section?: string | null;
    statement: string;
    claimType: ClaimType;
    confidence: Confidence;
    status?: string | null;
  },
) {
  return deps.prisma.claim.create({
    data: {
      analysisId: input.analysisId,
      assumptionId: input.assumptionId ?? null,
      section: input.section ?? null,
      statement: input.statement,
      claimType: input.claimType,
      confidence: input.confidence,
      status: input.status ?? null,
    },
  });
}

/** Evidence must never exist without provenance (TPRD §28/§94 Rule 5). */
export async function persistEvidence(deps: PipelineDeps, input: EvidenceInput) {
  return deps.prisma.evidence.create({
    data: {
      claimId: input.claimId,
      sourceId: input.sourceId,
      evidenceType: input.evidenceType,
      excerpt: input.excerpt.slice(0, 2000),
      relevance: input.relevance,
      confidence: input.confidence,
      geography: input.geography,
      population: input.population,
      timePeriod: input.timePeriod,
      notes: input.notes,
    },
  });
}

export async function logEvent(
  deps: PipelineDeps,
  input: {
    analysisId: string;
    runId?: string | null;
    agent?: string | null;
    eventType: ResearchLogEventType;
    query?: string | null;
    sourceId?: string | null;
    decision?: string | null;
    reason?: string | null;
    payload?: Record<string, unknown>;
  },
) {
  return deps.prisma.researchLogEntry.create({
    data: {
      analysisId: input.analysisId,
      runId: input.runId ?? null,
      agent: input.agent ?? null,
      eventType: input.eventType,
      query: input.query ?? null,
      sourceId: input.sourceId ?? null,
      decision: input.decision ?? null,
      reason: input.reason ?? null,
      payloadJson: JSON.stringify(input.payload ?? {}),
    },
  });
}

/** Idempotent task creation — the unique (runId, taskType) constraint guards. */
export async function ensureTask(
  deps: PipelineDeps,
  researchRunId: string,
  taskType: ResearchTaskType,
  input: Record<string, unknown> = {},
) {
  const existing = await deps.prisma.researchTask.findUnique({
    where: { researchRunId_taskType: { researchRunId, taskType } },
  });
  if (existing) return existing;
  return deps.prisma.researchTask.create({
    data: {
      researchRunId,
      taskType,
      status: 'PENDING',
      inputJson: JSON.stringify(input),
    },
  });
}

export async function startTask(deps: PipelineDeps, taskId: string) {
  return deps.prisma.researchTask.update({
    where: { id: taskId },
    data: {
      status: 'RUNNING',
      startedAt: deps.now ? deps.now() : new Date(),
      attempts: { increment: 1 },
    },
  });
}

export async function completeTask(
  deps: PipelineDeps,
  taskId: string,
  output: unknown,
) {
  return deps.prisma.researchTask.update({
    where: { id: taskId },
    data: {
      status: 'COMPLETE',
      outputJson: JSON.stringify(output ?? {}),
      completedAt: deps.now ? deps.now() : new Date(),
      failureReason: null,
    },
  });
}

export async function failTask(deps: PipelineDeps, taskId: string, reason: string) {
  return deps.prisma.researchTask.update({
    where: { id: taskId },
    data: {
      status: 'FAILED',
      failureReason: reason.slice(0, 900),
      completedAt: deps.now ? deps.now() : new Date(),
    },
  });
}
