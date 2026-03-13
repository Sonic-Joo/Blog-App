const router = require("express").Router();
const validvalidateObjectID = require("../middleware/validateObjectID");
const {
  createComment,
  getAllComment,
  deleteComment,
  updateComment,
} = require("../controllers/comment.controller");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middleware/verifyToken");

// api/auth
router
  .route("/")
  .post(verifyToken, createComment)
  .get(verifyTokenAndAdmin, getAllComment);

router
  .route("/:id")
  .delete(validvalidateObjectID, verifyToken, deleteComment)
  .put(validvalidateObjectID, verifyToken, updateComment);

module.exports = router;
