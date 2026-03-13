const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/user");
const { Post } = require("../models/post");
const { Comment } = require("../models/comment");
const bcrypt = require("bcryptjs");
const path = require("node:path");
const fs = require("fs");
const {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
  cloudinaryDeleteMultiImage,
} = require("../utilities/cloudinary");

/**
 * @desc Get All Users Porfile
 * @route /api/users/profile
 * @method GET
 * @access private (only admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").populate("posts");
  res.status(200).json(users);
});

/**
 * @desc Get Single User Porfile
 * @route /api/users/profile/:id
 * @method GET
 * @access public
 */
const getSingleUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id })
    .select("-password")
    .populate("posts");
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  res.status(200).json(user);
});

/**
 * @desc Update User Porfile
 * @route /api/users/profile/:id
 * @method PUT
 * @access private (only user himself)
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(401).json({ message: error.details[0].message });
  }

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(password, salt);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        bio: req.body.bio,
      },
    },
    { new: true },
  ).select("-password");

  res.status(200).json(updatedUser);
});

/**
 * @desc Get Users Count
 * @route /api/users/count
 * @method GET
 * @access private (only admin)
 */
const getUserCount = asyncHandler(async (req, res) => {
  const count = await User.countDocuments();
  res.status(200).json(count);
});

/**
 * @desc Update User Profile
 * @route /api/users/profile/profile-photo/upload
 * @method  POST
 * @access private (only logged user himself)
 */
const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No Image Provided" });

  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  let result;
  try {
    result = await cloudinaryUploadImage(imagePath);
  } catch (err) {
    fs.unlink(imagePath);
    return res
      .status(500)
      .json({ message: "Cloudinary upload failed", error: err.message });
  }

  const user = await User.findById(req.user.id);
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryDeleteImage(user.profilePhoto.publicId);
  }

  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();

  fs.unlink(imagePath, () => {
    console.log("Image Deleted Successfully");
  });

  res.status(200).json({
    message: "Your profile photo updated successfully",
    profilePhoto: user.profilePhoto,
  });
});

/**
 * @desc Delete User Profile (Account)
 * @route /api/users/profile/:id
 * @method  DELETE
 * @access private (only admin or user himself)
 */
const deteleUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  const posts = await Post.find({ user: user._id });
  const publicIds = posts.map((post) => post.image.publicId);
  if (publicIds.length > 0) {
    await cloudinaryDeleteMultiImage(publicIds);
  }

  if (user.profilePhoto.publicId !== null) {
    await cloudinaryDeleteImage(user.profilePhoto.publicId);
  }

  await Post.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "Your Profile Has Been Deleted" });
});

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUserProfile,
  getUserCount,
  uploadProfilePhoto,
  deteleUserProfile,
};
