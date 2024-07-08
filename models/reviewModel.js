const mongoose = require("mongoose");

//review /rating / createdAt / ref to tour / ref to user

const schema = {
  review: {
    type: String,
    required: [true, "Review cannot be empty"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "Review must belong to a tour."],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Review must belong to a user."],
  },
};

const reviewSchema = new mongoose.Schema(schema, {
  // Virtual properties are fields that are not stored in the DB, but calculated using some other values/fields, we want it to show up whenever there's an output.
  // This ensures that virtual properties shows up in JSON and Object outputs.
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "tour",
    select: "name",
  }).populate({
    path: "user",
    select: "name photo",
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
//////////
