import ratelimit from "../config/upstash.js";

const rateLimter = async (req, res, next) => {
  try {
    // If Upstash is not configured, skip limiting
    if (!ratelimit) {
      return next();
    }
    
    // Use IP address for rate limiting (per-user basis)
    const identifier = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'anonymous';
    
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);

    if (!success) {
      return res
        .status(429)
        .json({ 
          message: "Too many requests, please try again later.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000)
        });
    }
    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    // Always allow requests if rate limiter fails (fail-open)
    next();
  }
};

export default rateLimter;
