const fs = require("fs");
const express = require("express");

const router = express.Router();
const allUsers = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

const getAllUsers = (req, res) => {
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

const createUser = (req, res) => {
  const newId = allUsers[allUsers.length - 1]._id + 1;
  const newUser = Object.assign({ id: newId }, req.body);

  allUsers.push(newUser);

  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(allUsers),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          user: newUser,
        },
      });
    }
  );
};

const getUser = (req, res) => {
  console.log(req.params);

  const id = req.params.id;
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

const updateUser = (req, res) => {
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

const deleteUser = (req, res) => {
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
// //
// Creating Router
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
