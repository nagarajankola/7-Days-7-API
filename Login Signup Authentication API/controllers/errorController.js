const AppError = require("../utils/appError");

// invalid ...
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// while validation, eg: primary key
const errDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value ${value}. Please use another value!`;

  return new AppError(message, 400);
};

// not really sure
const handleValidationErrorDB = (error) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// in development the error is logged with all the details so as to solve them
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// in production there is no need to send all the eror details so only send the relevant ones
const sendErrorProd = (err, res) => {
  // error is of operational so we can send the message and response
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // this is for internal error that we dont want to lead to client or we dont wanna leak the error
  } else {
    // 1) log the error
    console.error("Error: " + err);

    // 2) Send generic error message
    res.status(500).json({
      status: "error",
      message: "Something went wrong :(",
    });
  }
};

// If there is any error in the token or if the token is invalid
const handleJWTError = () =>
  new AppError("Invalid token. Please login again.", 401);

// When the token is expired
const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please login again.", 401);

// controllers main logic for error handling
module.exports = (err, req, res, next) => {
  console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = errDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError(error);
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError(error);

    sendErrorProd(error, res);
  }
};
