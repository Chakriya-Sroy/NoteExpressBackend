import express from "express";
import { AuthSchema, RefreshTokenSchema } from "../schema/auth.schema.js";
import { findUserByEmail, insertUser } from "../models/auth.model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

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
     
    if(existingUser.status === 'inactive'){
      return  res.status(403).send({ error: "User account is deactivated" });
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
      role: decoded.payload.role,
    });

    return res.status(200).send({ access_token });

  } catch (err) {

    if (err.name === "ValidationError") {
      return res.status(400).send({ error: err.errors[0] });
    }

    if(err?.name ==='JWSInvalid'){
      return res.status(401).send({ error: "Invalid refresh token" });
    }

    return res
      .status(400)
      .send({ error: err?.message || "Internal Server Error" });
  }
});


export default route;
