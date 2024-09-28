const Tour = require("../models/tourModel");
// const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

// SORT OUT THE TOP 5 TOURS
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,-price";
  req.query.fields = "name, price, ratingsAverage, difficulty, summary";
  next();
};

// ROUTE HANDLERS

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: "reviews" });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

//////////////////////////////////////////////////////////////
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // EXECUTE QUERY
//   // query.find().sort().select().skip().limit() //Wat The query method is now
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;
//
//   // SEND RESPONSE
//   res.status(200).json({
//     status: "success",
//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate("reviews"); // Populates review for just a particular tour
//   // Tour.findOne({_id: req.params.id}) // Shorthand of the above method
//
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }
//
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
// });

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//
//   res.status(201).json({
//     status: "success",
//     data: {
//       tour: newTour,
//     },
//   });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }
//
//   res.status(200).json({
//     status: "success",
//     data: { tour },
//   });
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }
//
//   res.status(204).json({
//     status: "success",
//     message: "Id deleted successfully...",
//   });
// });
///////////////////////////////////////////////////////////////////////////////

// AGGREGATION PIPELINE (MATCH AND GROUPING)
// match basically is to select field(just to do a query)
// group is to group and work with the operators.
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" }, // grouped by difficulty
        numTours: { $sum: 1 },
        numOfRating: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: "EASY" } },
    // },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

// AGGREGATION PIPELINE (UNWINDING AND PROJECTING)
// Unwind is to seperate a document by a particular field (e.g startDates, images)
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" }, //push operator is to push the names into an array
      },
    },
    {
      $addFields: { month: "$_id" }, // addFields operator allows adding of a field. E.g adding "month" as a field, then using "_id" as it's value.
    },
    {
      $project: {
        _id: 0, // Project gets rid of a particular field. 0 to hide, 1 to show
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12, //Limits the number of documents to show at once.
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});

// router.route("/tours-within/distance/:distance/center/:latlng/unit/:unit")

exports.getToursWithin = catchAsync( async (req, res, next) => {
  const {distance, latlng, unit} = req.params;

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1; // This makes sure the radius is in radians.
  console.log("Radius: ", radius);

  const [lat, lng] = latlng.split(",")
  if(!lat || !lng) {
    return next(new AppError("Please provide your latitude and longitude in the format lat,lng.", 400))
  }

  console.log(distance, lat,lng, unit);

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [
          [lng, lat], // NOTE: In GeoJSON, the Longitude is always written first, then the Latitude next [lng, lat]. while in normal coordinates pairs(e.g maps), the Latitude is written first [lat, lng]
          radius
        ]
      }
    }
  })

  res.status(200).json({
    status: 'Success',
    tours: tours.length,
    data: {
      data: tours
    }
  })

})

exports.getDistances = catchAsync(async (req,res, next) => {
  const {latlng, unit} = req.params;
  const [lat, lng] = latlng.split(",")
  const multiplier = unit === "mi" ? 0.006213 : 0.001;

  if(!lat || !lng) {
    return next(new AppError("Please provide your latitude and longitude in the format lat,lng.", 400))
  }

  const distances = await Tour.aggregate([
  {
    $geoNear: { // NB: geoNear always need to be the first stage in the pipeline.
      near: {
        type: "Point",
        coordinates: [lng * 1, lat * 1]
      },
      distanceField: "distance",
      distanceMultiplier: multiplier, // (converts distance to Kilometers)
      spherical: true,
    }
  },
    {
      $project: {
        distance: 1,
        name: 1,
      }
    }
  ])

  res.status(200).json({
    status: 'Success',
    data: {
      data: distances
    }
  })
})



// ////////////////////\\/////////////////////////\\
// const allTours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// Param Middleware
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > allTours.length) {
//     return res.status(404).json({
//       status: "Failed",
//       message: "Invalid ID",
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: "Failed",
//       message: "Missing Name or Price",
//     });
//   }
//   next();
// };
// /

//////////////////////////////////////////////////////////

// BUILD QUERY

// 1A) FILTERING Query
// FIltering works with the find method.
// const queryObj = { ...req.query };
// const excludedFields = ["page", "sort", "limit", "fields"];
// excludedFields.forEach((el) => delete queryObj[el]);

// // 1B) ADVANCED FILTERING (Bringing the gte, gt, lte & lt method into consideration)
// let queryString = JSON.stringify(queryObj);
// queryString = queryString.replace(
//   /\b(gte|gt|lte|lt)\b/g,
//   (match) => `$${match}`,
// );

// const queryStr = JSON.parse(queryString);

// let query = Tour.find(queryStr); // First Method of writing a/filter query

// 2) SORTING
// // Sorting works with the sort method.
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(",").join(" ");
//   query = query.sort(sortBy);
// } else {
//   query = query.sort("-createdAt");
// }

// 3) FIELD LIMITING
// Limiting field (display certain data) works with the select method.
// if (req.query.fields) {
//   const fields = req.query.fields.split(",").join(" ");
//   query = query.select(fields);
// } else {
//   query = query.select("-__v");
// }

// 4) PAGINATION
// Pagination works with the skip and limit method.

// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;

// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numTours = await Tour.countDocuments();
//   if (skip >= numTours) throw new Error("Page Does not Exist!");
// }

////////
// Querying Using Special Mongoose Methods
// const query = await Tour.find() //Find method returns a query, that's why we can chain these methods to it.
//   .where("duration")
//   .equals(5)
//   .where("difficulty")
//   .equals("easy");

//////////////////////////////////////////////////
// USING TRY/CATCH BLOCK

// exports.getAllTours = async (req, res) => {
//   try {
//     // EXECUTE QUERY
//     // query.find().sort().select().skip().limit() //Wat The query method is now
//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();
//     const tours = await features.query;

//     // SEND RESPONSE
//     res.status(200).json({
//       status: "success",
//       results: tours.length,
//       data: {
//         tours: tours,
//       },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: "Failed",
//       message: error,
//     });
//   }
// };

// exports.getTour = async (req, res) => {
//   try {
//     const tour = await Tour.findById(req.params.id);
//     // Tour.findOne({_id: req.params.id}) // Shorthand of the above method

//     res.status(200).json({
//       status: "success",
//       data: {
//         tour,
//       },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: "Failed",
//       message: error,
//     });
//   }
// };

// exports.createTour = async (req, res) => {
//   try {
//     // const newTour = new Tour(req.body) //Another method to use to create.
//     // newTour.save(); // Follows the convention of model.prototype.save(); "prototype" => "new Tour"

//     const newTour = await Tour.create(req.body);

//     res.status(201).json({
//       status: "success",
//       data: {
//         tour: newTour,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "Failed",
//       message: error,
//     });

//     console.log("Error:", error);
//   }
// };

// exports.deleteTour = async (req, res) => {
//   console.log(req.params);
//   try {
//     await Tour.findByIdAndDelete(req.params.id);

//     res.status(204).json({
//       status: "success",
//       message: "Id deleted successfully...",
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: "Failed",
//       message: error,
//     });
//   }
// };

////////////////////////////
// AGGREGATION PIPELINE (MATCH AND GROUPING)
// match basically is to select field(just to do a query)
// group is to group and work with the operators.
// exports.getTourStats = async (req, res) => {
//   try {
//     const stats = await Tour.aggregate([
//       {
//         $match: { ratingsAverage: { $gte: 4.5 } },
//       },
//       {
//         $group: {
//           _id: { $toUpper: "$difficulty" },
//           numTours: { $sum: 1 },
//           numOfRating: { $sum: "$ratingsQuantity" },
//           avgRating: { $avg: "$ratingsAverage" },
//           avgPrice: { $avg: "$price" },
//           minPrice: { $min: "$price" },
//           maxPrice: { $max: "$price" },
//         },
//       },
//       {
//         $sort: { avgPrice: 1 },
//       },
//       // {
//       //   $match: { _id: { $ne: "EASY" } },
//       // },
//     ]);

//     res.status(200).json({
//       status: "success",
//       data: {
//         stats,
//       },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: "Failed",
//       message: error,
//     });
//   }
// };

// // AGGREGATION PIPELINE (UNWINDING AND PROJECTING)
// // Unwind is to seperate a document by a particular field (e.g startDates, images)
// exports.getMonthlyPlan = async (req, res) => {
//   try {
//     const year = req.params.year * 1; //2021

//     const plan = await Tour.aggregate([
//       {
//         $unwind: "$startDates",
//       },
//       {
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { $month: "$startDates" },
//           numTourStarts: { $sum: 1 },
//           tours: { $push: "$name" }, //push operator is to push the names into an array
//         },
//       },
//       {
//         $addFields: { month: "$_id" }, // addFields operator allows adding of a field. E.g adding "month" as a field, then using "_id" as it's value.
//       },
//       {
//         $project: {
//           _id: 0, // Project gets rid of a particular field. 0 to hide, 1 to show
//         },
//       },
//       {
//         $sort: { numTourStarts: -1 },
//       },
//       {
//         $limit: 12, //Limits the number of documents to show at once.
//       },
//     ]);

//     res.status(200).json({
//       status: "success",
//       data: {
//         plan,
//       },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: "Failed",
//       message: error,
//     });
//   }
// };
