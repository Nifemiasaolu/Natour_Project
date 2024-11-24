const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const pug = require("pug");
const path = require("path");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");

const app = express();

// Pug Template Engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// MIDDLEWARE FOR ALL OF THE ROUTES (GLOBAL)
// Serving static files
// app.use(express.static(`${__dirname}/public`)); // Uses it to access static file in our system. Access http://localhost/overview.html on browser
app.use(express.static(path.join(__dirname, "public")));

// Set security HTTP headers
app.use(helmet());

// 3rd Party Middleware (Development Logging)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate Limiting Middleware
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in an hour",
});
app.use("/api", limiter);

// Body-parser Middleware (Reading data from body into req.body)
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NOSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

//  Our Own MiddleWare
app.use((req, res, next) => {
  console.log("Hello From The MiddleWare World 🙌");
  next();
});

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.requestTime);
  // console.log(req.headers);
  next();
});

///////////////////////////
// app.get("/api/v1/tours", getAllTours);
// app.post("/api/v1/tours", createTour);
// app.get("/api/v1/tours/:id", getTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);
/////////////////////////////

// MIDDLEWARE FOR TOUR AND USER ROUTES

// Mounting Routers
// Using the route as middleware.
// Pug Route
app.use("/", viewRouter);

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

// MIDDLEWARE TO HANDLE UNHANDLED ROUTES
app.all("*", (req, res, next) => {
  // OUTDATED WAY OF MIDDLEWARE HANDLING ERROR
  // res.status(404).json({
  //   status: "Fail",
  //   message: `Can't find (${req.originalUrl}) on the server`,
  // });
  ///////////////////\\
  // CRUDE/OLD METHOD
  // const err = new Error(`Can't find (${req.originalUrl}) on the server`);
  // err.statusCode = 404;
  // err.status = "fail";
  // next(err);

  // NEW METHOD
  next(new AppError(`Can't find (${req.originalUrl}) on the server`, 404));
});

// GLOBAL MIDDLEWARE TO HANDLE ERROR
app.use(globalErrorHandler);

// START SERVER
module.exports = app;
