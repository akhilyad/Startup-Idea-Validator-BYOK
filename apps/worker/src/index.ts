import { env } from '@sift/config';
import { prisma, checkDatabase } from '@sift/db';
import { getLLMProvider } from '@sift/ai';
import { createLogger } from '@sift/observability';
import { getSearchProvider, runAnalysisPipeline } from '@sift/research';

const logger = createLogger('worker');

export async function startWorker() {
  console.log('👷 Sift Research Worker starting up...');
  const dbOk = await checkDatabase();
  console.log(`Database connected: ${dbOk}`);
  console.log(`Queue Driver: ${env.QUEUE_DRIVER}`);

  const deps = {
    prisma,
    llm: getLLMProvider(),
    search: getSearchProvider(),
    logger,
  };

  // Background polling loop for QUEUED research runs (for standalone worker deployment)
  const pollIntervalMs = 5000;
  setInterval(async () => {
    try {
      const queuedRun = await prisma.researchRun.findFirst({
        where: { status: 'QUEUED' },
        orderBy: { createdAt: 'asc' },
      });

      if (queuedRun) {
        logger.info('worker.picked_up_run', { runId: queuedRun.id, analysisId: queuedRun.analysisId });
        await runAnalysisPipeline(deps, {
          analysisId: queuedRun.analysisId,
          runId: queuedRun.id,
          runType: queuedRun.runType as any,
        });
      }
    } catch (err) {
      logger.error('worker.poll.error', { error: String(err) });
    }
  }, pollIntervalMs);

  console.log(`📡 Sift Research Worker active (polling queue every ${pollIntervalMs / 1000}s)`);
}

if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  startWorker();
}
