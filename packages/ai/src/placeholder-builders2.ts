import { ideaOf, list, sourcesOf, str, type Ctx, type StubBuilder } from './placeholder-context.js';

export const researchBuilders: Record<string, StubBuilder> = {
  agent_finding(ctx: Ctx) {
    const i = ideaOf(ctx);
    const section = str(ctx.section, 'RESEARCH');
    const sources = sourcesOf(ctx);
    const counter = Boolean(ctx.counterEvidence);
    const statements = sources.slice(0, 6).map((s) => ({
      statement: counter
        ? `${s.title} contains signal that weakens the ${section.toLowerCase()} thesis.`
        : `${s.title} supports the ${section.toLowerCase()} view of ${i.problem} for ${i.customer}.`,
      claimType: counter ? 'COUNTER_EVIDENCE' : 'FACT',
      confidence: 'LOW',
      sourceIndexes: [s.index],
      isCounterEvidence: counter,
    }));
    return {
      section,
      summary: sources.length
        ? `Placeholder synthesis for ${section}: ${sources.length} source(s) considered.`
        : `No usable sources were retrieved for ${section}; this gap is recorded explicitly.`,
      statements,
      unknowns: sources.length
        ? [`Willingness-to-pay for ${i.customer} remains unverified.`]
        : [`No evidence found for ${section}.`],
      evidenceGap: sources.length === 0,
    };
  },

  assumption_update_set(ctx: Ctx) {
    const sources = sourcesOf(ctx);
    const hasCounter = sources.some((s) => s.sourceType !== 'PRIMARY');
    const assumptions = list<Ctx>(ctx.assumptions);
    return {
      updates: assumptions.map((a, index) => {
        const category = str(a.category);
        let evidenceState = 'UNKNOWN';
        if (category === 'PRICING') evidenceState = 'UNKNOWN';
        else if (category === 'PROBLEM' && sources.length > 0) evidenceState = 'SUPPORTED';
        else if (hasCounter && (category === 'COMPETITION' || category === 'DEMAND'))
          evidenceState = 'MIXED';
        else if (sources.length > 0) evidenceState = 'WEAKLY_SUPPORTED';
        return {
          assumptionIndex: index,
          evidenceState,
          confidence: evidenceState === 'UNKNOWN' ? 'UNKNOWN' : 'LOW',
          rationale:
            evidenceState === 'UNKNOWN'
              ? 'No authoritative evidence retrieved; state preserved as UNKNOWN rather than assumed.'
              : 'Placeholder classification based on retrieved source tiers.',
          unknowns:
            evidenceState === 'UNKNOWN'
              ? 'Direct willingness-to-pay evidence is still required.'
              : null,
        };
      }),
    };
  },
};
