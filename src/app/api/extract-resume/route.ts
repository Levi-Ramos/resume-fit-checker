import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { chunkResume } from '@/lib/chunk';
import { extractResumeText } from '@/lib/extract-resume';
import { friendlyErrorMessage } from '@/lib/gemini-errors';
import { MAX_RESUME_FILE_BYTES } from '@/lib/constants';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to upload a resume file.' }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file was uploaded.' }, { status: 400 });
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
  }
  if (file.size > MAX_RESUME_FILE_BYTES) {
    return NextResponse.json(
      { error: `File is too large — must be under ${MAX_RESUME_FILE_BYTES / (1024 * 1024)}MB.` },
      { status: 413 },
    );
  }

  try {
    const pdfBytes = Buffer.from(await file.arrayBuffer());
    const text = await extractResumeText(pdfBytes);

    const warning =
      chunkResume(text).length === 0
        ? "Couldn't find any text in that PDF — it may be a scanned image. You can still type or paste the resume text below."
        : undefined;

    return NextResponse.json({ text, warning });
  } catch (error) {
    console.error('resume extraction failed:', error);
    return NextResponse.json({ error: friendlyErrorMessage(error) }, { status: 502 });
  }
}
