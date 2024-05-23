const express = require("express");
const morgan = require("morgan");

const app = express();

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

// MIDDLEWARE FOR ALL OF THE ROUTES

// 3rd Party Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Middlewawre for body-parser
app.use(express.json());

// Serving static files
app.use(express.static(`${__dirname}/public`)); // Uses it to access static file in our system. Access http://localhost/overview.html on browser

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

///////////////////////////////////////////
// app.get("/api/v1/tours", getAllTours);
// app.post("/api/v1/tours", createTour);
// app.get("/api/v1/tours/:id", getTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);
/////////////////////////////////////////\

// MIDDLEWARE FOR TOUR AND USER ROUTES
// Mounting Routers
// Using the route as middleware.
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// START SERVER
module.exports = app;
