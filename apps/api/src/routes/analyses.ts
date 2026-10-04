import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '@sift/db';
import { env } from '@sift/config';
import { getLLMProvider } from '@sift/ai';
import { createLogger } from '@sift/observability';
import {
  getSearchProvider,
  runAnalysisPipeline,
  publishAnalysisEvent,
  subscribeAnalysis,
  type AnalysisEvent,
} from '@sift/research';
import { authenticateRequest } from '../auth.js';

const logger = createLogger('api.analyses');

const createAnalysisSchema = z.object({
  rawInput: z.string().min(5),
  inputType: z.enum(['TEXT', 'URL', 'REDDIT_URL', 'PASTE', 'VOICE']).default('TEXT'),
  sourceUrl: z.string().optional(),
  projectName: z.string().optional(),
  projectId: z.string().optional(),
  normalizedCustomer: z.string().optional(),
  normalizedProblem: z.string().optional(),
  normalizedSolution: z.string().optional(),
  industry: z.string().optional(),
  geography: z.string().optional(),
  businessModel: z.string().optional(),
  pricing: z.string().optional(),
  distribution: z.string().optional(),
  technology: z.string().optional(),
  requestedDepth: z.enum(['QUICK', 'STANDARD', 'DEEP']).default('STANDARD'),
  assumptions: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
});

export const analysisRoutes: FastifyPluginAsync = async (app) => {
  // 1. List analyses
  app.get('/', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const { workspaceId: queryWorkspaceId } = req.query as { workspaceId?: string };
    const workspaceId = queryWorkspaceId || auth.workspaceId;

    const analyses = await prisma.analysis.findMany({
      where: { workspaceId },
      include: {
        ideaVersion: {
          include: {
            idea: {
              include: { project: true },
            },
          },
        },
        reports: {
          orderBy: { version: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            assumptions: true,
            claims: true,
            competitors: true,
            experiments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      analyses: analyses.map((a) => ({
        id: a.id,
        status: a.status,
        qualityStatus: a.qualityStatus,
        requestedDepth: a.requestedDepth,
        createdAt: a.createdAt,
        completedAt: a.completedAt,
        failureReason: a.failureReason,
        projectName: a.ideaVersion.idea.project.name,
        projectId: a.ideaVersion.idea.project.id,
        rawInput: a.ideaVersion.rawInput,
        title: a.ideaVersion.normalizedProblem
          ? a.ideaVersion.normalizedProblem.slice(0, 80)
          : a.ideaVersion.rawInput.slice(0, 80),
        customer: a.ideaVersion.normalizedCustomer,
        problem: a.ideaVersion.normalizedProblem,
        solution: a.ideaVersion.normalizedSolution,
        versionNumber: a.ideaVersion.versionNumber,
        stats: a._count,
        hasReport: a.reports.length > 0,
      })),
    });
  });

  // 2. Create and start analysis
  app.post('/', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const parse = createAnalysisSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid analysis input', details: parse.error.flatten() },
      });
    }

    const data = parse.data;
    const workspaceId = auth.workspaceId;

    // Check Entitlement / Free limit (PRD §48, TPRD §57)
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { subscription: true },
    });

    const isSubscribed = workspace?.subscription?.status === 'ACTIVE' && workspace.subscription.plan !== 'FREE';

    if (!isSubscribed) {
      const usageCount = await prisma.usageEvent.count({
        where: {
          workspaceId,
          eventType: 'ANALYSIS_COMPLETED',
        },
      });

      if (usageCount >= env.FREE_ANALYSES_PER_ACCOUNT) {
        return reply.status(402).send({
          error: {
            code: 'USAGE_LIMIT_EXCEEDED',
            message: `You have reached the free allocation of ${env.FREE_ANALYSES_PER_ACCOUNT} analyses. Please upgrade your plan to continue research.`,
            details: { usageCount, maxFree: env.FREE_ANALYSES_PER_ACCOUNT },
          },
        });
      }
    }

    // Resolve or create Project
    let project = data.projectId
      ? await prisma.project.findUnique({ where: { id: data.projectId } })
      : null;

    if (!project) {
      const defaultName = data.projectName || (data.normalizedSolution ? data.normalizedSolution.slice(0, 35) : data.rawInput.slice(0, 35));
      project = await prisma.project.create({
        data: {
          name: defaultName,
          workspaceId,
        },
      });
    }

    // Create Idea
    const idea = await prisma.idea.create({
      data: {
        projectId: project.id,
      },
    });

    // Create IdeaVersion
    const ideaVersion = await prisma.ideaVersion.create({
      data: {
        ideaId: idea.id,
        versionNumber: 1,
        rawInput: data.rawInput,
        inputType: data.inputType,
        sourceUrl: data.sourceUrl,
        normalizedCustomer: data.normalizedCustomer,
        normalizedProblem: data.normalizedProblem,
        normalizedSolution: data.normalizedSolution,
        industry: data.industry,
        geography: data.geography,
        businessModel: data.businessModel,
        pricing: data.pricing,
        distribution: data.distribution,
        technology: data.technology,
        assumptionsJson: JSON.stringify(data.assumptions || []),
        constraintsJson: JSON.stringify(data.constraints || []),
      },
    });

    await prisma.idea.update({
      where: { id: idea.id },
      data: { currentVersionId: ideaVersion.id },
    });

    // Create Analysis
    const analysis = await prisma.analysis.create({
      data: {
        ideaVersionId: ideaVersion.id,
        workspaceId,
        status: 'CREATED',
        requestedDepth: data.requestedDepth,
      },
    });

    // Create ResearchRun
    const run = await prisma.researchRun.create({
      data: {
        analysisId: analysis.id,
        runType: 'INITIAL',
        status: 'QUEUED',
      },
    });

    // Asynchronously trigger pipeline
    const pipelineDeps = {
      prisma,
      llm: getLLMProvider(),
      search: getSearchProvider(),
      logger,
    };

    setImmediate(async () => {
      try {
        await runAnalysisPipeline(pipelineDeps, {
          analysisId: analysis.id,
          runId: run.id,
          runType: 'INITIAL',
        });

        // Record usage event upon successful execution
        await prisma.usageEvent.create({
          data: {
            workspaceId,
            userId: auth.user.id,
            analysisId: analysis.id,
            eventType: 'ANALYSIS_COMPLETED',
            quantity: 1,
          },
        });
      } catch (pipelineErr) {
        logger.error('analysis.pipeline.error', {
          analysisId: analysis.id,
          error: pipelineErr instanceof Error ? pipelineErr.message : String(pipelineErr),
        });
      }
    });

    return reply.status(201).send({
      analysisId: analysis.id,
      runId: run.id,
      projectId: project.id,
      status: 'CREATED',
    });
  });

  // 3. Get analysis details
  app.get('/:id', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const { id } = req.params as { id: string };
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        ideaVersion: {
          include: {
            idea: {
              include: {
                project: true,
                versions: { orderBy: { versionNumber: 'desc' } },
              },
            },
          },
        },
        assumptions: {
          orderBy: [{ criticality: 'asc' }, { createdAt: 'asc' }],
          include: {
            experiments: true,
          },
        },
        claims: {
          include: {
            evidence: {
              include: { source: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        competitors: {
          orderBy: { classification: 'asc' },
        },
        experiments: {
          include: { assumption: true },
          orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        },
        reports: {
          orderBy: { version: 'desc' },
          take: 1,
        },
        researchRuns: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        logEntries: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
      },
    });

    if (!analysis) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Analysis not found' } });
    }

    // Parse thesis JSON if report exists
    let thesis = null;
    if (analysis.reports[0]?.thesisJson) {
      try {
        thesis = JSON.parse(analysis.reports[0].thesisJson);
      } catch {
        thesis = null;
      }
    }

    return reply.send({
      analysis: {
        id: analysis.id,
        status: analysis.status,
        qualityStatus: analysis.qualityStatus,
        requestedDepth: analysis.requestedDepth,
        cancelRequested: analysis.cancelRequested,
        createdAt: analysis.createdAt,
        completedAt: analysis.completedAt,
        failureReason: analysis.failureReason,
        ideaVersion: analysis.ideaVersion,
        project: analysis.ideaVersion.idea.project,
        ideaVersions: analysis.ideaVersion.idea.versions,
        assumptions: analysis.assumptions,
        claims: analysis.claims,
        competitors: analysis.competitors,
        experiments: analysis.experiments,
        thesis,
        report: analysis.reports[0] ?? null,
        runs: analysis.researchRuns,
        logEntries: analysis.logEntries,
      },
    });
  });

  // 4. Cancel analysis
  app.post('/:id/cancel', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const { id } = req.params as { id: string };
    await prisma.analysis.update({
      where: { id },
      data: { cancelRequested: true },
    });

    publishAnalysisEvent({
      analysisId: id,
      type: 'status',
      status: 'CANCELLED',
      message: 'Cancellation requested by user',
      at: new Date().toISOString(),
    });

    return reply.send({ success: true, message: 'Cancellation requested' });
  });

  // 5. Challenge the Idea (PRD §4, §35, TPRD §45)
  app.post('/:id/challenge', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const { id } = req.params as { id: string };
    const { focus } = (req.body || {}) as { focus?: string };

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: { ideaVersion: true },
    });

    if (!analysis) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Analysis not found' } });
    }

    const challengeRun = await prisma.researchRun.create({
      data: {
        analysisId: analysis.id,
        runType: 'CHALLENGE',
        status: 'QUEUED',
      },
    });

    const pipelineDeps = {
      prisma,
      llm: getLLMProvider(),
      search: getSearchProvider(),
      logger,
    };

    setImmediate(async () => {
      try {
        await runAnalysisPipeline(pipelineDeps, {
          analysisId: analysis.id,
          runId: challengeRun.id,
          runType: 'CHALLENGE',
          focus,
        });
      } catch (err) {
        logger.error('challenge.run.failed', {
          analysisId: analysis.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });

    return reply.send({
      success: true,
      message: 'Challenge the Idea run initiated',
      runId: challengeRun.id,
    });
  });

  // 6. Create New Version of Idea (PRD §36)
  app.post('/:id/new-version', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const { id } = req.params as { id: string };
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: { ideaVersion: { include: { idea: true } } },
    });

    if (!analysis) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Analysis not found' } });
    }

    const currentVersion = analysis.ideaVersion;
    const body = (req.body || {}) as Partial<{
      normalizedProblem: string;
      normalizedCustomer: string;
      normalizedSolution: string;
      businessModel: string;
      pricing: string;
      distribution: string;
      technology: string;
      assumptions: string[];
      constraints: string[];
    }>;

    const count = await prisma.ideaVersion.count({ where: { ideaId: currentVersion.ideaId } });

    const newVersion = await prisma.ideaVersion.create({
      data: {
        ideaId: currentVersion.ideaId,
        versionNumber: count + 1,
        rawInput: currentVersion.rawInput,
        inputType: currentVersion.inputType,
        sourceUrl: currentVersion.sourceUrl,
        normalizedCustomer: body.normalizedCustomer ?? currentVersion.normalizedCustomer,
        normalizedProblem: body.normalizedProblem ?? currentVersion.normalizedProblem,
        normalizedSolution: body.normalizedSolution ?? currentVersion.normalizedSolution,
        industry: currentVersion.industry,
        geography: currentVersion.geography,
        businessModel: body.businessModel ?? currentVersion.businessModel,
        pricing: body.pricing ?? currentVersion.pricing,
        distribution: body.distribution ?? currentVersion.distribution,
        technology: body.technology ?? currentVersion.technology,
        assumptionsJson: body.assumptions ? JSON.stringify(body.assumptions) : currentVersion.assumptionsJson,
        constraintsJson: body.constraints ? JSON.stringify(body.constraints) : currentVersion.constraintsJson,
      },
    });

    await prisma.idea.update({
      where: { id: currentVersion.ideaId },
      data: { currentVersionId: newVersion.id },
    });

    const newAnalysis = await prisma.analysis.create({
      data: {
        ideaVersionId: newVersion.id,
        workspaceId: analysis.workspaceId,
        status: 'CREATED',
        requestedDepth: analysis.requestedDepth,
      },
    });

    const run = await prisma.researchRun.create({
      data: {
        analysisId: newAnalysis.id,
        runType: 'INITIAL',
        status: 'QUEUED',
      },
    });

    const pipelineDeps = {
      prisma,
      llm: getLLMProvider(),
      search: getSearchProvider(),
      logger,
    };

    setImmediate(async () => {
      try {
        await runAnalysisPipeline(pipelineDeps, {
          analysisId: newAnalysis.id,
          runId: run.id,
          runType: 'INITIAL',
        });
      } catch (err) {
        logger.error('new_version.pipeline.failed', {
          analysisId: newAnalysis.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });

    return reply.status(201).send({
      analysisId: newAnalysis.id,
      versionNumber: newVersion.versionNumber,
      runId: run.id,
    });
  });

  // 7. Update assumption
  app.patch('/:id/assumptions/:assumptionId', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const { assumptionId } = req.params as { assumptionId: string };
    const body = req.body as {
      statement?: string;
      criticality?: string;
      status?: string;
      unknowns?: string;
    };

    const updated = await prisma.assumption.update({
      where: { id: assumptionId },
      data: {
        statement: body.statement,
        criticality: body.criticality,
        status: body.status,
        unknowns: body.unknowns,
      },
    });

    return reply.send({ assumption: updated });
  });

  // 8. Create experiment
  app.post('/:id/experiments', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const { id } = req.params as { id: string };
    const body = req.body as {
      assumptionId?: string;
      name: string;
      hypothesis: string;
      method: string;
      targetParticipants?: string;
      successCriterion: string;
      failureCriterion: string;
      priority?: string;
    };

    const experiment = await prisma.experiment.create({
      data: {
        analysisId: id,
        assumptionId: body.assumptionId || null,
        name: body.name,
        hypothesis: body.hypothesis,
        method: body.method,
        targetParticipants: body.targetParticipants || '15-20 target prospects',
        successCriterion: body.successCriterion,
        failureCriterion: body.failureCriterion,
        priority: body.priority || 'HIGH',
        status: 'PROPOSED',
      },
    });

    return reply.status(201).send({ experiment });
  });

  // 9. Record experiment result (North Star Metric PRD §65!)
  app.post('/:id/experiments/:experimentId/results', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const { experimentId } = req.params as { experimentId: string };
    const body = req.body as {
      result: string;
      conclusion: 'VALIDATED' | 'CONTRADICTED' | 'INCONCLUSIVE';
    };

    const exp = await prisma.experiment.update({
      where: { id: experimentId },
      data: {
        result: body.result,
        conclusion: body.conclusion,
        status: 'COMPLETE',
      },
    });

    // Update linked assumption evidence state if applicable!
    if (exp.assumptionId) {
      const newState =
        body.conclusion === 'VALIDATED'
          ? 'SUPPORTED'
          : body.conclusion === 'CONTRADICTED'
          ? 'CONTRADICTED'
          : 'MIXED';

      await prisma.assumption.update({
        where: { id: exp.assumptionId },
        data: {
          evidenceState: newState,
          status: body.conclusion === 'VALIDATED' ? 'VALIDATED' : 'OPEN',
        },
      });
    }

    return reply.send({ experiment: exp, message: 'Result recorded and thesis assumption updated.' });
  });

  // 10. Export report as Markdown
  app.get('/:id/export', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const { id } = req.params as { id: string };
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        ideaVersion: { include: { idea: { include: { project: true } } } },
        assumptions: true,
        claims: { include: { evidence: { include: { source: true } } } },
        competitors: true,
        experiments: true,
        reports: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!analysis) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Analysis not found' } });
    }

    let thesis: Record<string, any> = {};
    if (analysis.reports[0]?.thesisJson) {
      try {
        thesis = JSON.parse(analysis.reports[0].thesisJson);
      } catch {}
    }

    const md = [
      `# SIFT Opportunity & Validation Report`,
      `**Project:** ${analysis.ideaVersion.idea.project.name}`,
      `**Generated:** ${analysis.completedAt?.toISOString() || new Date().toISOString()}`,
      `**Status:** ${analysis.status} | **Quality Gate:** ${analysis.qualityStatus}`,
      ``,
      `---`,
      `## Executive Summary`,
      `${thesis.opportunity || analysis.ideaVersion.rawInput}`,
      ``,
      `### Customer & Problem Definition`,
      `- **Target Customer:** ${analysis.ideaVersion.normalizedCustomer || 'Unspecified'}`,
      `- **Problem:** ${analysis.ideaVersion.normalizedProblem || 'Unspecified'}`,
      `- **Proposed Solution:** ${analysis.ideaVersion.normalizedSolution || 'Unspecified'}`,
      `- **Business Model:** ${analysis.ideaVersion.businessModel || 'Unspecified'}`,
      ``,
      `---`,
      `## Falsifiable Business Thesis`,
      `> "${thesis.decisionOutput || 'Proceed with disciplined experimentation on critical assumptions.'}"`,
      ``,
      `### Critical Assumptions (${analysis.assumptions.length})`,
      ...analysis.assumptions.map(
        (a) =>
          `- **[${a.criticality}]** ${a.statement}\n  - *Evidence State:* ${a.evidenceState}\n  - *Unknowns:* ${a.unknowns || 'None recorded'}\n  - *Recommended Experiment:* ${a.requiredExperiment || 'Interview target users'}`,
      ),
      ``,
      `---`,
      `## Competitive Intelligence (${analysis.competitors.length})`,
      ...analysis.competitors.map(
        (c) =>
          `### ${c.company} (${c.classification})\n- **Product:** ${c.product || 'N/A'}\n- **Pricing:** ${c.pricing || 'Unknown'}\n- **Strengths:** ${c.strengths || 'N/A'}\n- **Complaints / Vulnerabilities:** ${c.complaints || 'None listed'}`,
      ),
      ``,
      `---`,
      `## Validation Experiments (${analysis.experiments.length})`,
      ...analysis.experiments.map(
        (e) =>
          `### ${e.name} [Priority: ${e.priority}]\n- **Hypothesis:** ${e.hypothesis}\n- **Method:** ${e.method}\n- **Success Criterion:** ${e.successCriterion}\n- **Failure Criterion:** ${e.failureCriterion}\n- **Status:** ${e.status} ${e.conclusion ? `(${e.conclusion})` : ''}`,
      ),
      ``,
      `---`,
      `*Generated by Sift — Know what to prove before you build.*`,
    ].join('\n');

    reply.header('Content-Type', 'text/markdown');
    reply.header('Content-Disposition', `attachment; filename="sift-report-${id}.md"`);
    return reply.send(md);
  });

  // 11. Server-Sent Events stream for realtime progress
  app.get('/:id/events', async (req, reply) => {
    const { id } = req.params as { id: string };

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');

    reply.raw.write(
      `data: ${JSON.stringify({
        type: 'connect',
        analysisId: id,
        message: 'Connected to live research stream',
        at: new Date().toISOString(),
      })}\n\n`,
    );

    const unsubscribe = subscribeAnalysis(id, (event: AnalysisEvent) => {
      try {
        reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
      } catch (err) {
        unsubscribe();
      }
    });

    req.raw.on('close', () => {
      unsubscribe();
    });
  });
};
