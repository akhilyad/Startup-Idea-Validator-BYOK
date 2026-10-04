import type {
  AccessibilityStatus,
  AnalysisStatus,
  AssumptionCategory,
  AssumptionStatus,
  ClaimType,
  CompetitorClassification,
  Confidence,
  Criticality,
  EvidenceState,
  EvidenceType,
  ExperimentPriority,
  ExperimentStatus,
  IdeaInputType,
  QualityStatus,
  Relevance,
  RequestedDepth,
  ResearchRunStatus,
  ResearchRunType,
  ResearchTaskType,
  SourceTier,
  SourceType,
  SubscriptionPlan,
  SubscriptionStatus,
  TaskStatus,
  WorkspaceRole,
} from './enums.js';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/** ISO-8601 timestamp string as serialized over the API. */
export type Timestamp = string;

export interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerifiedAt: Timestamp | null;
  image: string | null;
  createdAt: Timestamp;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: Timestamp;
  user?: User;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface IdeaVersion {
  id: string;
  ideaId: string;
  versionNumber: number;
  rawInput: string;
  inputType: IdeaInputType;
  normalizedCustomer: string | null;
  normalizedProblem: string | null;
  normalizedSolution: string | null;
  industry: string | null;
  geography: string | null;
  businessModel: string | null;
  pricing: string | null;
  distribution: string | null;
  technology: string | null;
  assumptionsJson: JsonValue;
  constraintsJson: JsonValue;
  createdAt: Timestamp;
}

export interface Idea {
  id: string;
  projectId: string;
  currentVersionId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  currentVersion?: IdeaVersion | null;
  versions?: IdeaVersion[];
}

export interface Analysis {
  id: string;
  ideaVersionId: string;
  workspaceId: string;
  status: AnalysisStatus;
  requestedDepth: RequestedDepth;
  cancelRequested: boolean;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  failureReason: string | null;
  qualityStatus: QualityStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Assumption {
  id: string;
  analysisId: string;
  category: AssumptionCategory;
  statement: string;
  criticality: Criticality;
  confidence: Confidence;
  status: AssumptionStatus;
  evidenceState: EvidenceState;
  unknowns: string | null;
  requiredExperiment: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Source {
  id: string;
  canonicalUrl: string;
  title: string | null;
  publisher: string | null;
  author: string | null;
  publishedAt: Timestamp | null;
  retrievedAt: Timestamp | null;
  sourceType: SourceType;
  tier: SourceTier;
  contentHash: string | null;
  accessibilityStatus: AccessibilityStatus;
  geography: string | null;
  population: string | null;
  independenceKey: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Claim {
  id: string;
  analysisId: string;
  assumptionId: string | null;
  section: string | null;
  statement: string;
  claimType: ClaimType;
  status: string | null;
  confidence: Confidence;
  createdAt: Timestamp;
}

export interface Evidence {
  id: string;
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
  createdAt: Timestamp;
  source?: Source;
  claim?: Claim;
}

export interface Competitor {
  id: string;
  analysisId: string;
  classification: CompetitorClassification;
  company: string;
  product: string | null;
  targetCustomer: string | null;
  geography: string | null;
  pricing: string | null;
  businessModel: string | null;
  distribution: string | null;
  funding: string | null;
  tractionEvidence: string | null;
  strengths: string | null;
  weaknesses: string | null;
  complaints: string | null;
  positioning: string | null;
  differentiation: string | null;
  lastVerified: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Experiment {
  id: string;
  analysisId: string;
  assumptionId: string | null;
  name: string;
  hypothesis: string;
  method: string;
  targetParticipants: string | null;
  successCriterion: string;
  failureCriterion: string;
  deadline: Timestamp | null;
  priority: ExperimentPriority;
  status: ExperimentStatus;
  result: string | null;
  conclusion: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ExperimentResult {
  id: string;
  experimentId: string;
  recordedAt: Timestamp;
  outcome: string;
  notes: string | null;
  evidenceJson: JsonValue;
  createdAt: Timestamp;
}

export interface ResearchRun {
  id: string;
  analysisId: string;
  runType: ResearchRunType;
  status: ResearchRunStatus;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  tokenCost: number;
  searchCost: number;
  sourceCount: number;
  failureReason: string | null;
  createdAt: Timestamp;
}

export interface ResearchTask {
  id: string;
  researchRunId: string;
  taskType: ResearchTaskType;
  status: TaskStatus;
  inputJson: JsonValue;
  outputJson: JsonValue;
  attempts: number;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  failureReason: string | null;
}

export interface ResearchLogEntry {
  id: string;
  analysisId: string;
  runId: string | null;
  agent: string | null;
  eventType: string;
  query: string | null;
  sourceId: string | null;
  decision: string | null;
  reason: string | null;
  payloadJson: JsonValue;
  createdAt: Timestamp;
}

export interface Report {
  id: string;
  analysisId: string;
  version: number;
  thesisJson: JsonValue;
  qualityStatus: QualityStatus;
  generatedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UsageSummary {
  freeLimit: number;
  freeUsed: number;
  freeRemaining: number;
  paidCredits: number;
  canStartAnalysis: boolean;
  plan: SubscriptionPlan;
}

export interface Subscription {
  id: string;
  workspaceId: string;
  provider: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Timestamp | null;
  currentPeriodEnd: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type { WorkspaceRole };
