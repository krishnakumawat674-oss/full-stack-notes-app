const Note = require("../models/Note.js");
const mongoose = require("mongoose");

const getNotes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const sort = req.query.sort;
    const filter = req.query.filter;
    const rawSearch = req.query.search;

if (
  rawSearch !== undefined &&
  (
    typeof rawSearch !== "string" ||
    rawSearch.length > 100
  )
) {
  return res.status(400).json({
    success: false,
    message: "Invalid search parameter",
  });
}

    const search = rawSearch?.trim();
const escapedSearch = search ? search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : ""

    if (sort && !["newest", "oldest"].includes(sort)) {
      return res.status(400).json({
        message: "Invalid sort option",
        success: false,
      });
    }

    if (filter && !["pinned", "unpinned"].includes(filter)) {
      return res.status(400).json({
        message: "Invalid filter option",
        success: false,
      });
    }

    const allNotes = {
      user: userId,
    };

    if (search) {
      allNotes.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { content: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (filter === "pinned") {
      allNotes.isPinned = true;
    } else if (filter === "unpinned") {
      allNotes.isPinned = false;
    }

    const notes = await Note.find(allNotes).sort({
      createdAt: sort === "oldest" ? 1 : -1,
    });

    return res.status(200).json({
      success: true,
      notes,
      message: "Notes fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.userId;

    if (!mongoose.isValidObjectId(noteId)) {
      return res.status(400).json({
        message: "Invalid ID Format",
        success: false,
      });
    }

    const note = await Note.findOne({ _id: noteId, user: userId });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
        success: false,
      });
    }

    return res.status(200).json({
      note,
      message: "Note fetched successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const createNotes = async (req, res, next) => {
  try {
    const data = req.body;
    const userId = req.user.userId;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return res.status(400).json({
        message: "Invalid request body",
        success: false,
      });
    }

    if (typeof data.title !== "string" || !data.title.trim()) {
      return res.status(400).json({
        message: "please send title inforamtion",
        success: false,
      });
    }

    if (typeof data.content !== "string" || !data.content.trim()) {
      return res.status(400).json({
        message: "please send content inforamtion",
        success: false,
      });
    }

    const notes = await Note.create({
      title: data.title.trim(),
      content: data.content.trim(),
      user: userId,
    });

    return res.status(201).json({
      notes,
      success: true,
      message: "Note created successfully",
    });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.userId;

    if (!mongoose.isValidObjectId(noteId)) {
      return res.status(400).json({
        message: "Invalid ID format",
        success: false,
      });
    }

    const note = await Note.findOneAndDelete({ _id: noteId, user: userId });
    if (!note) {
      return res.status(404).json({
        message: "note not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Note deleted successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const data = req.body;
    const noteId = req.params.id;
    const userId = req.user.userId;

    const allowedFields = ["title", "content", "isPinned"];

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return res.status(400).json({
        message: "Invalid request body",
        success: false,
      });
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: "Request Body cannot be empty",
        success: false,
      });
    }

    if (!mongoose.isValidObjectId(noteId)) {
      return res.status(400).json({
        message: "Invalid ID format",
        success: false,
      });
    }

    const hasUnsupportedFields = Object.keys(data).some(
      (field) => !allowedFields.includes(field),
    );

    if (hasUnsupportedFields) {
      return res.status(400).json({
        message: "Unsupported fields provided",
        success: false,
      });
    }

    const updateFields = {};

    if (Object.hasOwn(data, "title")) {
      if (typeof data.title !== "string" || data.title.trim() === "") {
        return res.status(400).json({
          message: "Invalid title",
          success: false,
        });
      }
      updateFields.title = data.title.trim();
    }

    if (Object.hasOwn(data, "content")) {
      if (typeof data.content !== "string") {
        return res.status(400).json({
          message: "Invalid content",
          success: false,
        });
      }
      updateFields.content = data.content.trim();
    }

    if (Object.hasOwn(data, "isPinned")) {
      if (typeof data.isPinned !== "boolean") {
        return res.status(400).json({
          message: "Invalid Pinned",
          success: false,
        });
      }
      updateFields.isPinned = data.isPinned;
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, user: userId },
      updateFields,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
        success: false,
      });
    }

    return res.status(200).json({
      note,
      message: "Note updated successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, createNotes, getNoteById, deleteNote, updateNote };
