/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 */

import { loginRateLimiter, generalRateLimiter, passwordResetRateLimiter } from "../config/upstash.js";

/**
 * Get client identifier (IP address or email for login attempts)
 */
const getClientIdentifier = (req) => {
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    "unknown"
  );
};

/**
 * Login rate limiter middleware
 * Limits login attempts to prevent brute force attacks
 * Uses both IP and email for rate limiting
 */
export const loginRateLimit = async (req, res, next) => {
  try {
    const clientIp = getClientIdentifier(req);
    const email = req.body.email?.toLowerCase() || "unknown";
    
    // Rate limit by IP
    const ipKey = `login:ip:${clientIp}`;
    const ipResult = await loginRateLimiter.limit(ipKey);
    
    // Rate limit by email (to prevent distributed attacks on single account)
    const emailKey = `login:email:${email}`;
    const emailResult = await loginRateLimiter.limit(emailKey);

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", ipResult.limit);
    res.setHeader("X-RateLimit-Remaining", Math.min(ipResult.remaining, emailResult.remaining));
    res.setHeader("X-RateLimit-Reset", ipResult.reset);

    if (!ipResult.success || !emailResult.success) {
      const retryAfter = Math.ceil((ipResult.reset - Date.now()) / 1000);
      res.setHeader("Retry-After", retryAfter);
      
      return res.status(429).json({
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes.",
        retryAfter: retryAfter,
      });
    }

    next();
  } catch (error) {
    console.error("Login rate limit error:", error);
    // Don't block the request if rate limiting fails
    next();
  }
};

/**
 * Password reset rate limiter middleware
 */
export const passwordResetRateLimit = async (req, res, next) => {
  try {
    const clientIp = getClientIdentifier(req);
    const email = req.body.email?.toLowerCase() || "unknown";
    
    const ipKey = `reset:ip:${clientIp}`;
    const emailKey = `reset:email:${email}`;
    
    const ipResult = await passwordResetRateLimiter.limit(ipKey);
    const emailResult = await passwordResetRateLimiter.limit(emailKey);

    if (!ipResult.success || !emailResult.success) {
      const retryAfter = Math.ceil((ipResult.reset - Date.now()) / 1000);
      res.setHeader("Retry-After", retryAfter);
      
      return res.status(429).json({
        success: false,
        message: "Too many password reset attempts. Please try again later.",
        retryAfter: retryAfter,
      });
    }

    next();
  } catch (error) {
    console.error("Password reset rate limit error:", error);
    next();
  }
};

/**
 * General API rate limiter middleware
 */
export const generalRateLimit = async (req, res, next) => {
  try {
    const clientIp = getClientIdentifier(req);
    const limitKey = `general:${clientIp}`;
    
    const { success, limit, remaining, reset } = await generalRateLimiter.limit(limitKey);

    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", reset);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      res.setHeader("Retry-After", retryAfter);
      
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please slow down.",
        retryAfter: retryAfter,
      });
    }

    next();
  } catch (error) {
    console.error("General rate limit error:", error);
    next();
  }
};
