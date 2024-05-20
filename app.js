const fs = require("fs");
const express = require("express");
const morgan = require("morgan");

const app = express();

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

// 1) MIDDLEWARE

// 3rd Party Middleware
app.use(morgan("dev"));

// Middlewawre for body-parser
app.use(express.json());

//  Our Own MiddleWare
app.use((req, res, next) => {
  console.log("Hello From The MiddleWare World 🙌");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});

////////////////////////////////////////////
// app.get("/api/v1/tours", getAllTours);
// app.post("/api/v1/tours", createTour);
// app.get("/api/v1/tours/:id", getTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);
////////////////////////////////////////////

// 3) ROUTES
// Mounting Routers
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
// 4) START SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}...`);
});
