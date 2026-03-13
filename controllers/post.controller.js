const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const { Comment } = require("../models/comment");
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require("../models/post");
const {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
} = require("../utilities/cloudinary");

/**
 * @desc Create New Post
 * @route /api/posts
 * @method POST
 * @access public
 */
const createPost = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No Image Provided" });
  }

  const { error } = validateCreatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

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

  const newPost = new Post({
    title: req.body.title,
    category: req.body.category,
    description: req.body.description,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  await newPost.save();

  res.status(201).json({ message: "Post Created Successfully", post: newPost });

  fs.unlinkSync(imagePath);
});

/**
 * @desc Get All Posts
 * @route /api/posts
 * @method GET
 * @access public
 */
const getAllPosts = asyncHandler(async (req, res) => {
  const { pageNumber, category } = req.query;
  const limit = 3;
  let posts;

  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"])
      .populate("comments");
  } else if (category) {
    posts = await Post.find({ category })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"])
      .populate("comments");
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"])
      .populate("comments"); //
  }

  if (posts.length === 0) {
    return res.status(200).json({ message: "No Posts Found" });
  }

  res.status(200).json(posts);
});

/**
 * @desc Get Single Post
 * @route /api/posts/:id
 * @method GET
 * @access public
 */
const getSinglePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("user", [
    "-password",
  ]);
  if (!post) {
    return res.status(400).json({ message: "Post Not Found" });
  }

  res.status(200).json(post);
});

/**
 * @desc Get Posts Count
 * @route /api/posts
 * @method GET
 * @access public
 */
const getPostsCount = asyncHandler(async (req, res) => {
  const count = await Post.countDocuments();
  res.status(200).json(count);
});

/**
 * @desc Delete Post
 * @route /api/posts/:id
 * @method DELETE
 * @access private (only Admin && User Himself)
 */
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(400).json({ message: "Post Not Found" });
  }

  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    await cloudinaryDeleteImage(post.image.publicId);
    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ postId: post._id });

    res.status(200).json({ message: "Post Has Been Deleted Successfully" });
  } else {
    res.status(403).json({ message: "Access Denied, Forbidden" });
  }
});

/**
 * @desc Update Post
 * @route /api/posts/:id
 * @method PUT
 * @access private (only User Himself)
 */
const updatePost = asyncHandler(async (req, res) => {
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(400).json({ message: "Post Not Found" });
  }

  if (req.user.id !== post.user.toString()) {
    res.status(403).json({ message: "Access Denied, Forbidden" });
  }

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true },
  ).populate("user", ["-password"]);

  res.status(200).json(updatedPost);
});

/**
 * @desc Update Post Photo
 * @route /api/posts/upload-image/:id
 * @method PUT
 * @access private (only User Himself)
 */
const updatePostPhoto = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No Image Provided" });

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(400).json({ message: "Post Not Found" });
  }

  if (req.user.id !== post.user.toString()) {
    return res.status(403).json({ message: "Access Denied, Forbidden" });
  }

  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  let result;
  try {
    result = await cloudinaryUploadImage(imagePath);
  } catch (err) {
    fs.unlinkSync(imagePath);
    return res.status(500).json({
      message: "Cloudinary upload failed",
      error: err.message,
    });
  }

  const updatedPostPhoto = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { returnDocument: "after" },
  );

  await cloudinaryDeleteImage(post.image.publicId);

  fs.unlinkSync(imagePath);

  res.status(200).json({
    message: "Image Updated Successfully",
    updatePost: updatedPostPhoto,
  });
});

/**
 * @desc Toggle Like
 * @route /api/posts/like/:id
 * @method PUT
 * @access private (only Logged User)
 */
const toggleLike = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const loggedUser = req.user.id;

  let post = await Post.findById(postId);
  if (!post) {
    return res.status(400).json({ message: "Post Not Found" });
  }

  const alreadyLiked = post.likes.find(
    (user) => user.toString() === loggedUser,
  );

  if (alreadyLiked) {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loggedUser },
      },
      { returnDocument: "after" },
    );
  } else {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loggedUser },
      },
      { returnDocument: "after" },
    );
  }

  res.status(200).json(post);
});

module.exports = {
  createPost,
  getAllPosts,
  getSinglePost,
  getPostsCount,
  deletePost,
  updatePost,
  updatePostPhoto,
  toggleLike,
};
