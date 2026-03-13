const mongoose = require("mongoose");

const validateObjectID = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(401).json({ message: "InValid Object Id" });
  }
  next();
};

module.exports = validateObjectID;
