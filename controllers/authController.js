const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");

const signInToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

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
    passwordChangedAt: req.body.passwordChangedAt,
  });

  // Create a token for each Users.
  const token = await signInToken(newUser._id);

  res.status(201).json({
    status: "Success",
    token,
    data: {
      user: newUser,
    },
  });
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
  const token = await signInToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

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

///////\\\\\
