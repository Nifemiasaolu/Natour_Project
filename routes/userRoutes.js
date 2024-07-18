const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Authentication Middleware: Protect All Routes After This Middleware
// Remember that middleware runs in sequence.
router.use(authController.protect);
//This middleware runs first, before any of the below, and it protects all of the below middlewares.

router.patch(
  "/updateMyPassword",
  // authController.protect, //This is removed because the Protect middleware function is already performing this task, also for the ones below.
  authController.updatePassword,
);
router.get(
  "/getMe",
  // authController.protect,
  userController.getMe,
  userController.getUser,
);
router.patch(
  "/updateMe",
  // authController.protect,
  userController.updateMe,
);

router.delete(
  "/deleteMe",
  // authController.protect,
  userController.deleteMe,
);

// Restrict All Routes After This Middleware.
router.use(authController.restrictTo("admin"));

// Creating Router
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

// //\\\\\\\\\\\\\\\\\\\\\\\
