const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const logger = require("../utils/logger");

const schema = {
  name: {
    type: String,
    required: [true, "User name is required"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password."],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password."],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
};

const userSchema = new mongoose.Schema(schema);

userSchema.pre("save", async function (next) {
  // Run this function if password was not modified
  if (!this.isModified("password")) return next();

  // Run this function if password was actually modified(saved or updated)
  // Hash/Encrypt the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // This is a query middleware that points to the current query.
  //   /^find/ means it works for all the query related to find. E.g findById, findOne etc.
  this.find({ active: { $ne: false } }); // This means that it should bring out result of user docs, that are active(true).
  // Rather than using {active: true}, note that some of the data in the db might not have the field "active : true", hence, we using { active: { $ne: false }

  next();
});

// This is an instance method that returns True/False, while comparing the input password to the existing password.
// An instance method (userSchema.methods) is available on all the documents. Documents are instances of a module.
userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword,
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    console.log(
      "Changed Time stamp:",
      changedTimeStamp,
      "JWTTimeStamp:",
      JWTTimestamp,
    );
    // This means if the token generated time is less than the changed password time, return true, which means there's been an alteration on the password, and don't grant access, else return false.
    return JWTTimestamp < changedTimeStamp;
  }

  // False means password NOT CHANGED
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  logger.info(
    `Reset Token: ${resetToken} *** Password Reset Token: ${this.passwordResetToken}`,
  );
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // logger.info(`Password Reset Expires: ${this.passwordResetExpires}`);

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

//////\\\\
