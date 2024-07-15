const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  // GET Nested routes
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  if (!reviews) {
    return next(new AppError("No review found", 404));
  }

  res.status(200).json({
    status: "Success",
    result: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//   // Nested Routes
//   // This gets the body and tour automatically, if the user doesn't input them as part of the review.
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.id;
//
//   const newReview = await Review.create(req.body);
//
//   if (!newReview) {
//     return next(new AppError("No review created"), 400);
//   }
//
//   res.status(201).json({
//     status: "Success",
//     data: {
//       review: newReview,
//     },
//   });
// });

//////
