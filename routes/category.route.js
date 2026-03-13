const router = require("express").Router();
const validvalidateObjectID = require("../middleware/validateObjectID");
const {
  createCategory,
  getAllCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const {
  verifyTokenAndAdmin,
  verifyToken,
} = require("../middleware/verifyToken");

router
  .route("/")
  .post(verifyTokenAndAdmin, createCategory)
  .get(verifyToken, getAllCategory);

router
  .route("/:id")
  .delete(validvalidateObjectID, verifyTokenAndAdmin, deleteCategory);

module.exports = router;
