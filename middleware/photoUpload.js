const multer = require("multer");
const path = require("path");

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase(); // ext
    const fileName = `user-${Date.now()}${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];
  if (imageType === "image") {
    cb(null, true);
  } else {
    cb({ message: "Only supported Image Format" }, false);
  }
};

const uploadPhoto = multer({
  storage: diskStorage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
});

module.exports = uploadPhoto;
