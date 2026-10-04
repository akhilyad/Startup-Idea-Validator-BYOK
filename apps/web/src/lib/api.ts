/**
 * Sift typed API client
 */

const API_BASE = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.error?.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg) as Error & { code?: string; status?: number; details?: unknown };
    err.code = data?.error?.code;
    err.status = res.status;
    err.details = data?.error?.details;
    throw err;
  }

  return data as T;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface WorkspaceRef {
  id: string;
  name: string;
  role: string;
  plan?: string;
}

export interface Entitlements {
  freeRemaining: number;
  isSubscribed: boolean;
  usageCount: number;
  maxFree: number;
}

export interface AuthResponse {
  user: User;
  workspace: WorkspaceRef | null;
  entitlements?: Entitlements;
  token?: string;
}

export interface NormalizedIdea {
  proposedCustomer: string;
  problem: string;
  proposedSolution: string;
  industry: string | null;
  geography: string | null;
  businessModel: string | null;
  pricing: string | null;
  distribution: string | null;
  technology: string | null;
}

export interface Assumption {
  id: string;
  analysisId: string;
  category: string;
  statement: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  status: string;
  evidenceState: 'SUPPORTED' | 'MIXED' | 'WEAKLY_SUPPORTED' | 'CONTRADICTED' | 'UNKNOWN' | 'NON_COMPARABLE';
  unknowns: string | null;
  requiredExperiment: string | null;
  createdAt: string;
}

export interface Source {
  id: string;
  canonicalUrl: string;
  title: string | null;
  publisher: string | null;
  sourceType: string;
  tier: string;
  geography: string | null;
  population: string | null;
}

export interface Evidence {
  id: string;
  claimId: string;
  sourceId: string;
  evidenceType: 'SUPPORTING' | 'COUNTER' | 'NEUTRAL' | 'CONTEXT';
  excerpt: string;
  relevance: string;
  confidence: string;
  notes: string | null;
  source: Source;
}

export interface Claim {
  id: string;
  statement: string;
  claimType: 'FACT' | 'DERIVED_ANALYSIS' | 'ASSUMPTION' | 'UNKNOWN' | 'COUNTER_EVIDENCE' | 'VALIDATION_RESULT';
  confidence: string;
  section: string | null;
  evidence: Evidence[];
}

export interface Competitor {
  id: string;
  company: string;
  product: string | null;
  classification: 'DIRECT' | 'INDIRECT' | 'SUBSTITUTE' | 'NON_CONSUMPTION' | 'FAILED';
  pricing: string | null;
  targetCustomer: string | null;
  strengths: string | null;
  weaknesses: string | null;
  complaints: string | null;
  differentiation: string | null;
}

export interface Experiment {
  id: string;
  assumptionId: string | null;
  name: string;
  hypothesis: string;
  method: string;
  targetParticipants: string;
  successCriterion: string;
  failureCriterion: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PROPOSED' | 'PLANNED' | 'RUNNING' | 'COMPLETE' | 'ABANDONED';
  result: string | null;
  conclusion: 'VALIDATED' | 'CONTRADICTED' | 'INCONCLUSIVE' | null;
  assumption?: Assumption;
}

export interface Thesis {
  opportunity: string;
  customer: string;
  problem: string;
  existingBehavior: string;
  proposedSolution: string;
  evidenceSummary: string;
  criticalAssumptions: string[];
  contradictoryEvidence: string[];
  criticalUnknowns: string[];
  validationPlan: string;
  decisionOutput: string;
}

export interface AnalysisDetail {
  id: string;
  status: 'CREATED' | 'PARSING' | 'DECOMPOSING' | 'GENERATING_ASSUMPTIONS' | 'RESEARCHING' | 'VERIFYING' | 'CHALLENGING' | 'SYNTHESIZING' | 'QUALITY_CHECK' | 'COMPLETE' | 'PARTIAL' | 'FAILED' | 'CANCELLED';
  qualityStatus: string;
  requestedDepth: string;
  cancelRequested: boolean;
  createdAt: string;
  completedAt: string | null;
  failureReason: string | null;
  ideaVersion: {
    id: string;
    versionNumber: number;
    rawInput: string;
    inputType: string;
    normalizedCustomer: string | null;
    normalizedProblem: string | null;
    normalizedSolution: string | null;
    industry: string | null;
    geography: string | null;
    businessModel: string | null;
    pricing: string | null;
    distribution: string | null;
    technology: string | null;
    assumptionsJson: string;
    constraintsJson: string;
  };
  project: {
    id: string;
    name: string;
  };
  ideaVersions: Array<{
    id: string;
    versionNumber: number;
    createdAt: string;
  }>;
  assumptions: Assumption[];
  claims: Claim[];
  competitors: Competitor[];
  experiments: Experiment[];
  thesis: Thesis | null;
  report: {
    id: string;
    version: number;
    generatedAt: string;
    qualityStatus: string;
  } | null;
  runs: Array<{
    id: string;
    runType: string;
    status: string;
    sourceCount: number;
    createdAt: string;
  }>;
  logEntries: Array<{
    id: string;
    eventType: string;
    decision: string | null;
    reason: string | null;
    createdAt: string;
  }>;
}

export interface AnalysisListItem {
  id: string;
  status: string;
  qualityStatus: string;
  requestedDepth: string;
  createdAt: string;
  completedAt: string | null;
  projectName: string;
  projectId: string;
  rawInput: string;
  title: string;
  customer: string | null;
  problem: string | null;
  solution: string | null;
  versionNumber: number;
  stats: {
    assumptions: number;
    claims: number;
    competitors: number;
    experiments: number;
  };
  hasReport: boolean;
}

export const api = {
  // Auth
  getMe: () => request<AuthResponse>('/auth/me'),
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name?: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  // Ideas & Normalization
  normalizeIdea: (rawInput: string, inputType = 'TEXT', sourceUrl?: string) =>
    request<{ normalized: NormalizedIdea; synthetic: boolean }>('/ideas/normalize', {
      method: 'POST',
      body: JSON.stringify({ rawInput, inputType, sourceUrl }),
    }),

  // Projects
  listProjects: () => request<{ projects: any[] }>('/projects'),
  createProject: (name: string, description?: string) =>
    request<{ project: any }>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),

  // Analyses
  createAnalysis: (data: {
    rawInput: string;
    inputType?: string;
    sourceUrl?: string;
    projectName?: string;
    projectId?: string;
    normalizedCustomer?: string;
    normalizedProblem?: string;
    normalizedSolution?: string;
    industry?: string;
    geography?: string;
    businessModel?: string;
    pricing?: string;
    distribution?: string;
    technology?: string;
    requestedDepth?: string;
    assumptions?: string[];
    constraints?: string[];
  }) =>
    request<{ analysisId: string; runId: string; projectId: string }>('/analyses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listAnalyses: () => request<{ analyses: AnalysisListItem[] }>('/analyses'),
  getAnalysis: (id: string) => request<{ analysis: AnalysisDetail }>(`/analyses/${id}`),
  cancelAnalysis: (id: string) => request<{ success: boolean }>(`/analyses/${id}/cancel`, { method: 'POST' }),

  // Challenge the Idea
  runChallenge: (id: string, focus?: string) =>
    request<{ success: boolean; runId: string }>(`/analyses/${id}/challenge`, {
      method: 'POST',
      body: JSON.stringify({ focus }),
    }),

  // Versioning
  createVersion: (id: string, data: any) =>
    request<{ analysisId: string; versionNumber: number; runId: string }>(`/analyses/${id}/new-version`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Assumptions
  updateAssumption: (analysisId: string, assumptionId: string, data: any) =>
    request<{ assumption: Assumption }>(`/analyses/${analysisId}/assumptions/${assumptionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Experiments
  createExperiment: (analysisId: string, data: {
    assumptionId?: string;
    name: string;
    hypothesis: string;
    method: string;
    targetParticipants?: string;
    successCriterion: string;
    failureCriterion: string;
    priority?: string;
  }) =>
    request<{ experiment: Experiment }>(`/analyses/${analysisId}/experiments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  recordExperimentResult: (analysisId: string, experimentId: string, data: {
    result: string;
    conclusion: 'VALIDATED' | 'CONTRADICTED' | 'INCONCLUSIVE';
  }) =>
    request<{ experiment: Experiment; message: string }>(`/analyses/${analysisId}/experiments/${experimentId}/results`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Billing
  getBillingUsage: () =>
    request<{
      plan: string;
      isSubscribed: boolean;
      usageCount: number;
      maxFree: number;
      freeRemaining: number;
      features: Record<string, boolean>;
    }>('/billing/usage'),

  upgradePlan: (plan: 'ONE_TIME' | 'PRO' | 'TEAM') =>
    request<{ success: boolean; plan: string; message: string }>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }),

  // Realtime Events
  subscribeEvents: (
    analysisId: string,
    onMessage: (event: any) => void,
    onError?: (err: any) => void,
  ) => {
    const sse = new EventSource(`/api/v1/analyses/${analysisId}/events`);
    sse.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        onMessage(parsed);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };
    sse.onerror = (err) => {
      if (onError) onError(err);
    };
    return () => sse.close();
  },
};
