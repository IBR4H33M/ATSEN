import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import dotenv from "dotenv";

dotenv.config();

// Only create ratelimit if Upstash environment variables are available
let ratelimit = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(100, "10 s"), // 100 requests every 10 seconds
      analytics: true,
    });
    console.log("✅ Rate limiting configured: 100 requests per 10 seconds");
    console.log("   Note: Connection will be tested on first request");
  } catch (error) {
    console.log("⚠️ Rate limiting initialization failed:", error.message);
    console.log("   Continuing without rate limiting...");
  }
} else {
  console.log("⚠️ Rate limiting disabled - Upstash not configured");
}

export default ratelimit;
