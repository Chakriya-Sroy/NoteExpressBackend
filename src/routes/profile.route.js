import express from "express";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";
import { findUserPassword, updateUserPassword } from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { ChangePasswordSchema } from "../schema/profile.schema.js";

const route = express.Router();

// Middlware
route.use(AuthenticateMiddlware);

// Get Profile
route.get("", async (req, res) => {
  const data = req?.user;
  return res.status(200).send({ data: data });
});

// Change Password
route.post("/change-password", async (req, res) => {
  try {

    await ChangePasswordSchema.validate(req.body, { abortEarly: false });

    const email= req?.user?.email;

    const { oldPassword, newPassword } = req.body;

    const {password} = await findUserPassword(email);

    const verifyUserPassword = await verifyPassword(oldPassword, password);

    if(password && !verifyUserPassword){
      return  res.status(400).send({ error: "Incorrect old password" });
    }
    
    const newHashedPassword = await hashPassword(newPassword);
    
    await updateUserPassword(email, newHashedPassword);

    return res.status(200).send({ message: "Password changed successfully" });

  } catch (err) {

    if (err.name === "ValidationError") {
      return res.status(400).send({ error: err.errors[0] });
    }

    return res
      .status(400)
      .send({ error: err?.message || "Internal Server Error" });
  }
});

export default route;
