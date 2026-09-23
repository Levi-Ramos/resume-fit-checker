// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { deleteUserData } from '@/db/delete-user-data';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@clerk/nextjs/webhooks', () => ({ verifyWebhook: vi.fn() }));
vi.mock('@/db/delete-user-data', () => ({ deleteUserData: vi.fn() }));

const req = () => new NextRequest('http://localhost/api/webhooks/clerk', { method: 'POST' });

describe('POST /api/webhooks/clerk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects unverified requests without deleting anything', async () => {
    vi.mocked(verifyWebhook).mockRejectedValue(new Error('bad signature'));
    const res = await POST(req());
    expect(res.status).toBe(400);
    expect(deleteUserData).not.toHaveBeenCalled();
  });

  it('deletes the user data on user.deleted', async () => {
    vi.mocked(verifyWebhook).mockResolvedValue({ type: 'user.deleted', data: { id: 'user_123' } } as never);
    const res = await POST(req());
    expect(res.status).toBe(200);
    expect(deleteUserData).toHaveBeenCalledWith('user_123');
  });

  it('ignores other events', async () => {
    vi.mocked(verifyWebhook).mockResolvedValue({ type: 'user.created', data: { id: 'user_123' } } as never);
    await POST(req());
    expect(deleteUserData).not.toHaveBeenCalled();
  });
});
