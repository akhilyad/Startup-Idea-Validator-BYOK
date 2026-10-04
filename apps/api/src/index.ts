import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { env } from '@sift/config';
import { checkDatabase } from '@sift/db';
import { createLogger } from '@sift/observability';
import { authRoutes } from './routes/auth.js';
import { workspaceRoutes } from './routes/workspaces.js';
import { projectRoutes } from './routes/projects.js';
import { ideaRoutes } from './routes/ideas.js';
import { analysisRoutes } from './routes/analyses.js';
import { billingRoutes } from './routes/billing.js';

const logger = createLogger('api');

export async function buildApp() {
  const app = Fastify({
    logger: false,
    trustProxy: true,
  });

  // CORS configuration
  await app.register(cors, {
    origin: [env.WEB_BASE_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Cookie parsing
  await app.register(cookie, {
    secret: env.AUTH_SECRET,
    hook: 'onRequest',
  });

  // Health check
  app.get('/health', async () => {
    const dbOk = await checkDatabase();
    return {
      status: dbOk ? 'ok' : 'degraded',
      db: dbOk ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  });

  // Register API v1 modules
  await app.register(
    async (v1) => {
      await v1.register(authRoutes, { prefix: '/auth' });
      await v1.register(workspaceRoutes, { prefix: '/workspaces' });
      await v1.register(projectRoutes, { prefix: '/projects' });
      await v1.register(ideaRoutes, { prefix: '/ideas' });
      await v1.register(analysisRoutes, { prefix: '/analyses' });
      await v1.register(billingRoutes, { prefix: '/billing' });
    },
    { prefix: '/api/v1' },
  );

  // Global error handler
  app.setErrorHandler((error, req, reply) => {
    logger.error('request.error', {
      url: req.url,
      method: req.method,
      error: error.message,
    });

    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send({
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || 'An unexpected error occurred.',
        requestId: req.id,
      },
    });
  });

  return app;
}

export async function startServer() {
  const app = await buildApp();
  const port = env.API_PORT || 4000;
  const host = '0.0.0.0';

  try {
    await app.listen({ port, host });
    console.log(`🚀 Sift API running on http://localhost:${port}`);
    console.log(`📡 Health probe: http://localhost:${port}/health`);
  } catch (err) {
    logger.error('server.listen.failed', { error: String(err) });
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  startServer();
}
