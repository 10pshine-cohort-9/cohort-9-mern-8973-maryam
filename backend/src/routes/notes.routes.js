const express = require("express");
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} = require("../controllers/notes.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect); // All routes below require authentication

router.post("/", createNote);
router.get("/", getNotes);
router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;