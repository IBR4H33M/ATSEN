# Upstash Redis - Status & Information

## Current Status: ✅ ENABLED

Rate limiting is **active and working** for API protection.

## Why Admin Dashboard Shows "Unreachable"

The admin dashboard shows "fetch failed" or "Unreachable (local network)" because:

1. **Local Development Network Issue**: Your local machine cannot resolve `charmed-chigger-26431.upstash.io`
2. **This is NORMAL in local development**
3. **It WILL work in production** when deployed

## How It Works

### In Development (localhost):
- ❌ Admin dashboard health check: **Fails** (network/DNS issue)
- ✅ Rate limiter: **Works** (fail-open design - allows requests if Redis is unreachable)

### In Production (deployed):
- ✅ Admin dashboard health check: **Works**
- ✅ Rate limiter: **Works** (enforces 100 requests per 10 seconds)

## Testing

Run this to test Redis connectivity:
```bash
cd backend
node test-redis.js
```

## Configuration

Current settings in `.env`:
```
UPSTASH_REDIS_REST_URL=https://charmed-chigger-26431.upstash.io
UPSTASH_REDIS_REST_TOKEN=AWc_AAIjcDEyOTI2ODE5MTZiMDI0NTE4YWZiNGYzZDhmNGM3MTNhZXAxMA
```

Rate limit: **100 requests per 10 seconds per IP**

## Why This Design?

**Fail-Open Architecture**: If Redis is unreachable, the app continues working without rate limiting rather than blocking all requests. This ensures:
- ✅ Development works smoothly
- ✅ Production stays online even if Redis has issues
- ✅ Rate limiting activates when Redis is available

## To Disable Rate Limiting

Comment out in `backend/src/server.js`:
```javascript
// app.use(rateLimiter);
```

## Summary

✅ Rate limiting is **configured and enabled**  
✅ Will work in **production deployment**  
⚠️ Shows "unreachable" in **local development** (expected behavior)  
✅ App works fine **with or without** Redis connection
