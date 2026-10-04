import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../apps/api/src/index.js';
import { prisma } from '@sift/db';
import type { FastifyInstance } from 'fastify';

describe('Sift Full-Stack SaaS Integration Suite', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('Health Check: returns ok and database connected', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
    expect(body.db).toBe('connected');
  });

  it('Auth: logs in with demo credentials and returns session token & workspace', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'demo@sift.internal',
        password: 'demopassword123',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.user.email).toBe('demo@sift.internal');
    expect(body.workspace).toBeDefined();
    expect(body.token).toBeDefined();
  });

  it('Idea Normalization: decomposes raw text into structured opportunity model (PRD §9)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/ideas/normalize',
      payload: {
        rawInput: 'AI inventory management and supplier ordering for independent restaurants.',
        inputType: 'TEXT',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.normalized).toBeDefined();
    expect(body.normalized.problem).toBeDefined();
    expect(body.normalized.proposedCustomer).toBeDefined();
    expect(body.normalized.proposedSolution).toBeDefined();
  });

  it('Analyses List: retrieves seeded demo project with assumptions, claims, and experiments', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/analyses',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body.analyses)).toBe(true);
    expect(body.analyses.length).toBeGreaterThan(0);

    const demo = body.analyses.find((a: any) => a.projectName === 'AI Recruiting Agent') || body.analyses[0];
    expect(demo).toBeDefined();
    expect(demo.stats.assumptions).toBeGreaterThan(0);
    expect(demo.stats.experiments).toBeGreaterThan(0);
  });

  it('Analysis Detail: retrieves full opportunity report, thesis, competitors, and sources', async () => {
    const listRes = await app.inject({ method: 'GET', url: '/api/v1/analyses' });
    const analysisId = JSON.parse(listRes.body).analyses[0].id;

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/analyses/${analysisId}`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const detail = body.analysis;

    expect(detail.id).toBe(analysisId);
    expect(detail.assumptions.length).toBeGreaterThan(0);
    expect(detail.claims.length).toBeGreaterThan(0);
    expect(detail.competitors.length).toBeGreaterThan(0);
    expect(detail.experiments.length).toBeGreaterThan(0);
    expect(detail.thesis).toBeDefined();
  });

  it('North Star Loop: recording an experiment result updates the experiment and linked assumption (PRD §65)', async () => {
    const listRes = await app.inject({ method: 'GET', url: '/api/v1/analyses' });
    const analysisId = JSON.parse(listRes.body).analyses[0].id;

    // Get an experiment
    const detailRes = await app.inject({ method: 'GET', url: `/api/v1/analyses/${analysisId}` });
    const experiment = JSON.parse(detailRes.body).analysis.experiments[0];
    expect(experiment).toBeDefined();

    // Record result
    const resultRes = await app.inject({
      method: 'POST',
      url: `/api/v1/analyses/${analysisId}/experiments/${experiment.id}/results`,
      payload: {
        result: 'Tested concierge MVP with 15 users; 12 approved preview drafts and 4 signed paid pre-orders.',
        conclusion: 'VALIDATED',
      },
    });

    expect(resultRes.statusCode).toBe(200);
    const resBody = JSON.parse(resultRes.body);
    expect(resBody.experiment.status).toBe('COMPLETE');
    expect(resBody.experiment.conclusion).toBe('VALIDATED');

    // Verify linked assumption was updated
    if (experiment.assumptionId) {
      const updatedAssumption = await prisma.assumption.findUnique({
        where: { id: experiment.assumptionId },
      });
      expect(updatedAssumption?.evidenceState).toBe('SUPPORTED');
    }
  });

  it('Export: generates Markdown report with citations (PRD §73, TPRD §83)', async () => {
    const listRes = await app.inject({ method: 'GET', url: '/api/v1/analyses' });
    const analysisId = JSON.parse(listRes.body).analyses[0].id;

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/analyses/${analysisId}/export`,
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/markdown');
    expect(res.body).toContain('# SIFT Opportunity & Validation Report');
    expect(res.body).toContain('Critical Assumptions');
  });

  it('Billing: checks usage ledger and supports instant plan upgrades (PRD §48, §50)', async () => {
    const usageRes = await app.inject({
      method: 'GET',
      url: '/api/v1/billing/usage',
    });
    expect(usageRes.statusCode).toBe(200);
    const usage = JSON.parse(usageRes.body);
    expect(usage.maxFree).toBe(2);

    const upgradeRes = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/checkout',
      payload: { plan: 'PRO' },
    });
    expect(upgradeRes.statusCode).toBe(200);
    expect(JSON.parse(upgradeRes.body).plan).toBe('PRO');
  });
});
