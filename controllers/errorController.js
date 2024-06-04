const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // const value = err.message.match(/(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/);
  // const value = err.keyValue.name;
  console.log(err.value);
  console.log(err);
  const message = `Duplicate field value: x. Please use another value`;
  return new AppError(message, 400);
};

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
    console.error("Error💥", err);

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
    let error = { ...err };
    // console.log(err.name);
    console.log(err.code);
    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === "11000") error = handleDuplicateFieldsDB(error);

    sendErrorProd(error, res);
  }
};

module.exports = globalErrorHandler;

/////\\\
