const fs = require("fs");

const allTours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

// Param Middleware
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  if (req.params.id * 1 > allTours.length) {
    return res.status(404).json({
      status: "Failed",
      message: "Invalid ID",
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "Failed",
      message: "Missing Name or Price",
    });
  }
  next();
};

// ROUTE HANDLERS
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: allTours.length,
    data: {
      tours: allTours,
    },
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);

  const id = req.params.id * 1; // When we multiply a string the looks like a number (e.g "5"), with a number, JavaScript automatically converts the string to a number.
  // E.g "5" * 1 = 5
  const tour = allTours.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newId = allTours[allTours.length - 1].id + 1;
  // eslint-disable-next-line prefer-object-spread
  const newTour = Object.assign({ id: newId }, req.body);

  allTours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(allTours),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    },
  );
};

exports.updateTour = (req, res) => {
  console.log(req.params);

  res.status(200).json({
    status: "success",
    data: "<Tour Updated...>",
  });
};

exports.deleteTour = (req, res) => {
  console.log(req.params);

  res.status(204).json({
    status: "success",
    message: "Id deleted successfully...",
  });
};
// //\
