import express from "express";
import { FormResponseSchema } from "../schema/form_resposne.schema.js";
import { useResponse } from "../utils/response.js";
import { isValidFormId } from "../models/form.model.js";
import * as yup from "yup";
import {
  getAllFormRespones,
  getFormResponseById,
  insertFormResponse,
} from "../models/formResponse.model.js";
import { clearCache, getOrSetCache } from "../configs/radis.js";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";
import { AdminPermissionsMiddleware } from "../middlewares/permissions.middleware.js";

const route = express.Router();

// Get All Forms Only Allow for admin and authentication user
route.get(
  "/",
  AuthenticateMiddlware,
  AdminPermissionsMiddleware,
  async (req, res) => {
    try {
      const data = await getOrSetCache("form_responses", async () => {
        const data = await getAllFormRespones();
        return data;
      });
      return useResponse(res, { sucess: true, data: data });
      
    } catch (err) {
      console.log("error", err);
      return useResponse(res, {
        code: 500,
        message: err?.message ?? "Internal Server Error",
      });
    }
  },
);

// Post Form Response
route.post("/", async (req, res) => {
  try {
    // Validate Input
    await FormResponseSchema.validate(req.body, { abortEarly: false });
    // Validate Form
    const form_id = req.body?.form_id;

    const form = await isValidFormId(form_id);

    const schema = generateSchema(form?.fields);

    await schema.validate(req.body?.answers);

    const { data } = await insertFormResponse(req.body);

    await clearCache("form_responses");

    return useResponse(res, {
      message: "Form Submitt Succesfully",
      data: data,
    });
  } catch (err) {
    console.log("err", err);
    if (err?.code === "22P02") {
      return useResponse(res, { code: 404, message: "Invalid Form Id" });
    }
    if (err.name === "ValidationError") {
      return useResponse(res, { code: 400, message: err.errors.join("\n") });
    }
    return useResponse(res, {
      code: 500,
      message: err?.message ?? "Internal Server Error",
    });
  }
});

route.get("/:id", async (req, res) => {
  try {
    const id = req.params?.id;

    const data = await getOrSetCache(`forms_responses_${id}`, async () => {
      const res = await getFormResponseById(id);
      return res;
    });

    if (!data) {
      return useResponse(res, {
        code: 404,
        message: "There no reposne with that id",
      });
    }

    return useResponse(res, { data: data });
  } catch (err) {
    return useResponse(res, {
      code: 500,
      message: err?.message ?? "Internal Server Error",
    });
  }
});

export default route;
/**
 * 
 * "fields": [
                {
                    "id": "field_1768386590217",
                    "name": "fullname",
                    "type": "text",
                    "label": "Fullname",
                    "options": [],
                    "required": true,
                    "placeholder": "Please input your fullname"
                },
                {
                    "id": "field_1768386608716",
                    "name": "age",
                    "type": "date",
                    "label": "Age",
                    "options": [],
                    "required": true,
                    "placeholder": "Please input your age"
                }
 ]
 The Schema will be {"fullname":"","age":""}
 */

const generateSchema = (fields) => {
  const schemaFields = {};

  fields.forEach((field) => {
    let fieldSchema;

    // Generate schema based on field type
    switch (field.type) {
      case "text":
      case "textarea":
        fieldSchema = yup.string();
        break;

      case "email":
        fieldSchema = yup.string().email("Invalid email format");
        break;

      case "number":
        fieldSchema = yup.number().typeError("Must be a number");
        break;

      case "date":
        fieldSchema = yup.date().typeError("Invalid date");
        break;

      case "checkbox":
        fieldSchema = yup.boolean();
        break;

      case "select":
      case "radio":
        fieldSchema = yup.string().oneOf(
          field.options.map((opt) => opt.value),
          "Invalid selection",
        );
        break;

      case "multiple":
        fieldSchema = yup.array().of(yup.string());
        break;

      default:
        fieldSchema = yup.string();
    }

    // Add required validation if needed
    if (field.required) {
      fieldSchema = fieldSchema.required(`${field.label} is required`);
    }

    // Add the field to schema
    schemaFields[field.name] = fieldSchema;
  });

  return yup.object().shape(schemaFields);
};
