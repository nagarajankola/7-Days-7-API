const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  if (!users) {
    return next(new AppError("No users found.", 404));
  }
  res.status(201).json({
    status: "success",
    result: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user posts password database,
    // this condition is only to check if user tries to update password through this route
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          "This route is not for updating password. Please use /updateMyPassword",
          400
        )
      );
    }

    // 2) Update user document
    // function call to filterout unwanted info
    const filteredBody = filterObj(req.body, "name", "email");
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(402).json({
      status: "fail",
      err,
    });
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    console.log(err);
    res.send("error");
  }
};

exports.getOneUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("posts");
    user.totalPosts = user.posts.length;
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: "fail",
      err,
    });
  }
};

exports.getMe = async (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
