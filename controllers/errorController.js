const AppError = require("../utils/appError");
const logger = require("../utils/logger");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  logger.error(`Error: ${JSON.stringify(err)}`);
  const value = err.keyValue.email;
  const message = `Duplicate field value: (${value}). Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const value = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${value.join(". ")}`;
  return new AppError(message, 404);
};

const handleJWTError = () =>
  new AppError("Invalid Token. Please log in again!", 401);

const handleTokenExpiredError = () =>
  new AppError("Token Expired. Please log in again!", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    // value: Object.values(err.)
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: Send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming, or other unknown error: don't leak error details
  } else {
    // 1) Log error
    logger.error(`Error💥: ${JSON.stringify(err)}`);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  //   console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV === "production") {
    // let error = { ...err };
    let error = Object.create(err);
    error.message = err.message;
    // console.log(err.name);
    // console.log(err.code);
    // logger.info(err.name);
    // logger.info(error.name);
    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleTokenExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports = globalErrorHandler;

///////
