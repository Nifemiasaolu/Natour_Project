const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

// const AppError = require("../utils/appError");

const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //   1) Create Error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is for password update. Please use /updatePassword.",
        400,
      ),
    );
  }
  //    2) Filtered Out unwanted field names that are not allowed to be updated.
  const filteredBody = filteredObj(req.body, "name", "email");
  //   3) Update the user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "Success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "Success",
    data: null,
  });
});

exports.createUser = factory.createOne(User);

// Do NOT update password with this!.
// This Update User is only for admin. Used to update data that's not the password.
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.getUser = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      // user,
    },
  });
};

// //\///\\
