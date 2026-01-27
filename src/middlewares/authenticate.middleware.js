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

    next(); // move to the next handler
  } catch (err) {
    console.error("Token verification failed:", err);
    return useResponse(res, { code: 401, message: "Invalid or expired token" });
  }
};
