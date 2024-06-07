const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("./utils/logger");

// UNCAUGHT EXCEPTIONS
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTIONS! 💥: Shutting down...");
  logger.error(`${err.name}: ${err.message}`);
  // Crashing the operation could be compulsory(as there are some hosting platforms that auto restart your server immediately
  process.exit(1);
});

dotenv.config();
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("DB connected successfully!"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  logger.info(`App listening on port ${port}...`);
});

// GLOBALLY HANDLE UNHANDLED REJECTIONS
process.on("unhandledRejection", (err) => {
  logger.error(`${err.name}: ${err.message}`);
  logger.error(`UNHANDLED REJECTION!💥: Shutting down...`);
  // Crashing the operation is OPTIONAL
  server.close(() => {
    process.exit(1);
  });
});

// \\\\\\\
