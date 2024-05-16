const fs = require("fs");
const express = require("express");

const router = express.Router();

const allTours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: allTours.length,
    data: {
      tours: allTours,
    },
  });
};

const getTour = (req, res) => {
  console.log(req.params);

  const id = req.params.id * 1; // When we multiply a string the looks like a number (e.g "5"), with a number, JavaScript automatically converts the string to a number.
  // E.g "5" * 1 = 5
  const tour = allTours.find((el) => el.id === id);

  // if(id > allTours.length) {
  if (!tour) {
    return res.status(404).json({
      status: "failed",
      message: "Invalid ID",
    });
  }

  res.status(200).json({
    status: "success",
    // results: allTours.length,
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  // console.log(req.body)

  const newId = allTours[allTours.length - 1].id + 1;
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
    }
  );
};

const updateTour = (req, res) => {
  console.log(req.params);

  if (req.params.id * 1 > allTours.length) {
    return res.status(404).json({
      status: "Failed",
      message: "Invalid ID",
    });
  }
  // const id = req.params.id * 1;
  // const tour = allTours.find(el => el.id === id);
  // const updatedTour= tour.findOneAndUpdate({
  //     $set: id
  // })

  res.status(200).json({
    status: "success",
    data: "<Tour Updated...>",
  });
};

const deleteTour = (req, res) => {
  console.log(req.params);

  if (req.params.id * 1 > allTours.length) {
    return res.status(404).json({
      status: "Failed",
      message: "Invalid ID",
    });
  }

  res.status(204).json({
    status: "success",
    message: "Id deleted successfully...",
  });
};
// \\
// Creating Router
router.route("/").get(getAllTours).post(createTour);
router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
