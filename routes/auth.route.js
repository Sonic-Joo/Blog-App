const express = require("express");
const router = express.Router();
const {
  registerUserCtrl,
  loginUser,
  verifyUserAccount,
} = require("../controllers/auth.controller");

// api/auth
router.post("/register", registerUserCtrl);
router.post("/login", loginUser);
router.get("/:userId/verify/:token", verifyUserAccount);

module.exports = router;
