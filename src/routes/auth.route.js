import express from "express";
import { AuthSchema, RefreshTokenSchema } from "../schema/auth.schema.js";
import { findUserByEmail, insertUser } from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { useResponse } from "../utils/response.js";
import { RecordActivityLog } from "../models/activity.model.js";
import {
  ActivityLogAction,
  ActivityLogModule,
} from "../constants/action.constant.js";

const route = express.Router();

route.post("/signin", async (req, res) => {
  // Validate Input
  try {
    await AuthSchema.validate(req.body);
    const { email, password } = req.body;
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return useResponse(res, {
        code: 409,
        message: "User already exists with this email",
      });
    }

    const password_hash = await hashPassword(password);

    const newUser = await insertUser({
      email,
      password: password_hash,
      role_id: req.body.role_id || 3,
      username: req.body.username || email.split("@")[0],
    });

    const access_token = await generateAccessToken(newUser);
    const refresh_token = await generateRefreshToken(newUser);

    await RecordActivityLog({
      module: ActivityLogModule.AUTH,
      action: ActivityLogAction.AUTH_SIGNUP,
      userId: newUser?.id,
    });

    return useResponse(res, {
      message: "Signin successfully",
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
      existingUser.password
    );

    if (!correctPassword) {
      return useResponse(res, { code: 401, message: "Invalid Credentials" });
    }

    // Generate Tokens
    const access_token = await generateAccessToken(existingUser);
    const refresh_token = await generateRefreshToken(existingUser);

    await RecordActivityLog({
      module: ActivityLogModule.AUTH,
      action: ActivityLogAction.AUTH_LOGIN,
      userId: existingUser?.id,
    });

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

    const access_token = await generateAccessToken({
      id: decoded.payload.id,
      email: decoded.payload.email,
      role_id: decoded.payload.role_id,
    });

    return useResponse(res, { data: { access_token } });
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
