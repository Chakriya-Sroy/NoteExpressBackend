import express from "express";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";
import { AdminPermissionsMiddleware } from "../middlewares/permissions.middleware.js";
import {
  activateUser,
  checkDuplicateEmail,
  checkDuplicateUsername,
  deactivateUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  getAllUsers,
  insertUser,
  resetUserPassword,
  updateUser,
} from "../models/user.model.js";

import { hashPassword } from "../utils/password.js";
import { useResponse } from "../utils/response.js";
import { RecordActivityLog } from "../models/activity.model.js";
import {
  ActivityLogAction,
  ActivityLogModule,
} from "../constants/action.constant.js";
import { AuthSchema } from "../schema/auth.schema.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { RateLimitMiddleware } from "../middlewares/rate-limit.middleware.js";
import { UpdateProfileSchema } from "../schema/profile.schema.js";
import { ValidateRole } from "../models/role.model.js";

const route = express.Router();

route.use(AuthenticateMiddlware);

route.use(AdminPermissionsMiddleware);

route.get("/", async (req, res) => {
  try {
    const { data, meta } = await getAllUsers(req?.query);
    return useResponse(res, { data, meta });
  } catch (err) {
    return useResponse(res, {
      code: 500,
      message: err?.message || "Internal Server Error",
    });
  }
});

route.post("", RateLimitMiddleware, async (req, res) => {
  try {
    await AuthSchema.validate(req.body);

    const { email, username, password } = req.body;

    const existingEmail = await findUserByEmail(email);

    if (existingEmail) {
      return useResponse(res, {
        code: 400,
        message: "User already exists with that email",
      });
    }

    const existingUsername = await findUserByUsername(username);

    if (existingUsername) {
      return useResponse(res, {
        code: 400,
        message: "User already exists with that username",
      });
    }

    const password_hash = await hashPassword(password ?? "Default@124");

    const newUser = await insertUser({
      email,
      password: password_hash,
      role_id: req.body.role_id || 3,
      username: req.body.username || email.split("@")[0],
    });

    await RecordActivityLog({
      module: ActivityLogModule.AUTH,
      action: ActivityLogAction.AUTH_SIGNUP,
      userId: req.user?.id,
    });

    return useResponse(res, {
      message: "Create user successfully",
      data: newUser,
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


route.put(
  "/deactivate-user/:id",
  AuthenticateMiddlware,
  AdminPermissionsMiddleware,
  RateLimitMiddleware,
  async (req, res) => {
    const id = req.params.id;

    try {
      const existingUser = await findUserById(id);
      if (!existingUser) {
        return useResponse(res, {
          code: 404,
          message: "User with that id not found",
        });
      }

      if (existingUser?.role_id=== 1 && existingUser?.username==='admin') {
        return useResponse(res, {
          code: 403,
          message: "Cannot deactivate admin user",
        });
      }

      if (existingUser?.status === "inactive") {
        return useResponse(res, {
          code: 409,
          message: "The user account is already in an inactive state.",
        });
      }

      await deactivateUser(existingUser?.email);

      await RecordActivityLog({
        module: ActivityLogModule.USER,
        action: ActivityLogAction.USER_DEACTIVATED,
        userId: req.user?.id,
        metadata: {
          old: {
            status: existingUser?.status,
          },
          new: {
            status: "inactive",
          },
        },
      });

      return useResponse(res, { message: "User deactivated successfully" });
    } catch (err) {
      return useResponse(res, {
        code: 500,
        message: err?.message || "Internal Server Error",
      });
    }
  }
);

route.put(
  "/activate-user/:id",
  AuthenticateMiddlware,
  AdminPermissionsMiddleware,
  RateLimitMiddleware,
  async (req, res) => {
    const id = req.params.id;

    try {
      const existingUser = await findUserById(id);
      if (!existingUser) {
        return useResponse(res, {
          code: 400,
          message: "User with that id not found",
        });
      }

      if (existingUser?.role_id === 1 && existingUser?.username==='admin') {
        return useResponse(res, {
          code: 403,
          message: "Cannot Activate Admin User",
        });
      }

      if (existingUser?.status === "active") {
        return useResponse(res, {
          code: 409,
          message: "The user account is already in an active state.",
        });
      }

      await activateUser(existingUser?.email);

      await RecordActivityLog({
        module: ActivityLogModule.USER,
        action: ActivityLogAction.USER_ACTIVATED,
        userId: req.user?.id,
        metadata: {
          old: {
            status: existingUser?.status,
          },
          new: {
            status: "active",
          },
        },
      });

      return useResponse(res, { message: "User activated successfully" });
    } catch (err) {
      return useResponse(res, {
        code: 500,
        message: err?.message || "Internal Server Error",
      });
    }
  }
);

route.put(
  "/reset-password",
  AuthenticateMiddlware,
  AdminPermissionsMiddleware,
  RateLimitMiddleware,
  async (req, res) => {
    const id = req.body?.user_id;

    if (!id) {
      return useResponse(res, { code: 400, message: "User id is required" });
    }

    try {
      const existingUser = await findUserById(id);

      if (!existingUser) {
        return useResponse(res, {
          code: 400,
          message: "User with that id not found",
        });
      }

      if (existingUser?.role_id === 1 && existingUser?.username==='admin') {
        return useResponse(res, {
          code: 400,
          message: "Admin password can't reset",
        });
      }

      const password = req.body?.password ? req.body?.password : "Default@123";

      const newHashedPassword = await hashPassword(password);

      await resetUserPassword(existingUser?.id, newHashedPassword);

      await RecordActivityLog({
        module: ActivityLogModule.USER,
        action: ActivityLogAction.USER_RESET_PASSWORD,
        userId: req.user?.id,
      });

      return useResponse(res, { message: "User password reset successfully" });
    } catch (err) {
      return useResponse(res, {
        code: 500,
        message: err?.message || "Internal Server Error",
      });
    }
  }
);

route.put("/:id", RateLimitMiddleware, async (req, res) => {
  try {
    const id = req.params?.id;

    const user = await findUserById(id);

    if (!user) {
      return useResponse(res, {
        code: 404,
        message: "Can't find user with that id",
      });
    }
 
    if(user?.role_id===1 && user?.username==='admin'){
      return useResponse(res, {
          code: 403,
          message: "Can't update  admin user",
        });
    }
    if (req.body && Object.keys(req.body).length === 0) {
      return useResponse(res, {
        code: 400,
        message: "No data provided for update",
      });
    }

    await UpdateProfileSchema.validate(req.body);

    const { email, username, role_id } = req.body;

    if (email) {
      const isDuplicateEmail = await checkDuplicateEmail({
        user_id: id,
        email: email,
      });
      if (isDuplicateEmail) {
        return useResponse(res, {
          code: 409,
          message: "Email already exists",
        });
      }
    }

    if (username) {
      const isDuplicateEmail = await checkDuplicateUsername({
        user_id: id,
        username: username,
      });
      if (isDuplicateEmail) {
        return useResponse(res, {
          code: 409,
          message: "Username already exists",
        });
      }
    }

    if (role_id) {
      const isValidRole = await ValidateRole(role_id);
      if (!isValidRole) {
        return useResponse(res, {
          code: 422,
          message: "There no role with that id",
        });
      }
    }

    const updatedUser = await updateUser({ ...req.body, id: id });

    const updatedData = {
      old:{},
      new:{}
    };

    for (const key in req.body) {
      if (key in updatedUser) {
        updatedData['new'][key] = updatedUser[key];
        updatedData['old'][key]=user[key];
      }
    }


    await RecordActivityLog({
      module: ActivityLogModule.USER,
      action: ActivityLogAction.USER_UPDATE,
      userId: req.user?.id,
      metadata: updatedData,
    });

    return useResponse(res, {
      message: "Update user successfully",
      data: updatedUser,
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
export default route;
