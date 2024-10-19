const mongoose = require("mongoose");
const Tour = require("../models/tourModel")

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

// This ensures that a user can only make/create just one review on one tour.
reviewSchema.index({tour: 1, user: 1}, { unique: true})

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
      $match: { tour: tourId }, // This means select by tourId.
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
  // console.log("Stats: ",stats);

  if(stats.length > 0){

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating.toFixed(1),
  })
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    })
  }
};

// This Post-save middleware is called in order to use the calcAverageRatings function, after the doc is saved.
// NOTE: POST middleware doesn't have access to the next function, only PRE-save middleware.
reviewSchema.post("save", function() {
  // this points to current review
  // The function is available on the model (this => Review)
  this.constructor.calcAverageRatings(this.tour) //constructor is the model that created the document.
})

/////////////////////////
// Teaches a simple trick of going around a query middleware to get a document off it (const r = await this.findOne()).
// findByIdAndUpdate
// findByIdAndDelete
// Here, we don't have doc middleware, we have query middleware, and in query middleware, we don't have direct access to the document,
// in order to do something similar to this ( this.constructor.calcAverageRatings(this.tour).
// Need access to current review document, to extract the tourId, but we're using query middleware here, and don't have access to it.

// reviewSchema.pre(/^findOneAnd/, async function(next) {
// // The goal is to get access to the current review document, but the "this" keyword, is the current query.
//  // Execute the current query with findOne, and it gives us the document that's currently being processed.

//  this.r = await this.findOne();
//   console.log("This.r: ",this.r);
//  next()
// })

// The Pre-findOneAnd here means that the review change(either update or delete) has occured on the document at this point,
// but it's not been persisted(changed or updated) yet, on the db.
// It's just a Pre-save phase.

// reviewSchema.post(/^findOneAnd/, async function() {
// //   await this.findOne(). does NOT work here, query has already been executed.
// // We want to get access to the current tour from the Pre-save, and to do that, rather than saving the query execution into a variable (const r), we save it into a "this" property of it's own(this.r), so that we have access to the current tour(in the document).
// //   CalcAverageRatings is a static method and it needs to be called on the model, and the current model is "this.r=> this" also means => this.constructor(just like using it in Pre-save middleware).

//   await this.r.constructor.calcAverageRatings(this.r.tour);
// })

// The Post-save here now persists(updates) the review change in the database.

///////////////////////////////////////////////////
// Updated way of writing the Pre and Post findOneAnd (for updating and deleting review), that's above. Pretty much straightforward.
reviewSchema.post(/^findOneAnd/, async function(doc, next) {
  await doc.constructor.calcAverageRatings(doc.tour);
  next();
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
