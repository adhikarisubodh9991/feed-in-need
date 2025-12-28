/**
 * Upstash Redis Configuration for Rate Limiting
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client from environment variables
const redis = Redis.fromEnv();

// General API rate limiter (500 requests per minute - more realistic)
export const generalRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(500, "1 m"),
  prefix: "ratelimit:general",
});

// Login rate limiter (50 attempts per 15 minutes - more reasonable)
export const loginRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "15 m"),
  prefix: "ratelimit:login",
});

// Rate limiter for password reset (20 attempts per hour)
export const passwordResetRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  prefix: "ratelimit:password-reset",
});

export default redis;
