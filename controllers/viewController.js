const Tour = require("../models/tourModel");
// const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get all tours
  const tours = await Tour.find();

  // 2) Build template (overview.pug)
  // 3) Render the tours data from step 1

  res.status(200).render("overview", {
    title: "All tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    field: "user rating review",
  });
  // console.log("Tour: ", tour);

  // .populate("guides");
  // 2) Build template (tour.pug)
  // 3) Render template using data from 1)

  res
    .status(200)
    .set("Content-Security-Policy", "frame-src 'self'")
    .render("tour", {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = (req, res) => {
  // const {email, password} = req.body;
  //
  // const existingUser = await User.findOne({ email });
  // if(!existingUser) {
  //
  // }

  res.status(200).render("login", {
    title: "Log into your account",
  });
};

exports.getSignUpForm = (req, res) => {
  res.status(200).render("signup", {
    title: "Sign up",
  });
};
