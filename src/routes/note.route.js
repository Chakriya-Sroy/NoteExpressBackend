import express from "express";
import { AuthenticateMiddlware } from "../middlewares/authenticate.middleware.js";
import { useResponse } from "../utils/response.js";
import { CreateNote, DeleteNote, FindNoteById, GetNotesByUserId, UpdateNote } from "../models/note.model.js";
import { NoteSchema } from "../schema/note.schema.js";

const router = express.Router();

router.use(AuthenticateMiddlware);

router.get("/", async (req, res) => {
  try {
    const data = await GetNotesByUserId(req.user.id);
    return useResponse(res, { code: 200, data });
  } catch (err) {
    return useResponse(res, { code: 500, message: 'Internal Server Error' });
  }
});

router.post("/", async (req, res) => {
  try {
    await NoteSchema.validateSync(req.body,{ abortEarly: false });

    const user_id = req?.user?.id;
    const payload = req?.body;

    const note = await CreateNote(payload, user_id);

    return useResponse(res, {
      message: "Note created successfully",
      data: note
    });

  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      return useResponse(res, { code: 400, message: err.errors.join(',') });
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
    const noteId= req.params?.id;
    // Verify Folder Id
    const note = await FindNoteById(noteId, req?.user?.id);

    if (!note) {
      return useResponse(res, {
        code: 404,
        message: "Note with that Id not found",
      });
    }

    await DeleteNote(noteId,req.user?.id);
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


export default router;
