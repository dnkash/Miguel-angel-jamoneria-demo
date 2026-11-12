import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

export interface RateLimitResult {
  success: boolean
  remaining: number
  limit: number
}

// Fallback en memoria para desarrollo local sin Upstash.
const memoryHits = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_REQUESTS = 10

function memoryLimit(identifier: string): RateLimitResult {
  const now = Date.now()
  const entry = memoryHits.get(identifier)
  if (!entry || entry.resetAt <= now) {
    memoryHits.set(identifier, { count: 1, resetAt: now + WINDOW_MS })
    return { success: true, remaining: MAX_REQUESTS - 1, limit: MAX_REQUESTS }
  }
  entry.count += 1
  return {
    success: entry.count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - entry.count),
    limit: MAX_REQUESTS,
  }
}

const upstash =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(MAX_REQUESTS, '1 m'),
        analytics: true,
        prefix: 'jamoneria:ratelimit',
      })
    : null

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  if (!upstash) return memoryLimit(identifier)
  try {
    const { success, remaining, limit } = await upstash.limit(identifier)
    return { success, remaining, limit }
  } catch (error) {
    console.error('[rate-limit] Upstash no disponible, usando fallback local:', error)
    return memoryLimit(identifier)
  }
}