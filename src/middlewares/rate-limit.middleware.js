import { rateLimit } from "express-rate-limit";
import { useResponse } from "../utils/response.js";

const limit = 3;

export const RateLimitMiddleware = rateLimit({
  windowMs: limit * 60 * 1000,
  limit: limit,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  handler: (req, res, next, options) => {
    return useResponse(res, {
      code: 429,
      message: `Too many attempts. Please try again later ${limit} minutes later`,
      data: { retryAfterMinutes: limit },
    });
  },
});
