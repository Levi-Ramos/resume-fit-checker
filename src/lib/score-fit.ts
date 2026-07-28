import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import type { JdRequirement } from './parse-jd';
import type { EmbeddedChunk } from './retrieval';
import { embedRequirementQueries, retrieveTopK } from './retrieval';

const TEXT_MODEL = google('gemini-3.5-flash-lite');
const TOP_K = 4;

const verdictSchema = z.object({
  results: z.array(
    z.object({
      requirementId: z.string(),
      verdict: z.enum(['match', 'partial', 'gap']),
      evidenceQuote: z
        .string()
        .nullable()
        .describe('Exact quote from that requirement\'s evidence, or null if none supports it.'),
      rationale: z.string().describe('One-sentence explanation grounded only in that requirement\'s evidence.'),
    }),
  ),
});

export type RequirementScore = {
  requirement: JdRequirement;
  verdict: 'match' | 'partial' | 'gap';
  evidenceQuote: string | null;
  rationale: string;
};

// One requirement-scoring generateText call regardless of requirement count —
// Gemini free tier caps generateContent at 15 requests/minute, so batching
// keeps a fit-check (JD parse + this) at 2 calls instead of N+1.
export async function scoreAllRequirements(
  requirements: JdRequirement[],
  embeddedChunks: EmbeddedChunk[],
): Promise<RequirementScore[]> {
  const requirementEmbeddings = await embedRequirementQueries(requirements.map((r) => r.text));

  const evidenceByRequirement = requirements.map((requirement, i) => {
    const retrieved = retrieveTopK(requirementEmbeddings[i], embeddedChunks, TOP_K);
    const evidenceBlock = retrieved
      .map(({ chunk }, j) => `[${j}] ${chunk.context ? `(${chunk.context}) ` : ''}${chunk.text}`)
      .join('\n');
    return { requirement, evidenceBlock };
  });

  const prompt = `You are assessing whether a candidate's resume evidence supports each of the following job requirements. Each requirement has its own retrieved evidence listed below it — only use that requirement's own evidence, never invent or assume anything not stated in it, and never borrow evidence from a different requirement's list.

Score each requirement as:
- "match": evidence clearly and directly supports the requirement
- "partial": evidence is related but doesn't fully cover the requirement (e.g. adjacent technology, unclear scope)
- "gap": no evidence supports the requirement (set evidenceQuote to null in this case)

${evidenceByRequirement
  .map(
    ({ requirement, evidenceBlock }) =>
      `Requirement ${requirement.id}: ${requirement.text}\nEvidence:\n${evidenceBlock || '(no evidence retrieved)'}`,
  )
  .join('\n\n')}

Return one result per requirement, matched by requirementId.`;

  const result = await generateText({
    model: TEXT_MODEL,
    output: Output.object({ schema: verdictSchema }),
    prompt,
  });

  const byId = new Map(result.output.results.map((r) => [r.requirementId, r]));

  return requirements.map((requirement) => {
    const scored = byId.get(requirement.id);
    return {
      requirement,
      verdict: scored?.verdict ?? 'gap',
      evidenceQuote: scored?.evidenceQuote ?? null,
      rationale: scored?.rationale ?? 'No verdict returned for this requirement.',
    };
  });
}
