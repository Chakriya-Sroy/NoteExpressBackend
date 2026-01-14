import express from "express";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";
import { AdminPermissionsMiddleware } from "../middlewares/permissions.middleware.js";
import {
  deleteForm,
  getAllForms,
  getFormById,
  InsertToForm,
  updateForm,
} from "../models/form.model.js";
import { useResponse } from "../utils/response.js";
import { FormSchema } from "../schema/form.schema.js";
import { getOrSetCache, clearCache, updateCache } from "../configs/radis.js";
import {
  ActivityLogAction,
  ActivityLogModule,
} from "../constants/action.constant.js";
import { RecordActivityLog } from "../models/activity.model.js";

const route = express.Router();

route.get(
  "/",
  AuthenticateMiddlware,
  AdminPermissionsMiddleware,
  async (req, res) => {
    try {
      const result = await getOrSetCache("forms", async () => {
        const data = await getAllForms();
        return data;
      });

      return useResponse(res, { data: result });
    } catch (err) {
      if (err.name === "ValidationError") {
        return useResponse(res, { code: 400, message: err.errors[0] });
      }

      return useResponse(res, {
        code: 500,
        message: err?.message ?? "Internal Server Error",
      });
    }
  }
);

route.post(
  "/",
  AuthenticateMiddlware,
  AdminPermissionsMiddleware,
  async (req, res) => {
    try {
      await FormSchema.validate(req.body);

      const user_id = req.user?.id;
      const payload = { ...req.body, user_id: user_id };
      const data = await InsertToForm(payload);

      // update cache
      await clearCache("forms");

      // record activity logs
      await RecordActivityLog({
        module: ActivityLogModule.FORM,
        action: ActivityLogAction.FORM_CREATE,
        userId: req.user?.id,
      });

      return useResponse(res, {
        data: data,
        message: "Form create successfully",
      });
    } catch (err) {
      console.log("this is err", err);
      if (err.name === "ValidationError") {
        return useResponse(res, { code: 400, message: err.errors[0] });
      }

      return useResponse(res, { code: 500, message: "Internal Server Error" });
    }
  }
);

route.get("/:id", async (req, res) => {
  try {
    const id = req.params?.id;
    const data = await getOrSetCache(`forms-${id}`, async () => {
      return await getFormById(id);
    });

    // const data = await getFormById(id);

    return useResponse(res, { data: data });
  } catch (err) {
    if (err?.code == "22P02") {
      return useResponse(res, { code: 404, message: "Invalid Form" });
    }
    console.log("heee", err);
    if (err.name === "ValidationError") {
      return useResponse(res, { code: 400, message: err.errors[0] });
    }

    return useResponse(res, { code: 500, message: "Internal Server Error" });
  }
});

route.put(
  "/:id",
  AuthenticateMiddlware,
  AdminPermissionsMiddleware,
  async (req, res) => {
    try {
      await FormSchema.validate(req.body);

      const id = req.params?.id;
      const user_id = req.user?.id;
      const payload = { ...req.body, user_id: user_id };

      const data = await updateForm(id, payload);

      // Update Cache
      await updateCache(`forms-${id}`, data);
      await clearCache("forms");

      // record activity logs
      await RecordActivityLog({
        module: ActivityLogModule.FORM,
        action: ActivityLogAction.FORM_UPDATE,
        userId: req.user?.id,
      });

      return useResponse(res, {
        data: data,
        message: "Form update successfully",
      });
    } catch (err) {
      if (err.name === "ValidationError") {
        return useResponse(res, { code: 400, message: err.errors[0] });
      }

      return useResponse(res, { code: 500, message: "Internal Server Error" });
    }
  }
);

route.delete(
  "/:id",
  AuthenticateMiddlware,
  AdminPermissionsMiddleware,
  async (req, res) => {
    try {
      const id = req.params?.id;

      await deleteForm(id);
      await clearCache(`forms-${id}`);
      await clearCache("forms");

      // record activity logs
      await RecordActivityLog({
        module: ActivityLogModule.FORM,
        action: ActivityLogAction.FORM_DELETE,
        userId: req.user?.id,
      });

      return useResponse(res, { message: "Form delete successfully" });
    } catch (err) {
      if (err.name === "ValidationError") {
        return useResponse(res, { code: 400, message: err.errors[0] });
      }

      return useResponse(res, { code: 500, message: "Internal Server Error" });
    }
  }
);

export default route;
