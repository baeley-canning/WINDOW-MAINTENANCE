import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

export const limiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 m') }) : undefined

export async function rateLimit(key: string) {
  if (!limiter) return { success: true }
  return limiter.limit(key)
}

