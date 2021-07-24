const express = require("express");

const authController = require("../controllers/authController");
const commentController = require("../controllers/commentController");

const router = express.Router();
router.use(authController.protect);

router
  .route("/")
  .post(commentController.addUserId, commentController.addComment)
  .get(commentController.getAllComment);
  
router
  .route("/:id")
  .get(commentController.getSingleComment)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

module.exports = router;
