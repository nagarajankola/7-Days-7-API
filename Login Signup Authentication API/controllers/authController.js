const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // sending jwt token as a cookie so that the next time the app makes the call it will always send the jwt token
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // 90days*24hours*60min*60sec*1000milsec*
    ),
    // // in this two ways, browser wont be able to access the cookie
    // secure: true,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // to remove password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check email pass exist
    if (!email || !password) {
      return next(new AppError("Please proide both email and password", 400));
    }
    // check if they are correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // if all OK send jwt
    createSendToken(user, 200, res);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in. Please login to get access", 401)
      );
    }

    // varify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("User no longer exists", 401));
    }

    // check if user has changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError("User has changed password", 401));
    }

    req.user = currentUser;
    console.log(req.user);
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({
      status: "fail",
      error: err,
    });
  }
};

exports.restrictTo = (...roles) => {
  try {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError("You do not have permission to access this route", 403)
        );
      }
      next();
    };
  } catch (err) {
    console.log(err);
    res.status(403).json({
      status: "fail",
      error: err,
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  // getting user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("No user found with that email", 404));
  }

  // generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send it to the user mail
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}.\nIf you didn't forgotPassword, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token {valid for 10min}",
      message: message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to mail!",
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sendEmail, please try again later", 500)
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  console.log(req.body);
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    console.log("hashed token: " + hashedToken);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    console.log(user);

    // 2) If token has not expired and there is user, set the new password
    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    console.log(user);

    // 3) Update changedPasswordAt property for the user

    // 4) Log the user in send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    console.log(err);
    res.json({
      status: "fail",
      error: err,
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    // 2) Check if posted curremt password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError("Your curremt password is incorrect", 401));
    }

    // 3) If yes then update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    // we are not using user.update() method coz the validation wont work(check schema) and also the jwt token thing works only on save
    await user.save();

    // 4) Log the user in and send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: "fail",
      err,
    });
  }
};


exports.logout = (req, res) => {
  try {
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({ status: "success" });
  } catch (err) {
    console.log(err);
  }
};