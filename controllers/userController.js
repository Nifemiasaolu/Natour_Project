const fs = require("fs");

const allUsers = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`),
);

exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      users: allUsers,
    },
  });
};

// const getAllUsers = (req, res) => {
//   res.status(500).json({
//     status: "error",
//     message: "This route is not yet defined!",
//   });
// };

exports.createUser = (req, res) => {
  const newId = allUsers[allUsers.length - 1]._id + 1;
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

// /
