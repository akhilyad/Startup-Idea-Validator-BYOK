/**
 * Domain enumerations.
 *
 * IMPORTANT (portability): these are stored in the database as plain strings.
 * Prisma `enum` is not supported on SQLite, so enums are enforced at the
 * application/validation layer (`@sift/validation`) instead. The same string
 * values are valid PostgreSQL enum labels if the project is migrated.
 */

export const WorkspaceRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;
export type WorkspaceRole = (typeof WorkspaceRole)[keyof typeof WorkspaceRole];
export const WORKSPACE_ROLES = Object.values(WorkspaceRole) as WorkspaceRole[];

/** Analysis lifecycle (Product PRD §58, TPRD §24). */
export const AnalysisStatus = {
  CREATED: 'CREATED',
  PARSING: 'PARSING',
  DECOMPOSING: 'DECOMPOSING',
  GENERATING_ASSUMPTIONS: 'GENERATING_ASSUMPTIONS',
  RESEARCHING: 'RESEARCHING',
  VERIFYING: 'VERIFYING',
  CHALLENGING: 'CHALLENGING',
  SYNTHESIZING: 'SYNTHESIZING',
  QUALITY_CHECK: 'QUALITY_CHECK',
  COMPLETE: 'COMPLETE',
  PARTIAL: 'PARTIAL',
  FAILED: 'FAILED',
  NEEDS_RETRY: 'NEEDS_RETRY',
  CANCELLED: 'CANCELLED',
} as const;
export type AnalysisStatus = (typeof AnalysisStatus)[keyof typeof AnalysisStatus];
export const ANALYSIS_STATUSES = Object.values(AnalysisStatus) as AnalysisStatus[];

/** Terminal statuses never transition further. */
export const TERMINAL_ANALYSIS_STATUSES: AnalysisStatus[] = [
  'COMPLETE',
  'PARTIAL',
  'FAILED',
  'CANCELLED',
];

export const AssumptionCategory = {
  DESIRABILITY: 'DESIRABILITY',
  CUSTOMER: 'CUSTOMER',
  PROBLEM: 'PROBLEM',
  SOLUTION: 'SOLUTION',
  DEMAND: 'DEMAND',
  PRICING: 'PRICING',
  BUSINESS_MODEL: 'BUSINESS_MODEL',
  MARKET: 'MARKET',
  COMPETITION: 'COMPETITION',
  DISTRIBUTION: 'DISTRIBUTION',
  TECHNOLOGY: 'TECHNOLOGY',
  OPERATIONS: 'OPERATIONS',
  REGULATION: 'REGULATION',
  ECONOMICS: 'ECONOMICS',
  DEFENSIBILITY: 'DEFENSIBILITY',
  TIMING: 'TIMING',
} as const;
export type AssumptionCategory = (typeof AssumptionCategory)[keyof typeof AssumptionCategory];
export const ASSUMPTION_CATEGORIES = Object.values(AssumptionCategory) as AssumptionCategory[];

/** How damaging would it be if this assumption were false? (PRD §11) */
export const Criticality = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;
export type Criticality = (typeof Criticality)[keyof typeof Criticality];
export const CRITICALITIES = Object.values(Criticality) as Criticality[];

/** Qualitative confidence only — never a fake percentage (PRD §71). */
export const Confidence = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  UNKNOWN: 'UNKNOWN',
} as const;
export type Confidence = (typeof Confidence)[keyof typeof Confidence];
export const CONFIDENCES = Object.values(Confidence) as Confidence[];

export const AssumptionStatus = {
  OPEN: 'OPEN',
  SUPPORTED: 'SUPPORTED',
  WEAKLY_SUPPORTED: 'WEAKLY_SUPPORTED',
  MIXED: 'MIXED',
  CONTRADICTED: 'CONTRADICTED',
  VALIDATED: 'VALIDATED',
  INVALIDATED: 'INVALIDATED',
  UNKNOWN: 'UNKNOWN',
} as const;
export type AssumptionStatus = (typeof AssumptionStatus)[keyof typeof AssumptionStatus];

/** Contradiction-engine classification (PRD §16). */
export const EvidenceState = {
  SUPPORTED: 'SUPPORTED',
  MIXED: 'MIXED',
  WEAKLY_SUPPORTED: 'WEAKLY_SUPPORTED',
  CONTRADICTED: 'CONTRADICTED',
  UNKNOWN: 'UNKNOWN',
  NON_COMPARABLE: 'NON_COMPARABLE',
} as const;
export type EvidenceState = (typeof EvidenceState)[keyof typeof EvidenceState];
export const EVIDENCE_STATES = Object.values(EvidenceState) as EvidenceState[];

/** Evidence vs. analysis vs. assumption vs. unknown (PRD §15, TPRD §3.1). */
export const ClaimType = {
  FACT: 'FACT',
  DERIVED_ANALYSIS: 'DERIVED_ANALYSIS',
  ASSUMPTION: 'ASSUMPTION',
  UNKNOWN: 'UNKNOWN',
  COUNTER_EVIDENCE: 'COUNTER_EVIDENCE',
  VALIDATION_RESULT: 'VALIDATION_RESULT',
} as const;
export type ClaimType = (typeof ClaimType)[keyof typeof ClaimType];
export const CLAIM_TYPES = Object.values(ClaimType) as ClaimType[];

export const SourceType = {
  PRIMARY: 'PRIMARY',
  SECONDARY: 'SECONDARY',
  COMMUNITY: 'COMMUNITY',
  LOW_CONFIDENCE: 'LOW_CONFIDENCE',
} as const;
export type SourceType = (typeof SourceType)[keyof typeof SourceType];
export const SOURCE_TYPES = Object.values(SourceType) as SourceType[];

/** Source hierarchy tier (PRD §13). */
export const SourceTier = {
  TIER_1_PRIMARY: 'TIER_1_PRIMARY',
  TIER_2_SECONDARY: 'TIER_2_SECONDARY',
  TIER_3_COMMUNITY: 'TIER_3_COMMUNITY',
  TIER_4_LOW_CONFIDENCE: 'TIER_4_LOW_CONFIDENCE',
} as const;
export type SourceTier = (typeof SourceTier)[keyof typeof SourceTier];

export const AccessibilityStatus = {
  ACCESSIBLE: 'ACCESSIBLE',
  ACCESS_UNAVAILABLE: 'ACCESS_UNAVAILABLE',
  PARTIAL: 'PARTIAL',
  PAYWALLED: 'PAYWALLED',
  BLOCKED: 'BLOCKED',
} as const;
export type AccessibilityStatus =
  (typeof AccessibilityStatus)[keyof typeof AccessibilityStatus];

export const EvidenceType = {
  SUPPORTING: 'SUPPORTING',
  COUNTER: 'COUNTER',
  NEUTRAL: 'NEUTRAL',
  CONTEXT: 'CONTEXT',
} as const;
export type EvidenceType = (typeof EvidenceType)[keyof typeof EvidenceType];
export const EVIDENCE_TYPES = Object.values(EvidenceType) as EvidenceType[];

export const Relevance = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;
export type Relevance = (typeof Relevance)[keyof typeof Relevance];

/** Competitor classification (PRD §17). NON_CONSUMPTION is first-class. */
export const CompetitorClassification = {
  DIRECT: 'DIRECT',
  INDIRECT: 'INDIRECT',
  SUBSTITUTE: 'SUBSTITUTE',
  NON_CONSUMPTION: 'NON_CONSUMPTION',
  FAILED: 'FAILED',
} as const;
export type CompetitorClassification =
  (typeof CompetitorClassification)[keyof typeof CompetitorClassification];
export const COMPETITOR_CLASSIFICATIONS = Object.values(
  CompetitorClassification,
) as CompetitorClassification[];

export const ExperimentPriority = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;
export type ExperimentPriority = (typeof ExperimentPriority)[keyof typeof ExperimentPriority];

export const ExperimentStatus = {
  PROPOSED: 'PROPOSED',
  PLANNED: 'PLANNED',
  RUNNING: 'RUNNING',
  COMPLETE: 'COMPLETE',
  ABANDONED: 'ABANDONED',
} as const;
export type ExperimentStatus = (typeof ExperimentStatus)[keyof typeof ExperimentStatus];

export const ResearchRunType = {
  INITIAL: 'INITIAL',
  CHALLENGE: 'CHALLENGE',
  REFRESH: 'REFRESH',
} as const;
export type ResearchRunType = (typeof ResearchRunType)[keyof typeof ResearchRunType];

export const ResearchRunStatus = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  COMPLETE: 'COMPLETE',
  PARTIAL: 'PARTIAL',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;
export type ResearchRunStatus = (typeof ResearchRunStatus)[keyof typeof ResearchRunStatus];

/** Research task types (TPRD §32). */
export const ResearchTaskType = {
  NORMALIZE: 'NORMALIZE',
  GENERATE_ASSUMPTIONS: 'GENERATE_ASSUMPTIONS',
  PROBLEM_RESEARCH: 'PROBLEM_RESEARCH',
  CUSTOMER_RESEARCH: 'CUSTOMER_RESEARCH',
  COMPETITOR_RESEARCH: 'COMPETITOR_RESEARCH',
  MARKET_RESEARCH: 'MARKET_RESEARCH',
  PRICING_RESEARCH: 'PRICING_RESEARCH',
  TECHNOLOGY_RESEARCH: 'TECHNOLOGY_RESEARCH',
  REGULATION_RESEARCH: 'REGULATION_RESEARCH',
  ECONOMICS_RESEARCH: 'ECONOMICS_RESEARCH',
  GTM_RESEARCH: 'GTM_RESEARCH',
  DEFENSIBILITY_RESEARCH: 'DEFENSIBILITY_RESEARCH',
  COUNTER_EVIDENCE: 'COUNTER_EVIDENCE',
  SYNTHESIS: 'SYNTHESIS',
  QUALITY_CHECK: 'QUALITY_CHECK',
} as const;
export type ResearchTaskType = (typeof ResearchTaskType)[keyof typeof ResearchTaskType];
export const RESEARCH_TASK_TYPES = Object.values(ResearchTaskType) as ResearchTaskType[];

export const TaskStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETE: 'COMPLETE',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

/** Query classes research agents may generate (TPRD §44). */
export const QueryClass = {
  DIRECT: 'DIRECT',
  PROBLEM: 'PROBLEM',
  NEGATIVE: 'NEGATIVE',
  FAILURE: 'FAILURE',
  PRICING: 'PRICING',
  ALTERNATIVE: 'ALTERNATIVE',
  CUSTOMER: 'CUSTOMER',
  COMMUNITY: 'COMMUNITY',
} as const;
export type QueryClass = (typeof QueryClass)[keyof typeof QueryClass];
export const QUERY_CLASSES = Object.values(QueryClass) as QueryClass[];

export const UsageEventType = {
  ANALYSIS_CREATED: 'ANALYSIS_CREATED',
  ANALYSIS_COMPLETED: 'ANALYSIS_COMPLETED',
  CHALLENGE_RUN: 'CHALLENGE_RUN',
  EXPORT_CREATED: 'EXPORT_CREATED',
  LLM_TOKENS: 'LLM_TOKENS',
  LLM_CALL: 'LLM_CALL',
  SEARCH_REQUEST: 'SEARCH_REQUEST',
  RETRIEVAL_REQUEST: 'RETRIEVAL_REQUEST',
  EMBEDDING: 'EMBEDDING',
} as const;
export type UsageEventType = (typeof UsageEventType)[keyof typeof UsageEventType];

export const SubscriptionPlan = {
  FREE: 'FREE',
  INDIVIDUAL: 'INDIVIDUAL',
  PRO: 'PRO',
  TEAM: 'TEAM',
  ENTERPRISE: 'ENTERPRISE',
} as const;
export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  TRIALING: 'TRIALING',
  PAST_DUE: 'PAST_DUE',
  CANCELED: 'CANCELED',
  INCOMPLETE: 'INCOMPLETE',
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const AuditAction = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  EMAIL_CHANGE: 'EMAIL_CHANGE',
  WORKSPACE_CREATED: 'WORKSPACE_CREATED',
  MEMBER_ADDED: 'MEMBER_ADDED',
  MEMBER_REMOVED: 'MEMBER_REMOVED',
  ANALYSIS_CREATED: 'ANALYSIS_CREATED',
  ANALYSIS_DELETED: 'ANALYSIS_DELETED',
  EXPORT_CREATED: 'EXPORT_CREATED',
  BILLING_CHANGE: 'BILLING_CHANGE',
  API_KEY_CHANGE: 'API_KEY_CHANGE',
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

/** Report navigation sections (PRD §30, §63). */
export const ReportSection = {
  OVERVIEW: 'OVERVIEW',
  ASSUMPTIONS: 'ASSUMPTIONS',
  EVIDENCE: 'EVIDENCE',
  COUNTER_EVIDENCE: 'COUNTER_EVIDENCE',
  CUSTOMERS: 'CUSTOMERS',
  PROBLEM: 'PROBLEM',
  COMPETITION: 'COMPETITION',
  MARKET: 'MARKET',
  ECONOMICS: 'ECONOMICS',
  TECHNOLOGY: 'TECHNOLOGY',
  REGULATION: 'REGULATION',
  GTM: 'GTM',
  DEFENSIBILITY: 'DEFENSIBILITY',
  EXPERIMENTS: 'EXPERIMENTS',
  SOURCES: 'SOURCES',
  RESEARCH_LOG: 'RESEARCH_LOG',
} as const;
export type ReportSection = (typeof ReportSection)[keyof typeof ReportSection];
export const REPORT_SECTIONS = Object.values(ReportSection) as ReportSection[];

export const IdeaInputType = {
  TEXT: 'TEXT',
  URL: 'URL',
  REDDIT_URL: 'REDDIT_URL',
  PASTE: 'PASTE',
  VOICE: 'VOICE',
} as const;
export type IdeaInputType = (typeof IdeaInputType)[keyof typeof IdeaInputType];

export const RequestedDepth = {
  QUICK: 'QUICK',
  STANDARD: 'STANDARD',
  DEEP: 'DEEP',
} as const;
export type RequestedDepth = (typeof RequestedDepth)[keyof typeof RequestedDepth];
export const REQUESTED_DEPTHS = Object.values(RequestedDepth) as RequestedDepth[];

export const QualityStatus = {
  NOT_RUN: 'NOT_RUN',
  PASSED: 'PASSED',
  PASSED_WITH_WARNINGS: 'PASSED_WITH_WARNINGS',
  FAILED: 'FAILED',
} as const;
export type QualityStatus = (typeof QualityStatus)[keyof typeof QualityStatus];

export const ExportFormat = {
  PDF: 'PDF',
  MARKDOWN: 'MARKDOWN',
} as const;
export type ExportFormat = (typeof ExportFormat)[keyof typeof ExportFormat];

export const ExportStatus = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  COMPLETE: 'COMPLETE',
  FAILED: 'FAILED',
} as const;
export type ExportStatus = (typeof ExportStatus)[keyof typeof ExportStatus];

export const ResearchLogEventType = {
  RESEARCH_STARTED: 'RESEARCH_STARTED',
  QUERY_ISSUED: 'QUERY_ISSUED',
  SOURCE_DISCOVERED: 'SOURCE_DISCOVERED',
  SOURCE_ACCEPTED: 'SOURCE_ACCEPTED',
  SOURCE_REJECTED: 'SOURCE_REJECTED',
  SOURCE_UNAVAILABLE: 'SOURCE_UNAVAILABLE',
  CLAIM_EXTRACTED: 'CLAIM_EXTRACTED',
  EVIDENCE_CLASSIFIED: 'EVIDENCE_CLASSIFIED',
  CONTRADICTION_FOUND: 'CONTRADICTION_FOUND',
  ASSUMPTION_UPDATED: 'ASSUMPTION_UPDATED',
  TASK_STATUS: 'TASK_STATUS',
  RESEARCH_COMPLETED: 'RESEARCH_COMPLETED',
  RESEARCH_FAILED: 'RESEARCH_FAILED',
} as const;
export type ResearchLogEventType =
  (typeof ResearchLogEventType)[keyof typeof ResearchLogEventType];
