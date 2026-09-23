import { verifyWebhook } from '@clerk/nextjs/webhooks';
import type { NextRequest } from 'next/server';
import { deleteUserData } from '@/db/delete-user-data';

// Clerk dashboard → Webhooks → endpoint /api/webhooks/clerk, event user.deleted.
// Signing secret goes in CLERK_WEBHOOK_SIGNING_SECRET.
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error('clerk webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  if (evt.type === 'user.deleted' && evt.data.id) {
    // Throwing → 500 → Clerk retries, so a transient DB error doesn't orphan the data.
    await deleteUserData(evt.data.id);
  }

  return new Response('OK');
}
