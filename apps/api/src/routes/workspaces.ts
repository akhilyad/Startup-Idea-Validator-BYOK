import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '@sift/db';
import { authenticateRequest } from '../auth.js';

const createWorkspaceSchema = z.object({
  name: z.string().min(1),
});

export const workspaceRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: auth.user.id },
      include: {
        workspace: {
          include: {
            subscription: true,
            _count: { select: { projects: true, analyses: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return reply.send({
      workspaces: memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        role: m.role,
        plan: m.workspace.subscription?.plan ?? 'FREE',
        projectCount: m.workspace._count.projects,
        analysisCount: m.workspace._count.analyses,
      })),
    });
  });

  app.post('/', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const parse = createWorkspaceSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Invalid name' } });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: parse.data.name,
        ownerId: auth.user.id,
        members: {
          create: {
            userId: auth.user.id,
            role: 'OWNER',
          },
        },
        subscription: {
          create: {
            provider: 'placeholder',
            plan: 'FREE',
            status: 'ACTIVE',
          },
        },
      },
    });

    return reply.status(201).send({ workspace });
  });

  app.get('/:id', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const { id } = req.params as { id: string };
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: { include: { user: true } },
        projects: {
          include: {
            ideas: {
              include: {
                currentVersion: {
                  include: { analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
                },
              },
            },
          },
        },
        subscription: true,
      },
    });

    if (!workspace) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Workspace not found' } });
    }

    return reply.send({ workspace });
  });
};
