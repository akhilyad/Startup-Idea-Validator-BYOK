import type { IdeaContext } from './placeholder-context.js';

export const assumptionTemplates: Array<{
  category: string;
  statement: (i: IdeaContext) => string;
  criticality: string;
  experiment: string;
}> = [
  {
    category: 'PROBLEM',
    statement: (i) => `${i.customer} experience "${i.problem}" frequently and severely enough to change behaviour.`,
    criticality: 'CRITICAL',
    experiment: 'Interview 15 qualified customers; quantify frequency, severity and current workaround cost.',
  },
  {
    category: 'CUSTOMER',
    statement: (i) => `"${i.customer}" is a reachable, well-defined segment with an identifiable economic buyer.`,
    criticality: 'HIGH',
    experiment: 'Map 30 target accounts and confirm who signs off on spend.',
  },
  {
    category: 'DEMAND',
    statement: (i) => `Demand for "${i.solution}" exists beyond early adopters.`,
    criticality: 'HIGH',
    experiment: 'Measure inbound interest (waitlist / demo requests) against a realistic baseline.',
  },
  {
    category: 'PRICING',
    statement: (i) => `${i.customer} will pay the proposed price for "${i.solution}".`,
    criticality: 'CRITICAL',
    experiment: 'Offer a paid pilot at the proposed price to 15 qualified prospects.',
  },
  {
    category: 'COMPETITION',
    statement: (i) => `Existing alternatives to "${i.solution}" are insufficient for ${i.customer}.`,
    criticality: 'HIGH',
    experiment: 'Run switch-interviews with 10 customers currently using an alternative.',
  },
  {
    category: 'SOLUTION',
    statement: (i) => `"${i.solution}" solves the problem in a form ${i.customer} will actually adopt.`,
    criticality: 'HIGH',
    experiment: 'Test a concierge/manual version of the workflow with 5 customers.',
  },
  {
    category: 'BUSINESS_MODEL',
    statement: (i) => `The business model (${i.businessModel ?? 'to be determined'}) can produce viable unit economics.`,
    criticality: 'HIGH',
    experiment: 'Model CAC, gross margin and payback using observed pilot economics.',
  },
  {
    category: 'DISTRIBUTION',
    statement: (i) => `A first distribution wedge to reach ${i.customer} exists and is affordable.`,
    criticality: 'MEDIUM',
    experiment: 'Run one paid acquisition or community experiment; record cost per qualified lead.',
  },
  {
    category: 'TECHNOLOGY',
    statement: (i) => `The technology required for "${i.solution}" is feasible to build, operate and support.`,
    criticality: 'MEDIUM',
    experiment: 'Build a scoped technical spike for the riskiest component and measure feasibility.',
  },
  {
    category: 'REGULATION',
    statement: (i) => `Regulation in ${i.geography ?? 'the target geography'} does not block "${i.solution}".`,
    criticality: 'MEDIUM',
    experiment: 'Obtain a written legal/regulatory opinion for the target jurisdiction.',
  },
  {
    category: 'DEFENSIBILITY',
    statement: () => 'There is structural defensibility beyond feature differentiation.',
    criticality: 'MEDIUM',
    experiment: 'Test whether usage compounds into proprietary data or workflow lock-in.',
  },
  {
    category: 'TIMING',
    statement: (i) => `Now is a reasonable time to build "${i.solution}".`,
    criticality: 'LOW',
    experiment: 'Track enabling shifts (technology, regulation, behaviour) over one quarter.',
  },
];

export const queryTemplates: Array<{
  cls: string;
  text: (i: IdeaContext) => string;
  rationale: string;
}> = [
  { cls: 'DIRECT', text: (i) => `${i.solution} ${i.industry ?? ''}`.trim(), rationale: 'Locate the direct product landscape.' },
  { cls: 'PROBLEM', text: (i) => `${i.customer} problems ${i.problem}`, rationale: 'Find first-hand problem evidence.' },
  { cls: 'NEGATIVE', text: (i) => `${i.solution} complaints problems`, rationale: 'Surface negative signal early.' },
  { cls: 'FAILURE', text: (i) => `${i.solution} startup failed shut down`, rationale: 'Learn why previous attempts failed.' },
  { cls: 'PRICING', text: (i) => `${i.solution} pricing per month cost`, rationale: 'Establish the price range alternatives charge.' },
  { cls: 'ALTERNATIVE', text: (i) => `${i.customer} ${i.problem} workaround spreadsheet manual`, rationale: 'Identify substitutes and non-consumption.' },
  { cls: 'CUSTOMER', text: (i) => `${i.customer} ${i.geography ?? ''}`.trim(), rationale: 'Define and size the customer segment.' },
  { cls: 'COMMUNITY', text: (i) => `${i.customer} forum reddit community ${i.problem}`, rationale: 'Find community vocabulary and objections.' },
];
