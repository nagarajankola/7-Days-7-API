const multer = require("multer");
const Image = require("../models/imageModel");
const AppError = require("../utils/appError");
const factory = require("../controllers/handlerFactory");

// THIS MAKE THE FILE INTO BUFFER
const multerStorage = multer.memoryStorage();

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

exports.uploadImages = upload.array("image", 5);

exports.uploadImageDetails = catchAsync(async (req, res) => {
  req.body.image = req.files;
  req.body.userID = req.user._id;

  const imageData = new Image(req.body);

  const image = await imageData.save();

  res.status(201).json({
    status: "success",
    message: "Image(s) uploaded successfully",
    image,
  });
});

exports.deleteImage = factory.deleteOne(Image);

exports.qwerty = (req, res) => {
  console.log(req);
};
