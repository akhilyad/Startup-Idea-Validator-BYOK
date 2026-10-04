import type { QueryClass, ResearchTaskType, ReportSection } from '@sift/types';

/**
 * Agent contract (TPRD §36, §37). Agents are bounded software modules with a
 * declared purpose, query classes and (implicitly) an input/output schema —
 * the schemas live in `@sift/validation`.
 */
export interface AgentDefinition {
  name: string;
  purpose: string;
  taskType: ResearchTaskType;
  /** Report section this agent contributes to. */
  section: ReportSection;
  /** Query classes this agent is allowed to issue (TPRD §44). */
  queryClasses: QueryClass[];
  /** Counter-evidence agents must include negative/failure queries. */
  counterEvidence: boolean;
  /** Token budget ceiling for the agent, enforced by the orchestrator. */
  tokenBudget: number;
  /** Milliseconds before the agent is considered failed. */
  timeoutMs: number;
  maxRetries: number;
}

export const RESEARCH_AGENTS: AgentDefinition[] = [
  {
    name: 'ProblemResearcher',
    purpose: 'Find evidence that the target customer experiences the stated problem.',
    taskType: 'PROBLEM_RESEARCH',
    section: 'PROBLEM',
    queryClasses: ['PROBLEM', 'COMMUNITY', 'CUSTOMER'],
    counterEvidence: false,
    tokenBudget: 20000,
    timeoutMs: 60000,
    maxRetries: 2,
  },
  {
    name: 'CustomerResearcher',
    purpose: 'Identify segments, buyer, user and economic buyer.',
    taskType: 'CUSTOMER_RESEARCH',
    section: 'CUSTOMERS',
    queryClasses: ['CUSTOMER', 'COMMUNITY'],
    counterEvidence: false,
    tokenBudget: 20000,
    timeoutMs: 60000,
    maxRetries: 2,
  },
  {
    name: 'CompetitorResearcher',
    purpose: 'Map direct, indirect, substitute, non-consumption and failed competitors.',
    taskType: 'COMPETITOR_RESEARCH',
    section: 'COMPETITION',
    queryClasses: ['DIRECT', 'ALTERNATIVE', 'FAILURE'],
    counterEvidence: false,
    tokenBudget: 30000,
    timeoutMs: 75000,
    maxRetries: 2,
  },
  {
    name: 'MarketResearcher',
    purpose: 'Establish market size, structure, growth and demand signals.',
    taskType: 'MARKET_RESEARCH',
    section: 'MARKET',
    queryClasses: ['DIRECT', 'CUSTOMER'],
    counterEvidence: false,
    tokenBudget: 25000,
    timeoutMs: 75000,
    maxRetries: 2,
  },
  {
    name: 'PricingResearcher',
    purpose: 'Establish competitor pricing, price models and willingness-to-pay proxies.',
    taskType: 'PRICING_RESEARCH',
    section: 'ECONOMICS',
    queryClasses: ['PRICING', 'ALTERNATIVE'],
    counterEvidence: false,
    tokenBudget: 20000,
    timeoutMs: 60000,
    maxRetries: 2,
  },
  {
    name: 'TechnologyResearcher',
    purpose: 'Assess technical feasibility, required infrastructure and limitations.',
    taskType: 'TECHNOLOGY_RESEARCH',
    section: 'TECHNOLOGY',
    queryClasses: ['DIRECT', 'PROBLEM'],
    counterEvidence: false,
    tokenBudget: 20000,
    timeoutMs: 60000,
    maxRetries: 2,
  },
  {
    name: 'RegulationResearcher',
    purpose: 'Identify applicable laws, licences and compliance constraints.',
    taskType: 'REGULATION_RESEARCH',
    section: 'REGULATION',
    queryClasses: ['DIRECT', 'FAILURE'],
    counterEvidence: false,
    tokenBudget: 20000,
    timeoutMs: 60000,
    maxRetries: 2,
  },
  {
    name: 'EconomicsResearcher',
    purpose: 'Model revenue, gross margin, CAC and payback; label unknowns.',
    taskType: 'ECONOMICS_RESEARCH',
    section: 'ECONOMICS',
    queryClasses: ['PRICING', 'DIRECT'],
    counterEvidence: false,
    tokenBudget: 20000,
    timeoutMs: 60000,
    maxRetries: 2,
  },
  {
    name: 'GTMResearcher',
    purpose: 'Identify acquisition channels, distribution constraints and the first wedge.',
    taskType: 'GTM_RESEARCH',
    section: 'GTM',
    queryClasses: ['CUSTOMER', 'COMMUNITY', 'ALTERNATIVE'],
    counterEvidence: false,
    tokenBudget: 20000,
    timeoutMs: 60000,
    maxRetries: 2,
  },
  {
    name: 'DefensibilityResearcher',
    purpose: 'Assess network effects, data moats, switching costs and structural moats.',
    taskType: 'DEFENSIBILITY_RESEARCH',
    section: 'DEFENSIBILITY',
    queryClasses: ['DIRECT', 'FAILURE'],
    counterEvidence: false,
    tokenBudget: 20000,
    timeoutMs: 60000,
    maxRetries: 2,
  },
  {
    name: 'CounterEvidenceResearcher',
    purpose: 'Find credible evidence that could invalidate the current thesis.',
    taskType: 'COUNTER_EVIDENCE',
    section: 'COUNTER_EVIDENCE',
    queryClasses: ['NEGATIVE', 'FAILURE', 'PRICING'],
    counterEvidence: true,
    tokenBudget: 30000,
    timeoutMs: 90000,
    maxRetries: 3,
  },
  {
    name: 'SynthesisAgent',
    purpose: 'Produce the final falsifiable thesis from gathered evidence.',
    taskType: 'SYNTHESIS',
    section: 'OVERVIEW',
    queryClasses: [],
    counterEvidence: false,
    tokenBudget: 40000,
    timeoutMs: 90000,
    maxRetries: 2,
  },
  {
    name: 'QualityAgent',
    purpose: 'Detect unsupported claims, citation gaps and coverage problems.',
    taskType: 'QUALITY_CHECK',
    section: 'OVERVIEW',
    queryClasses: [],
    counterEvidence: false,
    tokenBudget: 20000,
    timeoutMs: 60000,
    maxRetries: 2,
  },
];

export const RESEARCH_AGENT_TASK_TYPES: ResearchTaskType[] = RESEARCH_AGENTS.filter(
  (a) => a.counterEvidence === false && a.taskType.endsWith('_RESEARCH'),
).map((a) => a.taskType);

export function getAgentByTaskType(taskType: ResearchTaskType): AgentDefinition | undefined {
  return RESEARCH_AGENTS.find((a) => a.taskType === taskType);
}
