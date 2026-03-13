const mongoose = require("mongoose");
const joi = require("joi");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 5,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__480.png",
        publicId: null,
      },
    },
    bio: { type: String },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("posts", {
  ref: "Post", // Modle
  foreignField: "user", // Field in Post Model
  localField: "_id", // Filed in Current Model
});

const User = mongoose.model("User", userSchema);

// Validation Register
function validateRegisterUser(obj) {
  const schema = joi.object({
    username: joi.string().min(2).max(100).trim().required(),
    email: joi.string().min(5).max(100).trim().required().email(),
    password: joi.string().min(8).trim().required(),
  });
  return schema.validate(obj);
}

// Validation Login
function validateLoginUser(obj) {
  const schema = joi.object({
    email: joi.string().min(5).max(100).trim().required().email(),
    password: joi.string().min(8).trim().required(),
  });
  return schema.validate(obj);
}

// Validation Update User
function validateUpdateUser(obj) {
  const schema = joi.object({
    username: joi.string().min(2).max(100).trim(),
    password: joi.string().min(8).trim(),
    bio: joi.string(),
  });
  return schema.validate(obj);
}

module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
};
