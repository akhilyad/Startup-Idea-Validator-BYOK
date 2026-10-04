import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

/** Correlation context propagated across async work (TPRD §70). */
export interface RequestContext {
  requestId: string;
  userId?: string;
  workspaceId?: string;
  analysisId?: string;
  taskId?: string;
  service?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function newRequestId(): string {
  return `req_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
}

export function runWithContext<T>(context: Partial<RequestContext>, fn: () => T): T {
  const current = storage.getStore();
  const merged: RequestContext = {
    requestId: context.requestId ?? current?.requestId ?? newRequestId(),
    ...current,
    ...context,
  };
  return storage.run(merged, fn);
}

export function getContext(): RequestContext | undefined {
  return storage.getStore();
}

export function getRequestId(): string {
  return storage.getStore()?.requestId ?? 'req_unknown';
}
