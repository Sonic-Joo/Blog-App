const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {
  User,
  validateRegisterUser,
  validateLoginUser,
} = require("../models/user");
const { VerificationToken } = require("../models/verificationToken");
const generateToken = require("../utilities/generateToken");
const sendEmail = require("../utilities/sendEmail");

/**---------------------------------------------------------------
 * @desc Register New User - Sign Up
 * @router /api/auth/register
 * @method POST
 * @access public
  ---------------------------------------------------------------*/
const registerUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validateRegisterUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const userExist = await User.findOne({ email: req.body.email });
  if (userExist) {
    return res.status(400).json({ message: "User Already Exist" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashPassword,
  });
  await user.save();

  const verificationToken = new VerificationToken({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  });
  await verificationToken.save();

  const link = `http://localhost:8000/api/auth/${user._id}/verify/${verificationToken.token}`;
  const htmlTemplate = `
  <div>
    <p>Click on the link below to verify your email</p>
    <a href="${link}">Verify</a>
  </div>
  `;

  await sendEmail(user.email, "Verify Your Email", htmlTemplate);

  res.status(201).json({
    message: "We sent to you email, please verify your email address",
  });
});

/**---------------------------------------------------------------
 * @desc Login User
 * @router /api/auth/login
 * @method POST
 * @access public
  ---------------------------------------------------------------*/
const loginUser = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const userExist = await User.findOne({ email: req.body.email });
  if (!userExist) {
    return res.status(400).json({ message: "Email or Password is Incorrect" });
  }

  if (!userExist.isAccountVerified) {
    return res.status(400).json({
      message: "We sent to you email, please verify your email address",
    });
  }

  const isValidPass = await bcrypt.compare(
    req.body.password,
    userExist.password,
  );
  if (!isValidPass) {
    return res.status(400).json({ message: "Email or Password is Incorrect" });
  }

  const token = generateToken({
    id: userExist._id,
    isAdmin: userExist.isAdmin,
  });

  res.status(200).json({
    _id: userExist._id,
    username: userExist.username,
    isAdmin: userExist.isAdmin,
    profilePhoto: userExist.profilePhoto,
    token,
  });
});

/**---------------------------------------------------------------
 * @desc Verify User Account
 * @router /api/auth/:userId/verify/:token
 * @method GET
 * @access public
  ---------------------------------------------------------------*/
const verifyUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "Invalid Link" });
  }

  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });
  if (!verificationToken) {
    return res.status(400).json({ message: "Invalid Link" });
  }

  user.isAccountVerified = true;
  await user.save();
  await verificationToken.deleteOne();

  res.status(200).json({ message: "Your Account Verified" });
});

module.exports = {
  registerUserCtrl,
  loginUser,
  verifyUserAccount,
};
