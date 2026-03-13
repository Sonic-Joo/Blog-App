const Router = require("express").Router();
const uploadPhoto = require("../middleware/photoUpload");
const {
  verifyToken,
  verifyTokenAndOnlyUser,
} = require("../middleware/verifyToken");
const validateObjectId = require("../middleware/validateObjectID");
const {
  createPost,
  getAllPosts,
  getSinglePost,
  getPostsCount,
  deletePost,
  updatePost,
  updatePostPhoto,
  toggleLike,
} = require("../controllers/post.controller");

Router.route("/")
  .post(verifyToken, uploadPhoto.single("image"), createPost)
  .get(verifyToken, getAllPosts);

Router.route("/count").get(getPostsCount);

Router.route("/:id")
  .get(validateObjectId, verifyToken, getSinglePost)
  .delete(validateObjectId, verifyToken, deletePost)
  .put(validateObjectId, verifyToken, updatePost);

Router.route("/upload-image/:id").put(
  validateObjectId,
  verifyToken,
  uploadPhoto.single("image"),
  updatePostPhoto,
);

Router.route("/like/:id").put(validateObjectId, verifyToken, toggleLike);

module.exports = Router;
