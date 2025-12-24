
import { verifyAccessToken } from "../utils/jwt.js";
// Middleware to verify token
export const AuthenticateMiddlware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.replace(/^Bearer\s+/i, "");

    const { payload } = await verifyAccessToken(token);
    
    // Attach user info to request
    req.user = payload;

    next(); // move to the next handler
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
