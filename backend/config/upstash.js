/**
 * Upstash Redis Configuration for Rate Limiting
 * Falls back to a mock limiter if Upstash credentials aren't configured
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash credentials are configured
const hasUpstashCredentials = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Create a mock rate limiter for when Upstash isn't configured
const createMockLimiter = () => ({
  limit: async () => ({
    success: true,
    limit: 1000,
    remaining: 999,
    reset: Date.now() + 60000,
  }),
});

let redis = null;
let generalRateLimiter;
let loginRateLimiter;
let passwordResetRateLimiter;

if (hasUpstashCredentials) {
  try {
    // Initialize Redis client from environment variables
    redis = Redis.fromEnv();

    // General API rate limiter (500 requests per minute - more realistic)
    generalRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(500, "1 m"),
      prefix: "ratelimit:general",
    });

    // Login rate limiter (50 attempts per 15 minutes - more reasonable)
    loginRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "15 m"),
      prefix: "ratelimit:login",
    });

    // Rate limiter for password reset (20 attempts per hour)
    passwordResetRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      prefix: "ratelimit:password-reset",
    });

    console.log("✅ Upstash Redis rate limiting enabled");
  } catch (error) {
    console.error("❌ Upstash Redis initialization failed:", error.message);
    console.log("⚠️ Rate limiting disabled - using mock limiter");
    generalRateLimiter = createMockLimiter();
    loginRateLimiter = createMockLimiter();
    passwordResetRateLimiter = createMockLimiter();
  }
} else {
  console.log("⚠️ Upstash credentials not found - rate limiting disabled");
  generalRateLimiter = createMockLimiter();
  loginRateLimiter = createMockLimiter();
  passwordResetRateLimiter = createMockLimiter();
}

export { generalRateLimiter, loginRateLimiter, passwordResetRateLimiter };
export default redis;
