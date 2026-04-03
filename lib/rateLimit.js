/**
 * Rate Limiting System
 * 
 * Uses in-memory storage for tracking request attempts by IP address.
 * Each endpoint can have different rate limits.
 * 
 * For production with multiple servers, use Redis instead.
 */

const requestAttempts = new Map();

/**
 * Get client IP from request
 * @param {Request} req - Next.js Request object
 * @returns {string} Client IP address
 */
export function getClientIP(req) {
  // Try to get from headers (order matters - some proxies might not set all)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, use the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to connection socket if available
  return "127.0.0.1";
}

/**
 * Rate limiter configuration
 */
const DEFAULT_CONFIG = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "Too many requests, please try again later",
};

/**
 * Store key format: `${ip}:${endpoint}`
 * Value: { count: number, resetTime: timestamp }
 */

/**
 * Check if request exceeds rate limit
 * @param {string} ip - Client IP address
 * @param {string} endpoint - API endpoint (e.g., "/api/auth/login")
 * @param {Object} config - Configuration object
 * @returns {Object} { allowed: boolean, remaining: number, resetTime: Date }
 */
export function checkRateLimit(ip, endpoint, config = DEFAULT_CONFIG) {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const { maxRequests, windowMs } = config;

  let record = requestAttempts.get(key);

  // Initialize or reset if window has expired
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + windowMs,
    };
    requestAttempts.set(key, record);
  }

  // Increment attempt counter
  record.count += 1;

  const allowed = record.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - record.count + 1);
  const resetTime = new Date(record.resetTime);

  return {
    allowed,
    remaining,
    resetTime,
    retryAfter: Math.ceil((record.resetTime - now) / 1000), // Seconds
  };
}

/**
 * Clear rate limit for an IP:endpoint combination
 * Useful for admin resets or whitelist management
 */
export function clearRateLimit(ip, endpoint) {
  const key = `${ip}:${endpoint}`;
  requestAttempts.delete(key);
}

/**
 * Clear all rate limit records
 * Useful for testing or system reset
 */
export function clearAllRateLimits() {
  requestAttempts.clear();
}

/**
 * Get current rate limit status for debugging
 */
export function getRateLimitStatus(ip, endpoint) {
  const key = `${ip}:${endpoint}`;
  const record = requestAttempts.get(key);

  if (!record) {
    return {
      key,
      count: 0,
      resetTime: null,
      status: "no_record",
    };
  }

  return {
    key,
    count: record.count,
    resetTime: new Date(record.resetTime),
    status: "active",
  };
}

/**
 * Cleanup expired records periodically
 * Call this periodically to prevent memory leaks
 */
export function cleanupExpiredRecords() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, record] of requestAttempts.entries()) {
    if (now > record.resetTime) {
      requestAttempts.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Start automatic cleanup of expired records every 5 minutes
 */
let cleanupInterval = null;

export function startCleanupScheduler() {
  if (cleanupInterval) return; // Already running

  cleanupInterval = setInterval(() => {
    const cleaned = cleanupExpiredRecords();
    if (cleaned > 0) {
      console.log(`[RateLimit] Cleaned up ${cleaned} expired records`);
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  console.log("[RateLimit] Cleanup scheduler started");
}

export function stopCleanupScheduler() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log("[RateLimit] Cleanup scheduler stopped");
  }
}

/**
 * Whitelist configuration for IP addresses that should bypass rate limiting
 */
const ipWhitelist = new Set();

export function addToWhitelist(ip) {
  ipWhitelist.add(ip);
}

export function removeFromWhitelist(ip) {
  ipWhitelist.delete(ip);
}

export function isWhitelisted(ip) {
  return ipWhitelist.has(ip);
}

export function getWhitelist() {
  return Array.from(ipWhitelist);
}

export function clearWhitelist() {
  ipWhitelist.clear();
}

/**
 * Main rate limit check function
 * Use this in your API route handlers
 */
export function createRateLimiter(endpoint, config = DEFAULT_CONFIG) {
  return function rateLimitMiddleware(req) {
    const ip = getClientIP(req);

    // Check whitelist
    if (isWhitelisted(ip)) {
      return {
        allowed: true,
        whitelisted: true,
      };
    }

    const result = checkRateLimit(ip, endpoint, config);

    return {
      ...result,
      ip,
      endpoint,
    };
  };
}

/**
 * Format rate limit response headers
 */
export function getRateLimitHeaders(rateLimitResult) {
  return {
    "X-RateLimit-Limit": (rateLimitResult.config?.maxRequests || 5).toString(),
    "X-RateLimit-Remaining": Math.max(0, rateLimitResult.remaining - 1).toString(),
    "X-RateLimit-Reset": rateLimitResult.resetTime.toISOString(),
    "Retry-After": rateLimitResult.retryAfter.toString(),
  };
}

// Initialize cleanup on module load
startCleanupScheduler();
