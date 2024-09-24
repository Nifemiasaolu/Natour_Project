const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
// const reviewController = require("../controllers/reviewController");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

// // Param Middleware
// router.param("id", tourController.checkID);
// router.param("post", tourController.checkBody);
// Creating Router

// Nested Routes
// POST /tour/235fhe/reviews
// GET /tour/234tfdsd/reviews
// GET /tour/234tfdsd/reviews/2354fdsd4
// router
//   .route("/:tourId/reviews")
//   .post(
//     authController.protect,
//     authController.restrictTo("user"),
//     reviewController.createReview,
//   );

// Mounting Nested Route
router.use("/:tourId/reviews", reviewRouter);

router
  .route("/top-5-tours")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);

router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan,
  );

router.route("/tours-within/distance/:distance/center/:latlng/unit/:unit").get(tourController.getToursWithin)
// /tour-within/distance/234/center/-45,79/unit/mi => Path Params
// /tour-within?distance=234&center=-45,79&unit= mi => Query Params
// /tour-within/distance/2345/center/41.593666,-87.9191424/unit/mi:

router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances)

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour,
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour,
  );

module.exports = router;

// /\\\////\\\\
