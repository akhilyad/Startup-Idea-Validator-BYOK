import { generateValidated } from '@sift/ai';
import { queryPlanSchema } from '@sift/validation';
import type { QueryClass } from '@sift/types';
import type { AgentDefinition } from '../agents/definitions.js';
import { publishAnalysisEvent } from '../events.js';
import type { RetrievedDocument } from '../search/types.js';
import type { ResearchState } from './context.js';
import { completeTask, ensureTask, failTask, logEvent, startTask, upsertSource } from './persist.js';
import type { PipelineDeps } from './types.js';
import { extractAgentFindings } from './agent-extract.js';

export interface AcceptedSource {
  index: number;
  doc: RetrievedDocument;
  publisher: string | null;
  title: string | null;
  isCounter: boolean;
}

export interface AgentRunResult {
  sources: number;
  claims: number;
  tokenCost: number;
  retrieved: RetrievedDocument[];
  accepted: AcceptedSource[];
}

const MAX_QUERIES_PER_AGENT = 3;
const MAX_RESULTS_PER_QUERY = 3;

/** Counter-evidence research must include negative/failure queries (TPRD §44). */
function enforceQueryClasses(agent: AgentDefinition, classes: QueryClass[]): QueryClass[] {
  const required: QueryClass[] = [...classes];
  if (agent.counterEvidence) {
    for (const c of ['NEGATIVE', 'FAILURE'] as QueryClass[]) {
      if (!required.includes(c)) required.push(c);
    }
  }
  return required;
}

export async function runResearchAgent(
  deps: PipelineDeps,
  state: ResearchState,
  agent: AgentDefinition,
): Promise<AgentRunResult> {
  const { llm, search, logger } = deps;
  const result: AgentRunResult = { sources: 0, claims: 0, tokenCost: 0, retrieved: [], accepted: [] };

  const task = await ensureTask(deps, state.runId, agent.taskType, {
    section: agent.section,
    queryClasses: agent.queryClasses,
  });
  await startTask(deps, task.id);

  publishAnalysisEvent({
    analysisId: state.analysisId,
    type: 'stage',
    stage: agent.taskType,
    message: `${agent.name} running`,
    at: state.clock().toISOString(),
  });

  try {
    const plan = await generateValidated(llm, {
      schemaName: 'query_plan',
      schema: queryPlanSchema,
      system: 'You generate diverse, high-signal research queries, including negative and failure queries.',
      prompt: `Generate research queries for the "${agent.section}" investigation.`,
      context: { idea: state.baseIdea, focus: state.focus, section: agent.section },
    });
    result.tokenCost += plan.usage.costUsd;

    const allowed = enforceQueryClasses(agent, agent.queryClasses);
    const queries = plan.output.queries
      .filter((q) => allowed.includes(q.class))
      .slice(0, MAX_QUERIES_PER_AGENT);

    for (const query of queries) {
      await logEvent(deps, {
        analysisId: state.analysisId,
        runId: state.runId,
        agent: agent.name,
        eventType: 'QUERY_ISSUED',
        query: query.text,
        payload: { queryClass: query.class, rationale: query.rationale },
      });

      const results = await search.search({
        text: query.text,
        queryClass: query.class,
        maxResults: MAX_RESULTS_PER_QUERY,
      });

      for (const r of results.slice(0, MAX_RESULTS_PER_QUERY)) {
        const doc = await search.retrieve(r.url);
        const { source, created } = await upsertSource(deps, { doc, result: r });
        await logEvent(deps, {
          analysisId: state.analysisId,
          runId: state.runId,
          agent: agent.name,
          eventType: 'SOURCE_DISCOVERED',
          query: query.text,
          sourceId: source.id,
          decision: created ? 'ACCEPTED' : 'DEDUPLICATED',
          reason: created
            ? undefined
            : 'Equivalent source already catalogued (canonical URL or content hash match).',
          payload: { url: doc.canonicalUrl, tier: source.tier, accessibility: doc.accessibilityStatus },
        });

        if (doc.accessibilityStatus === 'ACCESS_UNAVAILABLE' || doc.content.length === 0) {
          await logEvent(deps, {
            analysisId: state.analysisId,
            runId: state.runId,
            agent: agent.name,
            eventType: 'SOURCE_UNAVAILABLE',
            sourceId: source.id,
            decision: 'REJECTED',
            reason: 'Source could not be retrieved; content is not inferred.',
          });
          continue;
        }

        result.retrieved.push(doc);
        result.accepted.push({
          index: result.retrieved.length - 1,
          doc,
          publisher: doc.publisher,
          title: doc.title,
          isCounter: agent.counterEvidence,
        });
      }
    }

    result.sources = result.accepted.length;
    const extraction = await extractAgentFindings(deps, state, agent, result.accepted);
    result.claims = extraction.claims;
    result.tokenCost += extraction.tokenCost;

    await completeTask(deps, task.id, {
      sources: result.sources,
      claims: result.claims,
    });
    return result;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    logger.warn('agent.failed', { agent: agent.name, reason });
    await failTask(deps, task.id, reason);
    throw error;
  }
}
