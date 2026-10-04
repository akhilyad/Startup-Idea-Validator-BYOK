import { EventEmitter } from 'node:events';
import type { AnalysisStatus } from '@sift/types';

/**
 * In-process analysis event bus powering the SSE progress stream (TPRD §8.11).
 *
 * NOTE: this is process-local. When the API and worker run as separate
 * containers, replace this with a Redis pub/sub fan-out behind the same
 * functions — call sites do not change. See docs/research-engine.md.
 */
export interface AnalysisEvent {
  analysisId: string;
  type: 'status' | 'stage' | 'log' | 'error' | 'done';
  status?: AnalysisStatus;
  stage?: string;
  message?: string;
  data?: Record<string, unknown>;
  at: string;
}

const emitter = new EventEmitter();
emitter.setMaxListeners(0);

function channel(analysisId: string): string {
  return `analysis:${analysisId}`;
}

export function publishAnalysisEvent(event: AnalysisEvent): void {
  emitter.emit(channel(event.analysisId), event);
}

export function subscribeAnalysis(
  analysisId: string,
  listener: (event: AnalysisEvent) => void,
): () => void {
  const ch = channel(analysisId);
  emitter.on(ch, listener);
  return () => emitter.off(ch, listener);
}

export function analysisListenerCount(analysisId: string): number {
  return emitter.listenerCount(channel(analysisId));
}
