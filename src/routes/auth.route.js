import express from "express";
import { AuthSchema, RefreshTokenSchema } from "../schema/auth.schema.js";
import {
  activateUser,
  deactivateUser,
  findUserByEmail,
  findUserById,
  insertUser,
  resetUserPassword,
} from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { AdminPermissionsMiddleware } from "../middlewares/permissions.middleware.js";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";

const route = express.Router();

route.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  // Validate Input
  try {
    await AuthSchema.validate(req.body);

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res
        .status(400)
        .send({ error: "User already exists with this email" });
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

    return res.status(201).send({
      message: "Signin successfully",
      accessToken: access_token,
      refreshToken: refresh_token,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send({ error: err.errors[0] });
    }

    return res
      .status(400)
      .send({ error: err?.message || "Internal Server Error" });
  }
});

route.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate Input
    await AuthSchema.validate(req.body);

    // Check if User Exists
    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      return res.status(400).send({ error: "User not found" });
    }

    if (existingUser?.status === "inactive") {
      return res.status(403).send({ error: "User account is deactivated" });
    }
    // Verify Password
    const correctPassword = await verifyPassword(
      password,
      existingUser.password
    );

    if (!correctPassword) {
      return res.status(400).send({ error: "Invalid Credentials" });
    }

    // Generate Tokens
    const access_token = await generateAccessToken(existingUser);
    const refresh_token = await generateRefreshToken(existingUser);

    return res.status(200).send({
      message: "Login successful",
      accessToken: access_token,
      refreshToken: refresh_token,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send({ error: err.errors[0] });
    }

    return res
      .status(400)
      .send({ error: err?.message || "Internal Server Error" });
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

    return res.status(200).send({ access_token });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send({ error: err.errors[0] });
    }

    if (err?.name === "JWSInvalid") {
      return res.status(401).send({ error: "Invalid refresh token" });
    }

    return res
      .status(400)
      .send({ error: err?.message || "Internal Server Error" });
  }
});

route.put(
  "/deactivate-user/:id",
  AuthenticateMiddlware,
  AdminPermissionsMiddleware,
  async (req, res) => {
    const id = req.params.id;

    try {
      const existingUser = await findUserById(id);
      if (!existingUser) {
        return res.status(400).send({ error: "User with that id not found" });
      }

      if (existingUser?.role_id === 1) {
        return res.status(403).send({ error: "Cannot deactivate admin user" });
      }

      await deactivateUser(existingUser?.email);

      return res.status(200).send({ message: "User deactivated successfully" });
    } catch (err) {
      return res
        .status(400)
        .send({ error: err?.message || "Internal Server Error" });
    }
  }
);

route.put(
  "/activate-user/:id",
  AuthenticateMiddlware,
  AdminPermissionsMiddleware,
  async (req, res) => {
    const id = req.params.id;

    try {
      const existingUser = await findUserById(id);
      if (!existingUser) {
        return res.status(400).send({ error: "User with that id not found" });
      }

      if (existingUser?.role_id === 1) {
        return res.status(403).send({ error: "Cannot activate admin user" });
      }

      await activateUser(existingUser?.email);

      return res.status(200).send({ message: "User activated successfully" });
    } catch (err) {
      return res
        .status(400)
        .send({ error: err?.message || "Internal Server Error" });
    }
  }
);

route.put(
  "/reset-password",
  AuthenticateMiddlware,
  AdminPermissionsMiddleware,
  async (req, res) => {
    const id = req.body?.user_id;

    if (!id) {
      return res.status(400).send({ error: "User id is required" });
    }
    
    try {
      const existingUser = await findUserById(id);

      if (!existingUser) {
        return res.status(400).send({ error: "User with that id not found" });
      }

      const password = "Default@123";

      const newHashedPassword = await hashPassword(password);

      await resetUserPassword(existingUser?.id, newHashedPassword);

      return res
        .status(200)
        .send({ message: "User password reset successfully" });
    } catch (err) {
      return res
        .status(400)
        .send({ error: err?.message || "Internal Server Error" });
    }
  }
);

export default route;
