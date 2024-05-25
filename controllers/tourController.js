const Tour = require("../models/tourModel");

// ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY
    // 1) Filter Query
    const queryObj = { ...req.query };
    const filteredObj = ["page", "sort", "limit", "fields"];
    filteredObj.forEach((el) => delete queryObj[el]);

    // 2) Advanced Filter (Bringing the gte, gt, lte & lt method into consideration)
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    const queryStr = JSON.parse(queryString);
    console.log(queryStr);

    const query = Tour.find(queryStr); // First Method of writing a/filter query

    // EXECUTE QUERY
    const tours = await query;

    // Querying Using Special Mongoose Methods
    // const query = await Tour.find() //Find method returns a query, that's why we can chain these methods to it.
    //   .where("duration")
    //   .equals(5)
    //   .where("difficulty")
    //   .equals("easy");

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

// ////////////////////

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
// //
