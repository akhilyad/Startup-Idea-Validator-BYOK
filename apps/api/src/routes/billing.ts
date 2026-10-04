import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '@sift/db';
import { env } from '@sift/config';
import { authenticateRequest } from '../auth.js';

const checkoutSchema = z.object({
  plan: z.enum(['ONE_TIME', 'PRO', 'TEAM']),
});

export const billingRoutes: FastifyPluginAsync = async (app) => {
  app.get('/usage', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: auth.workspaceId },
      include: { subscription: true },
    });

    const usageCount = await prisma.usageEvent.count({
      where: {
        workspaceId: auth.workspaceId,
        eventType: 'ANALYSIS_COMPLETED',
      },
    });

    const plan = workspace?.subscription?.plan ?? 'FREE';
    const isSubscribed = workspace?.subscription?.status === 'ACTIVE' && plan !== 'FREE';
    const freeRemaining = Math.max(0, env.FREE_ANALYSES_PER_ACCOUNT - usageCount);

    return reply.send({
      plan,
      isSubscribed,
      usageCount,
      maxFree: env.FREE_ANALYSES_PER_ACCOUNT,
      freeRemaining,
      features: {
        challengeMode: true,
        experiments: true,
        sourceProvenance: true,
        unlimitedAnalyses: isSubscribed,
      },
    });
  });

  app.post('/checkout', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const parse = checkoutSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Invalid plan' } });
    }

    const { plan } = parse.data;

    // In local / development mode (or placeholder billing provider), upgrade instantly
    const sub = await prisma.subscription.upsert({
      where: { workspaceId: auth.workspaceId },
      update: {
        plan,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
      create: {
        workspaceId: auth.workspaceId,
        provider: 'placeholder',
        plan,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });

    return reply.send({
      success: true,
      plan: sub.plan,
      message: `Upgraded to ${plan} plan! You now have unrestricted analysis access.`,
    });
  });
};
