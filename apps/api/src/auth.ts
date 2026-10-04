import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@sift/db';
import { env } from '@sift/config';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  workspaceId: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 3600 * 1000);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { token },
  });
}

export async function authenticateRequest(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<AuthContext | null> {
  // 1. Check cookies or authorization header
  const tokenFromCookie = req.cookies[env.SESSION_COOKIE_NAME];
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const token = tokenFromCookie || tokenFromHeader;

  if (token) {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            memberships: {
              include: { workspace: true },
            },
          },
        },
      },
    });

    if (session && session.expiresAt > new Date()) {
      const user = session.user;
      const membership = user.memberships[0];
      const workspaceId = membership ? membership.workspaceId : (user.memberships[0]?.workspaceId ?? '');
      const role = membership ? membership.role : 'OWNER';

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        workspaceId,
        role,
      };
    }
  }

  // 2. Dev mode fallback: automatically authenticate with demo user if no session token
  if (env.NODE_ENV !== 'production') {
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@sift.internal' },
      include: {
        memberships: {
          include: { workspace: true },
        },
      },
    });

    if (demoUser && demoUser.memberships.length > 0) {
      return {
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
        },
        workspaceId: demoUser.memberships[0]!.workspaceId,
        role: demoUser.memberships[0]!.role,
      };
    }
  }

  return null;
}
