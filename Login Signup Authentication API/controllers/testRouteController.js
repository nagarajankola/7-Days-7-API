const catchAsync = require("../utils/catchAsync");

exports.testRoute = catchAsync(async (req, res, next) => {
    res.status(201).json({
      status: "success",
      message: "admin & users"
    });
});

exports.testRouteSadmin = catchAsync(async (req, res, next) => {
    res.status(201).json({
      status: "success",
      message: "super admin"
    });
});
