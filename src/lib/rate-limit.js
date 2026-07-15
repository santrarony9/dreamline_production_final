// Simple in-memory rate limiter (suitable for Vercel serverless)
const rateLimit = (options = {}) => {
  const {
    interval = 60 * 1000, // 1 minute window
    uniqueTokenPerInterval = 500,
    limit = 10,
  } = options;

  const tokenCache = new Map();

  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of tokenCache) {
      if (now - data.timestamp > interval) {
        tokenCache.delete(key);
      }
    }
  }, interval);

  return {
    check: (request, maxRequests = limit) => {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";

      const tokenCount = tokenCache.get(ip);
      const now = Date.now();

      if (!tokenCount || now - tokenCount.timestamp > interval) {
        tokenCache.set(ip, { count: 1, timestamp: now });
        return { success: true, remaining: maxRequests - 1 };
      }

      if (tokenCount.count >= maxRequests) {
        return { success: false, remaining: 0 };
      }

      tokenCount.count++;
      return { success: true, remaining: maxRequests - tokenCount.count };
    },
  };
};

export const bookingLimiter = rateLimit({ interval: 60000, limit: 5 });
export const trackingLimiter = rateLimit({ interval: 60000, limit: 30 });
export const contentLimiter = rateLimit({ interval: 60000, limit: 60 });
export const authLimiter = rateLimit({ interval: 300000, limit: 5 }); // 5 attempts per 5 min
