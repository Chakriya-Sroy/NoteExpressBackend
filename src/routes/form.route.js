import express from "express";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";
import { AdminPermissionsMiddleware } from "../middlewares/permissions.middleware.js";
import { deleteForm, getAllForms, InsertToForm, updateForm } from "../models/form.model.js";
import { useResponse } from "../utils/response.js";
import { FormSchema } from "../schema/form.schema.js";

const route = express.Router();

route.use(AuthenticateMiddlware);

route.use(AdminPermissionsMiddleware);

route.get("/", async (req, res) => {
  try {

    const data = await getAllForms();

    return useResponse(res, { data: data });

  } catch (err) {

    if (err.name === "ValidationError") {
      return useResponse(res, { code: 400, message: err.errors[0] });
    }

    return useResponse(res, { code: 500, message: "Internal Server Error" });
  }
});

route.post("/", async (req, res) => {
  try {

    await FormSchema.validate(req.body);

    const user_id = req.user?.id;
    const payload = { ...req.body, user_id: user_id };
    const data = await InsertToForm(payload);

    return useResponse(res, { data: data ,message:'Form create successfully'});

  } catch (err) {

    if (err.name === "ValidationError") {
      return useResponse(res, { code: 400, message: err.errors[0] });
    }

    return useResponse(res, { code: 500, message: "Internal Server Error" });
  }
});


route.put("/:id", async (req, res) => {
  try {

    await FormSchema.validate(req.body);

    const id=req.params?.id;
    const user_id = req.user?.id;
    const payload = { ...req.body, user_id: user_id };
    const data = await updateForm(id,payload);

    return useResponse(res, { data: data,message:'Form update successfully' });

  } catch (err) {

    if (err.name === "ValidationError") {
      return useResponse(res, { code: 400, message: err.errors[0] });
    }

    return useResponse(res, { code: 500, message: "Internal Server Error" });
  }
});

route.delete("/:id", async (req, res) => {
  try {

    
    const id=req.params?.id;
   
    await deleteForm(id);

    return useResponse(res, { message:'Form delete successfully' });

  } catch (err) {

    if (err.name === "ValidationError") {
      return useResponse(res, { code: 400, message: err.errors[0] });
    }

    return useResponse(res, { code: 500, message: "Internal Server Error" });
  }
});

export default route;
