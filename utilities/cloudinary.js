const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUploadImage = async (fileToUpload) => {
  try {
    const data = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: "image",
    });
    return data;
  } catch (err) {
    throw new Error(err.message);
  }
};

const cloudinaryDeleteImage = async (imagePublicId) => {
  try {
    const result = await cloudinary.uploader.destroy(imagePublicId);
    return result;
  } catch (err) {
    throw new Error(err.message);
  }
};

const cloudinaryDeleteMultiImage = async (imagePublicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(imagePublicIds);
    return result;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
  cloudinaryDeleteMultiImage,
};
