const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

const userRouter = require("./routes/userRouter");
const noteRouter = require("./routes/noteRouter");

app.use(helmet());

app.use(express.json());

app.use(mongoSanitize());

// Data sanitization against XSS
// It wont allow any html type of code, it will change em into entity
app.use(xss());

// Prevent parameter pollution
// removes parameter pollution.
// eg: [in the url if we use 2 sortBy sortBy, it will make it work]
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "ratingsQuantity",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// This snippet limits the server to make many requests
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour.",
});
app.use("/api", limiter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/note", noteRouter);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status:"fail",
    message:`Can't find ${req.originalUrl} on this server`
  })
  // next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
