/* Context helpers shared by the placeholder provider's stub builders. */

export type Ctx = Record<string, unknown>;

export function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

export function nullableStr(value: unknown): string | null {
  const s = str(value);
  return s.length > 0 ? s : null;
}

export function list<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export interface IdeaContext {
  customer: string;
  problem: string;
  solution: string;
  industry: string | null;
  geography: string | null;
  businessModel: string | null;
  pricing: string | null;
  distribution: string | null;
  technology: string | null;
}

export function ideaOf(ctx: Ctx): IdeaContext {
  const idea = (ctx.idea ?? {}) as Ctx;
  return {
    customer: str(idea.customer, 'the target customer'),
    problem: str(idea.problem, 'the stated problem'),
    solution: str(idea.solution, 'the proposed solution'),
    industry: nullableStr(idea.industry),
    geography: nullableStr(idea.geography),
    businessModel: nullableStr(idea.businessModel),
    pricing: nullableStr(idea.pricing),
    distribution: nullableStr(idea.distribution),
    technology: nullableStr(idea.technology),
  };
}

export interface SourceContext {
  index: number;
  title: string;
  publisher: string | null;
  publishedAt: string | null;
  geography: string | null;
  population: string | null;
  url: string;
  tier: string;
  sourceType: string;
  snippet: string;
}

export function sourcesOf(ctx: Ctx): SourceContext[] {
  return list<Ctx>(ctx.sources).map((s, i) => ({
    index: typeof s.index === 'number' ? s.index : i,
    title: str(s.title, `Source ${i + 1}`),
    publisher: nullableStr(s.publisher),
    publishedAt: nullableStr(s.publishedAt),
    geography: nullableStr(s.geography),
    population: nullableStr(s.population),
    url: str(s.url, `https://example.invalid/sift/synthetic/${i + 1}`),
    tier: str(s.tier, 'TIER_4_LOW_CONFIDENCE'),
    sourceType: str(s.sourceType, 'LOW_CONFIDENCE'),
    snippet: str(s.snippet, ''),
  }));
}

export type StubBuilder = (ctx: Ctx) => unknown;
