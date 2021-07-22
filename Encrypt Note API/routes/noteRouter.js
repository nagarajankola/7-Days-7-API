const express = require("express");
const noteController = require("../controllers/noteController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.route("/").post(noteController.addNote).get(noteController.getMyNotes);

router
  .route("/:id")
  .patch(noteController.updateNote)
  .delete(noteController.deleteNote);

module.exports = router;
