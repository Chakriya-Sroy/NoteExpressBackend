import express from "express";
import { AuthSchema, RefreshTokenSchema, SignupSchema } from "../schema/auth.schema.js";
import {
  findUserByEmail,
  findUserByUsername,
  insertUser,
} from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { useResponse } from "../utils/response.js";

import { RateLimitMiddleware } from "../middlewares/rate-limit.middleware.js";

const route = express.Router();

route.use(RateLimitMiddleware);

route.post("/signin", async (req, res) => {
  // Validate Input
  try {
    SignupSchema.validateSync(req.body, { abortEarly: false });
    const { email, password, username } = req.body;
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return useResponse(res, {
        code: 409,
        message: "User already exists with this email",
      });
    }

    const existingUsername = await findUserByUsername(username);

    if (existingUsername) {
      return useResponse(res, {
        code: 400,
        message: "User already exists with this username",
      });
    }

    const password_hash = await hashPassword(password);

    const newUser = await insertUser({
      email,
      password: password_hash,
      username: req.body.username || email.split("@")[0],
    });

    const access_token = await generateAccessToken(newUser);
    const refresh_token = await generateRefreshToken(newUser);

    return useResponse(res, {
      message: "Signin successfully",
      data: { accessToken: access_token, refreshToken: refresh_token },
    });
  } catch (err) {

    if (err.name === "ValidationError") {
      return useResponse(res, { code: 400, message: err.errors.join(',') });
    }

    return useResponse(res, {
      code: 500,
      message: err?.message || "Internal Server Error",
    });
  }
});

route.post("/login", async (req, res) => {
  try {
    // Validate Input
    await AuthSchema.validate(req.body);

    const { email, password } = req.body;
    // Check if User Exists
    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      return useResponse(res, { code: 401, message: "User not found" });
    }

    if (existingUser?.status === "inactive") {
      return useResponse(res, {
        code: 403,
        message: "User account is deactivated",
      });
    }
    // Verify Password
    const correctPassword = await verifyPassword(
      password,
      existingUser.password,
    );

    if (!correctPassword) {
      return useResponse(res, { code: 401, message: "Invalid Credentials" });
    }

    // Generate Tokens
    const access_token = await generateAccessToken(existingUser);
    const refresh_token = await generateRefreshToken(existingUser);

    return useResponse(res, {
      message: "Login successful",
      data: { accessToken: access_token, refreshToken: refresh_token },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return useResponse(res, { code: 400, message: err.errors[0] });
    }

    return useResponse(res, {
      code: 500,
      message: err?.message || "Internal Server Error",
    });
  }
});

route.post("/refresh-access-token", async (req, res) => {
  try {
    await RefreshTokenSchema.validate(req.body);

    const decoded = await verifyRefreshToken(req.body?.refreshToken);

    const accessToken = await generateAccessToken({
      id: decoded.payload.id,
      email: decoded.payload.email,
      username: decoded.payload.username,
    });

    return useResponse(res, { data: { accessToken } });
  } catch (err) {
    if (err.name === "ValidationError") {
      return useResponse(res, { code: 400, message: err.errors[0] });
    }

    if (err?.name === "JWSInvalid") {
      return useResponse(res, { code: 401, message: "Invalid refresh token" });
    }

    return useResponse(res, {
      code: 400,
      message: err?.message || "Internal Server Error",
    });
  }
});

export default route;
