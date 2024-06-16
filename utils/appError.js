class AppError extends Error {
  // Parent Class "Error" has a property "message"
  constructor(message, statusCode) {
    super(message); // This called the parent class("Error"), and whatever we pass into it is gonna be the "message" property. So this means by doing this parent call, we already set the message property to the incoming message.

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "Fail" : "Error";
    this.isOperational = true; //We want it to work for only operational errors.

    Error.captureStackTrace(this, this.constructor); // when a new object is created, and the constructor function is called, the function call won't appear in the stack trace, and won't pollute it.
  }
}

module.exports = AppError;

//\\\\\\\\\\
