import { z } from 'zod';
import {
  assumptionCategorySchema,
  claimTypeSchema,
  competitorClassificationSchema,
  confidenceSchema,
  criticalitySchema,
  evidenceTypeSchema,
  queryClassSchema,
  relevanceSchema,
  sourceTierSchema,
  sourceTypeSchema,
  accessibilityStatusSchema,
  experimentPrioritySchema,
} from './enums.js';

/**
 * Structured-output contracts for every LLM interaction (TPRD §38, §39).
 * The pipeline validates raw model JSON against these schemas BEFORE any
 * persistence. Malformed output is retried, then fails the task.
 */

/* -------------------------------------------------------------------------- */
/* Stage 1 — Idea normalization (PRD §9)                                       */
/* -------------------------------------------------------------------------- */

export const normalizedIdeaSchema = z.object({
  proposedCustomer: z.string().min(1),
  problem: z.string().min(1),
  proposedSolution: z.string().min(1),
  industry: z.string().nullable(),
  geography: z.string().nullable(),
  businessModel: z.string().nullable(),
  pricing: z.string().nullable(),
  distribution: z.string().nullable(),
  technology: z.string().nullable(),
  userAssumptions: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  /** Hedged/uncertain fields are surfaced rather than invented (PRD §15). */
  unresolved: z.array(z.string()).default([]),
});
export type NormalizedIdeaOutput = z.infer<typeof normalizedIdeaSchema>;

/* -------------------------------------------------------------------------- */
/* Stage 2 — Assumption extraction (PRD §10, §11)                              */
/* -------------------------------------------------------------------------- */

export const assumptionOutputSchema = z.object({
  category: assumptionCategorySchema,
  statement: z.string().min(3),
  /** How damaging if false. */
  criticality: criticalitySchema,
  confidence: confidenceSchema,
  /** What would need to be observed to confirm/falsify it. */
  requiredExperiment: z.string().nullable(),
  unknowns: z.string().nullable(),
});

export const assumptionSetSchema = z.object({
  assumptions: z.array(assumptionOutputSchema).min(1),
});
export type AssumptionSetOutput = z.infer<typeof assumptionSetSchema>;

/* -------------------------------------------------------------------------- */
/* Stage 3 — Research planning & query generation (TPRD §44)                   */
/* -------------------------------------------------------------------------- */

export const researchQuerySchema = z.object({
  class: queryClassSchema,
  text: z.string().min(2),
  rationale: z.string().min(2),
});

export const queryPlanSchema = z.object({
  queries: z.array(researchQuerySchema).min(1).max(24),
});
export type QueryPlanOutput = z.infer<typeof queryPlanSchema>;

/* -------------------------------------------------------------------------- */
/* Stage 4 — Source discovery & retrieval (TPRD §41)                           */
/* -------------------------------------------------------------------------- */

export const discoveredSourceSchema = z.object({
  url: z.string().url(),
  title: z.string().nullable(),
  snippet: z.string().nullable(),
  publisher: z.string().nullable(),
  publishedAt: z.string().nullable(),
  sourceType: sourceTypeSchema,
  tier: sourceTierSchema,
  /** Which query class produced this result. */
  queryClass: queryClassSchema,
});

export const sourceDiscoveryResultSchema = z.object({
  sources: z.array(discoveredSourceSchema),
});
export type SourceDiscoveryResult = z.infer<typeof sourceDiscoveryResultSchema>;

export const retrievedSourceSchema = z.object({
  url: z.string().url(),
  canonicalUrl: z.string().url(),
  httpStatus: z.number().int(),
  accessibilityStatus: accessibilityStatusSchema,
  title: z.string().nullable(),
  publisher: z.string().nullable(),
  author: z.string().nullable(),
  publishedAt: z.string().nullable(),
  /** Extracted readable text (may be empty when unavailable). */
  content: z.string(),
  contentHash: z.string(),
  geography: z.string().nullable(),
  population: z.string().nullable(),
});
export type RetrievedSourceOutput = z.infer<typeof retrievedSourceSchema>;

/* -------------------------------------------------------------------------- */
/* Stage 5 — Claim extraction & evidence classification (TPRD §38)             */
/* -------------------------------------------------------------------------- */

export const extractedClaimSchema = z.object({
  statement: z.string().min(3),
  claimType: claimTypeSchema,
  confidence: confidenceSchema,
  /** Index into the retrieved-source array this claim came from, if any. */
  sourceIndex: z.number().int().nullable(),
  excerpt: z.string().nullable(),
  evidenceType: evidenceTypeSchema,
  relevance: relevanceSchema,
  geography: z.string().nullable(),
  population: z.string().nullable(),
  timePeriod: z.string().nullable(),
  /** Explicit non-comparability marker (PRD §43). */
  notes: z.string().nullable(),
  supportedBySource: z.boolean(),
});

export const claimSetSchema = z.object({
  claims: z.array(extractedClaimSchema),
});
export type ClaimSetOutput = z.infer<typeof claimSetSchema>;

/* -------------------------------------------------------------------------- */
/* Stage 6 — Contradiction (PRD §16, TPRD §45)                                 */
/* -------------------------------------------------------------------------- */

export const contradictionSchema = z.object({
  conclusion: z.string().min(3),
  contradictingStatement: z.string().min(3),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  affectedAssumptionIndex: z.number().int().nullable(),
  sourceIndex: z.number().int().nullable(),
  excerpt: z.string().nullable(),
  resolution: z.string().nullable(),
});

export const contradictionSetSchema = z.object({
  contradictions: z.array(contradictionSchema),
});
export type ContradictionSetOutput = z.infer<typeof contradictionSetSchema>;

/* -------------------------------------------------------------------------- */
/* Stage 7 — Per-agent section findings (PRD §12)                              */
/* -------------------------------------------------------------------------- */

export const agentFindingSchema = z.object({
  section: z.string().min(2),
  summary: z.string().min(3),
  /** Every material claim carries provenance (TPRD §5.2). */
  statements: z.array(
    z.object({
      statement: z.string().min(3),
      claimType: claimTypeSchema,
      confidence: confidenceSchema,
      sourceIndexes: z.array(z.number().int()).default([]),
      isCounterEvidence: z.boolean().default(false),
    }),
  ),
  unknowns: z.array(z.string()).default([]),
  /** Explicit "no evidence found" marker rather than silent omission. */
  evidenceGap: z.boolean().default(false),
});
export type AgentFindingOutput = z.infer<typeof agentFindingSchema>;

export const competitorOutputSchema = z.object({
  company: z.string().min(1),
  product: z.string().nullable(),
  classification: competitorClassificationSchema,
  targetCustomer: z.string().nullable(),
  geography: z.string().nullable(),
  pricing: z.string().nullable(),
  businessModel: z.string().nullable(),
  distribution: z.string().nullable(),
  funding: z.string().nullable(),
  tractionEvidence: z.string().nullable(),
  strengths: z.string().nullable(),
  weaknesses: z.string().nullable(),
  complaints: z.string().nullable(),
  positioning: z.string().nullable(),
  differentiation: z.string().nullable(),
  sourceIndexes: z.array(z.number().int()).default([]),
});

export const competitorSetSchema = z.object({
  competitors: z.array(competitorOutputSchema),
});
export type CompetitorSetOutput = z.infer<typeof competitorSetSchema>;

/* -------------------------------------------------------------------------- */
/* Stage 8 — Assumption updates (evidence → assumption state)                  */
/* -------------------------------------------------------------------------- */

export const assumptionUpdateSchema = z.object({
  assumptionIndex: z.number().int(),
  evidenceState: z.enum([
    'SUPPORTED',
    'MIXED',
    'WEAKLY_SUPPORTED',
    'CONTRADICTED',
    'UNKNOWN',
    'NON_COMPARABLE',
  ]),
  confidence: confidenceSchema,
  rationale: z.string().min(3),
  unknowns: z.string().nullable(),
});

export const assumptionUpdateSetSchema = z.object({
  updates: z.array(assumptionUpdateSchema),
});
export type AssumptionUpdateSetOutput = z.infer<typeof assumptionUpdateSetSchema>;

/* -------------------------------------------------------------------------- */
/* Stage 9 — Synthesis: the thesis (PRD §28, §29)                              */
/* -------------------------------------------------------------------------- */

export const marketSizeLineSchema = z.object({
  label: z.enum(['TAM', 'SAM', 'SOM']),
  value: z.string(),
  methodology: z.string(),
  inputs: z.array(z.string()),
  source: z.string().nullable(),
  date: z.string().nullable(),
  geography: z.string().nullable(),
  population: z.string().nullable(),
  assumptions: z.array(z.string()),
});

export const economicsLineSchema = z.object({
  label: z.string(),
  value: z.string(),
  /** Exactly one of these — unknowns must be labeled, not guessed. */
  basis: z.enum(['EVIDENCE', 'ASSUMPTION', 'UNKNOWN']),
  source: z.string().nullable(),
});

export const evidenceStateEnum = z.enum([
  'SUPPORTED',
  'MIXED',
  'WEAKLY_SUPPORTED',
  'CONTRADICTED',
  'UNKNOWN',
  'NON_COMPARABLE',
]);

export const thesisSchema = z.object({
  opportunity: z.string().min(3),
  customer: z.string().min(3),
  problem: z.string().min(3),
  existingBehavior: z.string().min(3),
  proposedSolution: z.string().min(3),
  evidenceSummary: z.string().min(3),
  criticalAssumptions: z.array(
    z.object({
      statement: z.string(),
      criticality: criticalitySchema,
      evidenceState: evidenceStateEnum,
    }),
  ),
  contradictoryEvidence: z.array(z.string()),
  unknowns: z.array(z.string()),
  competitiveEnvironment: z.string(),
  economics: z.string(),
  feasibility: z.enum([
    'STRAIGHTFORWARD',
    'FEASIBLE_WITH_ENGINEERING',
    'TECHNICALLY_DIFFICULT',
    'RESEARCH_HEAVY',
    'POTENTIALLY_INFEASIBLE',
    'UNKNOWN',
  ]),
  marketSize: z.array(marketSizeLineSchema).default([]),
  economicsModel: z.array(economicsLineSchema).default([]),
  /** No overall numeric score is ever produced (PRD §11, §29). */
  recommendedNextStep: z.string().min(3),
});
export type ThesisOutput = z.infer<typeof thesisSchema>;

/* -------------------------------------------------------------------------- */
/* Stage 10 — Quality assurance (PRD §59, §60, TPRD §53)                       */
/* -------------------------------------------------------------------------- */

export const qualityCheckSchema = z.object({
  citationCoverage: z.enum(['PASS', 'WARN', 'FAIL']),
  citationCorrectness: z.enum(['PASS', 'WARN', 'FAIL']),
  freshness: z.enum(['PASS', 'WARN', 'FAIL']),
  contradictionCoverage: z.enum(['PASS', 'WARN', 'FAIL']),
  geographyAlignment: z.enum(['PASS', 'WARN', 'FAIL']),
  numericalConsistency: z.enum(['PASS', 'WARN', 'FAIL']),
  assumptionTransparency: z.enum(['PASS', 'WARN', 'FAIL']),
  hallucination: z.enum(['PASS', 'WARN', 'FAIL']),
  unsupportedClaims: z.array(
    z.object({ statement: z.string(), reason: z.string() }),
  ),
  /** Overall gate result — determines COMPLETE vs PARTIAL (PRD §60). */
  overall: z.enum(['PASSED', 'PASSED_WITH_WARNINGS', 'FAILED']),
  summary: z.string(),
});
export type QualityCheckOutput = z.infer<typeof qualityCheckSchema>;

/* -------------------------------------------------------------------------- */
/* Experiment generation (PRD §26, §27)                                        */
/* -------------------------------------------------------------------------- */

export const generatedExperimentSchema = z.object({
  assumptionIndex: z.number().int(),
  name: z.string().min(3),
  hypothesis: z.string().min(3),
  method: z.string().min(3),
  targetParticipants: z.string().nullable(),
  successCriterion: z.string().min(3),
  failureCriterion: z.string().min(3),
  priority: experimentPrioritySchema,
});

export const experimentSetSchema = z.object({
  experiments: z.array(generatedExperimentSchema),
});
export type ExperimentSetOutput = z.infer<typeof experimentSetSchema>;
