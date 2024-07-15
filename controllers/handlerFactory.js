const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
// const Tour = require("../models/tourModel");

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (Model === "Review") {
      if (!req.body.tour) req.body.tour = req.params.tourId;
      if (!req.body.user) req.body.user = req.user.id;
    }

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        tour: doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      message: "Id deleted successfully...",
    });
  });
