const crypto = require("crypto");
const { promisify } = require("util");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const logger = require("../utils/logger");

const signInToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signInToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // secure: true, // Cookie will only be sent on an encrypted connection. i.e HTTPS
    httpOnly: true, // Cookie cannot be accessed or modified in anyway by the browser.
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  //  Cookie is a form of a text that a server sends to a browser, the browser saves it and sends it back with future request to the server.

  // Remove password from output gotten from new document creation.
  user.password = undefined;

  res.status(statusCode).json({
    status: "Success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body); //This code shows that anyone can signin as an admin, it is a security flaw.

  // This type shows that a single user is signing, not as an admin.
  // We are taking just some specific data of the user, and not giving special priority to them.
  // We only put the data that we need into the user,so that the user doesn't add a different field into our db.

  // Signing Up Users
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  // Create a token for each Users.
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1)  Check if email and password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 404));
  }
  // 2)  Check if User exists && password is correct
  const user = await User.findOne({ email }).select("+password");
  // If the "user" doesn't exist, then there will be no "correct"
  // const correct = await user.correctPassword(password, user.password);
  // If there's no user, or there's a wrong password, return this error.
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  //  3) If everything is okay, Send token to client
  createSendToken(user, 200, res);
});

// AUTHENTICATION (LOG IN)
// Check the authenticity of a user, to access the features (i.e if a user is logged in), then he can access the features.
exports.protect = async (req, res, next) => {
  // 1) Getting token, check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401),
    );
  }
  // 2) Verification token
  //  We are to use a callback fnctn, that's why we brought in "promisify"
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // const decoded = await function promise()
  } catch (err) {
    if (process.env.NODE_ENV === "production") {
      if (err.isOperational) {
        return res.status(401).json({
          status: "Fail",
          message: "Invalid Token. Please log in again.",
        });
      } else {
        logger.error(`Error💥: ${JSON.stringify(err)}`);
        // 2) Send generic message
        return res.status(500).json({
          status: "error",
          message: "Something went wrong",
        });
      }
    }
    if (process.env.NODE_ENV === "development") {
      return res.status(401).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
      });
    }
  }
  // 3) Check if the user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("The user with this token no longer exists", 401));
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401),
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser; // Put the entire user data on request.
  next();
};

// AUTHORIZATION
// Restrict some features and access to some particular type of user(e.g admin)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //   roles ["admin", "lead-guide"]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //   1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  // logger.info(`======= User: ${JSON.stringify(user)} ===========`);
  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }

  //   2) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  logger.info(` *** Reset token: ${resetToken} ****`);

  const savedUser = await user.save({ validateBeforeSave: false });

  logger.info(`====== Saved User: ${JSON.stringify(savedUser)} =========`);
  // await user.save({ validateModifiedOnly: true });

  //   3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Please submit a PATCH request with your new password and passwordConfirm to: ${resetURL}
  \nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Token (Valid for 10 minutes)",
      message,
    });

    res.status(200).json({
      status: "Success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Please try again!",
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //   1) Get user based on the token

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //   2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or expired!", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  //   3) Update changedPasswordAt property for the user
  // This is done on the userModel, as a pre save middleware.

  //   4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //   1) Get the user from the collection, based on the password
  const user = await User.findById(req.user.id).select("+password");

  //   2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  //   3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate WILL NOT work as intended.

  //   4) Log user in, send JWT
  createSendToken(user, 200, res);
});

/////\\\\\\\\\\

