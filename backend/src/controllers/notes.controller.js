const mongoose = require("mongoose");
const logger = require("../config/logger");
const Note = require("../models/Note");
const { DEFAULT_COLORS_BY_TYPE } = Note;

const normaliseTitle = (title) =>
  typeof title === "string" && title.trim() ? title.trim() : "Untitled Note";

const createNote = async (req, res, next) => {
  try {
    const { title, content, noteType, color, pinned } = req.body || {};

    const resolvedType = noteType ?? "note";
    const resolvedColor = color ?? DEFAULT_COLORS_BY_TYPE[resolvedType] ?? "purple";

    const note = await Note.create({
      title: normaliseTitle(title),
      content,
      noteType: resolvedType,
      color: resolvedColor,
      pinned,
      user: req.user._id,
    });

    logger.info(`Note created: ${note._id} by user ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

const getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({
      pinned: -1,
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: { notes } });
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid note ID" });
    }

    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }
    res.status(200).json({ success: true, data: { note } });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid note ID" });
    }

    const { title, content, noteType, color, pinned } = req.body || {};
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    const resolvedType = noteType ?? note.noteType;
    const isTypeChanging = noteType !== undefined && noteType !== note.noteType;
    const resolvedColor =
      color ??
      (isTypeChanging
        ? DEFAULT_COLORS_BY_TYPE[resolvedType] || "purple"
        : note.color);

    if (title !== undefined) note.title = normaliseTitle(title);
    if (content !== undefined) note.content = content;
    if (noteType !== undefined) note.noteType = resolvedType;
    if (color !== undefined || isTypeChanging) note.color = resolvedColor;
    if (pinned !== undefined) note.pinned = pinned;
    await note.save();

    logger.info(`Note updated: ${note._id} by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid note ID" });
    }

    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }
    logger.info(`Note deleted: ${note._id} by user ${req.user._id}`);

    res.status(200).json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote };
