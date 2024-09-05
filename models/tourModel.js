const mongoose = require("mongoose");
const slugify = require("slugify");
// const User = require("./userModel");
// const validator = require("validator");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tour Name is required"], //Internal Validator
      unique: true,
      trim: true,
      maxlength: [40, "Tour Name must be less than 40 characters"], //Internal Validator
      minlength: [10, "Tour Name must be more than 10 characters"], //Internal Validator
      // validate: [validator.isAlpha, "Tour name must only contain characters"], //Custom validator
    },

    slug: {
      type: String,
    },

    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },

    maxGroupSize: {
      type: Number,
      required: [true, "Tour must have a group size"],
    },

    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      // set: val => Math.round(val * 10) / 10 // Rounds a 4.666666 to 4.7
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, "Tour Price is required"],
      // index: true,
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // "this" keyword only points to current document on NEW document creation, it doesn't work with the Update method(i.e existing documents)
          return val < this.price; //Custom validator
        },
        message: "Discount price ({VALUE}) should be less than regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "Tour summary required"],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, "Tour cover image is required"],
    },

    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //   GeoJSON
      //   To specify GeoSpatial data with MongoDB,  We create a new object containing "type" and 'coordinates", so for the schema to know that this is a GeoSpatial Model
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number], // It means we expect an array of Numbers. In GeoJsON, this array is of coordinates, with Longitude first, then Latitude next (long, lat).
      //   In Google map, it's (lat, long).
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, //  Embedding Data Model (Connecting User to Tour). It contains all details of the User into the tour guide.

    // The reason we're using the reference model, is in scenario where there's a change in user detail (update), it would be a lot of work coming to the tour model, to update that same user that's just been updated. Hence, we just use the reference model method, to link the user directly to the tour, so any change on the user would majorly have direct effect on that same user in the tour model(due to the id link).

    // Reference/Normalized Data model
    guides: [
      // This makes sure it contains just the IDs of the Users, and not their corresponding data, like that of the Embedding/Denormalized Model
      {
        type: mongoose.Schema.ObjectId,
        ref: "User", //This creates a reference to another model (User). this is how to connect the models.
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound Index
tourSchema.index({ price: 1, ratingsAverage: -1 });
// 1 => Ascending
// -1 => Descending
tourSchema.index({ slug: 1 });

// VIRTUAL PROPERTY
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// Virtual Populate
// This is a scenario, where we want the tour to have access to it's reviews,
// without going through the Parent-Child referencing(as done on Review Model) again.
// Rather than doing that, we use virtual populate (from mongoDB) to access the review of that particular tourID.
tourSchema.virtual("reviews", {
  ref: "Review", // Refers to the Review Model
  foreignField: "tour", // Refers to "tour" field in the Review model.
  localField: "_id", // This is the id in the local Tour model. Which means we're connecting the local tour model by Id to the foreign Tour field that's in Reviews.
});

// DOCUMENT MIDDLEWARE: runs before .create() and .save(), but not .insertMany(), findOne() nor findByIdAndUpdate() and the others (update inclusive).
// Pre-save Hook/Middleware
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Saving user guides(by Id) into the tour, from the User model (Connecting Users into Tours by EMBEDDING)
// tourSchema.pre("save", async function (next) {
//   const guidePromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromise);
//   next();
// });

// tourSchema.pre("save", (next) => {
//   console.log("Will save document...");
//   next();
// });

// // Post-Save Hook/Middleware
// tourSchema.post("save", (doc, next) => {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE: runs before a certain query is executed (e.g FIND query)

// tourSchema.pre("find", function (next) {
tourSchema.pre(/^find/, function (next) {
  // ^find is written as a regular expression, which means that it should not only work for "find", but for other operators that start with the "find" name e.g "findOne", "findById" etc.
  this.find({ secretTour: { $ne: true } }); // This means that it should find and bring forth docs that has secretTour(false);

  this.start = Date.now();
  next();
});

// This population is done for the current doc/id being queried.
// This is a nice trick, in case you want to populate for all your document.
// NOTE: Population does not affect the db, i.e the populated data are not shown on the db(just the id shows),
// they are shown to the clients when the id(get tour) or get all tours are called.
tourSchema.pre(/^find/, function (next) {
  this.populate({
    //Populate here means fill up the details/data of this field(guides), when you query for a particular tour.
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  //   console.log(docs);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // this means that even on aggregate(calling the getTourStats route), we don't want the documents with secretTour being "true" to get out, we are calling for secretTour(false);
  // unshift method there, sets the "$match" operator to the beginning of the array.
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;

// //\\\
