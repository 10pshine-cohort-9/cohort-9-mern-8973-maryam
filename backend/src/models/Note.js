const mongoose = require("mongoose");

const NOTE_TYPES = ["note", "checklist", "todo", "goal"];
const NOTE_COLORS = ["orange", "navy", "cream", "blue", "purple", "mustard", "teal"];
const DEFAULT_COLORS_BY_TYPE = {
  note: "purple",
  checklist: "teal",
  todo: "orange",
  goal: "navy",
};

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Untitled Note",
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    noteType: {
      type: String,
      enum: NOTE_TYPES,
      default: "note",
    },
    color: {
      type: String,
      enum: NOTE_COLORS,
      default() {
        return DEFAULT_COLORS_BY_TYPE[this.noteType] || "purple";
      },
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goalPeriod: { 
      type: String,
       enum: ["weekly", "monthly"],
       default: "weekly"
       },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
module.exports.NOTE_TYPES = NOTE_TYPES;
module.exports.NOTE_COLORS = NOTE_COLORS;
module.exports.DEFAULT_COLORS_BY_TYPE = DEFAULT_COLORS_BY_TYPE;
