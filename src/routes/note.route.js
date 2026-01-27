import express from "express";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";
import { useResponse } from "../utils/response.js";
import {
  CreateNote,
  DeleteNote,
  FindNoteById,
  GetNotesByUserId,
  UpdateNote,
} from "../models/note.model.js";
import { NoteSchema } from "../schema/note.schema.js";
import { clearCache, getOrSetCache } from "../configs/radis.js";

const router = express.Router();

router.use(AuthenticateMiddlware);

router.get("/", async (req, res) => {
  try {
    const data = await getOrSetCache(
      `notes_user_${req?.user?.id}`,
      async () => {
        return await GetNotesByUserId(req?.user?.id);
      },
    );
    return useResponse(res, { code: 200, data });
  } catch (err) {
    return useResponse(res, { code: 500, message: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    await NoteSchema.validateSync(req.body, { abortEarly: false });

    const user_id = req?.user?.id;
    const payload = req?.body;

    const note = await CreateNote(payload, user_id);
    // Clear Radis Cache for user's notes
    await clearCache(`notes_user_${req?.user?.id}`);

    return useResponse(res, {
      message: "Note created successfully",
      data: note,
    });
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      return useResponse(res, { code: 400, message: err.errors.join(",") });
    }
    return useResponse(res, {
      code: 500,
      message: err?.message || "Internal Server Error",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const noteId = req.params?.id;

    if (!noteId) {
      return useResponse(res, { code: 400, message: "Note Id is required" });
    }

    await NoteSchema.validate(req.body);

    const payload = req.body;

    // Verify Note Id
    const oldNote = await FindNoteById(noteId, req?.user?.id);

    if (!oldNote) {
      return useResponse(res, {
        code: 404,
        message: "Note with that Id not found",
      });
    }

    const updatedNote = await UpdateNote(noteId, payload);
    // Clear Radis Cache for user's notes
    await clearCache(`notes_user_${req?.user?.id}`); // Note List
    await clearCache(`note_${noteId}_user_${req?.user?.id}`); // Specific Note

    return useResponse(res, {
      message: "Note updated successfully",
      data: updatedNote,
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
    const noteId = req.params?.id;
    // Verify Folder Id
    const note = await FindNoteById(noteId, req?.user?.id);

    if (!note) {
      return useResponse(res, {
        code: 404,
        message: "Note with that Id not found",
      });
    }
    // Clear Radis Cache for user's notes
    await clearCache(`notes_user_${req?.user?.id}`);
    await clearCache(`note_${noteId}_user_${req?.user?.id}`); // Specific Note

    await DeleteNote(noteId, req.user?.id);
    return useResponse(res, {
      message: "Note deleted successfully",
    });
  } catch (err) {
    return useResponse(res, {
      code: 500,
      message: err?.message || "Internal Server Error",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const noteId = req.params?.id;

    if (!noteId) {
      return useResponse(res, { code: 400, message: "Note Id is required" });
    }

    // Verify Note Id
    const note = await getOrSetCache(
      `note_${noteId}_user_${req?.user?.id}`,
      async () => {
        return await FindNoteById(noteId, req?.user?.id);
      },
    );

    if (!note) {
      return useResponse(res, {
        code: 404,
        message: "Note with that Id not found",
      });
    }

    return useResponse(res, {
      data: note,
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
export default router;
