const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
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

// const getAllUsers = (req, res) => {
//   res.status(500).json({
//     status: "error",
//     message: "This route is not yet defined!",
//   });
// };

exports.createUser = (req, res) => {
  // const newId = allUsers[allUsers.length - 1]._id + 1;
  // const newUser = Object.assign({ id: newId }, req.body);
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const newUser = { id: newId, ...req.body };

  allUsers.push(newUser);

  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(allUsers),
    () => {
      res.status(201).json({
        status: "success",
        data: {
          user: newUser,
        },
      });
    },
  );
};

exports.getUser = (req, res) => {
  console.log(req.params);

  const { id } = req.params;
  const user = allUsers.find((el) => el._id === id);
  console.log(user);

  // if(id > allUsers.length) {
  if (!user) {
    return res.status(404).json({
      status: "failed",
      message: "Invalid ID",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};

exports.updateUser = (req, res) => {
  console.log(req.params);

  if (req.params.id * 1 > allUsers.length) {
    return res.status(404).json({
      status: "Failed",
      message: "Invalid ID",
    });
  }

  res.status(200).json({
    status: "success",
    data: "<Tour Updated...>",
  });
};

exports.deleteUser = (req, res) => {
  console.log(req.params);

  if (req.params.id * 1 > allUsers.length) {
    return res.status(404).json({
      status: "Failed",
      message: "Invalid ID",
    });
  }

  res.status(204).json({
    status: "success",
    message: "Id deleted successfully...",
  });
};

// //\///\\\\\\
