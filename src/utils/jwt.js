import * as jose from "jose";
import dotenv from "dotenv";
import { PERMISSIONS } from "../constants/permission.constant.js";

dotenv.config();

export const generateAccessToken = async (user) => {
  return await new jose.SignJWT({
    id: user.id,
    email: user.email,
    role_id: user.role_id,
    permissions: user.role_id === 1 ? PERMISSIONS : [],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET));
};

export const generateRefreshToken = async (user) => {
  return await new jose.SignJWT({
    id: user.id,
    email: user.email,
    role_id: user.role_id,
    permissions: user.role_id === 1 ? PERMISSIONS : [],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET));
};

export const verifyAccessToken = async (token) => {
  return await jose.jwtVerify(
    token,
    new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)
  );
};

export const verifyRefreshToken = async (token) => {
  return await jose.jwtVerify(
    token,
    new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)
  );
};
