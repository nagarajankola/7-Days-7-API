const crypto = require("crypto-js");

const catchAsync = require("../utils/catchAsync");
const Note = require("../models/noteModel");
const { find } = require("../models/noteModel");

exports.addNote = catchAsync(async (req, res, next) => {
  req.body.userID = req.user._id;

  req.body.title = crypto.AES.encrypt(
    req.body.title,
    process.env.CRYPTO_SECRET
  ).toString();

  req.body.description = crypto.AES.encrypt(
    req.body.description,
    process.env.CRYPTO_SECRET
  ).toString();

  const noteData = new Note(req.body);

  const note = await noteData.save();

  res.status(201).json({
    status: "success",
    data: {
      note,
    },
  });
});

exports.getMyNotes = catchAsync(async (req, res, next) => {
  const notes = await Note.find({
    userID: req.user._id,
  });

  const decryptedNotes = [];

  function decryptNote(notes) {
    notes.map(async (note) => {
      note.title = crypto.AES.decrypt(
        note.title,
        process.env.CRYPTO_SECRET
      ).toString(crypto.enc.Utf8);
      note.description = crypto.AES.decrypt(
        note.description,
        process.env.CRYPTO_SECRET
      ).toString(crypto.enc.Utf8);
      decryptedNotes.push(note);
    });
  }
  decryptNote(notes);

  res
    .status(200)
    .json({ status: "success", result: decryptedNotes.length, decryptedNotes });
});

exports.updateNote = catchAsync(async (req, res, next) => {
  if (req.body.title) {
    req.body.title = crypto.AES.encrypt(
      req.body.title,
      process.env.CRYPTO_SECRET
    ).toString();
  }

  if (req.body.description) {
    req.body.description = crypto.AES.encrypt(
      req.body.description,
      process.env.CRYPTO_SECRET
    ).toString();
  }

  const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      note,
    },
  });
});

exports.deleteNote = catchAsync(async (req, res, next) => {
  const note = await Note.findByIdAndDelete(req.params.id);

  res.send(204).json({
    status: "success",
  });
});
