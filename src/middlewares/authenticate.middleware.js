import { getUserStatusById } from "../models/user.model.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { useResponse } from "../utils/response.js";
// Middleware to verify token
export const AuthenticateMiddlware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return useResponse(res, { code: 401, message: "No token provided" });

    const token = authHeader.replace(/^Bearer\s+/i, "");

    const { payload } = await verifyAccessToken(token);

    req.user = payload;

    // Admin
    if (payload?.data?.role_id == 1) {
      next();
    }

    // Attach user info to request
    const res = await getUserStatusById(payload?.data?.id);

    if (res?.status && res?.status === "inactive") {
      return useResponse(res, {
        code: 404,
        message: "Account is inactive. Please contact administrator.",
      });
    }
    next(); // move to the next handler
  } catch (err) {
    console.error("Token verification failed:", err);
    return useResponse(res, { code: 401, message: "Invalid or expired token" });
  }
};
