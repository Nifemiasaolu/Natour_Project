const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({
  path: "./config.env",
});

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
  .then(() => console.log("DB connected successfully!"));

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tour Name is required"],
    unique: true,
  },

  rating: {
    type: Number,
    default: 4.5,
  },

  price: {
    type: Number,
    required: [true, "Tour Price is required"],
  },
});

const Tour = mongoose.model("Tour", tourSchema);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}...`);
});

// /
