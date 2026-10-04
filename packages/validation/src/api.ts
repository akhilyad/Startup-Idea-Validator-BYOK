import { z } from 'zod';
import {
  assumptionCategorySchema,
  competitorClassificationSchema,
  confidenceSchema,
  criticalitySchema,
  evidenceStateSchema,
  experimentPrioritySchema,
  experimentStatusSchema,
  exportFormatSchema,
  ideaInputTypeSchema,
  relevanceSchema,
  requestedDepthSchema,
} from './enums.js';

/* -------------------------------------------------------------------------- */
/* Auth                                                                        */
/* -------------------------------------------------------------------------- */

export const signupSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(120).optional(),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

/* -------------------------------------------------------------------------- */
/* Workspaces & projects                                                       */
/* -------------------------------------------------------------------------- */

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(120),
});

export const createProjectSchema = z.object({
  workspaceId: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/* -------------------------------------------------------------------------- */
/* Idea intake & analysis creation                                            */
/* -------------------------------------------------------------------------- */

const httpUrl = z
  .string()
  .url()
  .refine((v) => /^https?:\/\//i.test(v), 'Only http(s) URLs are supported');

export const createAnalysisSchema = z
  .object({
    /** Free-form idea text (text/paste/voice-transcript). */
    text: z.string().min(8).max(20000).optional(),
    /** A single URL (web page or Reddit thread). */
    url: httpUrl.optional(),
    workspaceId: z.string().uuid().optional(),
    projectId: z.string().uuid().optional(),
    projectName: z.string().min(1).max(200).optional(),
    depth: requestedDepthSchema.default('STANDARD'),
  })
  .refine((v) => Boolean(v.text) || Boolean(v.url), {
    message: 'Provide either idea text or a URL.',
    path: ['text'],
  });
export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>;

export const updateIdeaVersionSchema = z.object({
  normalizedCustomer: z.string().max(2000).nullable().optional(),
  normalizedProblem: z.string().max(4000).nullable().optional(),
  normalizedSolution: z.string().max(4000).nullable().optional(),
  industry: z.string().max(200).nullable().optional(),
  geography: z.string().max(200).nullable().optional(),
  businessModel: z.string().max(500).nullable().optional(),
  pricing: z.string().max(500).nullable().optional(),
  distribution: z.string().max(500).nullable().optional(),
  technology: z.string().max(500).nullable().optional(),
  /** Editing the interpretation creates a NEW immutable idea version. */
  createNewVersion: z.boolean().default(true),
});
export type UpdateIdeaVersionInput = z.infer<typeof updateIdeaVersionSchema>;

/* -------------------------------------------------------------------------- */
/* Assumptions                                                                 */
/* -------------------------------------------------------------------------- */

export const patchAssumptionSchema = z.object({
  statement: z.string().min(3).max(2000).optional(),
  category: assumptionCategorySchema.optional(),
  criticality: criticalitySchema.optional(),
  confidence: confidenceSchema.optional(),
  evidenceState: evidenceStateSchema.optional(),
  unknowns: z.string().max(4000).nullable().optional(),
  requiredExperiment: z.string().max(4000).nullable().optional(),
});
export type PatchAssumptionInput = z.infer<typeof patchAssumptionSchema>;

/* -------------------------------------------------------------------------- */
/* Experiments                                                                 */
/* -------------------------------------------------------------------------- */

export const createExperimentSchema = z.object({
  assumptionId: z.string().uuid().nullable().optional(),
  name: z.string().min(3).max(300),
  hypothesis: z.string().min(3).max(4000),
  method: z.string().min(3).max(4000),
  targetParticipants: z.string().max(500).nullable().optional(),
  successCriterion: z.string().min(3).max(2000),
  failureCriterion: z.string().min(3).max(2000),
  deadline: z.string().datetime().nullable().optional(),
  priority: experimentPrioritySchema.default('MEDIUM'),
});
export type CreateExperimentInput = z.infer<typeof createExperimentSchema>;

export const patchExperimentSchema = z.object({
  name: z.string().min(3).max(300).optional(),
  hypothesis: z.string().min(3).max(4000).optional(),
  method: z.string().min(3).max(4000).optional(),
  targetParticipants: z.string().max(500).nullable().optional(),
  successCriterion: z.string().min(3).max(2000).optional(),
  failureCriterion: z.string().min(3).max(2000).optional(),
  deadline: z.string().datetime().nullable().optional(),
  priority: experimentPrioritySchema.optional(),
  status: experimentStatusSchema.optional(),
  result: z.string().max(4000).nullable().optional(),
  conclusion: z.string().max(4000).nullable().optional(),
});
export type PatchExperimentInput = z.infer<typeof patchExperimentSchema>;

export const recordExperimentResultSchema = z.object({
  outcome: z.enum(['SUCCESS', 'FAILURE', 'INCONCLUSIVE', 'PARTIAL']),
  notes: z.string().max(4000).optional(),
  /** Observed real-world numbers, e.g. { interviews: 15, paidPilots: 3 }. */
  metrics: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  /** Whether the underlying assumption is now validated/invalidated. */
  updateAssumption: z.boolean().default(true),
});
export type RecordExperimentResultInput = z.infer<typeof recordExperimentResultSchema>;

/* -------------------------------------------------------------------------- */
/* Challenge / export / competitors                                            */
/* -------------------------------------------------------------------------- */

export const challengeSchema = z.object({
  /** Optional free-text focus for the challenge run. */
  focus: z.string().max(2000).optional(),
});

export const exportRequestSchema = z.object({
  format: exportFormatSchema,
});

export const patchCompetitorSchema = z.object({
  classification: competitorClassificationSchema.optional(),
  company: z.string().min(1).max(300).optional(),
  positioning: z.string().max(4000).nullable().optional(),
  differentiation: z.string().max(4000).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
});

export const relevanceSchemaExport = relevanceSchema;
export const ideaInputTypeSchemaExport = ideaInputTypeSchema;

/* -------------------------------------------------------------------------- */
/* Common                                                                      */
/* -------------------------------------------------------------------------- */

export const idParamSchema = z.object({ id: z.string().uuid() });

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type PaginationInput = z.infer<typeof paginationSchema>;
