import express from "express";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";
import { AdminPermissionsMiddleware } from "../middlewares/permissions.middleware.js";
import {
  activateUser,
  deactivateUser,
  findUserById,
  getAllUsers,
  resetUserPassword,
} from "../models/user.model.js";
import { hashPassword } from "../utils/password.js";
import { useResponse } from "../utils/response.js";
import { RecordActivityLog } from "../models/activity.model.js";
import {
  ActivityLogAction,
  ActivityLogModule,
} from "../constants/action.constant.js";

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

route.put(
  "/deactivate-user/:id",
  AuthenticateMiddlware,
  AdminPermissionsMiddleware,
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

      if (existingUser?.role_id === 1) {
        return useResponse(res, {
          code: 403,
          message: "Permission denied cannot deactivate admin user",
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

      if (existingUser?.role_id === 1) {
        return useResponse(res, {
          code: 403,
          message: "Permission Denined",
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

      if (existingUser?.role_id === 1) {
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

export default route;
