import { getUserStatusById } from "../models/user.model.js";
import { verifyAccessToken } from "../utils/jwt.js";
// Middleware to verify token
export const AuthenticateMiddlware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.replace(/^Bearer\s+/i, "");

    const { payload } = await verifyAccessToken(token);

    req.user = payload;

    // Admin
    if (payload?.data?.role_id == 1) {
      next();
    }

    // Attach user info to request
    const { status } = await getUserStatusById(payload?.data?.id);

    if (status === "inactive") {
      return res.status(404).json({
        message: "Account is inactive. Please contact administrator.",
      });
    }
    next(); // move to the next handler
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
