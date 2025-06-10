import redis from './redis';

const WINDOW_SECONDS = 24 * 60 * 60; // 24 hours

export async function checkRateLimit(id: string, limit: number) {
  const key = `rate_limit:${id}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  return count <= limit;
}

/**
 * Returns:
 *  - used:     how many times they've already hit the endpoint
 *  - remaining: limit - used (floored at 0)
 *  - resetAt:  absolute ISO timestamp when the window resets
 */

export async function getRateLimitStatus(id: string, limit: number) {
  const key = `rate_limit:${id}`;
  // current count (0 if unset)
  const used = Number((await redis.get(key)) || 0);
  // seconds until expiry (-1 if no expire)
  const ttl = await redis.ttl(key);
  // compute reset time
  const resetAt =
    ttl > 0
      ? new Date(Date.now() + ttl * 1000).toISOString()
      : new Date(Date.now() + WINDOW_SECONDS * 1000).toISOString();

  return {
    used,
    remaining: Math.max(limit - used, 0),
    resetAt,
  };
}
