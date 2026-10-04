import { z } from 'zod';
import {
  ASSUMPTION_CATEGORIES,
  CLAIM_TYPES,
  COMPETITOR_CLASSIFICATIONS,
  CONFIDENCES,
  CRITICALITIES,
  EVIDENCE_TYPES,
  EVIDENCE_STATES,
  QUERY_CLASSES,
  REQUESTED_DEPTHS,
  SOURCE_TYPES,
  WORKSPACE_ROLES,
  type AssumptionCategory,
  type ClaimType,
  type CompetitorClassification,
  type Confidence,
  type Criticality,
  type EvidenceState,
  type EvidenceType,
  type QueryClass,
  type RequestedDepth,
  type SourceType,
  type WorkspaceRole,
} from '@sift/types';

/**
 * Helper: build a Zod enum from a readonly string-literal array exported by
 * `@sift/types`. Keeps the DB string columns and the runtime validation in one
 * place (TPRD §19: enum-like columns validated at the app layer).
 */
function enumFrom<T extends string>(values: readonly T[]) {
  return z.enum(values as unknown as [T, ...T[]]);
}

export const workspaceRoleSchema = enumFrom<WorkspaceRole>(WORKSPACE_ROLES);
export const assumptionCategorySchema = enumFrom<AssumptionCategory>(ASSUMPTION_CATEGORIES);
export const criticalitySchema = enumFrom<Criticality>(CRITICALITIES);
export const confidenceSchema = enumFrom<Confidence>(CONFIDENCES);
export const evidenceStateSchema = enumFrom<EvidenceState>([
  'SUPPORTED',
  'MIXED',
  'WEAKLY_SUPPORTED',
  'CONTRADICTED',
  'UNKNOWN',
  'NON_COMPARABLE',
]);
export const claimTypeSchema = enumFrom<ClaimType>(CLAIM_TYPES);
export const sourceTypeSchema = enumFrom<SourceType>(SOURCE_TYPES);
export const sourceTierSchema = enumFrom([
  'TIER_1_PRIMARY',
  'TIER_2_SECONDARY',
  'TIER_3_COMMUNITY',
  'TIER_4_LOW_CONFIDENCE',
] as const);
export const evidenceTypeSchema = enumFrom<EvidenceType>(EVIDENCE_TYPES);
export const queryClassSchema = enumFrom<QueryClass>(QUERY_CLASSES);
export const requestedDepthSchema = enumFrom<RequestedDepth>(REQUESTED_DEPTHS);
export const competitorClassificationSchema =
  enumFrom<CompetitorClassification>(COMPETITOR_CLASSIFICATIONS);
export const relevanceSchema = enumFrom(['HIGH', 'MEDIUM', 'LOW'] as const);
export const ideaInputTypeSchema = enumFrom([
  'TEXT',
  'URL',
  'REDDIT_URL',
  'PASTE',
  'VOICE',
] as const);
export const accessibilityStatusSchema = enumFrom([
  'ACCESSIBLE',
  'ACCESS_UNAVAILABLE',
  'PARTIAL',
  'PAYWALLED',
  'BLOCKED',
] as const);
export const experimentPrioritySchema = enumFrom([
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
] as const);
export const experimentStatusSchema = enumFrom([
  'PROPOSED',
  'PLANNED',
  'RUNNING',
  'COMPLETE',
  'ABANDONED',
] as const);
export const exportFormatSchema = enumFrom(['PDF', 'MARKDOWN'] as const);
export const subscriptionPlanSchema = enumFrom([
  'FREE',
  'INDIVIDUAL',
  'PRO',
  'TEAM',
  'ENTERPRISE',
] as const);
