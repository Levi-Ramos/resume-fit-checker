import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const TEXT_MODEL = google('gemini-3.5-flash-lite');

const requirementSchema = z.object({
  requirements: z
    .array(z.string())
    .describe(
      'Discrete, checkable requirements extracted from the job description — one concrete skill, technology, experience threshold, or responsibility per item, each a short sentence.',
    ),
});

export type JdRequirement = { id: string; text: string };

export async function parseJobDescription(jdText: string): Promise<JdRequirement[]> {
  const result = await generateText({
    model: TEXT_MODEL,
    output: Output.object({ schema: requirementSchema }),
    prompt: `Extract the discrete requirements and qualifications from this job description as a flat list of short, checkable statements. Split compound requirements into separate items.\n\nJob description:\n${jdText}`,
  });

  return result.output.requirements.map((text, i) => ({ id: `req-${i}`, text }));
}
