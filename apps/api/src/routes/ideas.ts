import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { getLLMProvider, generateValidated } from '@sift/ai';
import { normalizedIdeaSchema } from '@sift/validation';
import { authenticateRequest } from '../auth.js';

const normalizeInputSchema = z.object({
  rawInput: z.string().min(5),
  inputType: z.enum(['TEXT', 'URL', 'REDDIT_URL', 'PASTE', 'VOICE']).default('TEXT'),
  sourceUrl: z.string().optional(),
});

export const ideaRoutes: FastifyPluginAsync = async (app) => {
  app.post('/normalize', async (req, reply) => {
    const auth = await authenticateRequest(req, reply);
    if (!auth) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const parse = normalizeInputSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Input must be at least 5 characters.', details: parse.error.flatten() },
      });
    }

    const { rawInput } = parse.data;
    const llm = getLLMProvider();

    try {
      const result = await generateValidated(llm, {
        schemaName: 'normalized_idea',
        schema: normalizedIdeaSchema,
        system:
          'You are Sift, an evidence-first startup opportunity decomposition engine. ' +
          'Decompose the raw business idea into a normalized customer, problem, and solution. ' +
          'Label unknown or unstated fields as null.',
        prompt: 'Decompose and normalize this raw idea.',
        context: {
          rawInput,
          idea: {
            customer: 'target customer',
            problem: rawInput.slice(0, 300),
            solution: 'proposed solution',
          },
          userAssumptions: [],
          constraints: [],
        },
      });

      return reply.send({
        normalized: result.output,
        synthetic: result.synthetic,
      });
    } catch (err) {
      // Heuristic fallback if LLM offline
      const words = rawInput.trim().split(/\s+/);
      const title = words.slice(0, 7).join(' ');
      return reply.send({
        normalized: {
          proposedCustomer: 'Identified target segment',
          problem: rawInput.length > 80 ? rawInput.slice(0, 150) + '...' : rawInput,
          proposedSolution: `A focused product solving: ${title}`,
          industry: 'Technology / B2B SaaS',
          geography: 'United States & Remote',
          businessModel: 'Subscription SaaS',
          pricing: 'Tiered monthly pricing',
          distribution: 'Inbound SEO, Direct outbound, Communities',
          technology: 'Web application, APIs, automated workflows',
        },
        synthetic: true,
      });
    }
  });
};
