const multer = require("multer");
const uniqid = require("uniqid");
const fs = require("fs");

const Image = require("../models/imageModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("../controllers/handlerFactory");

// THIS MAKE THE FILE INTO BUFFER
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const uniqueId = uniqid();
    ext = file.mimetype.split("/")[1];
    const imageName = `image-${req.user.id}-${Date.now()}-${uniqueId}.${ext}`;
    cb(null, imageName);
    delete uniqueId;
  },
});

// To check if the file uploaded is image only
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload any image", 400), false);
  }
};

// Actual multer
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// IMPORTANT FOR MULTER IMAGE
// if its only a single image AND only one img field in schema
// -- upload.single('photo')       > req.file

// if its multiple images AND only one img field in schema
// -- upload.array('photo', 5)     > req.files

// if its multiple images AND single image AND one and multiple img for diff fields in schema
// exports.uploadTourImages = upload.fields([
//   //> req.files
//   { name: "imageCover", maxCount: 1 },
//   { name: "images", maxCount: 3 },
// ]);

exports.uploadImages = upload.array("image", 5);

exports.uploadImageDetails = catchAsync(async (req, res, next) => {
    req.body.userID = req.user._id;
    req.body.image = req.files;
    const imageData = new Image(req.body);

    const image = await imageData.save();

    res.status(200).json({
      status: "success",
      image
    });
});

exports.deleteImage = catchAsync((req, res) => {
    let resultHandler = function (err) {
      if (err) {
        console.log("unlink failed", err);
      } else {
        console.log("file deleted");
      }
    }

    fs.unlink(req.body.path, resultHandler)

    res.status(204).json({
      status: 'success'
    })

})

exports.getAllImages = factory.getAll(Image);