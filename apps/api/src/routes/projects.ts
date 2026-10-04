import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '@sift/db';
import { authenticateRequest } from '../auth.js';

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  workspaceId: z.string().optional(),
});

export const projectRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const { workspaceId: queryWorkspaceId } = req.query as { workspaceId?: string };
    const workspaceId = queryWorkspaceId || auth.workspaceId;

    const projects = await prisma.project.findMany({
      where: { workspaceId },
      include: {
        ideas: {
          include: {
            currentVersion: {
              include: {
                analyses: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                  select: {
                    id: true,
                    status: true,
                    qualityStatus: true,
                    createdAt: true,
                    completedAt: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return reply.send({ projects });
  });

  app.post('/', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const parse = createProjectSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Invalid project data' } });
    }

    const workspaceId = parse.data.workspaceId || auth.workspaceId;

    const project = await prisma.project.create({
      data: {
        name: parse.data.name,
        description: parse.data.description,
        workspaceId,
      },
    });

    return reply.status(201).send({ project });
  });

  app.get('/:id', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const { id } = req.params as { id: string };
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        ideas: {
          include: {
            versions: {
              orderBy: { versionNumber: 'desc' },
              include: {
                analyses: {
                  orderBy: { createdAt: 'desc' },
                  include: {
                    reports: { orderBy: { version: 'desc' }, take: 1 },
                    _count: { select: { assumptions: true, competitors: true, experiments: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    return reply.send({ project });
  });
};
