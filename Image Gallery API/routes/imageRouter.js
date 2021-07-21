const express = require("express");

const imageController = require("../controllers/imageController");
const imageControllerDb = require("../controllers/imageControllerDb");
const imageControllerCloud = require("../controllers/imageControllerCloud");
const authController = require("../controllers/authController");

const router = express.Router();

// ALL IMAGES
router.get("/", imageController.getAllImages);

// Upload on server
router.post(
  "/uploadToServer",
  authController.protect,
  imageController.uploadImages,
  imageController.uploadImageDetails
);

router.delete(
  "/deleteFromServer",
  authController.protect,
  imageController.deleteImage
);

// Upload to Database
router.post(
  "/uploadToDb",
  authController.protect,
  imageControllerDb.uploadImages,
  imageControllerDb.uploadImageDetails
);

router.delete(
  "/deleteFromDb/:id",
  authController.protect,
  imageControllerDb.deleteImage
);

// Upload to cloud
router.post("/uploadToCloud", imageControllerCloud.uploadImage);

module.exports = router;
