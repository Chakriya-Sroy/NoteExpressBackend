import express from "express";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";
import { AdminPermissionsMiddleware } from "../middlewares/permissions.middleware.js";
import { useResponse } from "../utils/response.js";
import { getAllRoles } from "../models/role.model.js";

const route = express.Router();

route.use(AuthenticateMiddlware);
route.use(AdminPermissionsMiddleware);

route.get("/", async (req, res) => {
  try {
    const data = await getAllRoles();
    return useResponse(res, {data: data });
  } catch (err) {
    return useResponse(res, {
      code: 500,
      message: err?.message || "Internal Server Error",
    });
  }
});

export default route;