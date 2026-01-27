import express from "express";
import { FolderSchema } from "../schema/folder.schema.js";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";
import { useResponse } from "../utils/response.js";
import {
  CreateFolder,
  DeleteFolder,
  FindFolderById,
  GetFoldersByUserId,
  UpdateFolder,
} from "../models/folder.model.js";

const router = express.Router();

router.use(AuthenticateMiddlware);

router.get("/", async (req, res) => {
  try {
    const data = await GetFoldersByUserId(req?.user?.id);
    return useResponse(res, { data });
  } catch (err) {
    return useResponse(res, {
      code: 500,
      message: err?.message || "Internal Server Error",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    await FolderSchema.validate(req.body);

    const user_id = req?.user?.id;
    const name = req?.body?.name;

    const folder = await CreateFolder(name, user_id);

    return useResponse(res, {
      message: "Folder created successfully",
      data: folder,
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

router.put("/:id", async (req, res) => {
  try {
    const folderId = req.params?.id;

    if (!folderId) {
      return useResponse(res, { code: 400, message: "Folder Id is required" });
    }

    await FolderSchema.validate(req.body);

    const name = req.body?.name;

    // Verify Folder Id
    const oldFolder = await FindFolderById(folderId, req?.user?.id);

    if (!oldFolder) {
      return useResponse(res, {
        code: 404,
        message: "Folder with that Id not found",
      });
    }

    const updatedFolder = await UpdateFolder(folderId, name);

    return useResponse(res, {
      message: "Folder updated successfully",
      data: updatedFolder,
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

router.delete("/:id", async (req, res) => {
  try {
    const folderId = req.params?.id;
    // Verify Folder Id
    const folder = await FindFolderById(folderId, req?.user?.id);

    if (!folder) {
      return useResponse(res, {
        code: 404,
        message: "Folder with that Id not found",
      });
    }

    await DeleteFolder(folderId,req.user?.id);

    return useResponse(res, {
      message: "Folder deleted successfully",
    });
  } catch (err) {
    return useResponse(res, {
      code: 500,
      message: err?.message || "Internal Server Error",
    });
  }
});

export default router;
