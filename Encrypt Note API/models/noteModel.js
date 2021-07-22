const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A note must have a title"],
    },
    description: {
      type: String,
      required: [true, "A note must have a description"],
    },
    userID: {
      type: mongoose.Schema.ObjectId,
      required: [true, "A note must have a user"],
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
