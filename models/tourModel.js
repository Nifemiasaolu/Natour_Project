const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tour Name is required"], //Internal Validator
      unique: true,
      trim: true,
      maxlength: [40, "Tour Name must be less than 40 characters"], //Internal Validator
      minlength: [10, "Tour Name must be more than 10 characters"], //Internal Validator
      //   validate: [validator.isAlpha, "Tour name must only contain characters"], //Custom validator
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
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, "Tour Price is required"],
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
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// VIRTUAL PROPERTY
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .create() and .save(), but not .insertMany(), findOne() nor findByIdAndUpdate() and the others (update inclusive).
// Pre-save Hook/Middleware
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre("save", (next) => {
//   console.log("Will save document...");
//   next();
// });

// // Post-Save Hook/Middleware
// tourSchema.post("save", (doc, next) => {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE: runs before or after a certain query is executed (e.g FIND query)

// tourSchema.pre("find", function (next) {
tourSchema.pre(/^find/, function (next) {
  // ^find is written as a regular expression, which means that it should not only work for "find", but for other operators that start with the "find" name e.g "findOne", "findById" etc.
  this.find({ secretTour: { $ne: true } }); // This means that it should find and bring forth docs that has secretTour(false);

  this.start = Date.now();
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

// //\\\\\
