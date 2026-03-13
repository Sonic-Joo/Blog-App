const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getSingleUser,
  updateUserProfile,
  uploadProfilePhoto,
  deteleUserProfile,
  getUserCount,
} = require("../controllers/user.controller");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyTokenAndOnlyAdminOrUser,
} = require("../middleware/verifyToken");
const validateObjectID = require("../middleware/validateObjectID");
const uploadPhoto = require("../middleware/photoUpload");

// api/users/profile
router.route("/profile").get(verifyTokenAndAdmin, getAllUsers);

// api/users/profile/:id
router
  .route("/profile/:id")
  .get(validateObjectID, getSingleUser)
  .put(validateObjectID, verifyTokenAndOnlyUser, updateUserProfile)
  .delete(validateObjectID, verifyTokenAndOnlyAdminOrUser, deteleUserProfile);

// api/users/count
router.route("/count").get(verifyTokenAndAdmin, getUserCount);

// /api/users/profile/profile-photo/upload
router
  .route("/profile/photo/upload")
  .post(verifyToken, uploadPhoto.single("image"), uploadProfilePhoto);

module.exports = router;
