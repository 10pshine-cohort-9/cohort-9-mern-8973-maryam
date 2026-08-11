const mongoose = require("mongoose");
const Note = require("../models/Note");

const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body || {};

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const note = await Note.create({ title, content, user: req.user._id });

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
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
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

    const { title, content } = req.body || {};
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    await note.save();

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
    res.status(200).json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote };