const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const headers = req.headers.authorization;

  if (!headers || !headers.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Token is Required, Access Denied" });
  }

  const token = headers.split(" ")[1];

  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decodedPayload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid Token, Access Denied" });
  }
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: "Not Allowed, Only Admin" });
    }
  });
};

const verifyTokenAndOnlyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id) {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Not Allowed, Only Admin Or User Himself" });
    }
  });
};

const verifyTokenAndOnlyAdminOrUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Not Allowed, Only User Himself" });
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyTokenAndOnlyAdminOrUser,
};
