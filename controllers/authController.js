const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signInToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
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
  //Getting token, check if it's there
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

  // Verification token
  //  We are to use a callback fnctn, that's why we brought in "promisify"
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  console.log(decoded);
  // Check if the user exists

  // Check if user changed password after the token was issued
  next();
};

///////\\\\\\\
