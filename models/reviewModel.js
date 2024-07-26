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
  // this.populate({
  //   path: "tour",
  //   select: "name",
  // }).populate({
  //   path: "user",
  //   select: "name photo",
  // })
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

// Calculate Average Ratings using Static Method
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([ //The aggregate method is performed on the current model(this => Review)
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        // This means it's the number of ratings, and average rating that we want to calculate in this aggregation.
        _id: "tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log(stats);
};

reviewSchema.post("save", function() {
  // this points to current review
  this.calcAverageRatings(this.tour)
})

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
///////\\\\



// import CustomError from "../../src/api/modules/custom-error";
// import { BAD_REQUEST, FORBIDDEN } from "../../src/api/modules/status";

// it("should handle errors when fetching geolocation data", async () => {
//   const ip = "8.frs.8.8";
//   const errorMessage = "Fetching Geolocation Data Failed";
//   const statusCode = FORBIDDEN;
//
//   // geoLocationStub = sinon.stub(request, "get").rejects(errorMessage);
//
//   geoLocationStub = sinon.stub(request, "get").rejects({
//     statusCode,
//     message: errorMessage,
//   });
//
//   await expect(geoLocation(ip)).to.be.rejectedWith(CustomError, errorMessage);
//
//   // await expect(geoLocation(ip)).to.be.rejectedWith(
//   //   CustomError({
//   //     statusCode: FORBIDDEN,
//   //     message: "Fetching Geolocation Data Failed",
//   //   })
//   // );
// });
// it("should handle errors from populating ipUserInfo", async () => {
//   const errorMessage = "Geolocation Middleware Error";
//
//   geoLocationStub = sinon
//     .stub(request, "get")
//     .rejects(new Error(errorMessage));
//
//   await ipUserInfo(req, res, next);
//
//   // expect(res.send).to.have.been.calledWith(BAD_REQUEST, {
//   //   status: false,
//   //   message: "Error in geolocation middleware",
//   // });
//
//   // expect(res.send.called).to.be.true;
//   expect(res.send.callCount).to.equal(1);
//   expect(res.send.args[0][0]).to.equal(BAD_REQUEST);
//   expect(res.send.args[0][1]).to.deep.equal({
//     status: false,
//     message: "Geolocation Middleware Error",
//   });
//
//   expect(next.called).to.be.false;
// });
