/**
 * Rate Limit Testing Utility
 * 
 * Use this to test rate limiting in development
 * 
 * Usage: node scripts/test-rate-limit.js
 */

import fetch from "node-fetch";

const BASE_URL = process.env.API_URL || "http://localhost:3000";

/**
 * Make multiple requests to test rate limiting
 */
async function testRateLimit(endpoint, requestCount = 10, delayMs = 100) {
  console.log(`\n📋 Testing Rate Limit on ${endpoint}`);
  console.log(`   Requests: ${requestCount}, Delay: ${delayMs}ms\n`);

  const results = [];

  for (let i = 1; i <= requestCount; i++) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "WrongPassword123!",
        }),
      });

      const data = await response.json();
      const isRateLimited = response.status === 429;

      const result = {
        request: i,
        status: response.status,
        rateLimited: isRateLimited,
        message: data.message || "No message",
        retryAfter: response.headers.get("Retry-After"),
        timestamp: new Date().toLocaleTimeString(),
      };

      results.push(result);

      // Print result
      const icon = isRateLimited ? "🚫" : "✅";
      const statusColor = isRateLimited ? "\x1b[31m" : "\x1b[32m";
      const resetColor = "\x1b[0m";

      console.log(
        `${icon} Request ${i}: ${statusColor}${response.status}${resetColor} - ${result.message}`
      );

      if (isRateLimited) {
        console.log(
          `   ⏱️  Retry after ${result.retryAfter} seconds (${result.timestamp})`
        );
      }

      // Delay between requests
      if (i < requestCount) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`❌ Request ${i} failed:`, error.message);
      results.push({
        request: i,
        error: error.message,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  }

  // Summary
  console.log("\n📊 Summary:");
  const rateLimitedCount = results.filter((r) => r.rateLimited).length;
  console.log(`   Total Requests: ${results.length}`);
  console.log(`   Rate Limited: ${rateLimitedCount}`);
  console.log(`   Allowed: ${results.length - rateLimitedCount}`);

  return results;
}

/**
 * Test all auth endpoints
 */
async function testAllAuthEndpoints() {
  console.log("🔐 Testing All Auth Endpoints\n");
  console.log("=" .repeat(50));

  const endpoints = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/admin-login",
  ];

  for (const endpoint of endpoints) {
    await testRateLimit(endpoint, 7, 200);
    console.log("\n" + "=".repeat(50));
  }

  console.log("\n✅ Rate limit testing complete!");
}

/**
 * Test with different request intervals
 */
async function testWithIntervals() {
  console.log("📊 Testing Different Request Intervals\n");

  const intervals = [0, 100, 500, 1000];

  for (const interval of intervals) {
    console.log(`\nTesting with ${interval}ms delay:`);
    console.log("-".repeat(40));
    await testRateLimit("/api/auth/login", 6, interval);
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "all";

  console.log("🔍 Rate Limit Testing Utility\n");

  switch (command) {
    case "login":
      await testRateLimit("/api/auth/login", 7);
      break;

    case "register":
      await testRateLimit("/api/auth/register", 7);
      break;

    case "admin":
      await testRateLimit("/api/admin-login", 7);
      break;

    case "intervals":
      await testWithIntervals();
      break;

    case "all":
      await testAllAuthEndpoints();
      break;

    default:
      console.log("Usage: node scripts/test-rate-limit.js [command]");
      console.log("\nAvailable commands:");
      console.log("  all       - Test all auth endpoints (default)");
      console.log("  login     - Test /api/auth/login");
      console.log("  register  - Test /api/auth/register");
      console.log("  admin     - Test /api/admin-login");
      console.log("  intervals - Test with different request intervals");
  }
}

// Run if executed directly
main().catch(console.error);
