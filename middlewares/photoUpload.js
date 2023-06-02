/**
 * Middleware for handling photo uploads.
 * @module photoUpload
 */

const { join } = require("path");
const multer = require("multer");

/**
 * The storage configuration for multer.
 */
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, "../images"));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

/**
 * The upload configuration for multer.
 */
const photoUpload = multer({
  storage: photoStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes("image")) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format." }, false);
    }
  },
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5 megabytes
});

module.exports = photoUpload;
