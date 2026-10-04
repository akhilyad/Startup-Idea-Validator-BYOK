/**
 * Minimal, dependency-free metrics registry (TPRD §71, §72).
 *
 * Counters and histograms are process-local. This is intentionally simple: it
 * exposes the standard `snapshot()` shape so it can be scraped by
 * `/metrics` or forwarded to OpenTelemetry/Sentry later without changing
 * call sites.
 */

interface Counter {
  type: 'counter';
  value: number;
}

interface Gauge {
  type: 'gauge';
  value: number;
}

interface Histogram {
  type: 'histogram';
  count: number;
  sum: number;
  min: number;
  max: number;
}

type Metric = Counter | Gauge | Histogram;

const registry = new Map<string, Metric>();

function key(name: string, labels?: Record<string, string | number>): string {
  if (!labels) return name;
  const parts = Object.keys(labels)
    .sort()
    .map((k) => `${k}=${labels[k]}`);
  return `${name}{${parts.join(',')}}`;
}

export function increment(
  name: string,
  labels?: Record<string, string | number>,
  amount = 1,
): void {
  const k = key(name, labels);
  const existing = registry.get(k);
  if (existing && existing.type === 'counter') existing.value += amount;
  else registry.set(k, { type: 'counter', value: amount });
}

export function gauge(name: string, value: number, labels?: Record<string, string | number>): void {
  registry.set(key(name, labels), { type: 'gauge', value });
}

export function observe(
  name: string,
  value: number,
  labels?: Record<string, string | number>,
): void {
  const k = key(name, labels);
  const existing = registry.get(k);
  if (existing && existing.type === 'histogram') {
    existing.count += 1;
    existing.sum += value;
    existing.min = Math.min(existing.min, value);
    existing.max = Math.max(existing.max, value);
  } else {
    registry.set(k, { type: 'histogram', count: 1, sum: value, min: value, max: value });
  }
}

export function time<T>(name: string, fn: () => T, labels?: Record<string, string | number>): T {
  const start = Date.now();
  try {
    return fn();
  } finally {
    observe(`${name}_ms`, Date.now() - start, labels);
  }
}

export async function timeAsync<T>(
  name: string,
  fn: () => Promise<T>,
  labels?: Record<string, string | number>,
): Promise<T> {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    observe(`${name}_ms`, Date.now() - start, labels);
  }
}

export function snapshot(): Record<string, Metric> {
  return Object.fromEntries(registry.entries());
}

export function resetMetrics(): void {
  registry.clear();
}
