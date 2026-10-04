import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '@sift/db';
import { env } from '@sift/config';
import {
  authenticateRequest,
  createSession,
  deleteSession,
  hashPassword,
  verifyPassword,
} from '../auth.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', async (req, reply) => {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid registration inputs.',
          details: parse.error.flatten(),
        },
      });
    }

    const { email, password, name } = parse.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({
        error: {
          code: 'USER_EXISTS',
          message: 'An account with this email already exists.',
        },
      });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? email.split('@')[0],
        emailVerifiedAt: new Date(),
      },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name || 'Personal'}'s Workspace`,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
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

    const token = await createSession(user.id);
    reply.setCookie(env.SESSION_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.SESSION_TTL_HOURS * 3600,
    });

    return reply.status(201).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        role: 'OWNER',
      },
      token,
    });
  });

  app.post('/login', async (req, reply) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password required.',
        },
      });
    }

    const { email, password } = parse.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: { workspace: true },
        },
      },
    });

    if (!user || !user.passwordHash) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    const token = await createSession(user.id);
    reply.setCookie(env.SESSION_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.SESSION_TTL_HOURS * 3600,
    });

    const membership = user.memberships[0];

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      workspace: membership
        ? {
            id: membership.workspaceId,
            name: membership.workspace.name,
            role: membership.role,
          }
        : null,
      token,
    });
  });

  app.post('/logout', async (req, reply) => {
    const token = req.cookies[env.SESSION_COOKIE_NAME];
    if (token) {
      await deleteSession(token);
    }
    reply.clearCookie(env.SESSION_COOKIE_NAME, { path: '/' });
    return reply.send({ success: true });
  });

  app.get('/me', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      include: {
        memberships: {
          include: {
            workspace: {
              include: { subscription: true },
            },
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({
        error: { code: 'USER_NOT_FOUND', message: 'User not found.' },
      });
    }

    const activeWorkspace = user.memberships.find((m) => m.workspaceId === auth.workspaceId) ?? user.memberships[0];

    // Compute remaining free analyses (PRD §48: 2 analyses per account lifetime)
    const usageCount = await prisma.usageEvent.count({
      where: {
        workspaceId: activeWorkspace?.workspaceId,
        eventType: 'ANALYSIS_COMPLETED',
      },
    });

    const isSubscribed = activeWorkspace?.workspace.subscription?.status === 'ACTIVE' && activeWorkspace.workspace.subscription.plan !== 'FREE';
    const freeRemaining = Math.max(0, env.FREE_ANALYSES_PER_ACCOUNT - usageCount);

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      workspace: activeWorkspace
        ? {
            id: activeWorkspace.workspaceId,
            name: activeWorkspace.workspace.name,
            role: activeWorkspace.role,
            plan: activeWorkspace.workspace.subscription?.plan ?? 'FREE',
          }
        : null,
      entitlements: {
        freeRemaining,
        isSubscribed,
        usageCount,
        maxFree: env.FREE_ANALYSES_PER_ACCOUNT,
      },
    });
  });
};
