import { rateLimit } from "express-rate-limit";
import { useResponse } from "../utils/response.js";

export const RateLimitMiddleware= rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  handler: (req, res, next, options) => {
    return useResponse(res,{code:429,message:'Too many attempts. Please try again later 5 minutes later'})
  },
})
