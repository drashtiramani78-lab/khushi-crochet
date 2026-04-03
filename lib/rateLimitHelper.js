/**
 * Rate Limit API Helper
 * 
 * Provides easy-to-use wrappers for applying rate limiting to Next.js API routes
 */

import { NextResponse } from "next/server";
import {
  createRateLimiter,
  getRateLimitHeaders,
} from "./rateLimit";

/**
 * Preset configurations for common use cases
 */
export const RATE_LIMIT_PRESETS = {
  // Auth endpoints: 5 attempts per 15 minutes
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    message: "Too many login/register attempts. Please try again in 15 minutes.",
  },

  // Admin login: 5 attempts per 15 minutes
  ADMIN_LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    message: "Too many admin login attempts. Please try again in 15 minutes.",
  },

  // Contact form: 3 submissions per hour
  CONTACT: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    message: "Too many contact form submissions. Please try again later.",
  },

  // API calls: 100 per hour
  API: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000,
    message: "Rate limit exceeded. Please try again later.",
  },

  // Strict: 1 per minute (for sensitive operations)
  STRICT: {
    maxRequests: 1,
    windowMs: 60 * 1000,
    message: "Please wait before trying again.",
  },
};

/**
 * Check rate limit and return response if exceeded
 * 
 * Usage in API route:
 * ```
 * export async function POST(req) {
 *   const rateLimitResponse = checkAndLimitRequest(req, "/api/auth/login");
 *   if (rateLimitResponse) return rateLimitResponse;
 *   
 *   // Continue with handler logic
 * }
 * ```
 */
export function checkAndLimitRequest(
  req,
  endpoint,
  config = RATE_LIMIT_PRESETS.API
) {
  const limiter = createRateLimiter(endpoint, config);
  const result = limiter(req);

  // If whitelisted or allowed, return null (no rate limit response needed)
  if (result.whitelisted || result.allowed) {
    return null;
  }

  // Return 429 Too Many Requests response
  return NextResponse.json(
    {
      success: false,
      message: config.message,
      retryAfter: result.retryAfter,
      resetTime: result.resetTime,
    },
    {
      status: 429,
      headers: {
        "Retry-After": result.retryAfter.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": result.resetTime.toISOString(),
      },
    }
  );
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 * 
 * Usage:
 * ```
 * const handler = async (req) => { ... };
 * export const POST = withRateLimit(handler, "/api/auth/login", RATE_LIMIT_PRESETS.AUTH);
 * ```
 */
export function withRateLimit(handler, endpoint, config = RATE_LIMIT_PRESETS.API) {
  return async function rateLimitedHandler(req, context) {
    const rateLimitResponse = checkAndLimitRequest(req, endpoint, config);
    if (rateLimitResponse) return rateLimitResponse;

    return handler(req, context);
  };
}

/**
 * Enhanced rate limit response for "too many attempts" scenarios
 * Includes remaining attempts count
 */
export function createRateLimitResponse(
  rateLimitResult,
  customMessage = RATE_LIMIT_PRESETS.API.message
) {
  return NextResponse.json(
    {
      success: false,
      message: customMessage,
      remaining: Math.max(0, rateLimitResult.remaining - 1),
      retryAfter: rateLimitResult.retryAfter,
      resetTime: rateLimitResult.resetTime,
    },
    {
      status: 429,
      headers: getRateLimitHeaders(rateLimitResult),
    }
  );
}
