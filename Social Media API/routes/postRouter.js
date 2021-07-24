const express = require("express");

const postController = require("../controllers/postController");
const authController = require("../controllers/authController");
const upload = require("../utils/multer");

const router = express.Router();

router.use(authController.protect);

// ALL IMAGES
router
  .route("/")
  .get(postController.getAllPost)
  .post(upload.single("image"), postController.uploadPostDetails);

router
  .route("/:id")
  .get(postController.getOnePost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

router
  .route("/like/:id")
  .post(postController.like)
  .patch(postController.dislike);

module.exports = router;
