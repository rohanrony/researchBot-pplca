import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { getRateLimitStatus } from '@/lib/redis/rateLimit';

export const GET = auth(async (req) => {
  const session = req.auth;
  const identifier = session?.user?.email
    ? `user:${session.user.email}`
    : `ip:${req.headers.get('x-forwarded-for') ?? 'unknown'}`;

  const limit = session ? 100 : 3;
  const status = await getRateLimitStatus(identifier, limit);

  return NextResponse.json(status);
});
