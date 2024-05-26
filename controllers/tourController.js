const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");

// SORT OUT THE TOP 5 TOURS
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,-price";
  req.query.fields = "name, price, ratingsAverage, difficulty, summary";
  next();
};

// ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    // EXECUTE QUERY
    // query.find().sort().select().skip().limit() //Wat The query method is now
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id: req.params.id}) // Shorthand of the above method

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour(req.body) //Another method to use to create.
    // newTour.save(); // Follows the convention of model.prototype.save(); "prototype" => "new Tour"

    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: "Invalid Data Sent",
    });

    console.log("Error:", error);
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: { tour },
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  console.log(req.params);
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      message: "Id deleted successfully...",
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error,
    });
  }
};

// AGGREGATOR PIPELINE
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
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
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error,
    });
  }
};

// //////////////////

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
