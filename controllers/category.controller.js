const asyncHandler = require("express-async-handler");
const { Category, validationCreateCategory } = require("../models/category");
/**
 * @desc Create New Category
 * @route /api/categories
 * @method POST
 * @access private (only Admin)
 */
const createCategory = asyncHandler(async (req, res) => {
  const { error } = validationCreateCategory(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const category = await Category.create({
    title: req.body.title,
    user: req.user.id,
  });

  return res.status(201).json({ category });
});

/**
 * @desc Get All Category
 * @route /api/categories
 * @method Get
 * @access public
 */
const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  return res.status(200).json({ categories });
});

/**
 * @desc Delete Category
 * @route /api/categories/:id
 * @method DELETE
 * @access private (only Admin)
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(400).json({ message: "Category Not Found" });
  }

  await Category.findByIdAndDelete(req.params.id);
  return res
    .status(200)
    .json({ message: "Category Has Been Deleted Successfully" });
});

module.exports = {
  createCategory,
  getAllCategory,
  deleteCategory,
};
