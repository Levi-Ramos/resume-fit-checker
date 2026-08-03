import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

const EXTRACTION_MODEL = google('gemini-3.5-flash-lite');

const EXTRACTION_PROMPT =
  'Extract the full text content of this resume PDF, verbatim. Format the output as ' +
  'blank-line-separated blocks: each role or section is a block, with a header line (job title, ' +
  'company, dates) followed by bullet points, each starting with "- ". Entries that are not a ' +
  'list of bullets (summary, contact info, a skills line) can stay as a single-line block. ' +
  'Output only the resume content itself — no commentary, no headings like "Extracted text:", no markdown.';

export async function extractResumeText(pdfBytes: Buffer): Promise<string> {
  const result = await generateText({
    model: EXTRACTION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: EXTRACTION_PROMPT },
          { type: 'file', mediaType: 'application/pdf', data: pdfBytes },
        ],
      },
    ],
  });

  return result.text.trim();
}
