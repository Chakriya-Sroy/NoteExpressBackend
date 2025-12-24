import express from "express";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";
import { AdminPermissionsMiddleware } from "../middlewares/permissions.middleware.js";
import { getAllUsers } from "../models/user.model.js";

const route = express.Router();

route.use(AuthenticateMiddlware);

route.use(AdminPermissionsMiddleware);

route.get("/", async (req, res) => {
  try {
    const { data, meta } = await getAllUsers(req?.query);
    return res.status(200).send({
      status: { message: "success", success: true, code: 200 },
      meta: meta,
      data: data,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ error: err?.message || "Internal Server Error" });
  }
});

export default route;
