const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

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

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  if (!newReview) {
    return next(new AppError("No review created"), 400);
  }

  res.status(201).json({
    status: "Success",
    data: {
      review: newReview,
    },
  });
});

///////
