import {
  ideaOf,
  list,
  nullableStr,
  sourcesOf,
  str,
  type Ctx,
  type StubBuilder,
} from './placeholder-context.js';
import { assumptionTemplates, queryTemplates } from './placeholder-templates.js';

export const coreBuilders: Record<string, StubBuilder> = {
  normalized_idea(ctx: Ctx) {
    const i = ideaOf(ctx);
    return {
      proposedCustomer: i.customer,
      problem: i.problem,
      proposedSolution: i.solution,
      industry: i.industry,
      geography: i.geography,
      businessModel: i.businessModel,
      pricing: i.pricing,
      distribution: i.distribution,
      technology: i.technology,
      userAssumptions: list<string>(ctx.userAssumptions),
      constraints: list<string>(ctx.constraints),
      unresolved: [
        ...(i.geography ? [] : ['Target geography was not stated and remains unconfirmed.']),
        ...(i.pricing ? [] : ['Pricing was not stated; willingness-to-pay is unresolved.']),
      ],
    };
  },

  assumption_set(ctx: Ctx) {
    const i = ideaOf(ctx);
    return {
      assumptions: assumptionTemplates.map((t) => ({
        category: t.category,
        statement: t.statement(i),
        criticality: t.criticality,
        confidence: 'LOW',
        requiredExperiment: t.experiment,
        unknowns:
          t.category === 'PRICING'
            ? 'No direct evidence of willingness-to-pay at the proposed price has been gathered yet.'
            : null,
      })),
    };
  },

  query_plan(ctx: Ctx) {
    const i = ideaOf(ctx);
    const focus = nullableStr(ctx.focus);
    return {
      queries: queryTemplates.map((t) => ({
        class: t.cls,
        text: focus ? `${t.text(i)} ${focus}`.trim() : t.text(i),
        rationale: t.rationale,
      })),
    };
  },

  claim_set(ctx: Ctx) {
    const i = ideaOf(ctx);
    const retrieved = list<Ctx>(ctx.retrieved);
    return {
      claims: retrieved.slice(0, 12).flatMap((r, idx) => {
        const index = typeof r.index === 'number' ? r.index : idx;
        const title = str(r.title, `Source ${index + 1}`);
        const counter = Boolean(r.isCounter);
        return [
          {
            statement: counter
              ? `${title} reports friction, complaints or failed attempts relevant to ${i.solution}.`
              : `${title} provides signal relevant to ${i.problem} for ${i.customer}.`,
            claimType: counter ? 'COUNTER_EVIDENCE' : 'FACT',
            confidence: counter ? 'MEDIUM' : 'LOW',
            sourceIndex: index,
            excerpt: str(r.excerpt, str(r.content, '').slice(0, 240)),
            evidenceType: counter ? 'COUNTER' : 'SUPPORTING',
            relevance: 'MEDIUM',
            geography: nullableStr(r.geography) ?? i.geography,
            population: nullableStr(r.population) ?? i.customer,
            timePeriod: null,
            notes: counter
              ? 'Counter-evidence recorded; weakens but does not by itself falsify the assumption.'
              : 'Evidence does not establish willingness to pay.',
            supportedBySource: true,
          },
        ];
      }),
    };
  },

  contradiction_set(ctx: Ctx) {
    const i = ideaOf(ctx);
    const sources = sourcesOf(ctx);
    const counter = sources.filter((s) => s.sourceType !== 'PRIMARY').slice(0, 3);
    return {
      contradictions: counter.map((s, idx) => ({
        conclusion: `There is demand for "${i.solution}".`,
        contradictingStatement: `${s.title} suggests adoption or retention is weaker than the thesis assumes.`,
        severity: idx === 0 ? 'HIGH' : 'MEDIUM',
        affectedAssumptionIndex: 3,
        sourceIndex: s.index,
        excerpt: s.snippet,
        resolution: 'Resolve through a paid pilot rather than further desk research.',
      })),
    };
  },

  competitor_set(ctx: Ctx) {
    const i = ideaOf(ctx);
    const sources = sourcesOf(ctx);
    const names = Array.from(
      new Set(sources.map((s) => s.publisher).filter((p): p is string => Boolean(p))),
    ).slice(0, 5);
    return {
      competitors: names.map((name, idx) => ({
        company: name,
        product: `${name} offering`,
        classification:
          idx === 0 ? 'DIRECT' : idx === 1 ? 'INDIRECT' : idx === 2 ? 'SUBSTITUTE' : 'NON_CONSUMPTION',
        targetCustomer: i.customer,
        geography: i.geography,
        pricing: idx === 0 ? 'Pricing published; see source.' : null,
        businessModel: i.businessModel,
        distribution: i.distribution,
        funding: null,
        tractionEvidence: `${name} appears in retrieved research results.`,
        strengths: 'Existing distribution and product surface.',
        weaknesses: 'Unverified fit for the specific segment.',
        complaints: idx === 0 ? 'Recurring complaints referenced in retrieved sources.' : null,
        positioning: `${name} positions against the same problem space.`,
        differentiation: 'Unverified — differentiation must be tested, not asserted.',
        sourceIndexes: [0],
      })),
    };
  },
};
