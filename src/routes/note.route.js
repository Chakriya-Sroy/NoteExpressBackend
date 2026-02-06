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
import {
  clearCache,
  clearCachePattern,
  getOrSetCache,
} from "../configs/radis.js";

const router = express.Router();

router.use(AuthenticateMiddlware);

// Helper function to clear all note-related caches for a user
const clearUserNoteCaches = async (userId, noteId = null) => {
  try {
    // Clear specific note cache if noteId provided
    if (noteId) {
      await clearCache(`note_${noteId}_user_${userId}`);
    }

    await clearCachePattern(`notes_user_${userId}*`);
  } catch (err) {
    console.error("Cache clearing error:", err);
  }
};

// Get all notes
router.get("/", async (req, res) => {
  try {
    const userId = req?.user?.id;

    // Generate cache key based on query parameters
    const queryString =
      req.query && Object.keys(req.query).length > 0
        ? `_query_${Object.entries(req.query)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}_${v}`)
            .join("_")}`
        : "";

    const key = `notes_user_${userId}${queryString}`;

    // Get Caches if exist
    const { notes: data, meta } = await getOrSetCache(key, async () => {
      return await GetNotesByUserId(userId, req.query);
    });

    // Clear browser caches
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Clear-Site-Data": '"cache"', // Modern browsers
    });

    return useResponse(res, { code: 200, data, meta });
  } catch (err) {
    console.log("error", err);
    return useResponse(res, { code: 500, message: "Internal Server Error" });
  }
});

// Create note
router.post("/", async (req, res) => {
  try {
    await NoteSchema.validateSync(req.body, { abortEarly: false });

    const user_id = req?.user?.id;
    const payload = req?.body;

    const note = await CreateNote(payload, user_id);

    // Clear all user note caches
    await clearUserNoteCaches(user_id);

    // Clear Broswer caches
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Clear-Site-Data": '"cache"', // Modern browsers
    });

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

// Update note
router.put("/:id", async (req, res) => {
  try {
    const noteId = req.params?.id;
    const userId = req?.user?.id;

    if (!noteId) {
      return useResponse(res, { code: 400, message: "Note Id is required" });
    }

    await NoteSchema.validate(req.body);

    const payload = req.body;

    // // Verify Note Id
    // const oldNote = await FindNoteById(noteId, userId);

    // if (!oldNote) {
    //   return useResponse(res, {
    //     code: 404,
    //     message: "Note with that Id not found",
    //   });
    // }

    const updatedNote = await UpdateNote(noteId, userId, payload);

    if (!updatedNote) {
      return useResponse(res, {
        code: 404,
        message: "Note with that Id not found",
      });
    }

    // Clear specific note cache and all list caches
    clearUserNoteCaches(userId, noteId).catch((err) =>
      console.error("Cache clear error:", err),
    );

    // Clear Broswer caches
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Clear-Site-Data": '"cache"', // Modern browsers
    });

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

// Delete note
router.delete("/:id", async (req, res) => {
  try {
    const noteId = req.params?.id;
    const userId = req?.user?.id;

    // Verify Note Id
    const note = await FindNoteById(noteId, userId);

    if (!note) {
      return useResponse(res, {
        code: 404,
        message: "Note with that Id not found",
      });
    }

    await DeleteNote(noteId, userId);

    // Clear specific note cache and all list caches
    await clearUserNoteCaches(userId, noteId);

    // Clear Broswer caches
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Clear-Site-Data": '"cache"', // Modern browsers
    });

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

// Get single note
router.get("/:id", async (req, res) => {
  try {
    const noteId = req.params?.id;
    const userId = req?.user?.id;

    if (!noteId) {
      return useResponse(res, { code: 400, message: "Note Id is required" });
    }

    // Get or set cache for specific note
    const note = await getOrSetCache(
      `note_${noteId}_user_${userId}`,
      async () => {
        return await FindNoteById(noteId, userId);
      },
    );

    if (!note) {
      return useResponse(res, {
        code: 404,
        message: "Note with that Id not found",
      });
    }

    // Add browser cache headers with ETag
    res.set({
      "Cache-Control": "private, max-age=300, stale-while-revalidate=30",
      ETag: `"${noteId}-${note.updated_at || note.created_at}"`,
    });

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
