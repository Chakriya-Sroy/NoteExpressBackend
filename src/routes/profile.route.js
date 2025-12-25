import express from "express";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";
import { findUserPassword, updateUserPassword } from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { ChangePasswordSchema } from "../schema/profile.schema.js";
import { useResponse } from "../utils/response.js";

const route = express.Router();

// Middlware
route.use(AuthenticateMiddlware);

// Get Profile
route.get("", async (req, res) => {
  const data = req?.user;
  return useResponse(res, { data: data });
});

// Change Password
route.put("/change-password", async (req, res) => {
  try {
    await ChangePasswordSchema.validate(req.body, { abortEarly: false });

    const email = req?.user?.email;

    const { old_password, new_password } = req.body;

    const { password } = await findUserPassword(email);

    const verifyUserPassword = await verifyPassword(old_password, password);

    if (password && !verifyUserPassword) {
      return useResponse(res, { code: 400, message: "Incorrect old password" });
    }

    const newHashedPassword = await hashPassword(new_password);

    await updateUserPassword(email, newHashedPassword);

    return useResponse(res, { message: "Password changed successfully" });
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

export default route;
