const asyncHandler = require("express-async-handler");
const { User } = require("../models/user");
const {
  Comment,
  validationCreateComment,
  validationUpdateComment,
} = require("../models/comment");

/**
 * @desc Create New Comment
 * @route /api/comments
 * @method POST
 * @access public
 */
const createComment = asyncHandler(async (req, res) => {
  const { error } = validationCreateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const userProfile = await User.findById(req.user.id);

  const comment = await Comment.create({
    postId: req.body.postId,
    text: req.body.text,
    user: req.user.id,
    username: userProfile.username,
  });

  res.status(200).json(comment);
});

/**
 * @desc Get All Comment
 * @route /api/comments
 * @method Get
 * @access private (only Admin)
 */
const getAllComment = asyncHandler(async (req, res) => {
  const comments = await Comment.find().populate("user", ["-password"]);
  res.status(200).json(comments);
});

/**
 * @desc Delete Comment
 * @route /api/comments
 * @method DELETE
 * @access private (only Admin and User Himself)
 */
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(400).json({ message: "Comment Not Found" });
  }

  if (req.user.isAdmin || req.user.id === comment.user.toString()) {
    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Comment Has Been Deleted Successfully" });
  } else {
    return res.status(403).json({ message: "Access Denied, Not Allowed" });
  }
});

/**
 * @desc Update Comment
 * @route /api/comments/:id
 * @method Put
 * @access private (User Himself)
 */
const updateComment = asyncHandler(async (req, res) => {
  const { error } = validationUpdateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(400).json({ message: "Comment Not Found" });
  }

  if (req.user.id !== comment.user.toString()) {
    return res
      .status(403)
      .json({ message: "Access Denied, Only User Himself" });
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        text: req.body.text,
      },
    },
    { new: true },
  );

  res.status(200).json({
    message: "Comment Has Been Updated Successfully",
    comment: updatedComment,
  });
});

module.exports = {
  createComment,
  getAllComment,
  deleteComment,
  updateComment,
};
