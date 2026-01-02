import express from "express";
import { getActivityLog } from "../models/activity.model.js";
import { useResponse } from "../utils/response.js";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";
import { AdminPermissionsMiddleware } from "../middlewares/permissions.middleware.js";

const route = express.Router();

route.use(AuthenticateMiddlware);

route.use(AdminPermissionsMiddleware);

route.get("/", async (req, res) => {
  try {
    const { data, meta } = await getActivityLog(req.query);
    return useResponse(res, {
      code: 202,
      meta: meta,
      data: data,
    });
  } catch (err) {
    return useResponse(res, {
      code: 500,
      message: err?.message,
    });
  }
});

export default route;
